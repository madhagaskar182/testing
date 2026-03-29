// LOGIN
const loginPanel = document.getElementById('loginPanel');
const adminPanel = document.getElementById('adminPanel');
const loginBtn = document.getElementById('loginBtn');
const loginError = document.getElementById('loginError');

loginBtn.addEventListener('click',()=>{
  const u=document.getElementById('username').value;
  const p=document.getElementById('password').value;
  if(u==='admin'&&p==='admin123'){
    loginPanel.classList.add('hidden');
    adminPanel.classList.remove('hidden');
    populateYearsMonths();
    document.getElementById('githubToken').value='GITHUB_TOKEN_DEFAULT';
  } else { loginError.classList.remove('hidden'); }
});

document.getElementById('logoutBtn').addEventListener('click',()=>{
  adminPanel.classList.add('hidden');
  loginPanel.classList.remove('hidden');
});

// MENU SWITCH
document.querySelectorAll('.menuBtn').forEach(btn=>{
  btn.addEventListener('click',()=>{
    document.querySelectorAll('.menuContent').forEach(m=>m.classList.add('hidden'));
    document.getElementById(btn.dataset.menu).classList.remove('hidden');
  });
});

// YEARS & MONTHS
function populateYearsMonths(){
  const yearSelects=[document.getElementById('selectYear'),document.getElementById('pdfYear')];
  const monthSelects=[document.getElementById('selectMonth'),document.getElementById('pdfMonth')];
  const currentYear=new Date().getFullYear();
  yearSelects.forEach(sel=>{sel.innerHTML='';for(let y=currentYear;y>=2000;y--) sel.innerHTML+=`<option value="${y}">${y}</option>`;});
  monthSelects.forEach(sel=>{sel.innerHTML='';for(let m=1;m<=12;m++) sel.innerHTML+=`<option value="${m}">${m}</option>`;});
}

// TOAST
function showToast(msg){
  const t=document.getElementById('toast');
  t.textContent=msg; t.classList.add('show');
  setTimeout(()=>t.classList.remove('show'),3000);
}

// DASHBOARD FILE LIST
document.getElementById('loadFiles').addEventListener('click', async()=>{
  const year=document.getElementById('selectYear').value;
  const month=document.getElementById('selectMonth').value;
  const token=document.getElementById('githubToken').value;
  const fileList=document.getElementById('fileList');
  fileList.innerHTML='Loading...';
  const repo='username/repo';
  const path=`${year}/${month}`;
  const res=await fetch(`https://api.github.com/repos/${repo}/contents/${path}`,{headers:{'Authorization':`token ${token}`}});
  const data=await res.json();
  if(Array.isArray(data)){ fileList.innerHTML=''; data.forEach(f=>{fileList.innerHTML+=`<li>${f.name}</li>`;}); }
  else fileList.innerHTML='Tidak ada file.';
});

// DRAG & DROP EXCEL
let uploadedFiles=[];
const dropZoneExcel=document.getElementById('dropZoneExcel');
const excelInput=document.getElementById('excelInput');
dropZoneExcel.addEventListener('click',()=>excelInput.click());
dropZoneExcel.addEventListener('dragover',e=>{e.preventDefault();dropZoneExcel.classList.add('drag-over');});
dropZoneExcel.addEventListener('dragleave',()=>dropZoneExcel.classList.remove('drag-over'));
dropZoneExcel.addEventListener('drop',e=>{e.preventDefault();dropZoneExcel.classList.remove('drag-over');handleExcelFiles(e.dataTransfer.files);});
excelInput.addEventListener('change',e=>handleExcelFiles(e.target.files));

function handleExcelFiles(files){
  uploadedFiles=Array.from(files);
  const filesDiv=document.getElementById('uploadedFiles'); filesDiv.innerHTML='';
  uploadedFiles.forEach((f,idx)=>{
    const div=document.createElement('div');
    div.className='flex justify-between items-center bg-gray-200 p-2 rounded mb-2';
    div.innerHTML=`${f.name} <button onclick="removeFile(${idx})" class="text-red-600 font-bold">×</button>`;
    filesDiv.appendChild(div);
  });
}
window.removeFile=function(idx){uploadedFiles.splice(idx,1);document.getElementById('uploadedFiles').children[idx].remove();}

// GENERATE JSON & PREVIEW
document.getElementById('generateJsonBtn').addEventListener('click',async()=>{
  const json=[];
  for(const f of uploadedFiles){
    const data=await f.arrayBuffer();
    const workbook=XLSX.read(data,{type:'array'});
    const sheetName=workbook.SheetNames[0];
    const sheet=XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);
    sheet.forEach(row=>{ row.password=CryptoJS.SHA256('default123').toString(); json.push(row); });
  }
  document.getElementById('jsonPreview').textContent=JSON.stringify(json,null,2);
  showToast('JSON berhasil digenerate');
});

// UPLOAD JSON
document.getElementById('uploadJsonBtn').addEventListener('click',async()=>{
  const token=document.getElementById('githubToken').value;
  const repo='username/repo';
  const content=document.getElementById('jsonPreview').textContent;
  await githubUploadFile(token,repo,'dataPegawai.json',content,'Update dataPegawai.json');
  showToast('JSON berhasil diupload ke GitHub');
});

// DRAG & DROP PDF
let pdfFiles=[];
const dropZonePdf=document.getElementById('dropZonePdf');
const pdfInput=document.getElementById('pdfInput');
dropZonePdf.addEventListener('click',()=>pdfInput.click());
dropZonePdf.addEventListener('dragover',e=>{e.preventDefault();dropZonePdf.classList.add('drag-over');});
dropZonePdf.addEventListener('dragleave',()=>dropZonePdf.classList.remove('drag-over'));
dropZonePdf.addEventListener('drop',e=>{e.preventDefault();dropZonePdf.classList.remove('drag-over');handlePdfFiles(e.dataTransfer.files);});
pdfInput.addEventListener('change',e=>handlePdfFiles(e.target.files));

function handlePdfFiles(files){
  pdfFiles=Array.from(files);
  const filesDiv=document.getElementById('pdfFilesList'); filesDiv.innerHTML='';
  pdfFiles.forEach(f=>{
    const div=document.createElement('div');
    div.className='flex justify-between items-center bg-gray-200 p-2 rounded mb-2';
    div.innerHTML=`${f.name} <button onclick="removePdfFile('${f.name}')" class="text-red-600 font-bold">×</button>`;
    filesDiv.appendChild(div);
  });
}
window.removePdfFile=function(name){pdfFiles=pdfFiles.filter(f=>f.name!==name);Array.from(document.getElementById('pdfFilesList').children).forEach(d=>{if(d.textContent.includes(name))d.remove();});}

// UPLOAD PDF WITH PROGRESS
document.getElementById('uploadPdfBtn').addEventListener('click',async()=>{
  const token=document.getElementById('githubToken').value;
  const repo='username/repo';
  const year=document.getElementById('pdfYear').value;
  const month=document.getElementById('pdfMonth').value;
  const progressBar=document.getElementById('pdfProgress');
  const loadingDiv=document.getElementById('pdfLoading');
  loadingDiv.classList.remove('hidden');
  for(let i=0;i<pdfFiles.length;i++){
    const f=pdfFiles[i];
    const content=await f.arrayBuffer();
    await githubUploadFile(token,repo,`${year}/${month}/${f.name}`,btoa(String.fromCharCode(...new Uint8Array(content))),`Upload ${f.name}`);
    progressBar.style.width=`${Math.round(((i+1)/pdfFiles.length)*100)}%`;
    progressBar.textContent=`${Math.round(((i+1)/pdfFiles.length)*100)}%`;
  }
  setTimeout(()=>loadingDiv.classList.add('hidden'),500);
  showToast('Semua PDF berhasil diupload!');
});