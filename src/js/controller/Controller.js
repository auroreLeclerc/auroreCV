import { ArchitectureError, HttpError } from "../Errors.js";

export class Controller {
	#elementsToBeLoaded = 0;
	#elementsLoaded = 0;
	#view = document.getElementById("view");
	#loading = document.getElementById("loading");
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
		circle: document.querySelector("section#loading svg.round-loading circle")
	};

	constructor() {
		addEventListener("hashchange", (event) => {
			this._render(new URL(event.newURL).hash.split("#")[1]);
		});
		this._render(window.location.hash.split("#")[1]);
	}

	/**
	 * @description Workaround to force kill Controller's doing
	 * @throws {Error}
	 */
	_stop() {
		this.#doneExecuting(true);
		throw new Error("Controller forced stop");
	}

	#doneExecuting(error = false) {
		this.#elementsLoaded++;
		if (error) {
			this.#elementsToBeLoaded = 0;
			this.#elementsLoaded = 0;
		}
		else if (this.#elementsLoaded >= this.#elementsToBeLoaded) {
			if (this.#elementsLoaded !== this.#elementsToBeLoaded) {
				console.warn(`${this.#elementsLoaded} != ${this.#elementsToBeLoaded} ; known bug: when a model fetch (of many) errors out`);
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
		while(this.#view.firstChild) {
			this.#view.removeChild(this.#view.firstChild);
		}
		const viewDependants = document.getElementsByClassName("view-dependant");
		while(viewDependants.length) {
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
				if (names.length === 0) {
					throw new ArchitectureError(`${script.src} is not a Model. There is no export.`);
				}
				else if (names.length > 1) {
					throw new ArchitectureError(`${script.src} is not a Model. There is more than one export.`);
				}
				console.info("🧑‍✈️", `Loading ${names[0]}`);
				globalThis.mvc.models.push(new module[names[0]]());
				this.#doneExecuting();
			}).catch(error => {
				if (error instanceof ArchitectureError) {
					this._renderError(new HttpError(521, "Internal Architecture Failure", window.location.toString(), JSON.stringify(error)));
				}
				this._renderError(new HttpError(500, "Internal Import Model Failure", script.src, error.toString()));
			});
		}
	}

	render(id = "home") {
		try {
			this._stop();
		} catch (error) {
			console.warn(error);
		} finally {
			this._render(id);
		}
	}

	/**
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
							view.getElementById("emote").innerHTML = errorToRender.emoji;
							view.getElementById("error").textContent = errorToRender.parameters.main;
							view.getElementById("additional").textContent = errorToRender.parameters.addMsgs.toString();
						} catch (error) {
							console.error(error);
							this._recovery(new HttpError(521, "Internal Architecture Failure", response.url, JSON.stringify(new ArchitectureError(JSON.stringify(error)))));
						}
					}
					while(view.body.firstElementChild.children.length) {
						this.#view.appendChild(view.body.firstElementChild.firstChild);
					}
					document.title = view.title;

					const links = view.head.getElementsByTagName("link");
					while(links.length) {
						links.item(0).classList.add("view-dependant");
						document.head.appendChild(links.item(0));
					}

					this.#modelsLoading(view);

					this.#doneExecuting();
				});
			}
			else if (errorToRender) this._recovery(new HttpError(508, "Loop Detected", response.url, JSON.stringify(errorToRender)));
			else this._renderError(new HttpError(response.status, response.statusText, response.url, response.headers.get("Error-Details")));
		}).catch(error => {
			console.error(error);
			if(errorToRender) this._recovery(new HttpError(508, "Loop Detected", window.location.toString(), error.toString(), JSON.stringify(errorToRender)));
			else this._renderError(new HttpError(500, "Internal Service Error", window.location.toString(), error.toString()));
		});
	}

	/**
	 * @note Does not break execution
	 * @param {HttpError} error 
	 */
	_renderError(error) {
		this.#doneExecuting(true);
		this._render("error", error);
	}

	/**
	 * @note Breaks execution (throws error)
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
		this.#view.insertAdjacentHTML("afterbegin", main);
		this.#doneExecuting();
		throw error;
	}
}

globalThis.mvc = {
	models: [],
	controller: new Controller()
};
