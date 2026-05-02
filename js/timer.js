import { timerState } from "./state.js";
import { openModal } from "./modal.js";

const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
const timer = document.getElementById("timer");

function format(sec) {
    let m = Math.floor(sec / 60);
    let s = sec % 60;
    return String(m).padStart(2, "0") + ":" + String(s).padStart(2, "0");
}

function updateDisplay() {
    if (!timer) return;
    timer.textContent = format(timerState.timeLeft);
}

export function initTimerUI() {
    updateDisplay();

    if (!timer) return;

    timer.addEventListener("click", async () => {
        if (audioCtx.state === "suspended") await audioCtx.resume();

        if (timerState.running) {
            resetTimer();
            return;
        }

        timerState.running = true;
        startTimer();
    });

    let pressTimer;

    timer.addEventListener("pointerdown", () => {
        pressTimer = setTimeout(async () => {
            const input = await openModal("Segundos del timer", timerState.defaultTime);

            if (input !== null) {
                const val = parseInt(input);
                if (!isNaN(val) && val > 0) {
                    timerState.defaultTime = val;
                    localStorage.setItem("defaultTime", val);
                    resetTimer();
                }
            }
        }, 600);
    });

    timer.addEventListener("pointerup", () => clearTimeout(pressTimer));
}

function startTimer() {
    clearInterval(timerState.interval);

    timerState.interval = setInterval(() => {
        if (timerState.timeLeft <= 0) {
            clearInterval(timerState.interval);
            timerState.running = false;

            playFinishSound();

            timerState.timeLeft = timerState.defaultTime;
            updateDisplay();
            return;
        }

        timerState.timeLeft--;
        updateDisplay();
    }, 1000);
}

function resetTimer() {
    clearInterval(timerState.interval);
    timerState.timeLeft = timerState.defaultTime;
    timerState.running = false;
    updateDisplay();
}

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
