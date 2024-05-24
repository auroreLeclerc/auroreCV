import expect from "expect.js";
import * as fs from "node:fs";
import { LOCALES } from "../www/src/js/variables.mjs";
import assert from "node:assert";

describe("Locales", function () {
	context("Index", function () {
		it("locales", function () {
			const html = fs.readFileSync(`./www/index.html`, "utf8");
			const balises = html.match(/locale="\S*"/g);
			for (const balise of balises) {
				expect(balise).to.contain("index.");
			}
		});
	});
	context("Settings", function () {
		it("Language switch", function () {
			const html = fs.readFileSync(`./www/src/view/settings.html`, "utf8");
			for (const locale of LOCALES) {
				expect(html).to.contain(`id="${locale}"`);
			}
		});
	});

	context("Controller", function () {
		let locales = [""];

		before(function () {
			locales = fs.readdirSync("./www/src/locales/");
		});

		it("Controller is up to date", async function () {
			for (const locale of locales) {
				assert.ok(LOCALES.has(locale));
			}
		});

		describe(`Languages`, function () {
			/**
			 * @type {{[key: string]: string[]}}
			 */
			let localeDirDict = {};

			before(function () {
				for (const locale of locales) {
					localeDirDict[locale] = fs.readdirSync(`./www/src/locales/${locale}/`);
				}
			});

			it("View locales are completete", function () {
				for (const [locale, translations] of Object.entries(localeDirDict)) {
					const htmls = fs.readdirSync(`./www/src/view/`, "utf8");
					expect(translations.length).to.be.equal(htmls.length + 1);
				}
			});

			it("Reading occurences from json", async function () {
				for (const [locale, translations] of Object.entries(localeDirDict)) {
					for (const translation of translations) {
						const fileName = translation.split(".")[0];
						const json = JSON.parse(fs.readFileSync(`./www/src/locales/${locale}/${fileName}.json`, "utf8"));
						let html;

						if (fileName === "index") {
							html = fs.readFileSync(`./www/index.html`, "utf8");
						}
						else {
							html = fs.readFileSync(`./www/src/view/${fileName}.html`, "utf8");
						}

						for (const [key, value] of Object.entries(json)) {
							expect(html).to.contain(`locale="${key}"`);
						}
					}
				}
			});

			it("Reading occurences from html", async function () {
				for (const [locale, translations] of Object.entries(localeDirDict)) {
					for (const translation of translations) {
						const fileName = translation.split(".")[0];
						const json = JSON.parse(fs.readFileSync(`./www/src/locales/${locale}/${fileName}.json`, "utf8"));
						let html;
						if (fileName === "index") {
							html = fs.readFileSync(`./www/index.html`, "utf8");
						}
						else {
							html = fs.readFileSync(`./www/src/view/${fileName}.html`, "utf8");
						}

						const balises = html.match(/locale="\S*"/g);
						for (const balise of balises) {
							expect(json).to.have.property(balise.substring(8, balise.length - 1));
						}
					}
				}
			});
		});
	});
});
