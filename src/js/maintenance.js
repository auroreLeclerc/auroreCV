const language = new Intl.Locale(navigator.language).language === "fr" ? "fr" : "en";
for (const element of document.getElementsByClassName(language === "fr" ? "english" : "french")) { // reverse
	if (element instanceof HTMLElement) element.style.display = "none";
}

/**
 * @param {string} fr
 * @param {string} en
 */
function checkLanguage(fr, en) {
	return language === "fr" ? fr : en;
}

/**
 * @param {HTMLButtonElement} button
 */
function clearCacheButton(button) {
	caches.keys().then(keyList => {
		button.textContent = "";
		for (const key of keyList) {
			caches.delete(key).then(success => {
				if (success) {
					button.textContent += checkLanguage(`Cache "${key}" effacé !\n`, `Cache "${key}" Deleted !\n`);
				}
				else {
					button.textContent += `"${key}" NotFound\n`;
				}
			});
		}
		if (!keyList.length) button.textContent = checkLanguage("Aucun cache", "No cache available");
	});
}

/**
 * @param {HTMLButtonElement} button
 */
function clearCookies(button) {
	window.indexedDB.databases(
	).then(databasesInfo => {
		for (const databaseInfo of databasesInfo) {
			window.indexedDB.deleteDatabase(databaseInfo.name);
			button.textContent = checkLanguage(`Configuration ${databaseInfo.name} effacée !`, `${databaseInfo.name} configuration  deleted !`);
		}
		if (!databasesInfo.length) button.textContent = checkLanguage("Aucune configuration", "No configuration available");
	}).catch(error => button.textContent = error);
}

/**
 * @param {HTMLButtonElement} button
 */
function clearServiceWorker(button) {
	navigator.serviceWorker.getRegistrations().then(registrations => {
		button.textContent = "";
		for (const registration of registrations) {
			registration.unregister().then(sucsess => {
				button.textContent += `${registration.active.scriptURL} ${checkLanguage(sucsess ? "effacé" : "échoué", sucsess ? "deleted" : "failed")} !\n`;
			});
		}
		if (!registrations.length) {
			button.textContent = checkLanguage("Aucun Service Worker", "No Service Worker Available");
		}
	});
}
