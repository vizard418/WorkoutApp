const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

/* =========================
   INIT SEGURO
========================= */

document.addEventListener("DOMContentLoaded", initApp);

function initApp() {
    initTheme();
    initUser();
    initTimerUI();
    render();
}

/* =========================
   MODAL (REEMPLAZO PROMPT)
========================= */

function openModal(title, value = "") {
    return new Promise((resolve) => {

        const modal = document.getElementById("modal");
        const modalTitle = document.getElementById("modal-title");
        const modalInput = document.getElementById("modal-input");
        const modalOk = document.getElementById("modal-ok");
        const modalCancel = document.getElementById("modal-cancel");

        if (!modal || !modalTitle || !modalInput || !modalOk || !modalCancel) {
            resolve(prompt(title, value));
            return;
        }

        modalTitle.textContent = title;
        modalInput.value = value;
        modal.classList.remove("hidden");

        const close = (result) => {
            modal.classList.add("hidden");
            modalOk.onclick = null;
            modalCancel.onclick = null;
            resolve(result);
        };

        modalOk.onclick = () => close(modalInput.value);
        modalCancel.onclick = () => close(null);
    });
}

/* =========================
   THEME
========================= */

function initTheme() {
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

/* =========================
   USER NAME
========================= */

function initUser() {
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

/* =========================
   TIMER
========================= */

let defaultTime = Number(localStorage.getItem("defaultTime")) || 120;
let timeLeft = defaultTime;
let interval = null;
let running = false;

const timer = document.getElementById("timer");

function format(sec) {
    let m = Math.floor(sec / 60);
    let s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function updateDisplay() {
    if (!timer) return;
    timer.textContent = format(timeLeft);
}

function initTimerUI() {
    updateDisplay();

    if (!timer) return;

    timer.addEventListener("click", async () => {
        if (audioCtx.state === "suspended") await audioCtx.resume();

        if (running) {
            resetTimer();
            return;
        }

        running = true;
        startTimer();
    });

    let pressTimer;

    timer.addEventListener("pointerdown", () => {
        pressTimer = setTimeout(async () => {
            const input = await openModal("Segundos del timer", defaultTime);

            if (input !== null) {
                const val = parseInt(input);
                if (!isNaN(val) && val > 0) {
                    defaultTime = val;
                    localStorage.setItem("defaultTime", val);
                    resetTimer();
                }
            }
        }, 600);
    });

    timer.addEventListener("pointerup", () => clearTimeout(pressTimer));
}

function startTimer() {
    clearInterval(interval);

    interval = setInterval(() => {
        if (timeLeft <= 0) {
            clearInterval(interval);
            running = false;

            playFinishSound();

            timeLeft = defaultTime;
            updateDisplay();
            return;
        }

        timeLeft--;
        updateDisplay();
    }, 1000);
}

function resetTimer() {
    clearInterval(interval);
    timeLeft = defaultTime;
    running = false;
    updateDisplay();
}

/* =========================
   SOUND
========================= */

function playBeep(freq = 1500, duration = 0.2) {
    const o = audioCtx.createOscillator();
    const g = audioCtx.createGain();

    o.type = "square";
    o.frequency.value = freq;

    o.connect(g);
    g.connect(audioCtx.destination);

    o.start();
    o.stop(audioCtx.currentTime + duration);
}

function playFinishSound() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => playBeep(1600, 0.2), i * 250);
    }
}

/* =========================
   DATA
========================= */

const rutinaBase = {
    dias: Array.from({ length: 7 }, () => ({
        descripcion: "Descanso",
        ejercicios: []
    }))
};

function getData() {
    const data = localStorage.getItem("rutina");
    return data ? JSON.parse(data) : structuredClone(rutinaBase);
}

function saveData(data) {
    localStorage.setItem("rutina", JSON.stringify(data));
}

/* =========================
   RENDER
========================= */

function render() {

    const data = getData();

    const days = document.getElementById("days-container");
    const cont = document.getElementById("rutina-container");

    if (!days || !cont) return;

    days.innerHTML = "";
    cont.innerHTML = "";

    data.dias.forEach((dia, index) => {

        const sectionId = "dia-" + index;

        const card = document.createElement("div");
        card.className = "day-card";

        const h3 = document.createElement("h3");
        h3.textContent = `Día ${index + 1}: ${dia.descripcion}`;

        const p = document.createElement("p");
        p.textContent = dia.ejercicios.length
            ? `${dia.ejercicios.length} ejercicios`
            : "Descanso";

        card.appendChild(h3);
        card.appendChild(p);

        card.onclick = () => {
            const el = document.getElementById(sectionId);
            if (!el) return;

            const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
        };

        card.addEventListener("contextmenu", async (e) => {
            e.preventDefault();

            const nuevo = await openModal(`Editar Día ${index + 1}`, dia.descripcion);

            if (nuevo !== null) {
                dia.descripcion = nuevo.trim() || "Descanso";
                saveData(data);
                render();
            }
        });

        days.appendChild(card);

        const title = document.createElement("div");
        title.className = "section-title";
        title.id = sectionId;
        title.textContent = `Día ${index + 1}: ${dia.descripcion}`;

        cont.appendChild(title);

        dia.ejercicios.forEach((e) => {

            const exCard = document.createElement("div");
            exCard.className = "exercise-card";

            const name = document.createElement("div");
            name.className = "ex-name";
            name.textContent = e.nombre;

            const volume = document.createElement("div");
            volume.className = "ex-info";
            volume.textContent = "Volumen: " + e.volumen;

            const notes = document.createElement("div");
            notes.className = "ex-notes";
            notes.textContent = e.notas;

            const controls = document.createElement("div");
            controls.className = "ex-controls";

            const weight = document.createElement("div");
            weight.className = "ex-weight";
            weight.textContent = (e.peso || 0) + " kg";

            weight.onclick = async (ev) => {
                ev.stopPropagation();

                const n = await openModal("Peso (kg)", e.peso || 0);

                if (n !== null) {
                    const val = parseFloat(n);
                    e.peso = isNaN(val) ? e.peso : Math.max(0, val);
                    saveData(data);
                    render();
                }
            };

            controls.appendChild(weight);

            exCard.appendChild(name);
            exCard.appendChild(volume);
            exCard.appendChild(notes);
            exCard.appendChild(controls);

            exCard.onclick = async () => {
                const n1 = await openModal("Ejercicio", e.nombre);
                const n2 = await openModal("Volumen", e.volumen);
                const n3 = await openModal("Notas", e.notas);

                if (n1 !== null) e.nombre = n1;
                if (n2 !== null) e.volumen = n2;
                if (n3 !== null) e.notas = n3;

                saveData(data);
                render();
            };

            cont.appendChild(exCard);
        });

        const btn = document.createElement("button");
        btn.className = "add-btn";
        btn.textContent = "+ Agregar ejercicio";

        btn.onclick = () => {
            dia.ejercicios.push({
                nombre: "Nuevo",
                volumen: "",
                notas: "",
                peso: 0
            });

            saveData(data);
            render();
        };

        cont.appendChild(btn);
    });
}
