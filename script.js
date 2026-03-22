const form = document.getElementById('pdfForm');
const viewer = document.getElementById('pdfViewer');
const viewerContainer = document.getElementById('viewerContainer');
const pesan = document.getElementById('pesan');
const errorDiv = document.getElementById('error');
const downloadBtn = document.getElementById('downloadBtn');

let currentUrl = '';
let currentFileName = '';
let dataPegawai = {};

// load JSON
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

// SUBMIT
form.addEventListener('submit', async function(e) {
  e.preventDefault();

  const tahun = document.getElementById('tahun').value;
  const bulan = document.getElementById('bulan').value;
  const nip = document.getElementById('nip').value.trim();
  const password = document.getElementById('password').value.trim();

  errorDiv.textContent = '';
  pesan.textContent = '';
  viewerContainer.style.display = 'none';
  viewer.innerHTML = '';

  if (!tahun || !bulan || !nip || !password) {
    errorDiv.textContent = 'Harap isi semua kolom!';
    return;
  }

  // 🔐 CEK LOGIN
  if (!dataPegawai[nip]) {
    errorDiv.textContent = 'NIP tidak terdaftar!';
    return;
  }

  if (dataPegawai[nip].password !== password) {
    errorDiv.textContent = 'Password salah!';
    return;
  }

  const namaFile = dataPegawai[nip].namaFile;
  currentFileName = namaFile + '.pdf';

  const baseUrl = 'https://cdn.jsdelivr.net/gh/madhagaskar182/testing@main/files/';
  const url = `${baseUrl}${tahun}/${bulan}/${namaFile}.pdf`;

  pesan.textContent = 'Memuat slip gaji...';

  try {
    currentUrl = url;

    const pdf = await pdfjsLib.getDocument(url).promise;

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 1.3 });

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
    pesan.textContent = 'Login berhasil - Slip gaji ditampilkan';

  } catch (err) {
    errorDiv.textContent = 'Gagal memuat PDF';
    pesan.textContent = '';
  }
});

// DOWNLOAD
downloadBtn.onclick = async () => {
  if (!currentUrl) return;

  const res = await fetch(currentUrl);
  const blob = await res.blob();

  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');

  a.href = url;
  a.download = currentFileName;

  document.body.appendChild(a);
  a.click();

  a.remove();
  URL.revokeObjectURL(url);
};

// default tahun
document.addEventListener('DOMContentLoaded', () => {
  const tahun = new Date().getFullYear().toString();
  const select = document.getElementById('tahun');

  if (![...select.options].some(o => o.value === tahun)) {
    const opt = document.createElement('option');
    opt.value = tahun;
    opt.textContent = tahun;
    select.appendChild(opt);
  }

  select.value = tahun;
});
