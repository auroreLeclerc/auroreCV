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

	"src/js/header.js",
	"src/js/HttpError.js",
	"src/js/index.js",
	"src/js/settings.js",
	"src/js/variables.js",

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
	"src/img/homeMade/hobbies.svg",
	"src/img/homeMade/house.svg",
	"src/img/homeMade/initials.svg",
	"src/img/homeMade/mail.svg",
	"src/img/homeMade/mbti.svg",
	"src/img/homeMade/phone.svg",
	"src/img/homeMade/skills.svg",

	"src/img/homeMade/icons/1024.png",
	"src/img/homeMade/icons/192.png",
	"src/img/homeMade/icons/384.png",
	"src/img/homeMade/icons/512.png",
	"src/img/homeMade/icons/initials.png",
	
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
	"src/img/registeredTrademark/USPN_2022.svg"
];

/**
 * @description First delete the service worker then deleting the cache.
 * Otherwise a service worker with empty cache continues running, thus not installing itself.
 */
export const DELETE_CACHE = () => {
	navigator.serviceWorker.getRegistrations().then(function(registrations) {
		for(let registration of registrations) {
			registration.unregister();
		}
		caches.delete(CACHE_NAME).then(
			window.location.reload()
		);
	});
};

/**
 * @description Set a cookie
 * @param {string} name Name of the cookie
 * @param {string} value Value of the cookie
 * @param {int} expiration In days, when the cookie will be deleted
 */
export function setCookie(name = "", value = "", expiration = 0) {
	let expirationDate = new Date();
	expirationDate.setTime(
		expirationDate.getTime() + (expiration * 24 * 60 * 60 * 1000)
	);
	document.cookie = `${name}=${value};expires=${expirationDate.toUTCString()}`;
}

/**
 * @private
 * @description Convert cookie string to boolean
 * @param {string} value Cookie value
 * @param {boolean} serviceWorker Can't restore cookies from Service Worker
 * @returns {boolean}
 * @throws {TypeError} Value is not a boolean
 */
function _toBoolean(value, serviceWorker = false) {
	try {
		return JSON.parse(value);
	} catch (error) {
		if (serviceWorker) {
			throw new TypeError(`📦‍🍪 ${value} is not a boolean`);
		}
		else {
			SET_DEFAULT_COOKIES();
			return false;
		}
	}
}

/**
 * @description Get a cookie
 * @param {string} name Name of the cookie
 * @param {boolean} boolean To return the value in boolean
 * @returns {string|boolean} Value of the cookie (if cookieStore then Promise)
 * @throws {Error} Cookie not found.
 */
export function getCookie(name, boolean = false) {
	let value;

	value = document.cookie.split('; ').find(
		row => row.startsWith(`${name}=`)
	)?.split('=')[1];

	if (value) return boolean ? _toBoolean(value, false) : value;
	else {
		SET_DEFAULT_COOKIES();
		throw new Error(`Cookie ${name} not found. Cookies were reset.`);
	}
}

/**
 * @async
 * @description Get a cookie from cookieStore
 * @param {string} name Name of the cookie
 * @param {boolean} boolean To return the value in boolean
 * @param {boolean} assumed Value to be returned in case cookieStore fails
 * @returns {Promise<string|boolean>} Promise that returns value of the cookie
 * @throws {Error} Cookie not found
 */
export async function getCookieFromStore(name, boolean = false, assumed = true) {
	let value;

	try {
		// https://developer.mozilla.org/en-US/docs/Web/API/CookieStore#browser_compatibility
		cookieStore.get("mozilla");
	} catch (error) {
		console.warn('🦊', error); 
		return Promise.resolve(assumed);
	}
	
	return cookieStore.get(name).then(cookie => {
		value = cookie.value;
		if (!value) {
			throw new Error(`📦‍🍪 ${name} is ${value}`);
		}
		return boolean ? _toBoolean(value, true) : value;
	});
}

/**
 * @description If there is a new version in cache cookies are updated.
 * If there is no update cookies are corrupted and therefore are reset.
 */
export const SET_DEFAULT_COOKIES = () => {
	fetch(MANIFEST_NAME).then(response =>
		response.json().then(json => {
			const cache = json.version;
			let cookie;
			try {
				cookie = getCookie("version", false);
			} catch (error) {
				// then firstUse
				cookie = cache;
			}
			
			if(compareVersion(cache, cookie)) {
				// TODO: Create a working cookie path upgrade for next releases
				let updated = cookie;
				while(!compareVersion(cache, updated)) {
					switch (updated) {
						case "1.0.0":
							updated = "1.0.1";
						break;
					
						default:
							throw new Error("Update path not implemented !");
						// break;
					}
				}
				setCookie("version", cache, 365 * 4);
			}
			else {
				setCookie("firstUse", false, 365 * 4);
				setCookie("autoUpdate", true, 365 * 4);
				setCookie("notification", false, 365 * 4);
				setCookie("debug", false, 365 * 4);
				setCookie("version", cache, 365 * 4);
				setCookie("lastReset", new Date().toISOString(), 365 * 4);
			}
		})
	)
};

/**
 * @description Notification manager
 * @param {string} body The message the notification will display
 * @param {array} actions Only with ServiceWorker, Buttons in the notification
 * @returns {Notification}
 */
export function sendNotification(body, actions = []) {
	const title = "Curriculum vitæ d'Aurore Leclerc";
	const options = {
		lang: "FR",
		badge: "/src/img/homeMade/icons/initials.png",
		body: body,
		tag: "🏳️‍⚧️",
		icon: "/src/img/homeMade/icons/384.png",
		// image: "/src/img/homeMade/icons/512.png",
		actions: actions
	};

	if ("serviceWorker" in navigator) {
		navigator.serviceWorker.ready.then((registration) => {
			if (Notification.permission !== "granted") {
				Notification.requestPermission().then( response => {
					if (response === "granted") {
						return registration.showNotification(title, options);
					}
				});
			}
			else return registration.showNotification(title, options);
		});
	}
	else { // Call from Service Worker (assumed to be headless)
		return self.registration.showNotification(title, options);
	}
}

/**
 * @description Compare online version against local version
 * @param {string} online The online string version
 * @param {string} local The local string version
 * @returns {boolean} if online > local; then true; else false
 */
export function compareVersion(online, local) {
	try {
		const onlineInt = parseInt(online.replace(/\./g, ''));
		const localInt = parseInt(local.replace(/\./g, ''));

		return onlineInt > localInt;
	} catch (error) {
		console.error(error, `online is ${online} and local is ${local}`);
		return false;
	}
}