import * as builder from "electron-builder";
import fs from "node:fs";
import path from "node:path";
import manifest from "../manifest.json" assert { type: "json" };
import packageJson from "../package.json" assert { type: "json" };
import {FuseV1Options, FuseVersion, flipFuses} from "@electron/fuses";

const options: builder.Configuration = {
	"appId": manifest.id,
	"productName": manifest.name,
	"copyright": `© ${new Date().getFullYear()} ${packageJson.author}`,

	// "store” | “normal” | "maximum". - For testing builds, use 'store' to reduce build time significantly.
	"compression": "normal",
	"removePackageScripts": true,
	"buildDependenciesFromSource": false,
	"removePackageKeywords": true,

	"directories": {
		"output": "./build/dist/",
		"buildResources": "./build/ressources/"
	},

	"win": {
		"target": {
			"target": "nsis",
			"arch": "x64"
		}
	},
	"mac": {
		"category": manifest.categories[0],
		"target": "dmg",
		"hardenedRuntime": false,
		"gatekeeperAssess": false
	},
	"dmg": {
		"background": "./src/img/homeMade/icons/apple/apple-splash-1290-2796.jpg"
	},

	"linux": {
		"target": {
			"target": "AppImage",
			"arch": "x64"
		}
		
	},
	"appImage": {
		"category": manifest.categories[0],
		"description": manifest.description
	}

	// "afterPack": async (context: builder.AfterPackContext) => {
	// 	const executableName = context.packager.appInfo.productFilename.toLowerCase().replace("-dev", "");
	// 	const ext = {"darwin": ".app", "win32": ".exe", "linux": [""]}[context.electronPlatformName];
	// 	await flipFuses(path.join(context.appOutDir, `${manifest.name}${ext}`), {
	// 		"version": FuseVersion.V1,
	// 		[FuseV1Options.RunAsNode]: false,
	// 		[FuseV1Options.EnableCookieEncryption]: false,
	// 		[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false,
	// 		[FuseV1Options.EnableNodeCliInspectArguments]: false,
	// 		[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: false,
	// 		[FuseV1Options.OnlyLoadAppFromAsar]: false,
	// 		[FuseV1Options.LoadBrowserProcessSpecificV8Snapshot]: false,
	// 		[FuseV1Options.GrantFileProtocolExtraPrivileges]: false
	// 	});
	// }
};

fs.mkdirSync("./build/ressources/icons", {"recursive": true});
for (const resolution of [192, 384, 512, 1024]) {
	fs.copyFileSync(`./src/img/homeMade/icons/${resolution}.png`, `./build/ressources/icons/${resolution}x${resolution}.png`);
}

builder.build({
	"targets": builder.Platform.WINDOWS.createTarget(),
	"config": options
}).then((result) => {
	console.log(JSON.stringify(result));
}).catch((error) => {
	console.error(error);
});