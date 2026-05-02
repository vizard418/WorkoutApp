export function initIO(onImport) {
    const exportBtn = document.getElementById("export-btn");
    const importBtn = document.getElementById("import-btn");
    const fileInput = document.getElementById("file-input");

    if (!exportBtn || !importBtn || !fileInput) return;

    exportBtn.onclick = () => {
        const data = localStorage.getItem("rutina") || "{}";

        const blob = new Blob([data], { type: "application/json" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = "rutina.json";
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
            localStorage.setItem("rutina", reader.result);
            onImport();
        };

        reader.readAsText(file);
    };
}
