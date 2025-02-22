import { DataBaseHelper } from "../DataBaseHelper.js";
import { HttpError } from "../Errors.js";
import { CACHE_NAME, MANIFEST_NAME, DELETE_CACHE, sendNotification, toDatetimeLocal, assertInstance } from "../variables.mjs";
import { Version } from "../Version.js";
/**
 * @typedef {import("../DataBaseHelper.js").DataBaseHelperTransactionType} DataBaseHelperTransactionType
 */

export class Settings {
	#local = document.getElementById("local");
	#online = document.getElementById("online");
	#update = document.getElementById("update");
	#currentChangeslogs = document.getElementById("currentChangeslogs");

	/**
	 * @param {DataBaseHelperTransactionType} transaction
	 */
	#checkFetchUpdate(transaction) {
		if (this.#local.children.length === 0 && this.#online.children.length === 0) {
			const onlineVsLocal = new Version(this.#online.textContent, this.#local.textContent);
			if (onlineVsLocal.isUpper()) {
				const msg = "♻️ Effacer le cache pour charger la mise à jour !";
				this.#update.textContent = msg;
				this.#update.classList.add("button");
				this.#update.addEventListener("click", DELETE_CACHE);
				document.getElementById("changelogs").style.display = "flex";
				transaction.getAppConfig("notification").then(notification => {
					if (notification) {
						sendNotification(msg, [{ action: "update", title: "Effacer le cache" }]);
					}
				});
			}
			else {
				this.#update.textContent = "Aucune mise à jour diponible";
			}
		}
	}

	#liteMode(forceErrorText = "") {
		assertInstance(document.getElementById("autoUpdateEnable"), HTMLInputElement).disabled = true;
		assertInstance(document.getElementById("notificationEnable"), HTMLInputElement).disabled = true;
		if (forceErrorText) {
			this.#online.textContent = forceErrorText;
			this.#local.textContent = forceErrorText;
			this.#currentChangeslogs.textContent = forceErrorText;
			this.#update.textContent = forceErrorText;
		}
	}

	/**
	 * @param {DataBaseHelperTransactionType} transaction
	 * @param {string} id
	 * @param {keyof import("../DataBaseHelper.js").AppConfig} config
	 * @param {Function} [action]
	 */
	#checkboxButton(transaction, id, config, action) {
		let checkbox = assertInstance(document.getElementById(id), HTMLInputElement);
		transaction.getAppConfig(config).then(configValue => {
			checkbox.checked = !!configValue;
			if (id === "debugEnable") {
				this.#debugEnable(!!configValue);
			}
		});
		checkbox.addEventListener("click", () => {
			transaction.getAppConfig(config).then(configValue => {
				let newConfig = !configValue;
				transaction.setAppConfig(config, newConfig);

				switch (id) {
					case "notificationEnable":
						sendNotification(`Les notifications ont bien été ${newConfig ? "activées" : "désactivées"}`);
						break;

					case "debugEnable":
						this.#debugEnable(newConfig);
						break;

					default:
						action();
						break;
				}
			});
		});
	}

	constructor() {
		this.#serviceWorkerInit();

		// new DataBaseHelper().start.then(transaction =>
		// 	transaction.getAppConfig("locale").then(locale => {
		// 		const selectedLanguage = document.getElementById(String(locale));
		// 		selectedLanguage.classList.add("selected");
		// 		selectedLanguage.classList.remove("button");
		// 	}),
		// );

		// const languages = document.getElementById("languages");
		// for (const flag of languages.children) {
		// 	flag.addEventListener("click", () => {
		// 		if (!flag.classList.contains("selected")) new DataBaseHelper().start.then(transaction =>
		// 			transaction.setAppConfig("locale", flag.id).then(() => globalThis.mvc.controller.reload()),
		// 		);
		// 	});
		// }
	}

	#serviceWorkerInit() {
		new DataBaseHelper().start.then(transaction => {
			this.#checkboxButton(transaction, "notificationEnable", "notification");
			this.#checkboxButton(transaction, "autoUpdateEnable", "autoUpdate", DELETE_CACHE);
			this.#checkboxButton(transaction, "debugEnable", "debug");
			transaction.getAppConfig("serviceWorker").then(isServiceWorker => {
				if (isServiceWorker) {
					navigator.serviceWorker.getRegistrations().then(registrations => {
						if (registrations.length === 0) {
							transaction.getAppConfig("serviceWorker").then(() => {
								const unreachable = "📦 Service Worker inatteignable";
								this.#online.textContent = unreachable;
								this.#local.textContent = unreachable;
								this.#currentChangeslogs.textContent = unreachable;
								this.#update.textContent = "Retourner à l'accueil pour réinstaller le Service Worker";

								this.#liteMode();
							});
						}
						else {
							caches.open(CACHE_NAME).then(cache =>
								cache.match("manifest.json"),
							).then(stream =>
								stream.json(),
							).then(json => {
								this.#currentChangeslogs.textContent = json.changelogs.join(", ");
								this.#local.textContent = json.version;
								this.#checkFetchUpdate(transaction);
							}).catch(error => {
								this.#local.textContent = "❌ Erreur Fatale";
								this.#update.textContent = "Problème pour récupérer le cache...";
								console.error("⚙️", error);
							});

							fetch("manifest.json!online").then(response => {
								if (!response?.ok) throw new HttpError(response.status, response.statusText, response.url);
								return response.json();
							}).then(json => {
								this.#online.textContent = json.version;
								this.#checkFetchUpdate(transaction);

								let changelogs = document.querySelector("#changelogs ul");
								for (const change of json.changelogs) {
									changelogs.insertAdjacentHTML("beforeend", `<li>${change}</li>`);
								}
							}).catch(error => {
								if (error instanceof HttpError && error.statusText === "Offline") {
									this.#online.textContent = "✈️ Hors ligne";
								}
								else this.#online.textContent = "❌ Erreur Fatale";
								this.#update.textContent = "Problème pour récupérer la version en ligne...";
								console.error("⚙️", error);
							});

							const serviceWorker = document.getElementById("serviceWorker");
							if (registrations.length > 1) DELETE_CACHE();
							else if (!("sync" in registrations[0])) {
								serviceWorker.textContent = `${registrations[0].active.scriptURL} without sync`;
								transaction.setAppConfig("autoUpdate", false);
								this.#liteMode();
							}
							else serviceWorker.textContent = registrations[0].active.scriptURL;
						}
					});

					document.getElementById("deleteCache").addEventListener("click", () => {
						if (!navigator.onLine) {
							if (confirm("🚫 Vous êtes hors ligne et vous voulez effacez le cache 🚫 \n 🚫 Continuez et l'application ne sera plus disponible 🚫")) {
								DELETE_CACHE();
							}
						}
						else DELETE_CACHE();
					});
				}
				else {
					for (const sw of document.getElementsByClassName("service-worker")) {
						assertInstance(sw, HTMLElement).style.display = "none";
					}
				}
			});
		});
	}

	/**
	 * @param {boolean} enable
	 */
	#debugEnable(enable) {
		let config = document.getElementById("config"),
			manifest = document.getElementById("manifest"),
			errors = document.getElementById("errors");
		config.textContent = "";
		manifest.textContent = "";
		errors.textContent = "";

		new DataBaseHelper().start.then(transaction => {
			transaction.getAllAppConfig().then(appConfig => {
				for (const [key, value] of Object.entries(appConfig)) {
					let valueHtml = "";
					if (value instanceof Date) {
						valueHtml = `<input type="datetime-local" value="${toDatetimeLocal(value)}" readonly />`;
					}
					else if (typeof value === "boolean") {
						valueHtml = `<input type="checkbox" ${value ? "checked" : ""} disabled />`;
					}
					else if (typeof value === "number") {
						valueHtml = `<input type="number" value="${value}" readonly />`;
					}
					else valueHtml = value;

					config.insertAdjacentHTML("beforeend", `
						<tr>
							<td>${key}</td>
							<td>${valueHtml}</td>
						</tr>
					`);
				}
			});
			transaction.getErrors().then(appErrors => {
				for (const appError of appErrors) {
					errors.insertAdjacentHTML("beforeend", `
						<tr>
							<td>${appError.error.stack}</td>
							<td><input type="datetime-local" value="${toDatetimeLocal(appError.date)}" readonly /></td>
						</tr>
					`);
				}
			});
		});

		fetch(MANIFEST_NAME).then(response =>
			response.json().then(json => {
				for (const key in json) {
					if (Object.hasOwnProperty.call(json, key)) {
						if (typeof json[key] === "string") {
							manifest.insertAdjacentHTML("beforeend", `
								<tr>
									<td>${key}</td>
									<td>${json[key]}</td>
								</tr>
							`);
						}
					}
				}
			}),
		);

		document.getElementById("resetConfig").addEventListener("click", () => new DataBaseHelper().start.then(transaction => transaction.hardReset()));

		if (globalThis.mvc.electron) {
			document.getElementById("electron").textContent = globalThis.mvc.electron.version.electron;
			document.getElementById("chrome").textContent = globalThis.mvc.electron.version.chrome;
			document.getElementById("node").textContent = globalThis.mvc.electron.version.node;
			document.getElementById("electron-info").style.display = "block";
		}
		else if (globalThis.mvc.capacitor) {
			globalThis.mvc.capacitor.device.getInfo().then(info => {
				document.getElementById("os").textContent = `${info.platform} ${info.osVersion}`;
				document.getElementById("phone").textContent = `${info.model} by ${info.manufacturer}`;
				document.getElementById("capacitor-info").style.display = "block";
			});
		}

		document.getElementById("debug").style.display = enable ? "flex" : "none";
	}
}
