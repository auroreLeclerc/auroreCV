/**
 * @typedef {import("../controller/Controller.js").Controller} Controller
 */

import { DataBaseHelper } from "../DataBaseHelper.js";
import { ArchitectureError } from "../Errors.js";

export class Home {
	constructor() {
		document.getElementById("calculateAge").textContent = (new Date().getFullYear() - 2001).toString();

		if (/iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) && !window.navigator?.standalone) {
			const ioss = document.getElementsByClassName("ios");

			for (const ios of ioss) {
				if (ios instanceof HTMLDivElement) {
					ios.style.display = "block";
					if (ios.classList.contains("prompt")) {
						ios.addEventListener("click", () => {
							ios.style.display = "none";
						});
					}
				}
				else throw new ArchitectureError(JSON.stringify(ios));
			}
		}

		new DataBaseHelper().start.then(transaction => {
			if (globalThis.mvc.electron || globalThis.mvc.capacitor || !("BroadcastChannel" in window)) {
				transaction.setAppConfig("serviceWorker", false);
				transaction.setAppConfig("autoUpdate", false);
			}
			else if ("serviceWorker" in navigator) {
				navigator.serviceWorker.getRegistrations().then(registrations => {
					transaction.getAppConfig("serviceWorker").then(isServiceWorker => {
						if (!registrations.length && isServiceWorker) {
							/**
							 * @type {Controller}
							 */
							globalThis.mvc.controller.render("serviceWorkerLoader");
						}
					});
				});
			}
			else {
				transaction.setAppConfig("serviceWorker", false);
				transaction.setAppConfig("autoUpdate", false);
				console.error("Browser does not even know what a service-worker is !");
			}
		});
	}
}
