import { EnhancedSring } from "./EnhancedSring.js";
import { NotFoundError, UnregisteredError } from "./Errors.js";
import { Version } from "./Version.js";

export const CACHE_NAME = "auroreCV";
export const MANIFEST_NAME = "manifest.json";
export const OFFLINE_URLS = [
	"./",
	"LICENSE",

	"service-worker.js",
	"index.html",
	"manifest.json",
	"rights.html",
	"settings.html",

	"src/css/header.css",
	"src/css/index.css",
	"src/css/liberation.css",
	"src/css/pwa.css",
	"src/css/rights.css",
	"src/css/settings.css",
	"src/css/style.css",
	"src/css/prettify.css",

	"src/js/header.js",
	"src/js/index.js",
	"src/js/settings.js",
	"src/js/variables.js",
	"src/js/prettify.js",
	"src/js/Errors.js",
	"src/js/Version.js",
	"src/js/EnhancedSring.js",

	"src/font/liberation/AUTHORS",
	"src/font/liberation/LICENSE",
	"src/font/liberation/LiberationMono-Bold.ttf",
	"src/font/liberation/LiberationMono-BoldItalic.ttf",
	"src/font/liberation/LiberationMono-Italic.ttf",
	"src/font/liberation/LiberationMono-Regular.ttf",
	"src/font/liberation/LiberationSans-Bold.ttf",
	"src/font/liberation/LiberationSans-BoldItalic.ttf",
	"src/font/liberation/LiberationSans-Italic.ttf",
	"src/font/liberation/LiberationSans-Regular.ttf",
	"src/font/liberation/LiberationSerif-Bold.ttf",
	"src/font/liberation/LiberationSerif-BoldItalic.ttf",
	"src/font/liberation/LiberationSerif-Italic.ttf",
	"src/font/liberation/LiberationSerif-Regular.ttf",

	"src/img/homeMade/agenda.svg",
	"src/img/homeMade/checkmark.svg",
	"src/img/homeMade/CV.svg",
	"src/img/homeMade/diploma.svg",
	"src/img/homeMade/experiences.svg",
	"src/img/homeMade/greenflag.svg",
	"src/img/homeMade/progress.svg",
	"src/img/homeMade/hobbies.svg",
	"src/img/homeMade/house.svg",
	"src/img/homeMade/initials.svg",
	"src/img/homeMade/mail.svg",
	"src/img/homeMade/mbti.svg",
	"src/img/homeMade/phone.svg",
	"src/img/homeMade/skills.svg",

	"src/img/homeMade/icons/agenda.png",
	"src/img/homeMade/icons/checkmark.png",
	"src/img/homeMade/icons/greenflag.png",
	"src/img/homeMade/icons/progress.png",
	"src/img/homeMade/icons/house.png",
	"src/img/homeMade/icons/mail.png",
	"src/img/homeMade/icons/mbti.png",
	"src/img/homeMade/icons/phone.png",
	"src/img/homeMade/icons/initials.png",

	"src/img/homeMade/icons/IOS.png",
	"src/img/homeMade/icons/192.png",
	"src/img/homeMade/icons/192_maskable.png",
	"src/img/homeMade/icons/384.png",
	"src/img/homeMade/icons/384_maskable.png",
	"src/img/homeMade/icons/512.png",
	"src/img/homeMade/icons/512_maskable.png",
	"src/img/homeMade/icons/1024.png",
	"src/img/homeMade/icons/1024_maskable.png",
	
	"src/img/registeredTrademark/AFIA_CFA_blanc.svg",
	"src/img/registeredTrademark/AFIA_CFA_couleur.svg",
	"src/img/registeredTrademark/DL_02_Dip_Etat_blanc.svg",
	"src/img/registeredTrademark/DL_02_Dip_Etat.svg",
	"src/img/registeredTrademark/Github_black.svg",
	"src/img/registeredTrademark/Github_white.svg",
	"src/img/registeredTrademark/Givaudan_logo_black.svg",
	"src/img/registeredTrademark/Givaudan_logo_red.svg",
	"src/img/registeredTrademark/Givaudan_logo_white.svg",
	"src/img/registeredTrademark/Givaudan_text_black.svg",
	"src/img/registeredTrademark/Givaudan_text_white.svg",
	"src/img/registeredTrademark/Linkedin.svg",
	"src/img/registeredTrademark/SAP_logo.svg",
	"src/img/registeredTrademark/UniversiteParis_couleur.svg",
	"src/img/registeredTrademark/UniversiteParis_noir.svg",
	"src/img/registeredTrademark/UniversiteParisCite_couleur.svg",
	"src/img/registeredTrademark/UniversiteParisCite_noir.svg",
	"src/img/registeredTrademark/UPJV_blanc.svg",
	"src/img/registeredTrademark/UPJV_bleu.svg",
	"src/img/registeredTrademark/UPJV_noir.svg",
	"src/img/registeredTrademark/USPN_2021_logo.svg",
	"src/img/registeredTrademark/USPN_2021.svg",
	"src/img/registeredTrademark/USPN_2022_logo.svg",
	"src/img/registeredTrademark/USPN_2022.svg",

	"src/img/registeredTrademark/icons/Github_black.png",
	"src/img/registeredTrademark/icons/Linkedin.png"
];

if ("serviceWorker" in navigator) {
	navigator.serviceWorker.addEventListener("message", (event) => {
		console.info("🖥️‍✉️", event.data?.request);
		switch (event.data?.request) {
		case "SET_DEFAULT_COOKIES":
			SET_DEFAULT_COOKIES();
			break;
			
		default:
			throw new UnregisteredError("Client message", event.data?.request, true);
				// break;
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
		for(let registration of registrations) {
			registration.unregister();
		}
		caches.delete(CACHE_NAME).then(success => {
			if (success) {
				window.location.reload();
			}
			else {
				sendNotification("Le cache n'a pas pu être effacé. Peut-être qu'il n'y a plus de données en cache.").then(() => {
					// window.location.reload();
				});
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

	try {
		// https://developer.mozilla.org/en-US/docs/Web/API/CookieStore#browser_compatibility
		cookieStore.get("mozilla");
	} catch (error) {
		console.warn("🦊", error); 
		return Promise.resolve(new EnhancedSring(assumed));
	}
	
	return cookieStore.get(name).then(cookie => {
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

					setCookie("version", cookieVsCache.compare);
					console.info("🍪‍♻️", "Cookies were updated");
				}
				else if (cookieVsCache.isEqual()) throw new Error("Cookies are corrupted");
				else if (cookieVsCache.isUpper()) throw new RangeError("Local is more recent than online");
				else throw new UnregisteredError("SET_DEFAULT_COOKIES", `cookieVsCache.isLower=${cookieVsCache.isLower()}`, true);
				
			} catch (error) {
				console.error(`SET_DEFAULT_COOKIES: ${error}`);
				
				setCookie("firstUse", false);
				setCookie("autoUpdate", true);
				setCookie("notification", false);
				setCookie("debug", false);
				setCookie("version", json.version);
				setCookie("lastReset", new Date().toISOString());
				setCookie("developmentBranch", 0);
				setCookie("UnregisteredError", null);
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
		// break;

	case "html":
	case "htm":
		return "text/html";
		// break;

	case "ico":
		return "image/vnd.microsoft.icon";
		// break;

	case "jpeg":
	case "jpg":
		return "image/jpeg";
		// break;

	case "js":
		return "text/javascript";
		// break;

	case "json":
		return "application/json";
		// break;

	case "otf":
		return "font/otf";
		// break;

	case "png":
		return "image/png";
		// break;
		
	case "svg":
		return "image/svg+xml";
		// break;

	case "ttf":
		return "font/ttf";
		// break;

	case "txt":
		return "text/plain";
		// break;

	case "md":
		return "text/markdown";
		// break;

	default:
		console.error(new UnregisteredError("getMimeType", extension, true));
		return "text/plain";
		// break;
	}
}