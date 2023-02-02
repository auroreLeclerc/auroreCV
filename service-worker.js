import { HttpError, UnregisteredError } from "./src/js/Errors.js";
import { CACHE_NAME, OFFLINE_URLS, MANIFEST_NAME, sendNotification, getCookieFromStore, getMimeType } from "./src/js/variables.js";
import { Version } from "./src/js/Version.js";

const gitBranches = [false, "main", "development"]; // [0] is for default handling

self.addEventListener("install", function(/** @type {ExtendableEvent} */ event) {
	console.info("📮", "ServiceWorker installing...");
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			for (const url of OFFLINE_URLS) {
				cache.add(url).then(() =>
					console.info("📥", url)
				).catch(error =>
					console.error("📪", error.message, url)
				);
			}
		})
	);
});

// TODO: Refactor to reduce Cognitive Complexity
self.addEventListener("fetch", function(/** @type {FetchEvent} */ event) {
	event.respondWith((() => {
		// self.clients.get(event.clientId).then(client => {
		// 	client.postMessage({
		// 		msg: "Hey I just got a fetch from you!",
		// 		url: event.request.url
		// 	});
		// });
		return getCookieFromStore("developmentBranch", "0", event.clientId).then(branchString => {
			const branch = Number(branchString);
			let url = event.request.url,
				request = event.request,
				online = false
			;

			if (gitBranches[branch] && !url.endsWith("/")) {
				url = url.replace(
					// "localhost:8000/", // localhost development
					"auroreleclerc.github.io/auroreCV/", // production
					`raw.githubusercontent.com/auroreLeclerc/auroreCV/${gitBranches[branch]}/`
				);

				request = new Request(url);
			}
			return caches.match(request).then(response => {
				if (url.endsWith("!online")) {
					url = url.substring(0, url.length - 7);
					console.info("🌐", url);
					online = true;
				}

				if (!online && response?.ok) {
					console.info("📬", url);
					if (gitBranches[branch]) {
						let redirection = new Response(response.body, {
							headers: new Headers()
						});
						redirection.headers.append("Content-Type", getMimeType(url)); // Workaround for some files being text/plain
						return redirection;
					}
					else return response;
				}
				else {						
					return fetch(new Request(url), {
						mode: "no-cors",
					}).then(fetched => {
						try {
							if (fetched?.ok) {
								console.info("📫", url);

								// Failsafe in case the service worker didn't cache the url in the install event
								if (!online) caches.open(CACHE_NAME).then(cache =>
									cache.add(url).then(() =>
										console.info("⛑️", url)
									)
								);
							}
							else {
								// TODO: check quality code of throw new HttpError and check if refactor is needed for better then/catch
								if (fetched?.type === "opaque") console.info("🛃", "Cross-Origin Resource Sharing", url);
								else throw new HttpError(fetched?.status, fetched?.statusText, url);
							}
						}
						catch(error) {
							console.error("📯‍📭", error);

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
							});
						}
						else return fetched;
					}).catch(error => {
						console.warn("✈️‍📭", error.message, url);

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
							return new Response(undefined, {
								status: 404,
								statusText: "Offline"
							}); // Custom offline response
						}
					});
				}
			});
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
			const onlineVsLocal = new Version(online.version, local.version);
			if (onlineVsLocal.isUpper()) {
				getCookieFromStore("notification", "false").then(cookie => {
					if (cookie.toType()) sendNotification("L'application a été mise à jour !\nVenez voir les nouveautés !");

					navigator.setAppBadge(1);
					caches.delete(CACHE_NAME);
					self.dispatchEvent(new Event("installing"));
					console.info("📦‍♻️", "Update will be installed on next reload");
				});
			}
			else {
				getCookieFromStore("debug", "false").then(cookie => {
					if (cookie.toType()) sendNotification(`📦‍♻️ Local: ${onlineVsLocal.compare} is the same as Online: ${onlineVsLocal.self}`);
				});
				console.info("📦‍♻️", onlineVsLocal.self, "=", onlineVsLocal.compare);
			}
		})
	);
}

self.addEventListener("periodicsync", function(/** @type {PeriodicSyncEvent} */ event) {
	if (event.tag === "update") {
		_checkUpdate();
	}
});

self.addEventListener("message", function(/** @type {MessageEvent} */ event) {
	if (event.origin !== "localhost:8000/") { // localhost development
	// if (event.origin !== "https://auroreleclerc.github.io/auroreCV/") { // production
		console.info("📦‍✉️", event.data?.request);
		switch (event.data?.request) {
		case "update":
			_checkUpdate();
			break;

		case "notification":
			sendNotification(event.data.data, event.data?.action);
			navigator.setAppBadge(1);
			break;
			
		default:
			throw new UnregisteredError("ServiceWorker message", event.data?.request, true);
		}
	}
	else {
		throw new HttpError(405, "Not Allowed", event.origin);
	}
});

self.addEventListener("notificationclick", function(/** @type {NotificationEvent} */ event) {
	console.info("📦‍🔔", "notification", event.notification.tag, "wants to", event.action === "" ? "default" : event.action);
	event.notification.close();

	switch (event.action) {
	case "":
		// eslint-disable-next-line no-undef
		event.waitUntil(clients.matchAll({
			type: "window"
		}).then((clientList) => {
			for (const client of clientList) {
				client.navigate("./");
				return client.focus();
			}
			// eslint-disable-next-line no-undef
			return clients.openWindow("./");
		}));
		break;

	case "silent":
		break;

	case "update":
		_checkUpdate();
		break;
	
	default:
		throw new UnregisteredError("ServiceWorker notification", event.action, true);
	}
});
  