// Vercel Serverless Function (Node 18+)
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" });
  const body = req.body || {};
  const required = ["namaLengkap", "nisn", "email", "telepon", "alamat", "asalSekolah", "jurusan", "pesan"];
  for (const key of required) {
    if (!body[key] || String(body[key]).trim().length === 0) return res.status(400).json({ ok: false, message: `Field "${key}" wajib diisi.` });
  }

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 465),
    secure: String(process.env.SMTP_SECURE || "true") === "true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });

  try {
    await transporter.verify();
    const toList = (process.env.PPDB_TO_EMAIL || "narenskii@gmail.com").split(",").map(s => s.trim()).filter(Boolean);
    const html = `
      <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto;">
        <h2>Formulir PPDB Baru</h2>
        <p><b>Nama Lengkap:</b> ${body.namaLengkap}</p>
        <p><b>NISN:</b> ${body.nisn}</p>
        <p><b>Email:</b> ${body.email}</p>
        <p><b>Telepon/WA:</b> ${body.telepon}</p>
        <p><b>Alamat:</b> ${body.alamat}</p>
        <p><b>Asal Sekolah:</b> ${body.asalSekolah}</p>
        <p><b>Jurusan Pilihan:</b> ${body.jurusan}</p>
        <hr/>
        <p><b>Pesan / Motivasi:</b><br/>${String(body.pesan).replace(/\n/g, "<br/>")}</p>
      </div>`;

    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || '"PPDB SMK Perintis 1 Depok" <no-reply@smkperintis1depok.sch.id>',
      to: toList,
      subject: `Pendaftaran PPDB: ${body.namaLengkap} - ${body.jurusan}`,
      replyTo: body.email,
      html
    });
    return res.status(200).json({ ok: true, message: "Pendaftaran berhasil dikirim.", id: info.messageId });
  } catch (e) {
    console.error("Send error:", e?.message);
    return res.status(500).json({ ok: false, message: "Gagal mengirim email." });
  }
}
