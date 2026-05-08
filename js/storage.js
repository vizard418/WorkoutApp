export function initIO(onImport) {
    const exportBtn = document.getElementById("export-btn");
    const importBtn = document.getElementById("import-btn");
    const fileInput = document.getElementById("file-input");

    if (!exportBtn || !importBtn || !fileInput) return;
    exportBtn.onclick = () => {
        const data = {
            rutina: JSON.parse(localStorage.getItem("rutina") || "{}"),
            userName: localStorage.getItem("userName") || ""
        };

        const blob = new Blob(
            [JSON.stringify(data, null, 2)],
            { type: "application/json" }
        );
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;

        // filename
        let userName =
            (localStorage.getItem("userName") || "user")
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .toLowerCase()
                .replace(/[^a-z0-9]/g, "");

        if (!userName) {
            userName = "user";
        }

        const now = new Date();
        const yy = String(now.getFullYear()).slice(2);
        const mm = String(now.getMonth() + 1).padStart(2, "0");
        const dd = String(now.getDate()).padStart(2, "0");

        const fileName = `${yy}${mm}${dd}-${userName}_workout.json`;

        a.download = fileName;
        a.click();

        URL.revokeObjectURL(url);
    };

    importBtn.onclick = () => {
        fileInput.value = "";
        fileInput.click();
    };

    fileInput.onchange = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();

        reader.onload = () => {
            const imported = JSON.parse(reader.result);

            // guardar rutina
            localStorage.setItem(
                "rutina",
                JSON.stringify(imported.rutina || imported)
            );

            // restaurar username si existe
            if (imported.userName) {
                localStorage.setItem("userName", imported.userName);
            }

            onImport();
        };

        reader.readAsText(file);
    };
}
