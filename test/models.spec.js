import * as fs from "node:fs";
import expect from "expect.js";
import assert from "node:assert";
import { Prettify } from "../www/src/js/model/Prettify.js";

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
	context("Prettify", function () {
		it.skip("Are accordions bloated ?", function () {
			global.document = {
				getElementsByClassName: () => [],
			};
			const accordions = (new Prettify())._fullTexts;
			const html = fs.readFileSync(`./www/src/view/home.html`, "utf8");
			for (const acronym of accordions.keys()) {
				expect(html).to.contain(`<span class="accordion prettify-js">${acronym}</span>`);
			}
		});
	});
});
