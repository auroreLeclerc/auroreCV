import { DataBaseHelper } from "./DataBaseHelper.js";
import { getEmojiPeople } from "./variables.mjs";

export class HttpRecoveryError extends Error {
	#status;
	statusText;
	/**
	 * @type {string[]}
	 */
	errors = [];

	/**
	 * @description HTTP Error with no Database
	 * @param {number} code status
	 * @param {string} response statusText
	 * @param {string} url URL
	 * @param {Error[]} errors
	 */
	constructor(code, response, url, ...errors) {
		super();
		this.#status = code;
		this.statusText = response;

		this.name = `Recovery Error ${code}`;
		this.message = `${url} is ${response}.`;

		for (const error of errors) {
			if (error === null) {
				throw new ArchitectureError(`Error is null`); // Will crash if DataBase is stuck
			}
			this.errors.push(`${new Date().getTime()}: ${error.constructor.name}: ${error.name}: ${error.message}`);
			if (error instanceof HttpError) {
				this.errors.concat(error.errors);
			}
		}
	}

	get emoji() {
		switch (this.#status.toString()[0]) {
			case "1":
				return getEmojiPeople(0x1F527, true);
			case "2":
				return getEmojiPeople(0x1F646);
			case "3":
				return getEmojiPeople(0x1F3C3);
			case "4":
				switch (this.#status) {
					case 404:
						return getEmojiPeople(0x1F575);

					case 403:
						return getEmojiPeople(0x1F46E);

					case 406:
						return getEmojiPeople(0x2696, true);

					case 444:
						return String.fromCodePoint(0x2708);

					default:
						return getEmojiPeople(0x1F645);
				}
			case "5":
				switch (this.#status) {
					case 508:
						return String.fromCodePoint(0x267E);

					case 521:
						return getEmojiPeople(0x1F3EB, true);

					default:
						return getEmojiPeople(0x1F4BB, true);
				}
			default:
				return "❌";
		}
	}
}

export class HttpError extends HttpRecoveryError {
	/**
	 * @description HTTP Error
	 * @param {number} code status
	 * @param {string} response statusText
	 * @param {string} url URL
	 * @param {Error[]} errors
	 */
	constructor(code, response, url, ...errors) {
		super(code, response, url, ...errors);

		this.name = `HTTP Error ${code}`;

		new DataBaseHelper().start.then(db => db.setAppError(this));
	}
}

export class NotFoundError extends Error {
	/**
	 * @description Not Found
	 * @param {string} element element
	 */
	constructor(element) {
		super();

		this.name = "Error Not Found";
		this.message = element;

		new DataBaseHelper().start.then(db => db.setAppError(this));
	}
}

export class ArchitectureError extends Error {
	/**
	 * @description Human error to be thrown when architectural checks fail
	 * @param {string} message
	 */
	constructor(message) {
		super();

		this.name = "Architecture Error";
		this.message = message;

		new DataBaseHelper().start.then(db => db.setAppError(this));
	}
}

export class UnknownError extends Error {
	/**
	 * @description Unknown error to be thrown on edge case
	 * @param {string} message
	 */
	constructor(message) {
		super();

		this.name = "Unknown Error";
		this.message = message;

		new DataBaseHelper().start.then(db => db.setAppError(this));
	}
}
