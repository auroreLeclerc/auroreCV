const { contextBridge, ipcRenderer } = require("electron");

/**
 * @typedef {import("electron").NotificationConstructorOptions} NotificationConstructorOptions
 */

/**
 * @typedef {object} ElectronExposed
 * @property {{node: string, chrome: string, electron: string}} version
 * @property {(param: NotificationConstructorOptions) => void} sendNotification
 */

/**
 * @type {ElectronExposed}
 */
const electronExposed = {
	version: {
		node: process.versions.node,
		chrome: process.versions.chrome,
		electron: process.versions.electron,
	},
	sendNotification: param => ipcRenderer.send("sendNotification", param),
};

contextBridge.exposeInMainWorld("electron", electronExposed);

navigation.addEventListener("navigate", event => {
	const url = new URL(event.destination.url);
	if ((url.pathname.endsWith("/") || url.pathname.endsWith("\\")) && url.origin === "file://") {
		url.pathname += "index.html";
		navigation.navigate(url.toString()).finished;
	}
});
