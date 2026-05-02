import { initTheme, initUser } from "./ui.js";
import { initTimerUI } from "./timer.js";
import { initIO } from "./storage.js";
import { render } from "./render.js";

document.addEventListener("DOMContentLoaded", () => {
    initTheme();
    initUser();
    initTimerUI();
    initIO(render);
    render();
});

if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
        navigator.serviceWorker
            .register("./service-worker.js")
            .then(reg => {
                console.log("SW registrado", reg.scope);
            })
            .catch(err => {
                console.error("Error SW", err);
            });
    });
}
