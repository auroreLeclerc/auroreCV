// import { HttpError} from "./HttpError.js";
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
			let request;
			if (event.request.url.endsWith("!online")) {
				request = new Request(event.request.url.substring(0, event.request.url.length - 7));
				console.info('🌐', request.url);
				response = "!online";
			}
			else {
				request = event.request;
			}

			if(response?.ok) {
				console.info('📬', response.url);
				return response;
			}
			else {
				return fetch(request).then(fetched => {
					if(fetched?.ok) {
						console.info('📫', request.url);

						// Failsafe in case the service worker didn't cache the url in the install event
						if (response !== "!online") caches.open(CACHE_NAME).then(cache =>
							cache.add(request.url).then(() =>
								console.warn('⛑️', request.url)
							)
						);
					}
					else {
						// TODO: implement throw new HttpError and refactor for better then/catch
						if (fetched?.type === "opaque") console.warn('🛃', "Cross-Origin Resource Sharing", request.url);
						else console.error('📯‍📭', "HTTP Error", fetched?.status, fetched?.statusText, request.url);
					}

					// If HTTP Error, the browser handle it like usual
					return fetched; 
				}).catch(error => {
					console.info('✈️‍📭', error.message, request.url);

					if (request.url.endsWith(".html")) {
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
											<h1 style="word-break: break-word;">You are offline ✈️ and ${request.url} has not been found in the cache 📭...</h1>
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
	);
});

self.addEventListener("periodicsync", function(event) {
    if (event.tag === "updater") {
		caches.open(CACHE_NAME).then(cache =>
			cache.match(MANIFEST_NAME)
		).then(stream =>
			stream.json()
		).then(local =>
			fetch(MANIFEST_NAME).then(response =>
				response.json()
			).then(online => {
				if(compareVersion(online.version, local.version)) {
					getCookieFromStore("notification", true, true).then(cookie => {
						if(cookie) sendNotification("L'application a été mise à jour !\nVenez voir les nouveautés !");
					});
					navigator.setAppBadge(1);
					caches.delete(CACHE_NAME);
					self.dispatchEvent(new Event("installing"));
					console.info('📦‍♻️', "Update will be installed on next reload");
				}
				else {
					getCookieFromStore("debug", true, false).then(cookie => {
						if(cookie) sendNotification(`📦‍♻️ Local: ${online.version} is the same as Online: ${local.version}`);
					});
					console.info('📦‍♻️', online.version, '=', local.version);
				}
			})
		)
    }
});

self.addEventListener("message", function(event) {
	console.info('📦‍✉️', event.data);
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
					client.navigate('/');
					return client.focus();
				}
				return clients.openWindow('/');
			}));
		break;
	
		default:
			throw new Error("Notification action not registered !");
		// break;
	}
});
  