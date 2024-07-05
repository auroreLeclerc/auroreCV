import {app, BrowserWindow, ipcMain, Menu, nativeImage, Notification, NotificationConstructorOptions, Tray, shell} from "electron";
import path from "node:path";
import fs from "node:fs";
import v8 from "node:v8";
import manifest from "../www/manifest.json" with { type: "json" };
import packageJson from "../package.json" with { type: "json" };

export class ElectronApp {
	private window: BrowserWindow;
	private tray: Tray;
	private readonly resourceFolder = path.join(app.isPackaged ? process.resourcesPath : path.join(app.getAppPath(), "../resources/electron/"));

	public start () {
		app.requestSingleInstanceLock();
		if (!app.hasSingleInstanceLock()) app.quit();

		this.configApp();
		app.whenReady().then(() => {
			this.createTray();
			// this.checkUpdate();
			app.on("activate", () => {
				if (BrowserWindow.getAllWindows().length === 0) {
					this.createWindow();
				}
			});
		}).then(() => this.createWindow());
	
		app.on("window-all-closed", () => {
			this.window = null;
		});

		app.on("second-instance", (event) => {
			this.loadUrl();
		});
	}

	private createWindow (file = "/index.html") {
		this.window = new BrowserWindow({
			"backgroundColor": manifest.background_color,
			"icon": nativeImage.createFromPath(path.join(app.getAppPath(), "/src/img/homeMade/icons/192.png")),
			"title": manifest.name,
			"width": 1280,
			"height": 720,
			"minWidth": 480,
			"minHeight": 720,
			"webPreferences": {
				"preload": path.join(app.isPackaged ? process.resourcesPath : path.join(app.getAppPath(), "../electron/commonjs/"), "preload.cjs"),
				"devTools": !app.isPackaged
			}
		});
		this.window.loadFile(path.join(app.getAppPath(), file));
	}

	private configApp () {
		app.setName(manifest.short_name);
		app.setAboutPanelOptions({
			"applicationName": manifest.name,
			"applicationVersion": packageJson.version,
			"authors": [packageJson.author],
			"copyright": packageJson.license,
			"credits": packageJson.author,
			"iconPath": path.join(app.getAppPath(), "/src/img/homeMade/icons/192.png"),
			"version": packageJson.version,
			"website": "https://auroreleclerc.github.io/auroreCV/www/index.html"
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
		ipcMain.on("dump", (event, content: unknown) => fs.writeFileSync(path.join(app.getAppPath(), "dump.txt"), v8.serialize(content)));
	}

	private loadUrl (file = "/index.html") {
		if (this.window) {
			this.window.loadFile(path.join(app.getAppPath(), file));
		}
		else this.createWindow(file);

		this.window.show();
		this.window.focus();
	}

	private createTray () {
		this.tray = new Tray(nativeImage.createFromPath(path.join(this.resourceFolder, "icon.png")));
		const contextMenu = Menu.buildFromTemplate([
			{"label": "Accueil", "click": () => this.loadUrl(), "icon": nativeImage.createFromPath(path.join(this.resourceFolder, "icon.png"))},
			{"label": "Maintenance", "click": () => this.loadUrl("/maintenance.html"), "icon": nativeImage.createFromPath(path.join(this.resourceFolder, "settings.png"))},
			{"type": "separator"},
			{"label": "Fermer l'application", "role": "quit"}
		]);
		this.tray.setContextMenu(contextMenu);
		this.tray.setTitle(manifest.name);
		this.tray.on("click", () => this.loadUrl());
	}

	private checkUpdate () {
		fetch("https://auroreleclerc.github.io/auroreCV/package.json").then(response =>
			response.json().then(json => {
				if (Number.parseInt(packageJson.version.replaceAll(".", ""), 10) > Number.parseInt(json.version.replaceAll(".", ""), 10)) {
					const notification = new Notification({
						"title": "Une nouvelle mise à jour est disponible !",
						"icon": nativeImage.createFromPath(path.join(app.getAppPath(), "/src/img/homeMade/icons/192.png")),
						"urgency": "normal"
					});
					notification.addListener("click", () => {
						shell.openExternal("https://github.com/auroreLeclerc/auroreCV/releases");
					});
					notification.show();
				}
				else console.info(`Remote is ${json.version}`);
			}).catch(error => 
				new Notification({
					"title": `${error.toString()}\nlocale=${typeof packageJson}\nonline=${response.ok}`,
					"icon": nativeImage.createFromPath(path.join(app.getAppPath(), "/src/img/homeMade/icons/192.png")),
					"urgency": "critical"
				}).show()
			)
		);
	}
}

