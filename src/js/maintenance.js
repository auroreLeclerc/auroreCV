/* eslint-disable no-unused-vars */

/**
 * @param {HTMLButtonElement} button
 */
function clearCacheButton(button) {
	/**
	 * @param {typeof import("./variables.mjs")} variable
	 * @param {Error} error
	*/
	function clearCache(variable, error) {
		caches.delete(variable?.CACHE_NAME ? variable?.CACHE_NAME : "auroreCV").then(success => {
			if (success) {
				button.textContent = "Cache effacé !";
			}
			else {
				button.textContent = "Aucun cache trouvé !";
			}
			if (error) {
				button.textContent += ` \n & ${error}`;
			}
		});
	}
	import("./variables.mjs").then(variable => {
		clearCache(variable, undefined);
	}).catch(error => {
		clearCache(null, error);
	});
}


/**
 * @param {HTMLButtonElement} button
 */
function clearCookies(button) {
	document.cookie.split(";").forEach(function(cookie) {
		document.cookie = cookie.trim().split("=")[0] + "=;" + "expires=Thu, 01 Jan 1970 00:00:00 UTC;";
	});
	button.textContent = "Cookies effacés !";
}

/**
 * @param {HTMLButtonElement} button
 */
function clearServiceWorker(button) {
	navigator.serviceWorker.getRegistrations().then(registrations => {
		if (registrations.length) {
			for(let registration of registrations) {
				registration.unregister();
			}
			button.textContent = "Service Worker effacé !";
		}
		else {
			button.textContent = "Aucun Service Worker présent !";
		}
	});
	
}