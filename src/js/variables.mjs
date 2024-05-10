import { DataBaseHelper } from "./DataBaseHelper.js";

/**
 * @typedef {object} Locales
 * @property {string} auto
 * @property {string} en
 * @property {string} fr
 */

export const
	/**
	 * @readonly
	 */
	CACHE_NAME = "auroreCV",
	/**
	 * @readonly
	 */
	MANIFEST_NAME = "manifest.json",
	/**
	 * @readonly
	 * @type {Set.<keyof Locales>}
	 */
	LOCALES = new Set(["auto", "en", "fr"])
;

const
	GENDERS = [
		0xFE0F,
		0x2640,
		0x2642,
	],
	PERSONNS = [
		0x1F9D1,
		0x1F468,
		0x1F469,
	],
	SKINTONES = [
		0xFE0F,
		0x1F3FB,
		0x1F3FC,
		0x1F3FD,
		0x1F3FE,
		0x1F3FF,
	]
;

/**
 * @description First delete the service worker then deleting the cache.
 * Otherwise a service worker with empty cache continues running, thus not installing itself.
 */
export const DELETE_CACHE = () => {
	navigator.serviceWorker.getRegistrations().then(function (registrations) {
		new DataBaseHelper().start.then(db => {
			db.setAppConfig("serviceWorker", true);
			for (let registration of registrations) {
				registration.unregister();
			}
			caches.delete(CACHE_NAME).then(success => {
				if (success) {
					window.location.reload();
				}
				else {
					sendNotification("Le cache n'a pas pu être effacé. Peut-être qu'il n'y a plus de données en cache.");
				}
			});
		});
	});
};

/**
 * @description Notification manager
 * @param {string} body The message the notification will display
 * @param {{action: string, title: string, icon?: string}[]} actions Only with ServiceWorker. Show as buttons in the notification
 */
export function sendNotification(body, actions = []) {
	const title = "Curriculum vitæ d'Aurore Leclerc";
	const options = {
		lang: "FR",
		badge: "./src/img/homeMade/icons/initials.png",
		body: body,
		tag: "🏳️‍⚧️",
		icon: "./src/img/homeMade/icons/384.png",
		// image: "./src/img/homeMade/icons/512.png",
		actions: actions,
	};

	if (Notification.permission !== "granted") {
		Notification.requestPermission().then(response => {
			if (response === "granted") {
				return sendNotification(body, actions);
			}
		});
	}
	else if ("serviceWorker" in navigator) { // DOM Scope
		navigator.serviceWorker.getRegistration().then(registration => {
			registration ? registration.showNotification(title, options) : new Notification(title, options);
		});
	}
	else if ("serviceWorker" in self) { // Service Worker Scope
		self.registration.showNotification(title, options);
	}
	else new Notification(title, options);
}

/**
 * @param {number} emoji as HTML decimal/hexadecimal encoded emoji
 * @param {boolean} isAccessory to construct an emoji with an accessory rather than a person emoji
 */
export function getEmojiPeople(emoji, isAccessory = false) {
	const randomIndex = (/** @type {number[]} */ array) => Math.floor(Math.random() * array.length);
	if (isAccessory) {
		return String.fromCodePoint(PERSONNS[randomIndex(PERSONNS)], SKINTONES[randomIndex(SKINTONES)], 0x200D, emoji);
	}
	else {
		return String.fromCodePoint(emoji, SKINTONES[randomIndex(SKINTONES)], 0x200D, GENDERS[randomIndex(GENDERS)]);
	}
}

/**
 * @param {Date} date
 * @returns {string} yyyy-MM-ddThh:mm:ss
 */
export function toDatetimeLocal(date) {
	return `${date.toLocaleDateString("fr-CA")}T${date.toLocaleTimeString("fr-FR")}`;
}
