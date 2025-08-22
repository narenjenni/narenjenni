import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { nama, email, telepon, jurusan, alamat, pesan } = req.body;

  try {
    // Transporter email (gunakan akun Gmail)
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER, // set di Vercel Environment Variable
        pass: process.env.EMAIL_PASS  // App Password Gmail
      }
    });

    // Konten email
    let mailOptions = {
      from: `"Website SMK Perintis 1 Depok" <${process.env.EMAIL_USER}>`,
      to: "narenskii@gmail.com", // email tujuan
      subject: "Pesan Baru dari Website SMK Perintis 1 Depok",
      html: `
        <h2>Pesan Baru dari Website</h2>
        <p><b>Nama:</b> ${nama || "-"} </p>
        <p><b>Email:</b> ${email || "-"} </p>
        <p><b>No Telepon:</b> ${telepon || "-"} </p>
        <p><b>Jurusan:</b> ${jurusan || "-"} </p>
        <p><b>Alamat:</b> ${alamat || "-"} </p>
        <p><b>Pesan:</b> ${pesan || "-"} </p>
      `
    };

    await transporter.sendMail(mailOptions);

    res.status(200).json({ message: "Email berhasil dikirim" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Gagal mengirim email" });
  }
}