import { setCookie } from "./variables.js";

export class HttpError extends Error {
	/**
	* @description HTTP Error
	* @param {number} code status
	* @param {string} response statusText
	* @param {string} url URL
	* @param {string} [msg] Additional message
	*/
	constructor(code, response, url, msg = undefined) {
		super();

		this.name = `HTTP Error ${code}`;
		this.message = `${url} is ${response}.`;
		
		if(msg) this.message += ` ${msg}.`;

		this.parameters = {
			status: code,
			statusText: response,
			url: url,
			msg: msg
		};
	}
}

export class UnregisteredError extends Error {
	/**
	* @description Condition not registered
	* @param {string} where Where does the error come from
	* @param {any} what What argument caused the error
	* @param {boolean} [internalError] Internal error message
	* @param {string} [msg] Additional message
	*/
	constructor(where, what, internalError = false, msg = undefined) {
		super();

		this.name = "Unregistered Error";
		this.message = "";

		if(internalError) this.message += "Internal implementation error ! ";
		this.message += `${what} is not registered in ${where}.`;		
		if(msg) this.message +=` ${msg}.`;

		this.parameters = {
			where: where,
			what: what,
			internal: internalError,
			msg: msg
		};

		if (typeof document !== "undefined") {
			setCookie("UnregisteredError", this.message);
		}
		else {
			cookieStore.set({
				name: "UnregisteredError",
				value: this.message.replace(/ /gi, "_"),
				expires: Date.now() + (365 * 5 * 24 * 60 * 60 * 1000)
			});
		}

	}
}

export class NotFoundError extends Error {
	/**
	* @description Not Found
	* @param {string} element element
	* @param {string} [msg] Additional message
	*/
	constructor(element, msg = undefined) {
		super();

		this.name = "Not Found Error";
		this.message = "";

		this.message += `${element} not found.`;	
		if(msg) this.message +=` ${msg}.`;

		this.parameters = {
			element: element,
			msg: msg
		};
	}
}