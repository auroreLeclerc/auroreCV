import { assert } from "node:console";
import * as fs from "node:fs";

describe("Cache", function () {
	it("locales", function () {
		const cache = JSON.parse(fs.readFileSync(`./www/src/json/cache.json`, "utf8"));
		for (let cacheFile of cache) {
			if (cacheFile === "maintenance.html" || cacheFile === "maintenance.js" || cacheFile === "maintenance.css" || cacheFile === "capacitor.bundle.js") {
				assert.fail(cacheFile);
			}
		}
	});
});
