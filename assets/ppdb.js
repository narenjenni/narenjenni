const ppdbForm = document.getElementById("ppdbForm");

if (ppdbForm) {
  ppdbForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const formData = new FormData(ppdbForm);

    const data = {
      nama: formData.get("nama"),
      email: formData.get("email"),
      telepon: formData.get("telepon"),
      jurusan: formData.get("jurusan"),
      alamat: formData.get("alamat")
    };

    // 📌 Sama seperti contact form, gunakan EmailJS / Backend
    document.getElementById("ppdbMessage").innerText =
      "Pendaftaran berhasil! Data Anda sudah kami terima.";

    ppdbForm.reset();
  });
}