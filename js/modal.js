export function openModal(title, value = "") {
    return new Promise((resolve) => {

        // referencias a nodos del DOM requeridos por el modal
        const modal = document.getElementById("modal");
        const modalTitle = document.getElementById("modal-title");
        const modalInput = document.getElementById("modal-input");
        const modalOk = document.getElementById("modal-ok");
        const modalCancel = document.getElementById("modal-cancel");

        // fallback a prompt si el modal no está disponible en el DOM
        if (!modal || !modalTitle || !modalInput || !modalOk || !modalCancel) {
            resolve(prompt(title, value));
            return;
        }

        // manejo de teclado; depende de la existencia de close()
        const handleKey = (e) => {
            if (e.key === "Enter") {
                e.preventDefault();
                close(modalInput.value);
            }

            if (e.key === "Escape") {
                e.preventDefault();
                close(null);
            }
        };

        // punto único de cierre; centraliza limpieza de estado y resolución
        const close = (result) => {
            modal.classList.add("hidden");

            // eliminación de handlers para evitar duplicación en aperturas posteriores
            modalOk.onclick = null;
            modalCancel.onclick = null;

            // eliminación del listener global asociado a esta instancia
            document.removeEventListener("keydown", handleKey);

            resolve(result);
        };

        // inicialización de contenido del modal
        modalTitle.textContent = title;
        modalInput.value = value;
        modal.classList.remove("hidden");

        // registro de listener global; requiere handleKey previamente definido
        document.addEventListener("keydown", handleKey);

        // asignación de foco diferido para asegurar render previo
        setTimeout(() => {
            modalInput.focus();
            modalInput.select();
        }, 50);

        // asociación de acciones de UI al punto de cierre
        modalOk.onclick = () => close(modalInput.value);
        modalCancel.onclick = () => close(null);
    });
}

export function openExerciseModal(exercise = {}) {
    return new Promise((resolve) => {

        const modal = document.getElementById("modal");
        const title = document.getElementById("modal-title");
        const ok = document.getElementById("modal-ok");
        const cancel = document.getElementById("modal-cancel");

        if (!modal || !title || !ok || !cancel) {
            resolve(null);
            return;
        }

        // contenedor exclusivo del formulario
        const form = document.createElement("div");
        form.className = "exercise-form";

        const fields = [
            { key: "nombre", label: "Ejercicio", value: exercise.nombre || "" },
            { key: "volumen", label: "Volumen", value: exercise.volumen || "" },
            { key: "notas", label: "Notas", value: exercise.notas || "" }
        ];

        const inputs = {};

        fields.forEach(f => {
            const wrap = document.createElement("div");

            const label = document.createElement("label");
            label.textContent = f.label;

            const input = document.createElement("input");
            input.value = f.value;

            inputs[f.key] = input;

            wrap.appendChild(label);
            wrap.appendChild(input);
            form.appendChild(wrap);
        });

        const content = modal.querySelector(".modal-content");

        // guardar contenido original del modal input (IMPORTANTE)
        const originalInput = document.getElementById("modal-input");

        // ocultar input viejo SIN destruirlo
        originalInput.style.display = "none";

        content.insertBefore(form, ok.parentElement);

        setTimeout(() => {
            const firstInput = form.querySelector("input");
            if (firstInput) {
                firstInput.focus();
                firstInput.select();
            }
        }, 0);

        modal.classList.remove("hidden");
        title.textContent = "Editar ejercicio";

        // eventos de teclas Intro - Escape
        const handleKey = (e) => {
            if (e.key === "Escape") {
                e.preventDefault();
                close(null);
            }

            if (e.key === "Enter") {
                e.preventDefault();
                ok.click();
            }
        };

document.addEventListener("keydown", handleKey);

        const close = (result) => {
            modal.classList.add("hidden");

            form.remove();

            // restaurar input original
            originalInput.style.display = "";

            ok.onclick = null;
            cancel.onclick = null;

            resolve(result);

            // eliminar el listener eventos de teclas
            document.removeEventListener("keydown", handleKey);
        };

        ok.onclick = () => {
            close({
                nombre: inputs.nombre.value,
                volumen: inputs.volumen.value,
                notas: inputs.notas.value
            });
        };

        cancel.onclick = () => close(null);
    });
}
