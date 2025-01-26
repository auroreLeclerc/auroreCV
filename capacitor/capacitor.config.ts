import type { CapacitorConfig } from "@capacitor/cli";
import manifest from "./www/manifest.json" with { type: "json" };

const config: CapacitorConfig = {
	appId: "gay.aurore.cv",
	appName: manifest.short_name,
	webDir: "www",
	backgroundColor: manifest.background_color,
	plugins: {
		LocalNotifications: {
			smallIcon: "./www/src/img/homeMade/icons/initials.png",
		},
	},
};

export default config;
