import * as fs from "node:fs";
import expect from "expect.js";
import assert from "node:assert";
import { Prettify } from "./www/src/js/model/Prettify.js";

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
		let html = "";
		before(function () {
			html = fs.readFileSync("./www/src/view/home.html", "utf8");
		});

		it("fullTexts occurances from html", async function() {
			for (const text of Object.keys(Prettify.fullTexts)) {
				expect(html).to.contain(`<span class="accordion prettify-js">${text}</span>`);
			}
		});

		it("fullTexts occurances from js", async function() {
			const tags = html.match(/<span class="accordion prettify-js">\w+<\/span>/gm) ?? ["N/A"];
			for (let tag of tags) {
				tag = tag.replace("<span class=\"accordion prettify-js\">", "");
				tag = tag.replace("</span>", "");
				expect(Prettify.fullTexts).to.have.property(tag);
			}
		});
	});
});
