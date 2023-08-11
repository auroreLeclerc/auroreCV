import { HttpError} from "../Errors.js";
import { CACHE_NAME, MANIFEST_NAME, DELETE_CACHE, sendNotification, setCookie, getCookie, SET_DEFAULT_COOKIES } from "../variables.mjs";
import { Version } from "../Version.js";

export class Settings {
	#local = document.getElementById("local");
	#online = document.getElementById("online");
	#update = document.getElementById("update");
	#currentChangeslogs = document.getElementById("currentChangeslogs");
	#initialised = false;

	#checkFetchUpdate() {
		try {
			const onlineVsLocal = new Version(this.#online.textContent, this.#local.textContent);
			if (onlineVsLocal.isUpper()) {
				const msg = "♻️ Effacer le cache pour charger la mise à jour !";
				this.#update.textContent = msg;
				this.#update.classList.add("button");
				this.#update.addEventListener("click", DELETE_CACHE);
				document.getElementById("changelogs").style.display = "flex";
				if (getCookie("notification").toType()) {
					sendNotification(msg, [{action: "update", title: "Effacer le cache"}]);
				}
			}
			else {
				this.#update.textContent = "Aucune mise à jour diponible";
			}
			
		} catch (typeError) {
			// console.info("checkFetchUpdate promise pending");
		}
	}

	#liteMode() {
		document.getElementById("autoUpdateEnable").disabled = true;
		document.getElementById("notificationEnable").disabled = true;
		document.getElementById("developmentBranch").disabled = true;
	}

	/**
	 * 
	 * @param {string} id 
	 * @param {string} cookie 
	 * @param {Function} [action] 
	 */
	#checkboxButton(id, cookie, action) {
		/**
		 * @type {HTMLInputElement}
		 */
		// @ts-ignore
		let checkbox = document.getElementById(id);
		checkbox.checked = getCookie(cookie).toType();
		checkbox.addEventListener("click", () => {
			let newCookie;
			if (this.#initialised) {
				newCookie = !getCookie(cookie).toType();
				setCookie(cookie, newCookie);
			}
			else {
				newCookie = getCookie(cookie).toType();
				checkbox.checked = true;
				// Fake click nullification for handling initialization.
			}

			switch (id) {
			case "notificationEnable":
				sendNotification(`Les notifications ont bien été ${newCookie ? "activées" : "désactivées"}`);
				break;

			case "debugEnable":
				document.getElementById("debug").style.display = newCookie ? "flex" : "none";
				action();
				break;
			
			default:
				action();
				break;
			}
		});
	}

	constructor() {
		navigator.serviceWorker.getRegistrations().then(registrations => {
			if(registrations.length === 0) {
				let unreachable = "";
				if (getCookie("service-worker").toType()) {
					unreachable = "📦 Service Worker inatteignable";
				}
				else {
					unreachable = "📦 Service Worker a échoué à s'enregistrer";
				}

				this.#online.textContent = unreachable;
				this.#local.textContent = unreachable;
				this.#currentChangeslogs.textContent = unreachable;
				this.#update.textContent = "Retourner à l'accueil pour réinstaller le Service Worker";

				this.#liteMode();
			}
			else {
				caches.open(CACHE_NAME).then(cache =>
					cache.match(MANIFEST_NAME)
				).then(stream => {
					if (!stream) throw new Error(`File '${MANIFEST_NAME}' not found in cache '${CACHE_NAME}'`);
					return stream.json();
				}).then(json => {
					this.#currentChangeslogs.textContent = json.changelogs.join(", ");

					this.#local.textContent = json.version;
					this.#checkFetchUpdate();
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
					this.#checkFetchUpdate();
			
					let changelogs = document.querySelector("#changelogs ul");
					for (const change of json.changelogs) {
						changelogs.insertAdjacentHTML("beforeend", `<li>${change}</li>`);
					}
				}).catch(error =>{
					if (error instanceof HttpError && error.parameters.statusText === "Offline") {
						this.#online.textContent = "✈️ Hors ligne";
					}
					else this.#online.textContent = "❌ Erreur Fatale";
					this.#update.textContent = "Problème pour récupérer la version en ligne...";
					console.error("⚙️", error);
				});

				const serviceWorker = document.getElementById("serviceWorker");
				if (registrations.length > 1) {
					for (const registration of registrations) {
						serviceWorker.textContent += registration.active.scriptURL;
					}
					this.#liteMode();
					alert(`Plusieurs Service Worker sont enregistrés. Effacer le cache ${registrations.length} fois pour les purger.`);
				}
				else if (registrations[0].active.scriptURL.endsWith("service-worker-lite.js")) {
					serviceWorker.textContent = registrations[0].active.scriptURL;
					this.#liteMode();
					setCookie("autoUpdate", false);
				}
				else if (!registrations[0]?.sync) {
					serviceWorker.textContent = `${registrations[0].active.scriptURL} without sync`;
					document.getElementById("autoUpdateEnable").disabled = true;
					document.getElementById("notificationEnable").disabled = true;
					setCookie("autoUpdate", false);
				}
				else serviceWorker.textContent = registrations[0].active.scriptURL;
			}
		});


		this.#checkboxButton("notificationEnable", "notification");
		this.#checkboxButton("autoUpdateEnable", "autoUpdate", DELETE_CACHE);
		this.#checkboxButton("debugEnable", "debug", function() {
			let cookies = document.getElementById("cookies"),
				manifest = document.getElementById("manifest")
			;
			cookies.textContent = ""; manifest.textContent = ""; // Removing childrens

			for (const name of document.cookie.replace(/=\S+/g, "").split(" ")) {
				cookies.insertAdjacentHTML("beforeend", `
					<tr>
						<td>${name}</td>
						<td>${getCookie(name)}</td>
					</tr>
				`);
			}
			
			fetch(MANIFEST_NAME).then(response => 
				response.json().then(json => {
					for (const key in json) {
						if (Object.hasOwnProperty.call(json, key)) {
							manifest.insertAdjacentHTML("beforeend", `
								<tr>
									<td>${key}</td>
									<td>${json[key]}</td>
								</tr>
							`);
						}
					}
				})
			);
			
			document.getElementById("developmentBranch").selected = true;
		});
		if (getCookie("debug").toType()) document.getElementById("debugEnable").click();

		document.getElementById("deleteCache").addEventListener("click", () => {
			if(!navigator.onLine) {
				if (confirm("🚫 Vous êtes hors ligne et vous voulez effacez le cache 🚫 \n 🚫 Continuez et l'application ne sera plus disponible 🚫")) {
					DELETE_CACHE();
				}
			}
			else DELETE_CACHE();
		});

		document.getElementById("resetCookies").addEventListener("click", SET_DEFAULT_COOKIES);

		/**
		 * @type {HTMLSelectElement}
		 */
		// @ts-ignore
		let branch = document.getElementById("developmentBranch");
		document.querySelector(`select#developmentBranch option[value="${getCookie("developmentBranch")}"]`).selected = true;
		branch.addEventListener("change", () => {
			setCookie("developmentBranch", branch.value);
			caches.delete(CACHE_NAME).then(success => {
				if (success) {
					window.location.reload();
				}
				else {
					sendNotification("developmentBranch\nLe cache n'a pas pu être effacé.");
				}
			});
		});

		this.#initialised = true;
	}
}