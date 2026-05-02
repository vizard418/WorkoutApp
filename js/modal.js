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
