import { login, checkSession, logout, resetIdleTimer } from './login.js';

window.addEventListener("DOMContentLoaded", () => {
    checkSession();

    // Event login / logout
    document.getElementById("loginBtn").addEventListener("click", login);
    document.getElementById("logoutBtn").addEventListener("click", () => logout(false));

    // Idle reset
    ["mousemove","keydown","click","scroll"].forEach(evt =>
        document.addEventListener(evt, resetIdleTimer)
    );

    // Sidebar navigation
    document.getElementById("menuDashboard").addEventListener("click", () => showPage("dashboard"));
    document.getElementById("menuJSON").addEventListener("click", () => showPage("json"));
    document.getElementById("menuUpload").addEventListener("click", () => showPage("upload"));

    // Tombol JSON / PDF bisa ditambahkan di sini
});

let currentPage = "dashboard";
function showPage(page) {
    const pages = ["dashboardPage","jsonPage","uploadPage"];
    pages.forEach(p => document.getElementById(p).classList.add("hidden"));
    if(page==="dashboard") document.getElementById("dashboardPage").classList.remove("hidden");
    if(page==="json") document.getElementById("jsonPage").classList.remove("hidden");
    if(page==="upload") document.getElementById("uploadPage").classList.remove("hidden");
    currentPage = page;
}

export function showToast(message,type="success") {
    const toast = document.getElementById("toast");
    toast.textContent = message;
    toast.className = "toast show";
    if(type==="error") toast.classList.add("error");
    setTimeout(()=>toast.classList.remove("show"),3000);
}
