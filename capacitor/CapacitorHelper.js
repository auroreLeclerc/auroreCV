import { Device } from "@capacitor/device";
import { Share } from "@capacitor/share";
import { StatusBar } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { LocalNotifications } from "@capacitor/local-notifications";
import { AndroidShortcuts } from "capacitor-android-shortcuts";

export class CapacitorHelper {
	constructor() {
		if (Capacitor.getPlatform() === "android") {
			AndroidShortcuts.setDynamic({
				items: [{
					id: "maintenance",
					shortLabel: "Maintenance",
					longLabel: "Maintenance",
					icon: undefined,
					data: "maintenance",
				}],
			});
			AndroidShortcuts.addListener("shortcut", response => {
				console.log(response.data);
				window.location.replace("/maintenance.html");
			});
		}
	}

	/**
	 * @readonly
	 */
	device = Device;

	/**
	 * @readonly
	 */
	share = Share;

	/**
	 * @readonly
	 */
	core = Capacitor;

	/**
	 * @param {import("@capacitor/status-bar").BackgroundColorOptions["color"]} backgroundColor
	 */
	set statusBarBackgroundColor(backgroundColor) {
		StatusBar.setBackgroundColor({
			color: backgroundColor,
		});
	}

	/**
	 * @param {string} body
	 * @param {string} title
	 */
	sendNotification(body, title) {
		LocalNotifications.checkPermissions().then(permission => {
			if (permission.display !== "denied") {
				this.launchNotification(body, title);
			}
			else {
				LocalNotifications.requestPermissions().then(permission => {
					if (permission.display !== "denied") {
						this.launchNotification(body, title);
					}
				});
			}
		});
	}

	/**
	 * @param {string} body
	 * @param {string} title
	 */
	launchNotification(body, title) {
		LocalNotifications.schedule({
			notifications: [{
				body :body,
				title: title,
				id: 666,
			}],
		});
	}
}
