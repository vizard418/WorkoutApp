import { getData, saveData } from "./state.js";
import { openModal } from "./modal.js";

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

        card.onclick = () => {
            const el = document.getElementById(sectionId);
            if (!el) return;

            const y = el.getBoundingClientRect().top + window.pageYOffset - 80;
            window.scrollTo({ top: y, behavior: "smooth" });
        };

        card.addEventListener("contextmenu", async (e) => {
            e.preventDefault();

            const nuevo = await openModal(`Cambiar título Día ${index + 1}`, dia.descripcion);

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

        title.addEventListener("contextmenu", async (e) => {
            e.preventDefault();

            const nuevo = await openModal(`Editar Día ${index + 1}`, dia.descripcion);

            if (nuevo !== null) {
                dia.descripcion = nuevo.trim() || "Descanso";
                saveData(data);
                render();
            }
        });

        cont.appendChild(title);

        dia.ejercicios.forEach((e, exIndex) => {

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

            exCard.addEventListener("contextmenu", (ev) => {
                ev.preventDefault();

                const confirmDelete = confirm("Eliminar ejercicio?");
                if (!confirmDelete) return;

                dia.ejercicios.splice(exIndex, 1);
                saveData(data);
                render();
            });

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
                peso: 0
            });

            saveData(data);
            render();
        };

        cont.appendChild(btn);
    });
}
