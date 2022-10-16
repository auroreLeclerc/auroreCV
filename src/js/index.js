import { getCookie } from "./variables.js";

if ("serviceWorker" in navigator) {
	window.addEventListener("load", () => {
		navigator.serviceWorker.register(
			"./service-worker.js", {
				type: "module", // https://bugzilla.mozilla.org/show_bug.cgi?id=1247687
				scope: "./"
			}
		).then(registration => {
			console.info('📮', "ServiceWorker called on", registration.scope);
			if(getCookie("autoUpdate", true)) {
				if (registration.sync) {
					navigator.serviceWorker.ready.then(registrationReady =>
						registrationReady.periodicSync.register("updater", {
							// minInterval: 24 * 60 * 60 * 1000
							minInterval: 30 * 1000
						}).then(() =>
							console.info('📮', "periodicSync updater registered")
						).catch(error =>
							console.warn("PWA not installed ;", error)
						)						
					);
				}
				else {
					console.error("Please use a recent navigator, that supports backgound jobs 🧓");
					registration.active.postMessage("update");
				}
			}
		}).catch(error => {
			throw new Error("Navigator serviceWorker registration as a module failed", { cause: error });
		});
	});
}
else {
	alert("Please use a recent navigator, that supports service worker 🧓");
}

document.getElementById("calculateAge").textContent = (new Date().getFullYear() - 2001) + " ans";

getCookie("firstUse");
