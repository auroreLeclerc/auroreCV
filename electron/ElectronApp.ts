import {app, BrowserWindow, ipcMain, Menu, nativeImage, Notification, NotificationConstructorOptions, Tray, shell, dialog} from "electron";
import path from "node:path";
import fs from "node:fs";
import v8 from "node:v8";
import manifest from "../www/manifest.json" with { type: "json" };
import packageJson from "../package.json" with { type: "json" };

export class ElectronApp {
	private window: BrowserWindow;
	private tray: Tray;
	private get icon () {
		switch (process.platform) {
			case "win32":
				return nativeImage.createFromPath(path.join(process.cwd(), "resources/icon.ico"));
			case "darwin":
				return nativeImage.createFromPath(path.join(process.cwd(), "resources/icon.icns"));
			default:
				return nativeImage.createFromPath(path.join(process.cwd(), "www/src/img/homeMade/icons/192.png"));
		}
	}
	private get settings () {
		switch (process.platform) {
			case "win32":
				return nativeImage.createFromPath(path.join(process.cwd(), "resources/settings.ico"));
			case "darwin":
				return nativeImage.createFromPath(path.join(process.cwd(), "resources/settings.icns"));
			default:
				return nativeImage.createFromPath(path.join(process.cwd(), "www/src/img/homeMade/icons/colorfullSettings.png"));
		}
	}

	public start () {
		this.configApp();
		app.whenReady().then(() => {
			this.createTray();
			this.checkUpdate();
			app.on("activate", () => {
				if (BrowserWindow.getAllWindows().length === 0) {
					this.createWindow();
				}
			});
		}).then(() => this.createWindow());
	
		app.on("window-all-closed", () => {
			this.window = null;
		});
	}

	private createWindow (file = "www/index.html") {
		this.window = new BrowserWindow({
			"backgroundColor": manifest.background_color,
			"icon": this.icon,
			"title": manifest.name,
			"width": 1280,
			"height": 720,
			"minWidth": 480,
			"minHeight": 720,
			"webPreferences": {
				"preload": path.join(process.cwd(), "electron/commonjs/preload.cjs"),
				"devTools": !app.isPackaged
			}
		});
		this.window.loadFile(path.join(process.cwd(), file));
	}

	private configApp () {
		app.setName(manifest.short_name);
		app.setAboutPanelOptions({
			"applicationName": manifest.name,
			"applicationVersion": packageJson.version,
			"authors": [packageJson.author],
			"copyright": packageJson.license,
			"credits": packageJson.author,
			"iconPath": path.join(process.cwd(), "www/src/img/homeMade/icons/192.png"),
			"version": packageJson.version,
			"website": "https://auroreleclerc.github.io/auroreCV/"
		});

		Menu.setApplicationMenu(Menu.buildFromTemplate([
			{"label": "Naviguer", "submenu": [
				{"label": "⬅️", "click": () => this.window.webContents.goBack()},
				{"label": "🔄", "role": "reload"},
				{"label": "➡️", "click": () => this.window.webContents.goForward()}
			]},
			{"type": "separator"},
			{"label": "À propos", "role": "about"},
			{"type": "separator"},
			...app.isPackaged ? [] : [
				{"label": "👩‍💻", "submenu": [
					{"label": "DevTool", "click": () => this.window.webContents.openDevTools()}
				]}
			]
		]));

		ipcMain.on("sendNotification", (event, param: NotificationConstructorOptions) => new Notification(param).show());
		ipcMain.on("dump", (event, content: unknown) => fs.writeFileSync(path.join(process.cwd(), "dump.txt"), v8.serialize(content)));
	}

	private loadUrl (file = "www/index.html") {
		if (this.window) {
			this.window.loadFile(path.join(process.cwd(), file));
		}
		else this.createWindow(file);
	}

	private createTray () {
		this.tray = new Tray(this.icon);
		const contextMenu = Menu.buildFromTemplate([
			{"label": "Accueil", "click": () => this.loadUrl(), "icon": this.icon},
			{"label": "Maintenance", "click": () => this.loadUrl("www/maintenance.html"), "icon": this.settings},
			{"type": "separator"},
			{"label": "Fermer l'application", "role": "quit"}
		]);
		this.tray.setContextMenu(contextMenu);
		this.tray.setTitle(manifest.name);
	}

	private checkUpdate () {
		fetch("https://auroreleclerc.github.io/auroreCV/package.json").then(response =>
			response.json().then(json => {
				if (Number.parseInt(packageJson.version.replaceAll(".", ""), 10) > Number.parseInt(json.version.replaceAll(".", ""), 10)) {
					const notification = new Notification({
						"title": "Une nouvelle mise à jour est disponible !",
						"icon": this.icon,
						"urgency": "critical"
					});
					notification.addListener("click", () => {
						shell.openExternal("https://github.com/auroreLeclerc/auroreCV/releases");
					});
					notification.show();
				}
				else console.info(`Remote is ${json.version}`);
			}).catch(error => 
				dialog.showMessageBox(this.window, {
					"message": `${error.toString()}\nlocale=${typeof packageJson}\nonline=${response.ok}`,
					"type": "error"
				})
			)
		);
	}
}

