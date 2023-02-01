import { getCookie } from "./variables.js";

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.getRegistrations().then(registrations => {
			if (!registrations.length) {
				navigator.serviceWorker.register(
					"./service-worker.js", {
						type: "module", // https://bugzilla.mozilla.org/show_bug.cgi?id=1247687
						scope: "./"
					}
				).then(registration => {	
					console.info("📮", "ServiceWorker installing on", registration.scope);
					if(getCookie("autoUpdate").toType()) {
						if (registration.sync) {
							navigator.serviceWorker.ready.then(registrationReady =>
								registrationReady.periodicSync.register("updater", {
									// minInterval: 24 * 60 * 60 * 1000
									minInterval: 30 * 1000
								}).then(() =>
									console.info("📮", "periodicSync updater registered")
								).catch((/** @type {Error} */ error) =>
									console.warn("PWA not installed ;", error)
								)
							);
						}
						else {
							console.error("Please use a recent navigator, that supports backgound jobs 🧓");
							registration.installing.postMessage({
								request: "update"
							});
						}
					}
				}).catch(error => {
					console.error(new Error(`Navigator serviceWorker registration as a module failed. ${error}`));
					navigator.serviceWorker.register(
						"./service-worker-lite.js", {
							scope: "./"
						}
					).then(registration => {
						console.info("📮", "ServiceWorker Lite called on", registration.scope);
					}).catch(error => {
						throw new Error(`Navigator serviceWorker Lite registration failed. ${error}`);
					});
				});
			}
		});
		// navigator.serviceWorker.getRegistration().then(registration => {
		// 	if (registration) {
		// 		registration.active.postMessage({
		// 			request: "notification",
		// 			data: "Test notification",
		// 			action: [{
		// 				action: "silent",
		// 				title: "Ceci est un bouton"
		// 			}]
		// 		});
		// 	}
		// });
	});
}
else {
	alert("Please use a recent navigator, that supports service worker 🧓");
}

document.getElementById("calculateAge").textContent = (new Date().getFullYear() - 2001) + " ans";

getCookie("firstUse");

if (/iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase()) && !window.navigator?.standalone) {
	const ioss = document.getElementsByClassName("ios");

	for (const ios of ioss) {
		ios.style.display = "block";
		if (ios.classList.contains("prompt")) {
			ios.addEventListener("click", () => {
				ios.style.display = "none";
			});
		}
	}
}