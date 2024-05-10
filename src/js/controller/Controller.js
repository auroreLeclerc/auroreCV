import { DataBaseHelper } from "../DataBaseHelper.js";
import { ArchitectureError, HttpError } from "../Errors.js";
import { LOCALES } from "../variables.mjs";

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
		for (const localeElement of document.querySelectorAll("body > header [locale], body > footer [locale]")) {
			const localeId = localeElement.getAttribute("locale");
			this.#indexFrenchTranslation[localeId] = localeElement.textContent;
		}
		addEventListener("hashchange", event => {
			this._render(new URL(event.newURL).hash.split("#")[1]);
		});
		this.reload();
	}

	reload() {
		this._render(window.location.hash.split("#")[1]);
	}

	/**
	 * @param {string} id
	 * @returns {Promise.<void>}
	 * @throws {HttpError}
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
					// @ts-ignore
						if (LOCALES.has(this.#browserLanguage)) {
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
						if (!responses[0].ok) reject(new HttpError(responses[0].status, responses[0].statusText, responses[0].url, responses[0].headers.get("Error-Details")));
						else if (!responses[1].ok) reject(new HttpError(responses[1].status, responses[1].statusText, responses[1].url, responses[1].headers.get("Error-Details")));
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
				});
			});
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
			}).catch(error => this._renderError(new HttpError(500, "Internal Import Model Failure", script.src, error.toString())));
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
	 * @param {HttpError} [errorToRender]
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
							view.getElementById("emote").textContent = errorToRender.emoji;
							view.getElementById("error").textContent = errorToRender.parameters.main;
							view.getElementById("additional").textContent = errorToRender.parameters.addMsgs.toString();
						}
						catch (error) {
							console.error("🧑‍✈️", error);
							this._recovery(new HttpError(521, "Internal Architecture Failure", response.url, (new ArchitectureError(error.toString())).toString()));
						}
					}

					while (view.body.firstElementChild.children.length) {
						this.#view.appendChild(view.body.firstElementChild.firstChild);
					}

					document.title = view.title;

					const links = view.head.getElementsByTagName("link");
					while (links.length) {
						links.item(0).classList.add("view-dependant-css");
						document.head.appendChild(links.item(0));
					}

					this.#translate(id).then(() => {
						this.#modelsLoading(view);
						this.#doneExecuting();
					}).catch(error => {
						if (errorToRender) this._recovery(new HttpError(508, "Loop Detected", response.url, errorToRender.toString(), error));
						else this._renderError(error);
					});
				}).catch(error => this._recovery(new HttpError(500, "Parsing error", response.url, error.toString())));
			}
			else if (errorToRender) this._recovery(new HttpError(508, "Loop Detected", response.url, errorToRender.toString()));
			else this._renderError(new HttpError(response.status, response.statusText, response.url, response.headers.get("Error-Details")));
		}).catch(error => {
			console.error("🧑‍✈️", error);
			if (errorToRender) this._recovery(new HttpError(503, "Service Unavailable", window.location.toString(), error.toString(), errorToRender.toString()));
			else this._renderError(new HttpError(500, "Internal Service Error", window.location.toString(), error.toString()));
		});
	}

	/**
	 * @description Does not break execution
	 * @param {HttpError} error
	 */
	_renderError(error) {
		this.#doneExecuting(true);
		this._render("error", error);
	}

	/**
	 * @description Breaks execution (throws error)
	 * @param {HttpError} error
	 */
	_recovery(error) {
		this.#preRender();
		this.#elementsToBeLoaded = 1;
		document.title = "Recovery";
		let main = `
			<style>
				main#view {
					align-self: center;
					text-align: center;
					display: flex;
					flex-flow: column nowrap;
					justify-content: center;
					align-items: center;
					width: 90%;
				}
			</style>
			<h2>${error.parameters.main}</h2>
		`;
		for (const msg of error.parameters.addMsgs) {
			main += `
				<h2>Caused by</h2>
				<h2>${msg}</h2>
			`;
		}
		main += "<h3><a href='./maintenance.html'>Maintenance</a></h3>";
		this.#view.insertAdjacentHTML("afterbegin", main);
		this.#doneExecuting();
		throw error;
	}
}

globalThis.mvc = {
	models: [],
	controller: new Controller(),
};
