import * as assert from "node:assert";
import cache from "./www/src/json/cache.json" with { type: "json" };

describe("Cache", function () {
	it("locales", function () {
		for (const cacheFile of cache) {
			if (cacheFile === "maintenance.html" || cacheFile === "maintenance.js" || cacheFile === "maintenance.css" || cacheFile === "capacitor.bundle.js") {
				assert.fail(cacheFile);
			}
		}
	});
});
