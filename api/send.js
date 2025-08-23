// Vercel Serverless Function
import nodemailer from "nodemailer";

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ ok: false, message: "Method not allowed" });
  const b = req.body || {};
  const reqs = ["namaLengkap","nisn","email","telepon","alamat","asalSekolah","jurusan","pesan"];
  for (const k of reqs) if (!b[k] || String(b[k]).trim()==="") return res.status(400).json({ ok:false, message:`Field "${k}" wajib diisi.` });
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST, port: Number(process.env.SMTP_PORT||465),
    secure: String(process.env.SMTP_SECURE||"true")==="true",
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
  });
  try {
    await transporter.verify();
    const toList = (process.env.PPDB_TO_EMAIL||"narenskii@gmail.com").split(",").map(s=>s.trim()).filter(Boolean);
    const html = `<div style="font-family: ui-sans-serif, system-ui;">
      <h2>Formulir PPDB Baru</h2>
      <p><b>Nama Lengkap:</b> ${b.namaLengkap}</p><p><b>NISN:</b> ${b.nisn}</p>
      <p><b>Email:</b> ${b.email}</p><p><b>Telepon/WA:</b> ${b.telepon}</p>
      <p><b>Alamat:</b> ${b.alamat}</p><p><b>Asal Sekolah:</b> ${b.asalSekolah}</p>
      <p><b>Jurusan Pilihan:</b> ${b.jurusan}</p><hr/><p><b>Pesan:</b><br/>${String(b.pesan||"").replace(/\n/g,"<br/>")}</p></div>`;
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || '"PPDB SMK Perintis 1 Depok" <no-reply@smkperintis1depok.sch.id>',
      to: toList, subject: `Pendaftaran PPDB: ${b.namaLengkap} - ${b.jurusan}`, replyTo: b.email, html
    });
    return res.status(200).json({ ok:true, message:"Pendaftaran berhasil dikirim.", id: info.messageId });
  } catch(e) { return res.status(500).json({ ok:false, message:"Gagal mengirim email." }); }
}
