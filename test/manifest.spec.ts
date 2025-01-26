import { readFileSync } from "node:fs";
import manifest from "./www/manifest.json" with { type: "json" };
import assert from "node:assert";

describe("manifest.json", function () {
	context("Syntax", function () {
		it("Semantic Versioning", function () {
			assert.ok(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/.test(manifest.version));
		});
	});
	context.skip("Continuity", function () {
		let packageJson: any;
		before(function() {
			packageJson = readFileSync("../package.json");
		});
		it("V4 upgrade bypass removed", function () {
			assert.ok(typeof packageJson.version !== "string");
			assert.ok(!Array.isArray(packageJson.changelogs));
		});
	});
});
