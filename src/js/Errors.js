export class HttpError extends Error {
	/**
	* @description HTTP Error
	* @param {int} code status
	* @param {string} response statusText
	* @param {string} url URL
	* @param {string} [msg] Additional message
	*/
	constructor(code, response, url, msg = null) {
		super();

		this.name = `HTTP Error ${code}`;
		this.message = `${url} is ${response}.`;
		
		if(msg) this.message += ` ${msg}.`;

		this.stack = {
			status: code,
			statusText: response,
			url: url,
			msg: msg
		};
	}
}

export class UnregisteredError extends Error {
	/**
	* @description Not registered state
	* @param {string} state state
	* @param {boolean} internalError Internal error message
	* @param {string} [msg] Additional message
	*/
	constructor(state, internalError = false, msg = null) {
		super();

		this.name = "Unregistered Error";
		this.message = "";

		if(internalError) this.message += "Internal implementation error ! ";
		this.message += `${state} is not registered.`;		
		if(msg) this.message +=` ${msg}.`;

		this.stack = {
			state: state,
			internal: internalError,
			msg: msg
		};
	}
}

export class NotFoundError extends Error {
	/**
	* @description Not Found
	* @param {string} element element
	* @param {string} [msg] Additional message
	*/
	constructor(element, msg = null) {
		super();

		this.name = "Not Found Error";
		this.message = "";

		this.message += `${element} not found.`;	
		if(msg) this.message +=` ${msg}.`;

		this.stack = {
			element: element,
			msg: msg
		};
	}
}