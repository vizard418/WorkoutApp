const audioCtx = new (window.AudioContext || window.webkitAudioContext)();

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

updateDisplay();

function start() {
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

function reset() {
    clearInterval(interval);
    timeLeft = defaultTime;
    running = false;
    updateDisplay();
}

/* CLICK / TAP */
if (timer) {
    timer.addEventListener("click", async () => {
        try {
            if (audioCtx.state === "suspended") {
                await audioCtx.resume();
            }
        } catch (e) {}

        if (running) {
            reset();
            return;
        }

        running = true;
        start();
    });

    /* =========================
       LONG PRESS (MOBILE + DESKTOP)
    ========================= */

    let pressTimer = null;
    let longPressActive = false;

    const startPress = () => {
        longPressActive = false;

        pressTimer = setTimeout(() => {
            longPressActive = true;

            const input = prompt("Segundos del timer:", defaultTime);

            if (input !== null) {
                const val = parseInt(input);

                if (!isNaN(val) && val > 0) {
                    defaultTime = val;
                    localStorage.setItem("defaultTime", val);
                    reset();
                }
            }
        }, 600);
    };

    const cancelPress = () => {
        clearTimeout(pressTimer);
    };

    timer.addEventListener("pointerdown", startPress);
    timer.addEventListener("pointerup", cancelPress);
    timer.addEventListener("pointercancel", cancelPress);
    timer.addEventListener("pointerleave", cancelPress);

    timer.style.userSelect = "none";
}

/* =========================
   SOUND
========================= */

function playBeep(freq = 1500, duration = 0.2) {
    try {
        const o = audioCtx.createOscillator();
        const g = audioCtx.createGain();

        o.type = "square";
        o.frequency.value = freq;

        o.connect(g);
        g.connect(audioCtx.destination);

        o.start();
        o.stop(audioCtx.currentTime + duration);
    } catch (e) {}
}

function playFinishSound() {
    for (let i = 0; i < 3; i++) {
        setTimeout(() => playBeep(1600, 0.2), i * 250);
    }
}

/* =========================
   USER NAME
========================= */

const userNameEl = document.getElementById("user-name");

if (userNameEl) {
    const savedName = localStorage.getItem("userName");
    if (savedName) userNameEl.textContent = savedName;

    userNameEl.onclick = () => {
        const n = prompt("Tu nombre:", userNameEl.textContent);
        if (n !== null) {
            userNameEl.textContent = n;
            localStorage.setItem("userName", n);
        }
    };
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

            const yOffset = -80; // ajusta si tu header es más alto o más bajo
            const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;

            window.scrollTo({
                top: y,
                behavior: "smooth"
            });
        };


        card.addEventListener("contextmenu", (e) => {
            e.preventDefault();

            const nuevo = prompt(`Editar Día ${index + 1}:`, dia.descripcion);

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

            weight.onclick = (ev) => {
                ev.stopPropagation();

                const n = prompt("Peso (kg):", e.peso || 0);

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

            exCard.onclick = () => {
                e.nombre = prompt("Ejercicio:", e.nombre) || e.nombre;
                e.volumen = prompt("Volumen:", e.volumen) || e.volumen;
                e.notas = prompt("Notas:", e.notas) || e.notas;

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

/* =========================
   EXPORT / IMPORT
========================= */

const exportBtn = document.getElementById("export-btn");
const importBtn = document.getElementById("import-btn");
const fileInput = document.getElementById("file-input");

if (exportBtn) {
    exportBtn.onclick = () => {
        const data = localStorage.getItem("rutina");
        if (!data) return;

        const blob = new Blob([data], { type: "application/json" });

        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "rutina.json";
        a.click();
    };
}

if (importBtn && fileInput) {
    importBtn.onclick = () => fileInput.click();

    fileInput.onchange = (e) => {
        const file = e.target.files[0];

        const reader = new FileReader();

        reader.onload = () => {
            localStorage.setItem("rutina", reader.result);
            location.reload();
        };

        reader.readAsText(file);
    };
}

/* =========================
   THEME
========================= */

const themeToggle = document.getElementById("theme-toggle");

if (themeToggle) {
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
        document.documentElement.setAttribute("data-theme", savedTheme);
    }

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
   INIT
========================= */

render();
