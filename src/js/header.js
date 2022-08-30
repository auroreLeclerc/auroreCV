const header = document.querySelector("body header")
header.insertAdjacentHTML("afterbegin", `<div id="airplane">✈️</div>`);
const airplane = document.getElementById("airplane");

const offline = () => {
    airplane.style.top = "5px";
    airplane.style.left = "5px";
},
online = () => {
    airplane.style.top = "2em";
    airplane.style.left = "-2em";
};

navigator.onLine ? online() : offline();
addEventListener("offline", () => offline());
addEventListener("online", () => online());

if ("share" in navigator) {
    header.insertAdjacentHTML("beforeend", `<h1 id="share"><a>Partager !</a></h1>`);
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