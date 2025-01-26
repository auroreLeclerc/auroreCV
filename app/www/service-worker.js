import { DataBaseHelper } from "./src/js/DataBaseHelper.js";
import { ArchitectureError, HttpError, NotFoundError } from "./src/js/Errors.js";
import { CACHE_NAME, MANIFEST_NAME, sendNotification } from "./src/js/variables.mjs";
import { Version } from "./src/js/Version.js";

self.addEventListener("install", function (/** @type {ExtendableEvent} */ event) {
	console.info("📮", "ServiceWorker installing...");
	event.waitUntil(
		caches.open(CACHE_NAME).then(cache => {
			const channel = new BroadcastChannel("serviceWorkerLoader");
			let done = 1;
			fetch("./src/json/cache.json").then(response => {
				if (response.ok) {
					response.json().then((/** @type {string[]} */ urls) => {
						urls.push("./");
						for (const url of urls) {
							cache.add(new Request(
								url, {
									headers: { "Cache-Control": "no-store" },
								},
							)).then(() => {
								console.info("📥", url);
								channel.postMessage({
									request: "installing",
									state: "success",
									total: urls.length - 1,
									done: done++,
								});
							}).catch(error => {
								console.error("📪", error.message, url);
								channel.postMessage({
									request: "installing",
									state: "failed",
									total: urls.length - 1,
									done: done++,
								});
							});
						}
					});
				}
				else throw new ArchitectureError((new HttpError(response.status, response.statusText, response.url)).toString());
			}).catch(error => {
				console.warn(error);
			});
		}),
	);
});

self.addEventListener("fetch", function (/** @type {FetchEvent} */ event) {
	event.respondWith((() => {
		if (event.request.url.endsWith("maintenance.html") || event.request.url.endsWith("maintenance.js") || event.request.url.endsWith("maintenance.css")) {
			return fetch(event.request);
		}
		else if (event.request.url.endsWith("capacitor.bundle.js")) {
			return new Response(JSON.stringify({}), {
				status: 206,
				statusText: "Service Worker is installed",
				headers: {
					"Content-Type": "text/javascript",
				},
			});
		}
		let url = event.request.url,
			request = event.request,
			online = false;
		return caches.match(request).then(response => {
			if (url.endsWith("!online")) {
				url = url.substring(0, url.length - 7);
				console.info("🌐", url);
				online = true;
			}

			if (!online && response?.ok) {
				console.info("📬", url);
				return response;
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
									console.info("⛑️", url),
								),
							);
						}
						else if (fetched?.type === "opaque") console.info("🛃", "Cross-Origin Resource Sharing", url);
						else throw new HttpError(fetched?.status, fetched?.statusText, url);
					}
					catch (error) {
						console.error("📯‍📭", error);

						// If HTTP Error, the browser handle it like usual
						return fetched;
					}

					return fetched;
				}).catch(error => {
					console.warn("✈️‍📭", error.message, url);
					return new Response(undefined, {
						status: 444, // 444 No Response
						statusText: "Offline",
						headers: {
							"Error-Details": "You are offline and the content has not been found in the cache.",
						},
					});
				});
			}
		});
	})());
});


function _checkUpdate() {
	caches.open(CACHE_NAME).then(cache =>
		cache.match(MANIFEST_NAME),
	).then(stream =>
		stream.json(),
	).then(local =>
		fetch(MANIFEST_NAME).then(response =>
			response.json(),
		).then(online => {
			new DataBaseHelper().start.then(transaction => {
				const onlineVsLocal = new Version(online.version, local.version);
				if (onlineVsLocal.isUpper()) {
					transaction.getAppConfig("notification").then(notification => {
						if (notification) sendNotification("L'application a été mise à jour !\nVenez voir les nouveautés !");
						navigator.setAppBadge(1);
						caches.delete(CACHE_NAME);
						self.dispatchEvent(new Event("installing"));
						console.info("📦‍♻️", "Update will be installed on next reload");
					});
				}
				else {
					transaction.getAppConfig("debug").then(debug => {
						if (debug) sendNotification(`📦‍♻️ Local: ${onlineVsLocal.compare} is the same as Online: ${onlineVsLocal.self}`);
						console.info("📦‍♻️", onlineVsLocal.self, "=", onlineVsLocal.compare);
					});
				}
			});
		}),
	);
}

self.addEventListener("periodicsync", event => {
	if (event.tag === "update") {
		new DataBaseHelper().start.then(transaction => {
			transaction.getAppConfig("debug").then(debug => {
				if (debug) sendNotification("periodicsync event");
				navigator.setAppBadge(1);
			});
		});
		_checkUpdate();
	}
});

self.addEventListener("message", function (/** @type {MessageEvent} */ event) {
	// if (event.origin !== "localhost:8000/") { // localhost development
	if (event.origin !== "https://auroreleclerc.github.io/auroreCV/") { // production
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
				throw new NotFoundError(`ServiceWorker message : ${event.data?.request}`);
		}
	}
	else {
		throw new HttpError(405, "Not Allowed", event.origin);
	}
});

self.addEventListener("notificationclick", function (/** @type {NotificationEvent} */ event) {
	console.info("📦‍🔔", "notification", event.notification.tag, "wants to", event.action === "" ? "default" : event.action);
	event.notification.close();

	switch (event.action) {
		case "":
			event.waitUntil(self.clients.matchAll({
				type: "window",
			}).then(clientList => {
				for (const client of clientList) {
					client.navigate("./");
					return client.focus();
				}
				return self.clients.openWindow("./");
			}));
			break;

		case "silent":
			break;

		case "update":
			_checkUpdate();
			break;

		default:
			throw new NotFoundError(`ServiceWorker notification : ${event.action}`);
	}
});
