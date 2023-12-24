import { DataBaseHelper } from "./DataBaseHelper.js";
import { getEmojiPeople } from "./variables.mjs";

export class HttpError extends Error {
	/**
	 * @description HTTP Error
	 * @param {number} code status
	 * @param {string} response statusText
	 * @param {string} url URL
	 * @param {string[]} msgs
	 */
	constructor(code, response, url, ...msgs) {
		super();

		this.name = `HTTP Error ${code}`;
		this.message = `${url} is ${response}.`;
		const main = `${this.name}: ${this.message}`;
		
		for (const msg of msgs) {
			this.message += ` ${msg}.`;
		}

		this.parameters = {
			main: main,
			status: code,
			statusText: response,
			url: url,
			addMsgs: msgs
		};

		new DataBaseHelper().start.then(db => db.setAppError(this));
	}

	get emoji() {
		switch (this.parameters.status.toString()[0]) {
		case "1":
			return getEmojiPeople("&#128295;", true);
		case "2":
			return getEmojiPeople("&#1F646;");
		case "3":
			return getEmojiPeople("&#127939;");
		case "4":
			switch (this.parameters.status) {
			case 404:
				return getEmojiPeople("&#128373;");
	
			case 403:
				return getEmojiPeople("&#128110;");
	
			case 406:
				return getEmojiPeople("&#9878;&#65039;", true);
	
			case 444:
				return "&#9992;&#65039;";
	
			default:
				return getEmojiPeople("&#128581;");
			}
		case "5":
			switch (this.parameters.status) {
			case 508:
				return "&#9854;&#65039;";
	
			case 521:
				return getEmojiPeople("&#127979;", true);
	
			default:
				return getEmojiPeople("&#128187;", true);
			}
		default:
			return "❌";
		}
	}
}

export class NotFoundError extends Error {
	/**
	 * @description Not Found
	 * @param {string} element element
	 * @param {string} [msg] Additional message
	 */
	constructor(element, msg = "") {
		super();

		this.name = "Not Found Error";
		this.message = "";

		this.message += `${element} not found.`;	
		if(msg) this.message +=` ${msg}.`;

		this.parameters = {
			element: element,
			msg: msg
		};

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