import * as builder from "electron-builder";
import manifest from "../www/manifest.json" assert { type: "json" };
import packageJson from "../package.json" assert { type: "json" };

const options: builder.Configuration = {
	"appId": "gay.aurore.cv",
	"productName": manifest.name,
	"artifactName": "${name}_${version}.${ext}",

	"directories": {
		"output": "./out/build/",
		"buildResources": "./resources/",
	},

	"win": {
		"icon": "./resources/icon.ico",
		"releaseInfo": {
			"releaseDate": new Date().toDateString(),
			"releaseName": "${version}",
			"releaseNotes": packageJson.changelogs.join(", "),
			"vendor": {
				"🏳️‍🌈": manifest.id
			}
		}
	},
	"nsis": {
		"shortcutName": manifest.short_name,
		"license": "./LICENSE"
	},
	"linux": {
		"synopsis": manifest.short_name,
		"description": manifest.description,
		"category": manifest.categories[0],
		"icon": "./resources/icon.icns",
		"maintainer": packageJson.author,
		"vendor": manifest.id
	},
	"mac": {
		"icon": "./resources/icon.icns"
	},
	"flatpak": {
		"baseVersion": "23.08",
		"runtimeVersion": "23.08"
	}
};

builder.build({
	"x64": true,
	"linux": ["appImage"],
	"win": ["nsis"],
	"config": options
}).then((result) => {
	console.log(JSON.stringify(result));
}).catch((error) => {
	console.error(error);
});