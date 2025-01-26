import path from "node:path";
import webpack from "webpack";
import process from "node:process";

const config: webpack.Configuration = {
	mode: "production",
	entry: "./CapacitorHelper.js",
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

export default config;
