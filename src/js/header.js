const header = document.querySelector("body header");
header.insertAdjacentHTML("afterbegin", `<div id="airplane">✈️</div>`);
const airplane = document.getElementById("airplane");

const OFFLINE = () => {
    airplane.style.top = "5px";
    airplane.style.left = "5px";
},
ONLINE = () => {
    airplane.style.top = "2em";
    airplane.style.left = "-2em";
};

navigator.onLine ? ONLINE() : OFFLINE();
addEventListener("offline", OFFLINE);
addEventListener("online", ONLINE);

if ("share" in navigator) {
    header.insertAdjacentHTML("beforeend", `<h1 id="share"><a href="#top">Partager !</a></h1>`);
    document.getElementById("share").addEventListener("click", () => {
        navigator.share({
            title: "Partager le Curriculum vitæ d'Aurore Leclerc",
            text: "Je t'ai montré le CV d'Aurore Leclerc ?\nRegarde il peut même être installé sur ton appareil (en PWA) !",
            url: window.location.href,
        }).then(() => {
            console.info("Shared !");
        });
    });
}

if ("print" in window && (window.location.pathname.endsWith("/index.html") || window.location.pathname.endsWith("/"))) {
    header.insertAdjacentHTML("beforeend", `<h1 id="print"><a href="#top">Imprimer</a></h1>`);
    document.getElementById("print").addEventListener("click", () => {
        window.print();
    });
}

if ("BeforeInstallPromptEvent" in window) {
    header.insertAdjacentHTML("beforeend", `<h1 id="install"><a href="#top">Installer</a></h1>`);
    const install = document.getElementById("install");
    install.style.display = "none";
    let deferredPrompt = null;

    install.addEventListener("click", () => {
        install.style.display = "none";
        deferredPrompt.prompt().then(choice => {
            console.info(`${choice.platforms} user ${choice.outcome} the A2HS prompt`);
            deferredPrompt = null;
        });
    });

    window.addEventListener("beforeinstallprompt", (event) => {
        event.preventDefault();
        deferredPrompt = event;
        install.style.display = "block";
    });
}