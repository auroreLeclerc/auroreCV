export class Version {
	#selfInt = 0;
	#self = "";

	#compareInt = 0;
	#compare = "";

	/**
    * @param {string} self "Number.Number.Number"
    * @throws {TypeError} Wrongly formated string
    */
	constructor(self, compare) {
		this.self = self;
		this.compare = compare;
	}

	/**
    * @param {string} self "Number.Number.Number"
    * @throws {TypeError} Wrongly formated string
    */
	set self(self) {
		const selfInt = Number.parseInt(self.replace(/\./g, ""), 10);

		if (Number.isNaN(selfInt)) {
			throw new TypeError(`self=${self} :${typeof self}`);
		}

		this.#self = self;
		this.#selfInt = selfInt;
	}

	/**
    * @param {string} compare "Number.Number.Number"
    * @throws {TypeError} Wrongly formated string
    */
	set compare(compare) {
		const compareInt = Number.parseInt(compare.replace(/\./g, ""), 10);

		if (Number.isNaN(compareInt)) {
			throw new TypeError(`compare=${compare} :${typeof compare}`);
		}

		this.#compare = compare;
		this.#compareInt = compareInt;
	}

	/**
    * @returns {string}
    */
	get self() {
		return this.#self;
	}

	/**
    * @returns {string}
    */
	get compare() {
		return this.#compare;
	}

	/**
    * @returns {boolean}
    */
	isUpper() {
		return this.#selfInt > this.#compareInt;
	}

	/**
    * @returns {boolean}
    */
	isLower() {
		return this.#selfInt < this.#compareInt;
	}

	/**
    * @returns {boolean}
    */
	isEqual() {
		return this.#selfInt === this.#compareInt;
	}
}