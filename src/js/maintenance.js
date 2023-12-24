/* eslint-disable no-unused-vars */

/**
 * @param {HTMLButtonElement} button
 */
function clearCacheButton(button) {
	button.textContent = "";
	caches.keys().then((keyList) => {
		for (const key of keyList) {	
			caches.delete(key).then(success => {
				if (success) {
					button.textContent += `Cache "${key}" effacé !\n`;
				}
				else {
					button.textContent += `"${key}" NotFound\n`;
				}
			});
		}
	});
}

/**
 * @param {HTMLButtonElement} button
 */
function clearCookies(button) {
	window.indexedDB.databases().then((databasesInfo) => {
		for (const databaseInfo of databasesInfo) window.indexedDB.deleteDatabase(databaseInfo.name);
	}).then(() => {
		button.textContent = "Configurations effacées !";
	}).catch(error => button.textContent = error);
}

/**
 * @param {HTMLButtonElement} button
 */
function clearServiceWorker(button) {
	button.textContent = "";
	navigator.serviceWorker.getRegistrations().then(registrations => {
		if (registrations.length) {
			for(const registration of registrations) {
				registration.unregister().then(sucsess => {
					button.textContent += `${registration.active.scriptURL} ${sucsess ? "effacé" : "échoué"} !`;
				});
			}
		}
		else {
			button.textContent = "Aucun Service Worker présent !";
		}
	});	
}