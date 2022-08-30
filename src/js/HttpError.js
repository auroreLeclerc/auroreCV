export class HttpError extends Error {
	/**
	* @description HTTP Error
	* @param {int} code status
	* @param {string} response statusText
	* @param {string} url URL
	* @param {string} msg Additional message
	*/
	constructor(code, response, url, msg) {
		super();

		this.name = `HTTP Error ${code}`;
		this.message = `${url} is ${response}.`;
		
		if(msg) this.message+=` ${msg}.`;

		this.stack = {
			status: code,
			statusText: response,
			url: url,
			msg: msg
		};
	}
}