export class Version {
	#selfInt = 0;
	#self = "";

	#compareInt = 0;
	#compare = "";

	/**
	 * @param {string} self "Number.Number.Number"
	 * @param {string} compare
	 * @throws {TypeError} Wrongly formated string
	 */
	constructor(self, compare) {
		this.self = self;
		this.compare = compare;
	}

	/**
	 * @param {string} version
	 * @param {"compare"|"self"} who
	 * @returns {number}
	 * @throws {TypeError} Wrongly formated string
	 */
	#versionInt(version, who) {
		const versionInt = Number.parseInt(version.replace(/\./g, ""), 10);

		if (Number.isNaN(versionInt)) {
			throw new TypeError(`${who}=${version} :${typeof version}`);
		}

		return versionInt;
	}

	/**
    * @param {string} self "Number.Number.Number"
    * @throws {TypeError} Wrongly formated string
    */
	set self(self) {
		this.#self = self;
		this.#selfInt = this.#versionInt(self, "self");
	}

	/**
    * @param {string} compare "Number.Number.Number"
    * @throws {TypeError} Wrongly formated string
    */
	set compare(compare) {
		this.#compare = compare;
		this.#compareInt = this.#versionInt(compare, "compare");
	}

	get self() {
		return this.#self;
	}

	get compare() {
		return this.#compare;
	}

	isUpper() {
		return this.#selfInt > this.#compareInt;
	}

	isLower() {
		return this.#selfInt < this.#compareInt;
	}

	isEqual() {
		return this.#selfInt === this.#compareInt;
	}
}