import { DataBaseHelper } from "../DataBaseHelper.js";
import { ArchitectureError, HttpError, HttpRecoveryError, NotFoundError } from "../Errors.js";
import { LOCALES, getEmojiPeople } from "../variables.mjs";

/**
 * @typedef {import("../../../../../electron/commonjs/preload.cjs").ElectronExposed} ElectronExposed
 * @typedef {import("../../../../../capacitor/CapacitorHelper.js").CapacitorHelper} CapacitorHelper
 */

export class Controller {
	/**
	 * @readonly
	 */
	#browserLanguage = new Intl.Locale(navigator.language).language;
	#elementsToBeLoaded = 0;
	#elementsLoaded = 0;
	#view = document.getElementById("view");
	#loading = document.getElementById("loading");
	/**
	 * @type {{[key: string]: string}}
	 */
	#indexFrenchTranslation = {};
	#loadingAnimation = {
		/**
		 * @param {"paused"|"running"} state
		 */
		set styleAnimationPlayState(state) {
			this.svg.style.animationPlayState = state;
			this.circle.style.animationPlayState = state;
		},
		/**
		 * @type {SVGElement}
		 */
		svg: document.querySelector("section#loading svg.round-loading"),
		/**
		 * @type {SVGElement}
		 */
		circle: document.querySelector("section#loading svg.round-loading circle"),
	};

	constructor() {
		// import("../header.js");
		// for (const localeElement of document.querySelectorAll("body > header [locale], body > footer [locale]")) {
		// 	const localeId = localeElement.getAttribute("locale");
		// 	this.#indexFrenchTranslation[localeId] = localeElement.textContent;
		// }
		addEventListener("hashchange", event => {
			this._render(new URL(event.newURL).hash.split("#")[1]);
		});
		this.reload();
	}

	reload() {
		this._render(window.location.hash.split("#")[1]);
	}

	/**
	 * @deprecated
	 * @param {string} id
	 * @returns {Promise.<void>}
	 * @throws {HttpError | DOMException | NotFoundError}
	 */
	#translate(id) {
		return new Promise((resolve, reject) => {
			/**
			 * @type {string}
			 */
			let language;
			new DataBaseHelper().start.then(transaction => {
				transaction.getAppConfig("locale").then(locale => {
					if (locale === "auto") {
						if (LOCALES.includes(this.#browserLanguage)) {
							language = this.#browserLanguage;
						}
						else language = "en"; // Fallback
					}
					else language = String(locale);

					if (language === "fr") {
						for (const indexElement of document.querySelectorAll("body > header [locale], body > footer [locale]")) {
							indexElement.textContent = this.#indexFrenchTranslation[indexElement.getAttribute("locale")];
						}
						resolve();
					}
					else Promise.all([
						fetch(`./src/locales/${language}/${id}.json`),
						fetch(`./src/locales/${language}/index.json`),
					]).then(responses => {
						if (!responses[0].ok) reject(new HttpError(responses[0].status, responses[0].statusText, responses[0].url, new Error(responses[0].headers.get("Error-Details"))));
						else if (!responses[1].ok) reject(new HttpError(responses[1].status, responses[1].statusText, responses[1].url, new Error(responses[0].headers.get("Error-Details"))));
						else Promise.all([
							responses[0].json(),
							responses[1].json(),
						]).then((/** @type {Array.<{[key: string]: string}>} */locales) => {
							for (const localeElement of document.querySelectorAll("[locale]")) {
								const localeId = localeElement.getAttribute("locale");
								const locale = locales[0][localeId] || locales[1][localeId];
								if (locale.indexOf("<") !== -1) {
									localeElement.textContent = "";
									localeElement.insertAdjacentHTML("afterbegin", locale);
								}
								else {
									localeElement.textContent = locale;
								}
							}
							resolve();
						});
					});
				}).catch((/** @type {NotFoundError} */ error) => reject(error));
			}).catch((/** @type {DOMException} */ error) => reject(error));
		});
	}

	/**
	 * @description Workaround to force kill Controller's doing
	 * @throws {Error}
	 */
	_stop() {
		this.#doneExecuting(true);
		throw new Error("Reset Content");
	}

	#doneExecuting(error = false) {
		this.#elementsLoaded++;
		if (error) {
			this.#elementsToBeLoaded = 0;
			this.#elementsLoaded = 0;
		}
		else if (this.#elementsLoaded >= this.#elementsToBeLoaded) {
			if (this.#elementsLoaded !== this.#elementsToBeLoaded) {
				console.warn("🧑‍✈️", `${this.#elementsLoaded} != ${this.#elementsToBeLoaded} ; known bug: when a model fetch (of many) errors out`);
			}
			this.#elementsToBeLoaded = 0;
			this.#elementsLoaded = 0;

			this.#loadingAnimation.styleAnimationPlayState = "paused";
			this.#loading.style.opacity = "0";
			this.#loading.style.visibility = "hidden";
			this.#view.style.display = null;
		}
	}

	#preRender() {
		this.#loadingAnimation.styleAnimationPlayState = "running";
		this.#loading.style.opacity = "1";
		this.#loading.style.visibility = "visible";
		this.#view.style.display = "none";
		while (this.#view.firstChild) {
			this.#view.removeChild(this.#view.firstChild);
		}
		const viewDependants = document.getElementsByClassName("view-dependant-css");
		while (viewDependants.length) {
			viewDependants.item(0).remove();
		}
	}

	/**
	 * @param {Document} view
	 */
	#modelsLoading(view) {
		const scripts = view.body.getElementsByTagName("script");
		globalThis.mvc.models = [];
		this.#elementsToBeLoaded += scripts.length;
		for (const script of scripts) {
			import(`${script.src}`).then(module => {
				const names = Object.keys(module);
				console.info("🧑‍✈️", `Model ${names[0]} loaded`);
				globalThis.mvc.models.push(new module[names[0]]());
				this.#doneExecuting();
			}).catch((/** @type {TypeError} */ error) => this._renderError(new HttpError(500, "Internal Import Model Failure", script.src, error)));
		}
	}

	render(id = "home") {
		try {
			this._stop();
		}
		catch (error) {
			console.warn("🧑‍✈️", error);
		}
		finally {
			this._render(id);
		}
	}

	/**
	 * @param {string} [id]
	 * @param {HttpError | DOMException | null} [errorToRender]
	 */
	_render(id = "home", errorToRender = null) {
		this.#elementsToBeLoaded++;
		this.#preRender();

		fetch(`./src/view/${id}.html`).then(response => {
			if (response.ok) {
				response.text().then(text => {
					const view = new DOMParser().parseFromString(text, "text/html");

					if (errorToRender) {
						try {
							if (globalThis.mvc.capacitor) globalThis.mvc.capacitor.statusBarBackgroundColor = "#B22222";
							if (errorToRender instanceof HttpError) {
								view.getElementById("emote").textContent = errorToRender.emoji;
								const errorElement = view.getElementById("error");
								errorElement.textContent = errorToRender.toString();
								for (const error of errorToRender.errors) {
									errorElement.insertAdjacentHTML("afterend", `<p>Caused by</p><h2>${error}</h2>`);
								}
							}
							else {
								view.getElementById("emote").textContent = getEmojiPeople(0x1F4BB, true);
								view.getElementById("error").textContent = errorToRender.toString();
							}
						}
						catch (error) {
							console.error("🧑‍✈️", error);
							if (error instanceof Error) this._recovery(new HttpRecoveryError(521, "Internal Architecture Failure", response.url, error));
							else this._recovery(new HttpRecoveryError(521, typeof error, response.url));
						}
					}
					else if (globalThis.mvc.capacitor) globalThis.mvc.capacitor.statusBarBackgroundColor = "#9932CC";

					while (view.body.firstElementChild.children.length) {
						this.#view.appendChild(view.body.firstElementChild.firstChild);
					}

					document.title = view.title;

					const links = view.head.getElementsByTagName("link");
					while (links.length) {
						links.item(0).classList.add("view-dependant-css");
						document.head.appendChild(links.item(0));
					}

					// this.#translate(id).then(() => {
					this.#modelsLoading(view);
					this.#doneExecuting();
					// }).catch((/** @type {HttpError | DOMException} */ error) => {
					// 	if (errorToRender) this._recovery(new HttpRecoveryError(508, "Loop Detected", response.url, error, errorToRender));
					// 	else this._renderError(error);
					// });
				}).catch((/** @type {TypeError} */ error) => {
					if (errorToRender) this._recovery(new HttpRecoveryError(508, "Parsing Loop Error", response.url, error, errorToRender));
					else this._renderError(new HttpError(500, "Parsing Error", response.url, error));
				});
			}
			else if (errorToRender) this._recovery(new HttpRecoveryError(508, "Loop Detected", response.url, errorToRender));
			else this._renderError(new HttpError(response.status, response.statusText, response.url, new Error(response.headers.get("Error-Details"))));
		}).catch((/** @type {Error} */ error) => {
			console.error("🧑‍✈️", error);
			if (errorToRender) this._recovery(new HttpRecoveryError(503, "Service Unavailable", window.location.toString(), error, errorToRender));
			else this._renderError(new HttpError(500, "Internal Service Error", window.location.toString(), error));
		});
	}

	/**
	 * @description Does not break execution
	 * @param {DOMException | HttpError} error
	 */
	_renderError(error) {
		this.#doneExecuting(true);
		this._render("error", error);
	}

	/**
	 * @description Breaks execution (throws error)
	 * @param {HttpRecoveryError} error
	 */
	_recovery(error) {
		this.#preRender();
		this.#elementsToBeLoaded = 1;
		document.title = "Recovery";
		let main = `
			<style>
				main#view {
					display: flex;
					flex-flow: column nowrap;
					justify-content: space-around;
					align-items: center;
					text-align: center;
				}
			</style>
			<h2>${error.toString()}</h2>
		`;
		for (const additionalError of error.errors) {
			main += `
				<p>Caused by</p>
				<h2>${additionalError}</h2>
			`;
		}
		main += "<h1><a href='./maintenance.html'>Maintenance</a></h1>";
		this.#view.insertAdjacentHTML("afterbegin", main);
		this.#doneExecuting();
		throw error;
	}
}

globalThis.mvc = {
	/**
	 * @type {ElectronExposed}
	 */
	// @ts-ignore
	electron: "electron" in window ? window.electron : null,
	/**
	 * @type {CapacitorHelper}
	 */
	capacitor: null,
	models: [],
	/**
	 * @type {Controller}
	 */
	controller: null,
};

import("../ts/CapacitorHelper.js").then(module => {
	if (Object.keys(module).length === 0) globalThis.mvc.capacitor = null;
	const helper = new module.CapacitorHelper();
	if (!helper.core.isNativePlatform()) {
		throw new ArchitectureError(helper.core.getPlatform());
	}
	globalThis.mvc.capacitor = helper;
}).catch(error => {
	console.error(error);
}).finally(() => globalThis.mvc.controller = new Controller());
