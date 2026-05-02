export const rutinaBase = {
    dias: Array.from({ length: 7 }, () => ({
        descripcion: "Descanso",
        ejercicios: []
    }))
};

export function getData() {
    const data = localStorage.getItem("rutina");
    return data ? JSON.parse(data) : structuredClone(rutinaBase);
}

export function saveData(data) {
    localStorage.setItem("rutina", JSON.stringify(data));
}

export const timerState = {
    defaultTime: Number(localStorage.getItem("defaultTime")) || 120,
    timeLeft: Number(localStorage.getItem("defaultTime")) || 120,
    interval: null,
    running: false
};
