const form = document.getElementById('pdfForm');
const pesan = document.getElementById('pesan');
const errorDiv = document.getElementById('error');
const viewerContainer = document.getElementById('viewerContainer');
const canvas = document.getElementById('pdfCanvas');
const ctx = canvas.getContext('2d');

pdfjsLib.GlobalWorkerOptions.workerSrc =
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

form.addEventListener('submit', async function(e) {
  e.preventDefault();

  const tahun = document.getElementById('tahun').value;
  const bulan = document.getElementById('bulan').value;
  const nama = document.getElementById('nama').value
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, '');

  errorDiv.textContent = '';
  pesan.textContent = '';
  viewerContainer.style.display = 'none';

  if (!tahun || !bulan || !nama) {
    errorDiv.textContent = 'Harap isi semua kolom!';
    return;
  }

  const baseUrl = 'https://raw.githubusercontent.com/madhagaskar182/testing/main/files/';
  const filePath = `${tahun}/${bulan}/${nama}.pdf`;
  const fullUrl = baseUrl + filePath;

  pesan.textContent = 'Memuat PDF...';

  try {
    // cek file dulu
    const response = await fetch(fullUrl, { method: 'HEAD' });
    if (!response.ok) {
      throw new Error('File tidak ditemukan');
    }

    // load PDF
    const loadingTask = pdfjsLib.getDocument(fullUrl);
    const pdf = await loadingTask.promise;

    // ambil halaman pertama
    const page = await pdf.getPage(1);

    const viewport = page.getViewport({ scale: 1.5 });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };

    await page.render(renderContext).promise;

    viewerContainer.style.display = 'block';
    pesan.textContent = 'PDF berhasil ditampilkan';

  } catch (err) {
    errorDiv.textContent = err.message || 'Gagal memuat PDF';
    pesan.textContent = '';
  }
});
