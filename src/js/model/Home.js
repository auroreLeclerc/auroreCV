/**
 * @typedef {import("../controller/Controller.js").Controller} Controller
 */

import { DataBaseHelper } from "../DataBaseHelper.js";

export class Home {
	constructor() {
		document.getElementById("calculateAge").textContent = (new Date().getFullYear() - 2001) + " ans";

		// @ts-ignore
		if (/iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) && !window.navigator?.standalone) {
			/**
			 * @type {HTMLCollectionOf<HTMLDivElement>}
			 */
			// @ts-ignore
			const ioss = document.getElementsByClassName("ios");

			for (const ios of ioss) {
				ios.style.display = "block";
				if (ios.classList.contains("prompt")) {
					ios.addEventListener("click", () => {
						ios.style.display = "none";
					});
				}
			}
		}

		new DataBaseHelper().start.then(transaction => {	
			if ("serviceWorker" in navigator) {
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
				console.error("Browser does not even know what a service-worker is !");
			}
		});
	}
}