// =========================
// Mobile Menu
// =========================
const toggleBtn = document.querySelector(".mobile-menu-toggle");
const navLinks = document.querySelector(".nav-links");

if (toggleBtn) {
  toggleBtn.addEventListener("click", () => {
    navLinks.classList.toggle("show");
  });
}

// =========================
// Counter Animation
// =========================
const counters = document.querySelectorAll(".counter");

counters.forEach(counter => {
  const updateCount = () => {
    const target = +counter.getAttribute("data-target");
    const current = +counter.innerText;
    const increment = Math.ceil(target / 200);

    if (current < target) {
      counter.innerText = current + increment;
      setTimeout(updateCount, 20);
    } else {
      counter.innerText = target;
    }
  };

  updateCount();
});

// =========================
// Contact Form (EmailJS)
// =========================
if (contactForm) {
  contactForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(contactForm);

    const data = {
      nama: formData.get("nama"),
      email: formData.get("email"),
      pesan: formData.get("pesan")
    };

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data)
      });

      const result = await res.json();
      document.getElementById("contactMessage").innerText = result.message;
      
    // 📌 Gunakan EmailJS atau backend API (Node.js / PHP)
    // Agar bisa kirim email ke narenskii@gmail.com
    // Berikut contoh dummy pakai alert:
    document.getElementById("contactMessage").innerText = 
      "Terima kasih, pesan Anda sudah terkirim!";

    contactForm.reset();
  });
}