import { EnhancedSring } from "./EnhancedSring.js";
import { NotFoundError, UnregisteredError } from "./Errors.js";
import { Version } from "./Version.js";

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

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.addEventListener("message", (event) => {
		console.info("🖥️‍✉️", event.data?.request);
		switch (event.data?.request) {
		case "SET_DEFAULT_COOKIES":
			SET_DEFAULT_COOKIES();
			break;
		case "setCookie":
			setCookie(event.data?.data);
			break;
		default:
			throw new UnregisteredError("Client message", event.data?.request, true);
		}
	});
}

/**
 * @description First delete the service worker then deleting the cache.
 * Otherwise a service worker with empty cache continues running, thus not installing itself.
 */
export const DELETE_CACHE = () => {
	navigator.serviceWorker.getRegistrations().then(function(registrations) {
		setCookie("developmentBranch", 0);
		setCookie("service-worker", true);
		for(let registration of registrations) {
			registration.unregister();
		}
		caches.delete(CACHE_NAME).then(success => {
			if (success) {
				window.location.reload();
			}
			else {
				// TODO: make an internal frontend sendNotification fallback because in this case it is needed to give information why nothing happens
				sendNotification("Le cache n'a pas pu être effacé. Peut-être qu'il n'y a plus de données en cache.");
			}
		});
	});
};

/**
 * @description Set a cookie
 * @param {string} name Name of the cookie
 * @param {any} value Value of the cookie
 * @param {number} expiration In days, when the cookie will be deleted
 */
export function setCookie(name, value, expiration = 365 * 5) {
	value = String(value).replace(/ /gi, "_");
	let expirationDate = new Date();
	expirationDate.setTime(
		expirationDate.getTime() + (expiration * 24 * 60 * 60 * 1000)
	);
	document.cookie = `${name}=${value};expires=${expirationDate.toUTCString()}`;
}

/**
 * @description Get a cookie (not for Service Worker)
 * @param {string} name Name of the cookie
 * @returns {EnhancedSring} Value of the cookie
 * @throws {NotFoundError} Cookie not found.
 */
export function getCookie(name) {
	let value;

	value = document.cookie.split("; ").find(
		row => row.startsWith(`${name}=`)
	)?.split("=")[1];

	if (!value) {
		SET_DEFAULT_COOKIES();
		throw new NotFoundError(`Cookie ${name}`, "Cookies were reset");
	}

	return new EnhancedSring(value);
}

/**
 * @async
 * @description Get a cookie from cookieStore (for Service Worker)
 * @param {string} name Name of the cookie
 * @param {string} [assumed] Value to be returned in case cookieStore fails
 * @param {string} [clientId]
 * @returns {Promise<EnhancedSring>} Promise that returns value of the cookie
 * @throws {NotFoundError} Cookie not found
 */
export async function getCookieFromStore(name, assumed = "", clientId = "") {
	let value;

	/**
	 * @returns {import("./typedef.js").CookieStore}
	 */
	function getCookieStore() {
		// @ts-ignore
		// eslint-disable-next-line no-undef
		return cookieStore;
	}

	try {
		getCookieStore().get("firefox");
	} catch (error) {
		console.warn("🦊", error); 
		return Promise.resolve(new EnhancedSring(assumed));
	}

	return getCookieStore().get(name).then(cookie => {
		value = cookie?.value;
		if (!value) {
			self.clients.get(clientId).then(client => {
				client.postMessage({
					request: "SET_DEFAULT_COOKIES",
				});
			});
			throw new NotFoundError(`Cookie ${name} 📦‍🍪`, "Cookies were reset");
		}
		return new EnhancedSring(value);
	}).catch((/** @type {TypeError} */ error) => {
		console.error(error);
		return new EnhancedSring(assumed);
	});
}

/**
 * @description If there is a new version in cache cookies are updated.
 * If there is no update cookies are corrupted and therefore are reset.
 */
export const SET_DEFAULT_COOKIES = () => {
	fetch(MANIFEST_NAME).then(response =>
		response.json().then(json => {
			try {
				const cookieVsCache = new Version(getCookie("version").toString(), json.version);
				if(cookieVsCache.isLower()) {
					cookieVsCache.compare = "1.1.0";
					if (cookieVsCache.isLower()) { // Local Vs PastNewVersion
						setCookie("developmentBranch", 0);
					}

					cookieVsCache.compare = "1.2.0";
					if (cookieVsCache.isLower()) { // Local Vs PastNewVersion
						setCookie("UnregisteredError", null);
					}

					cookieVsCache.compare = "2.0.0";
					if (cookieVsCache.isLower()) { // Local Vs PastNewVersion
						setCookie("service-worker", true);
					}

					setCookie("version", cookieVsCache.compare);
					console.info("🍪‍♻️", "Cookies were updated");
				}
				else if (cookieVsCache.isEqual()) throw new Error("Cookies are corrupted");
				else if (cookieVsCache.isUpper()) throw new RangeError("Local is more recent than online");
				else throw new UnregisteredError("SET_DEFAULT_COOKIES", `cookieVsCache.isLower=${cookieVsCache.isLower()}`, true);
				
			} catch (error) {
				console.error(`SET_DEFAULT_COOKIES: ${error.toString()}`);
				
				setCookie("firstUse", false);
				setCookie("autoUpdate", true);
				setCookie("notification", false);
				setCookie("debug", false);
				setCookie("version", json.version);
				setCookie("lastReset", new Date().toISOString());
				setCookie("developmentBranch", 0);
				setCookie("UnregisteredError", null);
				setCookie("service-worker", true);
			}
		})
	);
};

/**
 * @description Notification manager
 * @param {string} body The message the notification will display
 * @param {{action: string, title: string, icon?: string}[]} actions Only with ServiceWorker, Buttons in the notification
 * @returns {Promise<void>}
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

	/**
	 * @param {(value: void | PromiseLike<void>) => void} resolve
	 */
	function fallBack (resolve) {
		new Notification(title, options);
		resolve();
	}

	/**
	 * @param {(value: void | PromiseLike<void>) => void} resolve
	 */
	function forwardNotification(resolve) {
		if ("serviceWorker" in navigator) { // DOM Scope
			navigator.serviceWorker.getRegistration().then(registration => {
				if (registration) {
					registration.showNotification(title, options).then(() => resolve());
				}
				else fallBack(resolve);
			});
		}
		else if ("serviceWorker" in self) { // Service Worker Scope
			self.registration.showNotification(title, options).then(() => resolve());
		}
		else fallBack(resolve);
	}
	
	return new Promise((resolve) => {
		if (Notification.permission !== "granted") {
			Notification.requestPermission().then(response => {
				if (response === "granted") {
					return forwardNotification(resolve);
				}
			});
		}
		else return forwardNotification(resolve);
	});


	
}

/**
 * @description Returns MIME Type from simple url ending with extension file
 * @param {string} url 
 * @returns {string} MIME Type
 */
export function getMimeType(url) {
	if (url.endsWith("/")) return "text/html";
	// Index workaround

	const extension = url.split(".").pop();

	switch (extension) {
	case "css":
		return "text/css";
	case "html":
	case "htm":
		return "text/html";
	case "ico":
		return "image/vnd.microsoft.icon";
	case "jpeg":
	case "jpg":
		return "image/jpeg";
	case "js":
	case "mjs":
		return "text/javascript";
	case "json":
		return "application/json";
	case "otf":
		return "font/otf";
	case "png":
		return "image/png";		
	case "svg":
		return "image/svg+xml";
	case "ttf":
		return "font/ttf";
	case "txt":
		return "text/plain";
	case "md":
		return "text/markdown";
	default:
		console.error(new UnregisteredError("getMimeType", extension, true));
		return "text/plain";
	}
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