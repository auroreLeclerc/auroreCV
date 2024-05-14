import {app, BrowserWindow, ipcMain, Menu, nativeImage, Notification, NotificationConstructorOptions, systemPreferences, Tray} from "electron";
import path from "node:path";
import fs from "node:fs";
import v8 from "node:v8";
import manifest from "../manifest.json" with { type: "json" };
import packageJson from "../package.json" with { type: "json" };

export class ElectronApp {
	private window: BrowserWindow;
	private tray: Tray;

	constructor () {
		app.whenReady().then(() => {
			this.configInit();
			this.createTray();
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

	createWindow (file = "index.html") {
		this.window = new BrowserWindow({
			"backgroundColor": manifest.background_color,
			"icon": path.join(process.cwd(), "src/img/homeMade/icons/192.png"),
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

	configInit () {
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
		app.setAboutPanelOptions({
			"applicationName": manifest.name,
			"applicationVersion": packageJson.version,
			"authors": [packageJson.author],
			"copyright": packageJson.license,
			"credits": packageJson.author,
			"iconPath": path.join(process.cwd(), "src/img/homeMade/icons/192.png"),
			"version": packageJson.version,
			"website": "https://auroreleclerc.github.io/auroreCV/"
		}); 
		ipcMain.on("sendNotification", (event, param: NotificationConstructorOptions) => new Notification(param).show());
		ipcMain.on("dump", (event, content: unknown) => fs.writeFileSync(path.join(process.cwd(), "dump.txt"), v8.serialize(content)));
	}

	loadUrl (file = "index.html") {
		if (this.window) {
			this.window.loadFile(path.join(process.cwd(), file));
		}
		else this.createWindow(file);
	}

	createTray () {
		const icon = nativeImage.createFromPath(path.join(process.cwd(), "src/img/homeMade/icons/192.png"));
		this.tray = new Tray(icon);
		const contextMenu = Menu.buildFromTemplate([
			{"label": "Accueil", "click": () => this.loadUrl(), "icon": path.join(process.cwd(), "src/img/homeMade/icons/192.png")},
			{"label": "Maintenance", "click": () => this.loadUrl("maintenance.html"), "icon": path.join(process.cwd(), "src/img/homeMade/icons/colorfullSettings.png")},
			{"type": "separator"},
			{"label": "Fermer l'application", "role": "quit"}
		]);
		this.tray.setContextMenu(contextMenu);
		this.tray.setTitle(manifest.name);
	}
}

