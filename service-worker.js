import { HttpError, UnregisteredError } from "./src/js/error.js";
import { CACHE_NAME, OFFLINE_URLS, MANIFEST_NAME, compareVersion, sendNotification, getCookieFromStore, getMimeType } from "./src/js/variables.js";

const gitBranches = [false, "main", "development"]; // [0] is for default handling

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

// TODO: Refactor to reduce Cognitive Complexity
self.addEventListener("fetch", function(event) {
	event.respondWith((() => {
		return getCookieFromStore("developmentBranch", false, 0).then(branch => {
			let url = event.request.url,
			request = event.request;

			if (gitBranches[branch] && !url.endsWith('/')) {
				url = url.replace(
					// "localhost:8000/", // localhost development
					"auroreleclerc.github.io/auroreCV", // production
					`raw.githubusercontent.com/auroreLeclerc/auroreCV/${gitBranches[branch]}/`
				);

				request = new Request(url);
			}
			return caches.match(request).then(response => {
				if (url.endsWith("!online")) {
					url = url.substring(0, url.length - 7);
					console.info('🌐', url);
					response = "!online";
				}

				if (response?.ok) {
					console.info('📬', url);
					if (gitBranches[branch]) {
						let redirection = new Response(response.body, {
							headers: new Headers()
						})
						redirection.headers.append("Content-Type", getMimeType(url)); // Workaround for some files being text/plain
						return redirection;
					}
					else return response;
				}
				else {						
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
								// TODO: check quality code of throw new HttpError and check if refactor is needed for better then/catch
								if (fetched?.type === "opaque") console.warn('🛃', "Cross-Origin Resource Sharing", url);
								else throw new HttpError(fetched?.status, fetched?.statusText, url);
							}
						}
						catch(error) {
							console.error('📯‍📭', error);

							// If HTTP Error, the browser handle it like usual
							return fetched;
						}
						
						if (gitBranches[branch]) {
							return fetched.text().then(text => {
								return new Response(
									new Blob(
										[text],
										{type: getMimeType(url)}
									)
								);
							})	
						}
						else return fetched;
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
				}
			})
		}).catch(error => { // fatal error failsafe
			console.error("Fatal Error ;", error);
			return fetch(event.request);
		});
	})());
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
				getCookieFromStore("notification", true, false).then(cookie => {
					if (cookie) sendNotification("L'application a été mise à jour !\nVenez voir les nouveautés !");

					navigator.setAppBadge(1);
					caches.delete(CACHE_NAME);
					self.dispatchEvent(new Event("installing"));
					console.info('📦‍♻️', "Update will be installed on next reload");
				});
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
  