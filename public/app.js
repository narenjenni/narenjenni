/* Interaksi UI, animasi tombol, submit PPDB */
const $ = (sel) => document.querySelector(sel);

const mobileMenuBtn = $("#mobileMenuBtn");
const mobileMenu = $("#mobileMenu");
mobileMenuBtn?.addEventListener("click", () => {
  mobileMenu.classList.toggle("hidden");
});

// Dark mode toggle (opsional)
const themeToggle = $("#themeToggle");
themeToggle?.addEventListener("click", () => {
  document.documentElement.classList.toggle("dark");
  document.body.classList.toggle("bg-slate-900");
  document.body.classList.toggle("text-slate-100");
});

// CTA buttons to focus PPDB
const ppdbBtn = $("#ppdbBtn");
const ctaPPDB = $("#ctaPPDB");
ppdbBtn?.addEventListener("click", () => document.getElementById("ppdb")?.scrollIntoView({ behavior: "smooth" }));
ctaPPDB?.addEventListener("click", () => document.getElementById("ppdb")?.scrollIntoView({ behavior: "smooth" }));

// Tahun berjalan
const y = document.getElementById("y");
if (y) y.textContent = new Date().getFullYear();

// Submit PPDB
const ppdbForm = document.getElementById("ppdbForm");
const ppdbAlert = document.getElementById("ppdbAlert");

const showAlert = (msg, ok = true) => {
  ppdbAlert.classList.remove("hidden");
  ppdbAlert.classList.toggle("border-green-200", ok);
  ppdbAlert.classList.toggle("bg-green-50", ok);
  ppdbAlert.classList.toggle("text-green-700", ok);
  ppdbAlert.classList.toggle("border-red-200", !ok);
  ppdbAlert.classList.toggle("bg-red-50", !ok);
  ppdbAlert.classList.toggle("text-red-700", !ok);
  ppdbAlert.textContent = msg;
}

ppdbForm?.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(ppdbForm);
  const payload = Object.fromEntries(formData.entries());

  // Minimal client-side validation
  if (!/^\+?\d{9,15}$/.test(payload.telepon)) {
    showAlert("Nomor telepon/WA tidak valid. Gunakan format internasional, contoh: +62812xxxxxxx", false);
    return;
  }

  const btn = ppdbForm.querySelector('button[type="submit"]');
  const defaultText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "Mengirim...";

  try {
    const res = await fetch("/api/ppdb", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data?.message || "Gagal mengirim.");
    showAlert("Pendaftaran berhasil dikirim. Silakan cek email Anda untuk konfirmasi (jika ada).", true);
    ppdbForm.reset();
  } catch (err) {
    showAlert(err.message || "Terjadi kesalahan. Coba lagi.", false);
  } finally {
    btn.disabled = false;
    btn.innerHTML = defaultText;
  }
});
