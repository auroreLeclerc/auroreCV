/**
 * @typedef {import("../controller/Controller.js").Controller} Controller
 */

import { DataBaseHelper } from "../DataBaseHelper.js";

export class ServiceWorkerLoader {
	/**
	 * @type {SVGElement}
	 */
	#circle = document.querySelector("section#service-worker svg.round-step-loading circle");
	#total = 2;
	#done = 1;
	#initialised = false;
	#channel = new BroadcastChannel("serviceWorkerLoader");
	/**
	 * @readonly
	 * @description debug bool
	 */
	hold = false;

	constructor() {
		this.#channel.onmessage = event => {
			if (!this.#initialised) {
				this.#total += event.data.total;
				this.#initialised = true;
			}
			this.#next();
		};
		this.#serviceWorkerRegistration();
	}

	#next() {
		this.#done++;
		this.#circle.style.strokeDasharray = `calc(${this.#done / this.#total} * var(--circumference)) var(--circumference)`;
		if (this.#done >= this.#total) {
			this.#channel.close();
			if (!this.hold) {
				window.location.reload();
			}
		}
	}

	#serviceWorkerRegistration() {
		new DataBaseHelper().start.then(transaction => {
			if ("serviceWorker" in navigator) {
				navigator.serviceWorker.getRegistrations().then(registrations => {
					if (!registrations.length) {
						navigator.serviceWorker.register(
							"./service-worker.js", {
								type: "module", // https://bugzilla.mozilla.org/show_bug.cgi?id=1247687
								scope: "./",
							},
						).then(registration => {
							console.info("📮", "ServiceWorker installing on", registration.scope);
							transaction.getAppConfig("autoUpdate").then(autoUpdate => {
								if (autoUpdate) {
									if ("sync" in registration) {
										navigator.serviceWorker.ready.then(registrationReady =>
											registrationReady.periodicSync.register("updater", {
												// minInterval: 24 * 60 * 60 * 1000
												minInterval: 30 * 1000,
											}).then(() => {
												console.info("📮", "periodicSync updater registered");
											}).catch((/** @type {Error} */ error) => {
												console.warn("PWA not installed ;", error);
											}),
										);
									}
									else {
										console.error("🧓", "No support for backgound jobs");
										registration.installing.postMessage({
											request: "update",
										});
									}
								}
							});
						}).catch(error => {
							this.#circle.style.animationName = "error-breathing";
							transaction.setAppConfig("serviceWorker", false);
							console.error(`Navigator serviceWorker registration as a module failed. ${error}`);
							this.#next();
						});
					}
				});
			}
			else {
				this.#circle.style.animationName = "error-breathing";
				transaction.setAppConfig("serviceWorker", false);
				console.error("Browser does not even know what a service-worker is !");
				this.#next();
			}
		});
	}

	/**
	 * @param {string} body
	 * @param {{ action: string; title: string; icon?: string; }[]} actions
	 */
	serviceWorkerMessage(body, actions) {
		navigator.serviceWorker.getRegistration().then(registration => {
			if (registration) {
				registration.active.postMessage({
					request: "notification",
					data: body,
					action: actions,
				});
			}
		});
	}
}
