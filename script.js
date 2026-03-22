const form = document.getElementById('pdfForm');
const viewer = document.getElementById('pdfViewer');
const viewerContainer = document.getElementById('viewerContainer');
const pesan = document.getElementById('pesan');
const errorDiv = document.getElementById('error');
const downloadBtn = document.getElementById('downloadBtn');

let currentUrl = '';
let currentFileName = '';
let dataPegawai = {};

// 🔥 Load JSON pegawai
async function loadData() {
  try {
    const res = await fetch('pegawai.json');
    dataPegawai = await res.json();
  } catch (err) {
    console.error('Gagal load JSON:', err);
  }
}
loadData();

// PDF worker
pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

// SUBMIT FORM
form.addEventListener('submit', async function(e) {
  e.preventDefault();

  const tahun = document.getElementById('tahun').value;
  const bulan = document.getElementById('bulan').value;
  const nip = document.getElementById('nip').value.trim();

  errorDiv.textContent = '';
  pesan.textContent = '';
  viewerContainer.style.display = 'none';

  // 🔥 HAPUS CANVAS SAJA (biar tombol tidak hilang)
  viewer.querySelectorAll('canvas').forEach(c => c.remove());

  if (!tahun || !bulan || !nip) {
    errorDiv.textContent = 'Harap isi semua kolom!';
    return;
  }

  // cek NIP
  if (!dataPegawai[nip]) {
    errorDiv.textContent = 'Nomor pegawai tidak terdaftar!';
    return;
  }

  const namaFile = dataPegawai[nip];
  currentFileName = namaFile + '.pdf';

  // 🔥 pakai CDN (lebih stabil)
  const baseUrl = 'https://cdn.jsdelivr.net/gh/madhagaskar182/testing@main/files/';
  const url = `${baseUrl}${tahun}/${bulan}/${namaFile}.pdf`;

  pesan.textContent = 'Memuat slip gaji...';

  try {
    const check = await fetch(url, { method: 'HEAD' });
    if (!check.ok) throw new Error('File tidak ditemukan');

    currentUrl = url;

    const pdf = await pdfjsLib.getDocument(url).promise;

    // render semua halaman
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.4 });

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      viewer.appendChild(canvas);

      await page.render({
        canvasContext: ctx,
        viewport: viewport
      }).promise;
    }

    viewerContainer.style.display = 'block';
    pesan.textContent = 'Slip gaji berhasil ditampilkan';

  } catch (err) {
    errorDiv.textContent = err.message || 'Gagal memuat PDF';
    pesan.textContent = '';
  }
});

// ✅ DOWNLOAD (nama sesuai file asli)
downloadBtn.onclick = async () => {
  if (!currentUrl) return;

  try {
    const response = await fetch(currentUrl);
    const blob = await response.blob();

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');

    a.href = url;
    a.download = currentFileName; // 🔥 nama asli
    document.body.appendChild(a);
    a.click();

    a.remove();
    window.URL.revokeObjectURL(url);

  } catch (err) {
    alert('Gagal download file');
  }
};

// ✅ DEFAULT TAHUN OTOMATIS
document.addEventListener('DOMContentLoaded', () => {
  const tahunSelect = document.getElementById('tahun');
  const tahunSekarang = new Date().getFullYear().toString();

  let found = false;

  for (let opt of tahunSelect.options) {
    if (opt.value === tahunSekarang) {
      found = true;
      break;
    }
  }

  if (!found) {
    const opt = document.createElement('option');
    opt.value = tahunSekarang;
    opt.textContent = tahunSekarang;
    tahunSelect.appendChild(opt);
  }

  tahunSelect.value = tahunSekarang;
});
