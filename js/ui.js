import { openModal } from "./modal.js";

export function initTheme() {
    const themeToggle = document.getElementById("theme-toggle");

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
        document.documentElement.setAttribute("data-theme", savedTheme);
    }

    if (!themeToggle) return;

    themeToggle.onclick = () => {
        const current = document.documentElement.getAttribute("data-theme");

        if (current === "dark") {
            document.documentElement.removeAttribute("data-theme");
            localStorage.setItem("theme", "light");
        } else {
            document.documentElement.setAttribute("data-theme", "dark");
            localStorage.setItem("theme", "dark");
        }
    };
}

export function initUser() {
    const userNameEl = document.getElementById("user-name");

    if (!userNameEl) return;

    const saved = localStorage.getItem("userName");
    if (saved) userNameEl.textContent = saved;

    userNameEl.onclick = async () => {
        const n = await openModal("Tu nombre", userNameEl.textContent);
        if (n !== null) {
            userNameEl.textContent = n;
            localStorage.setItem("userName", n);
        }
    };
}
