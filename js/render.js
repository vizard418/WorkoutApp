import { getData, saveData } from "./state.js";
import { openModal, openExerciseModal } from "./modal.js";

let dragFromIndex = null;
let dragDiaIndex = null;

// =========================
// PESOS HELPERS
// =========================
function normalizePesos(e) {
    // migración suave desde sistema viejo
    if (!Array.isArray(e.pesos)) {
        if (typeof e.peso === "number" && e.peso > 0) {
            e.pesos = [e.peso];
        } else {
            e.pesos = [];
        }
    }

    return e.pesos;
}

function pushPeso(e, value) {
    const pesos = normalizePesos(e);

    pesos.push(value);

    // mantener solo últimos 5
    while (pesos.length > 5) {
        pesos.shift();
    }
}

function updatePeso(e, index, value) {
    const pesos = normalizePesos(e);

    if (index >= 0 && index < pesos.length) {
        pesos[index] = value;
    }
}

// fix de eventos long-press
function attachLongPress(element, callback, delay = 600) {
    let timer = null;

    const start = (e) => {
        e.preventDefault?.();

        timer = setTimeout(() => {
            callback(e);
        }, delay);
    };

    const cancel = () => {
        clearTimeout(timer);
        timer = null;
    };

    element.addEventListener("pointerdown", start);
    element.addEventListener("pointerup", cancel);
    element.addEventListener("pointerleave", cancel);
    element.addEventListener("pointercancel", cancel);

    element.addEventListener("contextmenu", (e) => {
        e.preventDefault();
    });
}

// helper eliminar peso
function deletePeso(e, i, data) {
    e.pesos.splice(i, 1);
    saveData(data);
    render();
}

export function render() {
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

        const editBtn = document.createElement("button");
        editBtn.className = "day-edit-btn";
        editBtn.textContent = "✎";

        editBtn.onclick = async (ev) => {
            ev.stopPropagation();

            const nuevo = await openModal(`Cambiar título Día ${index + 1}`, dia.descripcion);

            if (nuevo !== null) {
                dia.descripcion = nuevo.trim() || "Descanso";
                saveData(data);
                render();
            }
        };

        card.appendChild(editBtn);

        card.onclick = () => {
            const el = document.getElementById(sectionId);
            if (!el) return;

            const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
        };

        days.appendChild(card);

        const title = document.createElement("div");
        title.className = "section-title";
        title.id = sectionId;
        title.textContent = `Día ${index + 1}: ${dia.descripcion}`;

        cont.appendChild(title);

        dia.ejercicios.forEach((e, exIndex) => {

            const exCard = document.createElement("div");
            exCard.className = "exercise-card";
            exCard.draggable = true;

            // drag start
            exCard.addEventListener("dragstart", () => {
                dragFromIndex = exIndex;
                dragDiaIndex = index;

                // agregado: clase para estilar
                exCard.classList.add("dragging");
            });

            // limpiarlo cuando termina
            exCard.addEventListener("dragend", () => {
                exCard.classList.remove("dragging");
            });

            // permitir drop
            exCard.addEventListener("dragover", (e) => {
                e.preventDefault();
            });

            // drop reordenar evento
            exCard.addEventListener("drop", () => {
                if (dragDiaIndex !== index) return;

                const from = dragFromIndex;
                const to = exIndex;

                if (from === to) return;

                const moved = dia.ejercicios.splice(from, 1)[0];
                dia.ejercicios.splice(to, 0, moved);

                saveData(data);
                render();
            });

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

            // =========================
            // PESOS UI (NUEVO)
            // =========================

            const pesos = normalizePesos(e);

            const pesosContainer = document.createElement("div");
            pesosContainer.style.display = "flex";
            pesosContainer.style.gap = "6px";
            pesosContainer.style.alignItems = "center";

            pesos.forEach((p, i) => {
                const btn = document.createElement("button");
                btn.textContent = p + "kg";

                btn.style.border = "none";
                btn.style.borderRadius = "6px";
                btn.style.padding = "3px 6px";
                btn.style.fontSize = "0.75rem";
                btn.style.cursor = "pointer";

                btn.onclick = async (ev) => {
                    ev.stopPropagation();

                    const n = await openModal("Editar peso (kg)", p);

                    if (n !== null) {
                        const val = parseFloat(n);

                        if (!isNaN(val) && val >= 0) {
                            updatePeso(e, i, val);
                            saveData(data);
                            render();
                        }
                    }
                };

                // click derecho (desktop)
                btn.addEventListener("contextmenu", (ev) => {
                    ev.preventDefault();
                    ev.stopPropagation();

                    const confirmDelete = confirm(`Eliminar peso (${p}kg)?`);
                    if (!confirmDelete) return;

                    deletePeso(e, i, data);
                });

                // long press (mobile)
                attachLongPress(btn, () => {
                    const confirmDelete = confirm(`Eliminar peso (${p}kg)?`);
                    if (!confirmDelete) return;

                    deletePeso(e, i, data);
                });

                pesosContainer.appendChild(btn);
            });

            const addBtn = document.createElement("button");
            addBtn.textContent = "+";

            addBtn.style.border = "none";
            addBtn.style.borderRadius = "6px";
            addBtn.style.padding = "3px 8px";
            addBtn.style.cursor = "pointer";

            addBtn.onclick = async (ev) => {
                ev.stopPropagation();

                const n = await openModal("Nuevo peso (kg)", "");

                if (n !== null) {
                    const val = parseFloat(n);

                    if (!isNaN(val) && val >= 0) {
                        pushPeso(e, val);
                        saveData(data);
                        render();
                    }
                }
            };

            pesosContainer.appendChild(addBtn);

            const deleteBtn = document.createElement("button");
            deleteBtn.className = "ex-delete-btn";
            deleteBtn.textContent = "🗑";

            deleteBtn.onclick = (ev) => {
                ev.stopPropagation();

                const confirmDelete = confirm("Eliminar ejercicio?");
                if (!confirmDelete) return;

                dia.ejercicios.splice(exIndex, 1);
                saveData(data);
                render();
            };

            controls.appendChild(pesosContainer);
            controls.appendChild(deleteBtn);

            exCard.appendChild(name);
            exCard.appendChild(volume);
            exCard.appendChild(notes);
            exCard.appendChild(controls);

            exCard.onclick = async () => {

                const result = await openExerciseModal(e);

                if (!result) return;

                e.nombre = result.nombre;
                e.volumen = result.volumen;
                e.notas = result.notas;

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
                nombre: "Nombre del ejercicio.",
                volumen: "Ej. 3x12 (series x reps)",
                notas: "",
                peso: 0,
                pesos: []
            });

            saveData(data);
            render();
        };

        cont.appendChild(btn);
    });
}
