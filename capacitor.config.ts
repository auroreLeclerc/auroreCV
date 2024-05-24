import type {CapacitorConfig} from "@capacitor/cli";
import manifest from "./www/manifest.json" with { type: "json" };

const config: CapacitorConfig = {
	"appId": "gay.aurore.cv",
	"appName": manifest.short_name,
	"webDir": "www",
	"backgroundColor": manifest.background_color,
	"cordova": {
		"preferences": {
			"BackgroundColor": manifest.background_color,
			"StatusBarBackgroundColor": manifest.background_color
		}
	}
};

export default config;
