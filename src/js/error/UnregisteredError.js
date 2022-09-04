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
		this.message = '';
        
		if(internalError) this.message +=`Internal error ! `;
		this.message += `${state} is not registered.`;		
		if(msg) this.message +=` ${msg}.`;

		this.stack = {
			state: state,
			internal: internalError,
			msg: msg
		};
	}
}