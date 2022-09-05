// import { HttpError} from "./HttpError.js";
import { HttpError } from "./src/js/error/HttpError.js";
import { UnregisteredError } from "./src/js/error/UnregisteredError.js";
import { CACHE_NAME, OFFLINE_URLS, MANIFEST_NAME, compareVersion, sendNotification, getCookieFromStore } from "./src/js/variables.js";
// TODO: Create service worker class Error

self.addEventListener("install", function(event) {
	console.info('📮', "ServiceWorker installing...");
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			for (const url of OFFLINE_URLS) {
				cache.add(url).then(() =>
					console.info('📥', url)
				).catch(error =>
					console.error('📪', error.message, url)
				);
			}
		})
	);
});

// TODO: refactor and add HttpError
self.addEventListener("fetch", function(event) {
	event.respondWith(
		caches.match(event.request).then(response => {
				let url = event.request.url;

				if (url.endsWith("!online")) {
					url = url.substring(0, url.length - 7);
					console.info('🌐', url);
					response = "!online";
				}

				if (response?.ok) {
					console.info('📬', response.url);
					return response;
				}
				else {
					return getCookieFromStore("branch", false, "main").then(branch => {
						if (branch !== "main") {
							url = url.replace(
								"auroreleclerc.github.io/auroreCV",
								`raw.githubusercontent.com/auroreLeclerc/auroreCV/${branch}`
							);
						}
						return fetch(new Request(url)).then(fetched => {
							try {
								if (fetched?.ok) {
									console.info('📫', url);

									// Failsafe in case the service worker didn't cache the url in the install event
									if (response !== "!online") caches.open(CACHE_NAME).then(cache =>
										cache.add(url).then(() =>
											console.warn('⛑️', url)
										)
									);
								}
								else {
									// TODO: implement throw new HttpError and refactor for better then/catch
									if (fetched?.type === "opaque") console.warn('🛃', "Cross-Origin Resource Sharing", url);
									else throw new HttpError(fetched?.status, fetched?.statusText, url);
								}
							}
							catch(error) {
								console.error('📯‍📭', error);

								// If HTTP Error, the browser handle it like usual
								return fetched;
							}
							return fetched;
						}).catch(error => {
							console.info('✈️‍📭', error.message, url);

							if (url.endsWith(".html")) {
								return new Response(
									new Blob([`
										<!DOCTYPE html>
										<html lang="en">
											<head>
												<meta charset="UTF-8"/>
												<meta name="theme-color" content="DeepPink"/>
												<meta name="viewport" content="width=device-width, initial-scale=1">
												<title>Not Found</title>
												<link rel="stylesheet" type="text/css" href="/src/css/style.css" />
											</head>
											<body>
												<main class="center">
													<h1 style="word-break: break-word;">You are offline ✈️ and ${url} has not been found in the cache 📭...</h1>
													<h2>Make sure you are not off domain 🛂</h2>
													<h2><a href="./">Return to the home page 🏠</a></h2>
												</main>
											</body>
										</html>
									`], {type : "text/html"})
								); // Custom offline page
							}
							else {
								return new Response(null, {
									status: 404,
									statusText: "Offline"
								}); // Custom offline response
							}
						});
					});
				}
		})
	);
});

function _checkUpdate() {
	caches.open(CACHE_NAME).then(cache =>
		cache.match(MANIFEST_NAME)
	).then(stream =>
		stream.json()
	).then(local =>
		fetch(MANIFEST_NAME).then(response =>
			response.json()
		).then(online => {
			if (compareVersion(online.version, local.version)) {
				getCookieFromStore("notification", true, true).then(cookie => {
					if (cookie) sendNotification("L'application a été mise à jour !\nVenez voir les nouveautés !");
				});
				navigator.setAppBadge(1);
				caches.delete(CACHE_NAME);
				self.dispatchEvent(new Event("installing"));
				console.info('📦‍♻️', "Update will be installed on next reload");
			}
			else {
				getCookieFromStore("debug", true, false).then(cookie => {
					if (cookie) sendNotification(`📦‍♻️ Local: ${online.version} is the same as Online: ${local.version}`);
				});
				console.info('📦‍♻️', online.version, '=', local.version);
			}
		})
	)
}

self.addEventListener("periodicsync", function(event) {
    if (event.tag === "update") {
		_checkUpdate();
    }
});

self.addEventListener("message", function(event) {
	console.info('📦‍✉️', event.data);
	switch (message) {
		case "update":
			_checkUpdate();
		break;
	
		default:
			throw new UnregisteredError(event.action, true);
		// break;
	}
});

self.addEventListener("notificationclick", function(event) {
	console.info('📦‍🔔', "notification", event.notification.tag, "wants to", event.action === '' ? "default" : event.action);
	event.notification.close();

	switch (event.action) {
		case '':
			event.waitUntil(clients.matchAll({
				type: "window"
			}).then((clientList) => {
				for (const client of clientList) {
					client.navigate('./');
					return client.focus();
				}
				return clients.openWindow('./');
			}));
		break;
	
		default:
			throw new UnregisteredError(event.action, true);
		// break;
	}
});
  