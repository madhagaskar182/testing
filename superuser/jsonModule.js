import { hashPass } from './login.js';

export let jsonData = {};
export const TOKEN = "_pat_11CAL3MIA03YlOdbk6DTFt_K7vkaYfLDFxgt5w5chcvjunGjaWA79oRknfplcB62Df4IBWLSBJw41Bw1j1";

export function initToken() {
    tokenJson.value = TOKEN;
}

export async function generateJSON() {
    const file = excelFile.files[0];
    if (!file) { alert("⚠️ Pilih file Excel dulu!"); return; }

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const data = new Uint8Array(e.target.result);
            const workbook = XLSX.read(data, { type: "array", cellDates: true, cellText: false });
            const sheetName = workbook.SheetNames[0];
            if (!sheetName) { alert("❌ Sheet tidak ditemukan!"); return; }

            const sheet = workbook.Sheets[sheetName];
            const rows = XLSX.utils.sheet_to_json(sheet, { defval: "", raw: false });

            const result = {};
            for (let row of rows) {
                const normalized = {};
                for (let key in row) normalized[key.toLowerCase().replace(/\s/g, "")] = row[key];

                const email = (normalized.email || "").toLowerCase().trim();
                const nama = (normalized.namafile || "").toUpperCase().trim();
                const pass = (normalized.password || "").toString().trim();

                if (!email || !nama || !pass) continue;
                result[email] = { namaFile: nama, password: await hashPass(pass) };
            }

            if (!Object.keys(result).length) { alert("❌ Data tidak terbaca!"); return; }

            jsonData = result;
            jsonOutput.value = JSON.stringify(result, null, 2);
            alert("✅ JSON berhasil dibuat!");
        } catch (err) {
            console.error(err);
            alert("❌ Gagal membaca Excel! Periksa file.");
        }
    };
    reader.readAsArrayBuffer(file);
}

export async function uploadJSON() {
    if (!Object.keys(jsonData).length) { alert("⚠️ Generate JSON dulu!"); return; }
    const token = tokenJson.value;
    if (!token) { alert("⚠️ Token kosong!"); return; }

    status.innerText = "⏳ Upload ke GitHub...";
    const repo = "valios-idn/slip-gaji";
    const path = "dataPegawai.json";
    const content = btoa(unescape(encodeURIComponent(JSON.stringify(jsonData, null, 2))));
    const url = `https://api.github.com/repos/${repo}/contents/${path}`;

    let sha = null;
    try {
        const get = await fetch(url, { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } });
        if (get.ok) { const data = await get.json(); sha = data.sha; }

        const res = await fetch(url, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json", Accept: "application/vnd.github+json" },
            body: JSON.stringify({ message: "update dataPegawai otomatis", content, sha })
        });

        const result = await res.json();
        if (!res.ok) alert("❌ Upload gagal: " + (result.message || ""));
        else showToast("✅ JSON berhasil diupload!");
    } catch (err) {
        console.error(err);
        alert("❌ Upload gagal!");
    }
}
