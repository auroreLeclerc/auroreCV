import { HttpError} from "./Errors.js";
import { CACHE_NAME, MANIFEST_NAME, DELETE_CACHE, sendNotification, setCookie, getCookie, SET_DEFAULT_COOKIES } from "./variables.js";
import { Version } from "./Version.js";

let local = document.getElementById("local"),
	online = document.getElementById("online"),
	update = document.getElementById("update"),
	currentChangeslogs = document.getElementById("currentChangeslogs"),
	initialised = false;

function checkFetchUpdate() {
	try {
		const onlineVsLocal = new Version(online.textContent, local.textContent);
		if (onlineVsLocal.isUpper()) {
			const msg = "♻️ Effacer le cache pour charger la mise à jour !";
			update.textContent = msg;
			update.classList.add("button");
			update.addEventListener("click", DELETE_CACHE);
			document.getElementById("changelogs").style.display = "flex";
			if (getCookie("notification").toType()) {
				sendNotification(msg, [{action: "update", title: "Effacer le cache"}]);
			}
		}
		else {
			update.textContent = "Aucune mise à jour diponible";
		}
		
	} catch (typeError) {
		// console.info("checkFetchUpdate promise pending");
	}
}

function liteMode() {
	document.getElementById("autoUpdateEnable").disabled = true;
	document.getElementById("notificationEnable").disabled = true;
	document.getElementById("developmentBranch").disabled = true;
}

navigator.serviceWorker.getRegistrations().then(registrations => {
	if(registrations.length === 0) {
		const unreachable = "📦 Service Worker inatteignable";

		online.textContent = unreachable;
		local.textContent = unreachable;
		currentChangeslogs.textContent = unreachable;
		update.textContent = "Retourner à l'accueil pour réinstaller le Service Worker";

		liteMode();
	}
	else {
		caches.open(CACHE_NAME).then(cache =>
			cache.match(MANIFEST_NAME)
		).then(stream => {
			if (!stream) throw new Error(`File '${MANIFEST_NAME}' not found in cache '${CACHE_NAME}'`);
			return stream.json();
		}).then(json => {
			currentChangeslogs.textContent = json.changelogs.join(", ");

			local.textContent = json.version;
			checkFetchUpdate();
		}).catch(error => {
			local.textContent = "❌ Erreur Fatale";
			update.textContent = "Problème pour récupérer le cache...";
			console.error("⚙️", error);
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
			if (error instanceof HttpError && error.parameters.statusText === "Offline") {
				online.textContent = "✈️ Hors ligne";
			}
			else online.textContent = "❌ Erreur Fatale";
			update.textContent = "Problème pour récupérer la version en ligne...";
			console.error("⚙️", error);
		});

		const serviceWorker = document.getElementById("serviceWorker");
		if (registrations.length > 1) {
			for (const registration of registrations) {
				serviceWorker.textContent += registration.active.scriptURL;
			}
			liteMode();
			alert(`Plusieurs Service Worker sont enregistrés. Effacer le cache ${registrations.length} fois pour les purger.`);
		}
		else if (registrations[0].active.scriptURL.endsWith("service-worker-lite.js")) {
			serviceWorker.textContent = registrations[0].active.scriptURL;
			liteMode();
			setCookie("autoUpdate", false);
		}
		else if (!registrations[0]?.sync) {
			serviceWorker.textContent = `${registrations[0].active.scriptURL} without sync`;
			document.getElementById("autoUpdateEnable").disabled = true;
			document.getElementById("notificationEnable").disabled = true;
			setCookie("autoUpdate", false);
		}
		else serviceWorker.textContent = registrations[0].active.scriptURL;
	}
});

/**
 * 
 * @param {string} id 
 * @param {string} cookie 
 * @param {Function} [action] 
 */
function checkboxButton(id, cookie, action) {
	let checkbox = document.getElementById(id);
	checkbox.checked = getCookie(cookie).toType();
	checkbox.addEventListener("click", () => {
		let newCookie;
		if (initialised) {
			newCookie = !getCookie(cookie).toType();
			setCookie(cookie, newCookie);
		}
		else {
			newCookie = getCookie(cookie).toType();
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

	for (const name of document.cookie.replace(/=\S+/g, "").split(" ")) {
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
if (getCookie("debug").toType()) document.getElementById("debugEnable").click();

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