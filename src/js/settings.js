import { HttpError} from "./error/HttpError.js";
import { CACHE_NAME, MANIFEST_NAME, DELETE_CACHE, sendNotification, setCookie, getCookie, compareVersion, SET_DEFAULT_COOKIES } from "./variables.js";

let local = document.getElementById("local"),
online = document.getElementById("online"),
update = document.getElementById("update"),
initialised = false;

function checkFetchUpdate() {
	if(!isNaN(local.textContent[0]) && !isNaN(online.textContent[0])) {
		if (compareVersion(online.textContent, local.textContent)) {
			const msg = "♻️ Effacer le cache pour charger la mise à jour !"
			update.textContent = msg;
			document.getElementById("changelogs").style.display = "flex";
			sendNotification(msg);
		}
		else {
			update.textContent = "Aucune mise à jour diponible";
		}
	}
}

navigator.serviceWorker.getRegistrations().then(registrations => {
	if(registrations.length === 0) {
		const unreachable = "📦 Service Worker inatteignable";
		online.textContent = unreachable;
		local.textContent = unreachable;
		update.textContent = "Retourner à l'accueil pour réinstaller le Service Worker";
	}
	else {
		caches.open(CACHE_NAME).then(cache =>
			cache.match(MANIFEST_NAME)
		).then(stream => {
			if (!stream) throw new Error(`File '${MANIFEST_NAME}' not found in cache '${CACHE_NAME}'`);
			return stream.json()
		}).then(json => {
			local.textContent = json.version;
			checkFetchUpdate();
		}).catch(error => {
			local.textContent = "❌ Erreur Fatale";
			console.log('⚙️', error);
		});

		fetch(`${MANIFEST_NAME}!online`).then(response => {
			if (!response?.ok) throw new HttpError(response.status, response.statusText, response.url);
			return response.json();
		}).then(json => {
			online.textContent = json.version;
			checkFetchUpdate();
	
			let changelogs = document.querySelector("#changelogs ul");
			for (const change of json.changelogs) {
				changelogs.insertAdjacentHTML("beforeend", `<li>${change}</li>`);
			}
		}).catch(error =>{
			if (error instanceof HttpError && error.stack.statusText === "Offline") {
				online.textContent = "✈️ Hors ligne";
			}
			else online.textContent = "❌ Erreur Fatale";
			console.log('⚙️', error);
		});
	}
});

navigator.serviceWorker.ready.then(registration => {
	if (!registration.sync) {
		const iosWarning = document.getElementById("iosWarning");
		while (iosWarning.lastChild) {
			iosWarning.removeChild(iosWarning.lastChild);
		}
		iosWarning.textContent = `📦‍♻️ Service update disable ! <a href="https://developer.mozilla.org/en-US/docs/Web/API/PeriodicSyncEvent#browser_compatibility">You need a navigator that supports backgound jobs.</a>`;
	}
});

document.getElementById("deleteCache").addEventListener("click", () => {
	if(!navigator.onLine) {
		if (confirm("🚫 Vous êtes hors ligne et vous voulez effacez le cache 🚫 \n 🚫 Continuez et l'application ne sera plus disponible 🚫")) {
			DELETE_CACHE();
		}
	}
	else DELETE_CACHE();
});

let notificationEnable = document.getElementById("notificationEnable");
notificationEnable.checked = getCookie("notification", true);
notificationEnable.addEventListener("click", () => {
	let newValue = !getCookie("notification", true);
	setCookie("notification", newValue);
	sendNotification(`Les notifications ont bien été ${newValue ? "activées" : "désactivées"}`);
});

let autoUpdateEnable = document.getElementById("autoUpdateEnable");
autoUpdateEnable.checked = getCookie("autoUpdate", true);
autoUpdateEnable.addEventListener("click", () => {
	setCookie("autoUpdate", !getCookie("autoUpdate", true));
	DELETE_CACHE();
});


let debugEnable = document.getElementById("debugEnable");
let debugEnableCookie = getCookie("debug", true);
debugEnable.addEventListener("click", () => {
	const newValue = initialised ? !getCookie("debug", true) : getCookie("debug", true);
	if (initialised) setCookie("debug", newValue);

	let cookies = document.getElementById("cookies");
	cookies.textContent = ""; // Removing childrens
	for (const name of document.cookie.replace(/=\S+/g, '').split(' ')) {
		cookies.insertAdjacentHTML("beforeend", `
			<tr>
				<td>${name}</td>
				<td>${getCookie(name)}</td>
			</tr>
		`);
	}

	document.getElementById("debug").style.display = newValue ? "flex" : "none";
});

let manifest = document.getElementById("manifest");
fetch(MANIFEST_NAME).then(response => 
	response.json().then(json => {
		for (const key in json) {
			if (Object.hasOwnProperty.call(json, key)) {
				manifest.insertAdjacentHTML("beforeend", `
					<tr>
						<td>${key}</td>
						<td>${json[key]}</td>
					</tr>
				`);
			}
		}
	})
);

document.getElementById("resetCookies").addEventListener("click", SET_DEFAULT_COOKIES);

let branch = document.getElementById("branch");
branch.addEventListener("change", () => {
	setCookie("branch", branch.value);
	DELETE_CACHE();
});

if (debugEnableCookie) debugEnable.click();
initialised = true;