export let files = [];

export function initPDF() {
    pdfDrop.onclick = () => pdfFiles.click();
    pdfFiles.onchange = e => { files = Array.from(e.target.files); renderFiles(); };
}

export function renderFiles() {
    fileList.innerHTML = "";
    files.forEach((f, i) => {
        fileList.innerHTML += `
        <div class="file-item">
            <div class="file-top">${f.name}<span class="remove" onclick="removeFile(${i})">✖</span></div>
            <div class="progress"><div class="bar" id="bar${i}"></div></div>
        </div>`;
    });
}

export function removeFile(i) { files.splice(i, 1); renderFiles(); }

export function toBase64(file) {
    return new Promise(r => {
        const fr = new FileReader();
        fr.onload = () => r(fr.result.split(',')[1]);
        fr.readAsDataURL(file);
    });
}

export async function uploadSingle(file, i, token) {
    const bar = document.getElementById("bar" + i);
    const base64 = await toBase64(file);
    const fileNameUpper = file.name.toUpperCase();
    const path = `files/${tahun.value}/${bulan.value}/${fileNameUpper}`;
    const url = `https://api.github.com/repos/valios-idn/slip-gaji/contents/${path}`;

    bar.style.width = "30%";
    try {
        const res = await fetch(url, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify({ message: "Upload slip gaji", content: base64 })
        });
        if (!res.ok) throw new Error((await res.json()).message || `Upload gagal ${res.status}`);
        bar.style.width = "100%";
        console.log(`✅ Berhasil upload: ${fileNameUpper}`);
        return fileNameUpper;
    } catch (err) {
        console.error(`Gagal upload ${file.name}:`, err);
        bar.style.backgroundColor = "#ef4444";
        throw err;
    }
}

export async function uploadAll(token) {
    if (!files.length) { alert("⚠️ Tidak ada file!"); return; }
    status.innerText = "⏳ Upload sedang berjalan...";
    let success = 0;
    for (let i = 0; i < files.length; i++) {
        try { await uploadSingle(files[i], i, token); success++; } catch (e) { console.error(e); }
    }
    if (success === files.length) {
        status.innerText = "🎉 Semua file berhasil diupload!";
        showToast("🎉 Upload selesai semua!");
    } else {
        status.innerText = `⚠️ ${success}/${files.length} file berhasil`;
        showToast("⚠️ Ada file yang gagal upload", "error");
    }
}
