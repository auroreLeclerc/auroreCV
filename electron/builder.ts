import * as builder from "electron-builder";
import manifest from "./www/manifest.json" with { type: "json" };

const options: builder.Configuration = {
	appId: "gay.aurore.cv",
	productName: manifest.name,
	artifactName: "${name}_${version}.${ext}",
	electronLanguages: ["en", "fr"],

	directories: {
		output: "./build/",
		buildResources: "./resources/electron/",
		app: "./www/",
	},
	extraResources: [{
		from: "./electron/commonjs/",
		to: "./",
		filter: "**/*.cjs",
	}, {
		from: "./resources/electron/",
		to: "./",
		filter: "**/*.png",
	}],

	win: {
		icon: "./resources/electron/icon.ico",
		releaseInfo: {
			releaseDate: new Date().toDateString(),
			releaseName: "${version}",
			releaseNotes: manifest.changelogs.join(", "),
			vendor: {
				"🏳️‍🌈": manifest.id,
			},
		},
	},
	nsis: {
		shortcutName: manifest.short_name,
		license: "./LICENSE",
	},
	linux: {
		synopsis: manifest.short_name,
		description: manifest.description,
		category: manifest.categories[0],
		icon: "./resources/electron/icon.icns",
		maintainer: "Aurore Leclerc",
		vendor: manifest.id,
	},
	mac: {
		icon: "./resources/electron/icon.icns",
	},
	flatpak: {
		baseVersion: "23.08",
		runtimeVersion: "23.08",
	},
};

builder.build({
	x64: true,
	linux: ["appImage"],
	win: ["nsis"],
	config: options,
}).then(result => {
	console.log(JSON.stringify(result));
}).catch(error => {
	console.error(error);
});
