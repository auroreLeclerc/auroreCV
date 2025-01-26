import { readFileSync } from "node:fs";
import manifest from "./www/manifest.json" with { type: "json" };
import assert from "node:assert";

describe("manifest.json", function () {
	context("Syntax", function () {
		it("Semantic Versioning", function () {
			assert.ok(/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/.test(manifest.version));
		});
	});
	context("Continuity", function () {
		it("V4 upgrade bypass removed", function () {
			const packageJson = JSON.parse(readFileSync("../app/package.json").toString());
			assert.strictEqual(packageJson.version, "1.0.0");
			assert.ok(typeof packageJson.changelogs === "undefined");
		});
	});
});
