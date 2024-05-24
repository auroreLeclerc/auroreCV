import * as fs from "node:fs";
import assert from "node:assert";

describe("MVC", function () {
	context("Model", function () {
		let models = [""];
		before(function () {
			models = fs.readdirSync("./www/src/js/model");
		});

		it("Models must have only one class declaration", async function () {
			for (const model of models) {
				const module = await import(`../www/src/js/model/${model}`);
				const names = Object.keys(module);
				assert.deepStrictEqual(names.length, 1);
			}
		});
	});
});
