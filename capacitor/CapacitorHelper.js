import { Device } from "@capacitor/device";
import { Share } from "@capacitor/share";
import { StatusBar } from "@capacitor/status-bar";
import { Capacitor } from "@capacitor/core";
import { AndroidShortcuts } from "capacitor-android-shortcuts";

export class CapacitorHelper {
	constructor() {
		AndroidShortcuts.setDynamic({
			items: [{
				id: "maintenance",
				shortLabel: "Maintenance",
				longLabel: "Maintenance",
				icon: null,
				data: "maintenance",
			}],
		});
		AndroidShortcuts.addListener("shortcut", response => {
			window.location.replace("/maintenance.html");
		});
	}

	get device() {
		return Device;
	}

	get share() {
		return Share;
	}

	get core() {
		return Capacitor;
	}

	/**
	 * @param {string} backgroundColor
	 */
	set statusBarBackgroundColor(backgroundColor) {
		StatusBar.setBackgroundColor({
			color: backgroundColor,
		});
	}
}
