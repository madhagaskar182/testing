const GITHUB_USER = "madhagaskar182";          // ← GANTI dengan username GitHub kamu
const GITHUB_REPO = "testing";      // ← GANTI nama repo
const BRANCH      = "main";                   // atau master

const BASE_URL = `https://raw.githubusercontent.com/${GITHUB_USER}/${GITHUB_REPO}/${BRANCH}/`;

document.getElementById("form").addEventListener("submit", async (e) => {
  e.preventDefault();

  const nomor = document.getElementById("nomor").value.trim();
  const bulan = document.getElementById("bulan").value;
  const tahun = document.getElementById("tahun").value;
  const status = document.getElementById("status");

  if (!nomor || !bulan || !tahun) {
    status.innerHTML = '<span class="text-red-400">Lengkapi semua kolom</span>';
    return;
  }

  const key = `${tahun}-${bulan}-${nomor}`;
  status.innerHTML = '<span class="text-gray-300">Mencari file...</span>';

  try {
    const res = await fetch("data.json");
    if (!res.ok) throw new Error("Gagal load mapping");

    const data = await res.json();
    let path = data[key] || data["default"];

    if (!path) {
      status.innerHTML = '<span class="text-red-400">File tidak ditemukan untuk data ini</span>';
      return;
    }

    const fileUrl = BASE_URL + path;

    status.innerHTML = '<span class="text-green-400">Mengarahkan ke file...</span>';

    // Redirect (PDF biasanya download langsung)
    setTimeout(() => {
      window.location.href = fileUrl;
    }, 800);

  } catch (err) {
    status.innerHTML = '<span class="text-red-400">Terjadi kesalahan saat mengambil data</span>';
    console.error(err);
  }
});
