import { DataBaseHelper } from "../DataBaseHelper.js";
import { ArchitectureError, HttpError } from "../Errors.js";
import { CACHE_NAME, MANIFEST_NAME, DELETE_CACHE, sendNotification, toDatetimeLocal, getEmojiPeople, LOCALES } from "../variables.mjs";
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
		for (const element of [
			document.getElementById("autoUpdateEnable"),
			document.getElementById("notificationEnable"),
		]) {
			if (element instanceof HTMLInputElement) {
				element.disabled = true;
			}
			else throw new ArchitectureError(JSON.stringify(element));
		}
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
		/**
		 * @type {HTMLInputElement}
		 */
		// @ts-ignore
		let checkbox = document.getElementById(id);
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
		new DataBaseHelper().start.then(transaction => {
			document.getElementById("resetConfig").addEventListener("click", () => transaction.hardReset());
			if (!("serviceWorker" in navigator)) this.#liteMode(getEmojiPeople(0x1F9D3));
			else navigator.serviceWorker.getRegistrations().then(registrations => {
				if (registrations.length === 0) {
					transaction.getAppConfig("serviceWorker").then(isServiceWorker => {
						const unreachable = isServiceWorker ? "📦 Service Worker inatteignable" : "📦 Service Worker n'est pas enregistrable";
						this.#online.textContent = unreachable;
						this.#local.textContent = unreachable;
						this.#currentChangeslogs.textContent = unreachable;
						this.#update.textContent = isServiceWorker ? "Retourner à l'accueil pour réinstaller le Service Worker" : "https://bugzilla.mozilla.org/show_bug.cgi?id=1247687";

						this.#liteMode();
					});
				}
				else {
					caches.open(CACHE_NAME).then(cache =>
						cache.match(MANIFEST_NAME),
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

					fetch(`${MANIFEST_NAME}!online`).then(response => {
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
						if (error instanceof HttpError && error.parameters.statusText === "Offline") {
							this.#online.textContent = "✈️ Hors ligne";
						}
						else this.#online.textContent = "❌ Erreur Fatale";
						this.#update.textContent = "Problème pour récupérer la version en ligne...";
						console.error("⚙️", error);
					});

					const serviceWorker = document.getElementById("serviceWorker");
					if (registrations.length > 1) {
						this.#liteMode();
						DELETE_CACHE();
						throw new ArchitectureError(JSON.stringify(registrations));
					}
					// @ts-ignore
					else if (!registrations[0]?.sync) {
						serviceWorker.textContent = `${registrations[0].active.scriptURL} without sync`;
						transaction.setAppConfig("autoUpdate", false);
						this.#liteMode();
					}
					else serviceWorker.textContent = registrations[0].active.scriptURL;
				}
			});

			this.#checkboxButton(transaction, "notificationEnable", "notification");
			this.#checkboxButton(transaction, "autoUpdateEnable", "autoUpdate", DELETE_CACHE);
			this.#checkboxButton(transaction, "debugEnable", "debug");
		});
		document.getElementById("deleteCache").addEventListener("click", () => {
			if (!navigator.onLine) {
				if (confirm("🚫 Vous êtes hors ligne et vous voulez effacez le cache 🚫 \n 🚫 Continuez et l'application ne sera plus disponible 🚫")) {
					DELETE_CACHE();
				}
			}
			else DELETE_CACHE();
		});

		new DataBaseHelper().start.then(transaction =>
			transaction.getAppConfig("locale").then(locale => {
				const selectedLanguage = document.getElementById(String(locale));
				selectedLanguage.classList.add("selected");
				selectedLanguage.classList.remove("button");
			}),
		);

		const languages = document.getElementById("languages");
		for (const flag of languages.children) {
			flag.addEventListener("click", () => {
				if (!flag.classList.contains("selected")) new DataBaseHelper().start.then(transaction =>
					// @ts-ignore
					transaction.setAppConfig("locale", flag.id).then(() => globalThis.mvc.controller.reload()),
				);
			});
		}
	}

	/**
	 * @param {boolean} enable
	 */
	#debugEnable(enable) {
		let config = document.getElementById("config"),
			manifest = document.getElementById("manifest"),
			errors = document.getElementById("errors")
		;
		// Removing childrens
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

		document.getElementById("debug").style.display = enable ? "flex" : "none";
	}
}
