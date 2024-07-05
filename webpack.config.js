import path from "node:path";
import process from "node:process";

/**
 * @type {import("webpack").Configuration}
 */
export default {
	mode: "production",
	entry: "./capacitor/CapacitorHelper.js",
	experiments: {
		outputModule: true,
	},
	output: {
		path: path.join(process.cwd(), "/www/src/js/bundle/"),
		filename: "capacitor.bundle.js",
		library: {
			type: "module",
		},
	},
};
