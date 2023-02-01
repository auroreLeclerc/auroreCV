export class EnhancedSring extends String {

	/**
	 * @param {string} value
	 */
	constructor(value) {
		super(value);
	}

	/**
	 * @description Convert string to boolean
	 * @returns {boolean|number|any}
	 * @throws {TypeError} Value is not a boolean
	 */
	toType() {
		try {
			return JSON.parse(this.toLowerCase());
		} catch (error) {
			throw new TypeError(`${this} is a string`);
		}
	}
}