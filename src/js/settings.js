import { HttpError} from "./error/HttpError.js";
import { CACHE_NAME, MANIFEST_NAME, DELETE_CACHE, sendNotification, setCookie, getCookie, compareVersion, SET_DEFAULT_COOKIES } from "./variables.js";

let local = document.getElementById("local"),
online = document.getElementById("online"),
update = document.getElementById("update"),
currentChangeslogs = document.getElementById("currentChangeslogs"),
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
		currentChangeslogs.textContent = unreachable;
		update.textContent = "Retourner à l'accueil pour réinstaller le Service Worker";
	}
	else {
		caches.open(CACHE_NAME).then(cache =>
			cache.match(MANIFEST_NAME)
		).then(stream => {
			if (!stream) throw new Error(`File '${MANIFEST_NAME}' not found in cache '${CACHE_NAME}'`);
			return stream.json()
		}).then(json => {
			currentChangeslogs.textContent = json.changelogs.join(", ");

			local.textContent = json.version;
			checkFetchUpdate();
		}).catch(error => {
			local.textContent = "❌ Erreur Fatale";
			console.error('⚙️', error);
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
			console.error('⚙️', error);
		});
	}
});

/**
 * 
 * @param {string} id 
 * @param {string} cookie 
 * @param {Function} action 
 */
function checkboxButton(id, cookie, action) {
	let checkbox = document.getElementById(id);
	checkbox.checked = getCookie(cookie, true);
	checkbox.addEventListener("click", () => {
		let newCookie;
		if (initialised) {
			newCookie = !getCookie(cookie, true);
			setCookie(cookie, newCookie);
		}
		else {
			newCookie = getCookie(cookie, true);
			if (!initialised) checkbox.checked = true;
			// Fake click nullification for handling initialization.
		}

		switch (id) {
			case "notificationEnable":
				sendNotification(`Les notifications ont bien été ${newCookie ? "activées" : "désactivées"}`);
			break;

			case "debugEnable":
				document.getElementById("debug").style.display = newCookie ? "flex" : "none";
				action();
			break;
		
			default:
				action();
			break;
		}
	});
}

checkboxButton("notificationEnable", "notification");
checkboxButton("autoUpdateEnable", "autoUpdate", DELETE_CACHE);
checkboxButton("debugEnable", "debug", function() {
	let cookies = document.getElementById("cookies"),
	manifest = document.getElementById("manifest");
	cookies.textContent = ""; manifest.textContent = ""; // Removing childrens

	for (const name of document.cookie.replace(/=\S+/g, '').split(' ')) {
		cookies.insertAdjacentHTML("beforeend", `
			<tr>
				<td>${name}</td>
				<td>${getCookie(name)}</td>
			</tr>
		`);
	}
	
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
	
	document.getElementById("developmentBranch").selected = true;
});
if (getCookie("debug", true)) debugEnable.click();

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

document.getElementById("resetCookies").addEventListener("click", SET_DEFAULT_COOKIES);

let branch = document.getElementById("developmentBranch");
document.querySelector(`select#developmentBranch option[value="${getCookie("developmentBranch")}"]`).selected = true;
branch.addEventListener("change", () => {
	setCookie("developmentBranch", branch.value);
	caches.delete(CACHE_NAME).then(
		window.location.reload()
	);
});

initialised = true;

//TODO: Remplacer les texte de chargement par des https://developer.mozilla.org/fr/docs/Web/HTML/Element/Progress (animé) ou autre logo de chargement indicatif ou même un gif car si ce fichier js est exécuté les fetchs sont très proches d'être éxécutés donc mieux vaut des logos en css pure que du js (comme toujours toujours)