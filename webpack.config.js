import path from "node:path";

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
		path: path.resolve(process.cwd(), "www/src/js/out"),
		filename: "capacitor.bundle.js",
		library: {
			type: "module",
		},
	},
};
