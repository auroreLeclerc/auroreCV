import { DataBaseHelper } from "./DataBaseHelper.js";

const header = document.querySelector("body header");
header.insertAdjacentHTML("afterbegin", "<div id=\"airplane\">✈️</div>");
const airplane = document.getElementById("airplane");

const OFFLINE = () => {
		airplane.style.top = "5px";
		airplane.style.left = "5px";
	}, ONLINE = () => {
		airplane.style.top = "2em";
		airplane.style.left = "-2em";
	};

navigator.onLine ? ONLINE() : OFFLINE();
addEventListener("offline", OFFLINE);
addEventListener("online", ONLINE);

new DataBaseHelper().start.then(transaction => {
	transaction.getAppConfig("serviceWorker").then(serviceWorker => {
		if (serviceWorker) {
			header.insertAdjacentHTML("beforeend",
				`<h1 id="settings" >
					<a href="./index.html#settings" class="landscape-orientation" locale="index.settings">Paramètres</a>
					<a href="./index.html#settings" class="portrait-orientation"><img class="force-theme" src="./src/img/homeMade/settings.svg" alt="Paramètres"></a>
				</h1>`,
			);
		}
	});
});

if ("share" in navigator || globalThis.mvc?.capacitor) {
	header.insertAdjacentHTML("beforeend",
		`<h1 id="share">
			<a href="javascript:void(null);" class="landscape-orientation">Partager !</a>
			<a href="javascript:void(null);" class="portrait-orientation"><img class="force-theme" src="./src/img/homeMade/share.svg" alt="Partager !"></a>
		</h1>`,
	);
	document.getElementById("share").addEventListener("click", () => {
		const shareOptions = {
			title: "Partager le Curriculum vitæ d'Aurore Leclerc",
			text: "Je t'ai montré le CV d'Aurore Leclerc ?\nRegarde il peut même être installé sur ton appareil (en PWA) !",
			url: "https://auroreleclerc.github.io/auroreCV/app/www/index.html",
		};

		if (globalThis.mvc.capacitor) globalThis.mvc.capacitor.share.share(shareOptions);
		else navigator.share(shareOptions);
	});
}

/**
 * @param {Location | URL} url
 * @param {HTMLElement} print
 */
function checkIfPrintAvaible(url, print) {
	if ((url.hash.endsWith("#home") || url.hash === "") && !globalThis?.mvc?.capacitor) {
		print.style.display = null;
	}
	else print.style.display = "none";
}
if ("print" in window) {
	header.insertAdjacentHTML("beforeend",
		`<h1 id="print">
			<a href="javascript:void(null);" class="landscape-orientation">Imprimer</a>
			<a href="javascript:void(null);" class="portrait-orientation"><img class="force-theme" src="./src/img/homeMade/printer.svg" alt="Imprimer"></a>
		</h1>`,
	);
	const print = document.getElementById("print");
	print.style.display = "none";

	checkIfPrintAvaible(window.location, print);
	addEventListener("hashchange", event => {
		checkIfPrintAvaible(new URL(event.newURL), print);
	});
	print.addEventListener("click", () => {
		window.print();
	});
}

if ("BeforeInstallPromptEvent" in window) {
	header.insertAdjacentHTML("beforeend",
		`<h1 id="install">
			<a href="javascript:void(null);" class="landscape-orientation">Installer</a>
			<a href="javascript:void(null);" class="portrait-orientation"><img class="force-theme" src="./src/img/homeMade/install.svg" alt="Installer"></a>
		</h1>`,
	);
	const install = document.getElementById("install");
	install.style.display = "none";
	/**
	 * @type {Event}
	 */
	let deferredPrompt = null;

	install.addEventListener("click", () => {
		install.style.display = "none";
		deferredPrompt.prompt().then((/** @type {{ platform: string; outcome: string; }} */ choice) => {
			console.info(`${choice.platform} user ${choice.outcome} the A2HS prompt`);
			deferredPrompt = null;
		});
	});

	window.addEventListener("beforeinstallprompt", event => {
		event.preventDefault();
		deferredPrompt = event;
		install.style.display = null;
	});
}

fetch("./pwa.html").then(response => {
	response.text().then(text => {
		const pwa = new DOMParser().parseFromString(text, "text/html");
		while (pwa.head.children.length) {
			document.head.appendChild(pwa.head.firstChild);
		}
	});
});
