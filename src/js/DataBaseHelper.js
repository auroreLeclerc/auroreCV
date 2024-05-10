import { ArchitectureError, HttpError, NotFoundError, UnknownError } from "./Errors.js";
import { CACHE_NAME } from "./variables.mjs";

/**
 * @typedef {object} AppConfig
 * @property {boolean} firstUse
 * @property {boolean} autoUpdate
 * @property {boolean} notification
 * @property {boolean} debug
 * @property {number} version
 * @property {Date} lastReset
 * @property {boolean} serviceWorker
 * @property {keyof import("./variables.mjs").Locales} locale
 */

/**
 * @typedef {object} AppErrors
 * @property {Date} date
 * @property {Error} error
 */

export class DataBaseHelper {
	#currentVersion = 2;
	#openRequest = indexedDB.open(CACHE_NAME, this.#currentVersion);
	/**
	 * @type {number}
	 */
	#oldVersion;
	#started = false;

	get started() {
		return this.#started;
	}

	constructor() {
		this.#openRequest.onupgradeneeded = version => {
			const db = this.#openRequest.result;
			this.#oldVersion = version.oldVersion;
			switch (version.oldVersion) {
				case 0:
					db.createObjectStore("appConfig", { keyPath: "id", autoIncrement: true });
					db.createObjectStore("errorConfig", { keyPath: "id", autoIncrement: true });
					break;
				case 1:
					// client had version 1
					// update
					break;
			}
		};

		this.#openRequest.onblocked = change => {
			console.error(change);
			window.alert(change);
		};
	}

	/**
	 * @returns {Promise.<DataBaseHelperTransaction>}
	 */
	get start() {
		return new Promise((resolve, reject) => {
			this.#openRequest.onsuccess = () => {
				this.#openRequest.result.onversionchange = event => {
					console.warn(JSON.stringify(event));
				};
				if (this.started) {
					this.#openRequest.result.close();
					throw new ArchitectureError("Database connection already started.");
				}
				const transactionHelper = new DataBaseHelperTransaction(this.#openRequest.result);
				this.#started = true;
				switch (this.#oldVersion) {
					case 0: {
						const transaction = this.#openRequest.result.transaction("appConfig", "readwrite");
						/**
						 * @type {AppConfig}
						 */
						const appconfig = {
							firstUse: false,
							autoUpdate: true,
							notification: false,
							debug: false,
							version: this.#currentVersion,
							lastReset: new Date(),
							serviceWorker: true,
							locale: "auto",
						};
						transaction.objectStore("appConfig").add(appconfig);
						transaction.commit();
						break;
					}
					case 1:
						transactionHelper.setAppConfig("locale", "auto");
						transactionHelper.setAppConfig("version", 2);
						break;
					default:
						break;
				}
				resolve(transactionHelper);
			};
			this.#openRequest.onerror = event => {
				reject(new UnknownError(JSON.stringify(event)));
			};
			this.#openRequest.onblocked = event => {
				reject(new UnknownError(JSON.stringify(event)));
			};
		});
	}
}

/**
 * @typedef {DataBaseHelperTransaction} DataBaseHelperTransactionType
 */

class DataBaseHelperTransaction {
	#database;

	/**
	 * @param {IDBDatabase} database
	 */
	constructor(database) {
		this.#database = database;
	}

	/**
	 * @param {string} name
	 * @param {"readonly" | "readwrite"} operation
	 */
	#getStore(name, operation) {
		const transaction = this.#database.transaction(name, operation);
		return transaction.objectStore(name);
	}

	/**
	 * @param {keyof AppConfig} key
	 * @returns {Promise.<AppConfig[keyof AppConfig]>}
	 */
	getAppConfig(key) {
		return new Promise((resolve, reject) => {
			const store = this.#getStore("appConfig", "readonly");
			const request = store.get(IDBKeyRange.only(1));

			request.onerror = error => reject(new UnknownError(error.toString()));
			request.onsuccess = () => {
				if (request.result) resolve(request.result[key]);
				else reject(new NotFoundError(`${key} in getAppConfig`));
			};
		});
	}

	/**
	 * @description Adds or updates record.
	 * @param {keyof AppConfig} key
	 * @param {AppConfig[keyof AppConfig]} value
	 * @returns {Promise.<void>}
	 */
	setAppConfig(key, value) {
		return new Promise((resolve, reject) => {
			const store = this.#getStore("appConfig", "readwrite");
			const request = store.get(IDBKeyRange.only(1));

			request.onerror = error => reject(new UnknownError(error.toString()));
			request.onsuccess = () => {
				if (request.result) {
					request.result[key] = value;
					store.put(request.result);
					resolve();
				}
				else reject(new NotFoundError(`${key} in setAppConfig`));
			};
		});
	}

	/**
	 * @returns {Promise.<AppConfig>}
	 */
	getAllAppConfig() {
		return new Promise((resolve, reject) => {
			const store = this.#getStore("appConfig", "readonly");
			const request = store.get(IDBKeyRange.only(1));

			request.onerror = error => reject(new UnknownError(error.toString()));
			request.onsuccess = () => resolve(request.result);
		});
	}

	/**
	 * @param {Error} errorInsert
	 * @returns {Promise.<void>}
	 */
	setAppError(errorInsert) {
		return new Promise((resolve, reject) => {
			const store = this.#getStore("errorConfig", "readwrite");
			const request = store.add(/** @type {AppConfig} */ {
				date: new Date(),
				error: errorInsert,
			});

			request.onerror = error => reject(new UnknownError(error.toString()));
			request.onsuccess = () => {
				if (request.result) resolve();
				else reject(new UnknownError("Error registration failed"));
			};
		});
	}

	/**
	 * @returns {Promise.<AppErrors[]>}
	 */
	getErrors() {
		return new Promise((resolve, reject) => {
			const store = this.#getStore("errorConfig", "readonly");
			const request = store.getAll();

			request.onerror = error => reject(new UnknownError(error.toString()));
			request.onsuccess = () => resolve(request.result);
		});
	}

	hardReset() {
		this.#database.close();
		const request = indexedDB.deleteDatabase(CACHE_NAME);
		request.onerror = event => {
			globalThis.mvc.controller._renderError(new HttpError(424, event.toString(), window.location.toString()));
		};
		request.onsuccess = () => {
			window.location.reload();
		};
	}
}
