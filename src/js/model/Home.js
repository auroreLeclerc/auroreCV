import { getCookie } from "../variables.mjs";
/**
 * @typedef {import("../controller/Controller.js").Controller} Controller
 */

export class Home {
	constructor() {
		document.getElementById("calculateAge").textContent = (new Date().getFullYear() - 2001) + " ans";

		try {
			getCookie("firstUse");
		}
		catch(error) {
			console.info(error);
		}

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

		navigator.serviceWorker.getRegistrations().then(registrations => {
			if (!registrations.length && getCookie("service-worker").toType()) {
				/**
				 * @type {Controller}
				 */
				globalThis.mvc.controller.render("serviceWorkerLoader");
			}
		});
	}
}