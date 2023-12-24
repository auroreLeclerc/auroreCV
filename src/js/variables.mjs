import { DataBaseHelper } from "./DataBaseHelper.js";

export const
	CACHE_NAME = "auroreCV",
	MANIFEST_NAME = "manifest.json"
;

const
	GENDERS = [
		"",
		"&#8205;&female;",
		"&#8205;&male;"
	],
	PERSONNS = [
		"&#129489;",
		"&#128105;",
		"&#128104;"
	],
	SKINTONES = [
		"",
		"&#127995;",
		"&#127996;",
		"&#127997;",
		"&#127998;",
		"&#127999;"
	]
;

/**
 * @description First delete the service worker then deleting the cache.
 * Otherwise a service worker with empty cache continues running, thus not installing itself.
 */
export const DELETE_CACHE = () => {
	navigator.serviceWorker.getRegistrations().then(function(registrations) {
		new DataBaseHelper().start.then(db => {
			return db.setAppConfig("serviceWorker", true);
		});
		for(let registration of registrations) {
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
};

export const SET_DEFAULT_CONFIG = () => {
	const request = indexedDB.deleteDatabase(CACHE_NAME);
	request.onerror = (event) => {
		sendNotification(JSON.stringify(event));
	};
	request.onsuccess = () => {
	};
};

/**
 * @description Notification manager
 * @param {string} body The message the notification will display
 * @param {{action: string, title: string, icon?: string}[]} actions Only with ServiceWorker, Buttons in the notification
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
		actions: actions
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
			registration.showNotification(title, options);
		});
	}
	else if ("serviceWorker" in self) { // Service Worker Scope
		self.registration.showNotification(title, options);
	}
	else new Notification(title, options);	
}

/**
 * @param {string} emoji as HTML decimal/hexadecimal encoded emoji
 * @param {boolean} isAccessory to construct an emoji with an accessory rather than a person emoji 
 */
export function getEmojiPeople(emoji, isAccessory = false) {
	const randomIndex = (/** @type {string[]} */ array) => Math.floor(Math.random() * array.length);
	if (isAccessory) {
		return `${PERSONNS[randomIndex(PERSONNS)]}${SKINTONES[randomIndex(SKINTONES)]}&#8205;${emoji}`;
	}
	else {
		return `${emoji}${SKINTONES[randomIndex(SKINTONES)]}${GENDERS[randomIndex(GENDERS)]}`;
	}
}

/**
 * @param {Date} date 
 * @returns {string} yyyy-MM-ddThh:mm:ss
 */
export function toDatetimeLocal(date) {
	return `${date.toLocaleDateString("fr-CA")}T${date.toLocaleTimeString("fr-FR")}`;
}