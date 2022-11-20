const CACHE_NAME = "auroreCV",
	OFFLINE_URLS = [
		"./",
		"LICENSE",

		"service-worker.js",
		"index.html",
		"manifest.json",
		"rights.html",
		"settings.html",

		"src/css/header.css",
		"src/css/index.css",
		"src/css/liberation.css",
		"src/css/pwa.css",
		"src/css/rights.css",
		"src/css/settings.css",
		"src/css/style.css",
		"src/css/prettify.css",

		"src/js/header.js",
		"src/js/index.js",
		"src/js/settings.js",
		"src/js/variables.js",
		"src/js/prettify.js",

		"src/font/liberation/AUTHORS",
		"src/font/liberation/LICENSE",
	];

self.addEventListener("install", function(event) {
	console.info("📮", "ServiceWorker Lite installing...");
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

self.addEventListener("fetch", function(event) {
	event.respondWith(
		caches.match(event.request).then(response => {			
			let request = event.request;

			if (event.request.url.endsWith("!online")) {
				request = new Request(event.request.url.substring(0, event.request.url.length - 7));
				console.info("🌐", request.url);
				response = "!online";
			}

			if (response?.ok) {
				console.info("📬", response.url);
				return response;
			}
			else {						
				return fetch(request).then(fetched => {
					try {
						if (fetched?.ok) {
							console.info("📫", request.url);

							// Failsafe in case the service worker didn't cache the url in the install event
							if (response !== "!online") caches.open(CACHE_NAME).then(cache =>
								cache.add(request.url).then(() =>
									console.warn("⛑️", request.url)
								)
							);
						}
						else {
							if (fetched?.type === "opaque") console.warn("🛃", "Cross-Origin Resource Sharing", request.url);
							else throw new Error(`${fetched?.status} ${fetched?.statusText} for ${request.url}`);
						}
					}
					catch(error) {
						console.error("📯‍📭", error);

						// If HTTP Error, the browser handle it like usual
						return fetched;
					}
					
					return fetched;
				}).catch(error => {
					console.info("✈️‍📭", error.message, request.url);

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
		}).catch(error => { // fatal error failsafe
			console.error("Fatal Error ;", error);
			return fetch(event.request);
		})
	);
});