import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { RateLimiterMemory } from "rate-limiter-flexible";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security & parsers
app.use(helmet({
  contentSecurityPolicy: false
}));
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));

// Static files
app.use(express.static("public"));

// Rate limiting for /api/ppdb
const rateLimiter = new RateLimiterMemory({
  points: 5, // 5 requests
  duration: 60 // per 60 seconds per IP
});

const validatePayload = (body) => {
  const required = ["namaLengkap", "nisn", "email", "telepon", "alamat", "asalSekolah", "jurusan", "pesan"];
  for (const key of required) {
    if (!body[key] || String(body[key]).trim().length === 0) return `Field "${key}" wajib diisi.`;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(body.email)) return "Format email tidak valid.";
  const waRegex = /^\+?\d{9,15}$/;
  if (!waRegex.test(body.telepon)) return "Nomor telepon/WA tidak valid.";
  return null;
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || "true") === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

app.post("/api/ppdb", async (req, res) => {
  try {
    await rateLimiter.consume(req.ip);
  } catch (err) {
    return res.status(429).json({ ok: false, message: "Terlalu banyak percobaan, coba lagi sebentar." });
  }

  const errMsg = validatePayload(req.body || {});
  if (errMsg) return res.status(400).json({ ok: false, message: errMsg });

  const {
    namaLengkap, nisn, email, telepon, alamat, asalSekolah, jurusan, pesan
  } = req.body;

  const toList = (process.env.PPDB_TO_EMAIL || "narenskii@gmail.com").split(",").map(s => s.trim()).filter(Boolean);
  const html = `
    <div style="font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto;">
      <h2>Formulir PPDB Baru</h2>
      <p><b>Nama Lengkap:</b> ${namaLengkap}</p>
      <p><b>NISN:</b> ${nisn}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Telepon/WA:</b> ${telepon}</p>
      <p><b>Alamat:</b> ${alamat}</p>
      <p><b>Asal Sekolah:</b> ${asalSekolah}</p>
      <p><b>Jurusan Pilihan:</b> ${jurusan}</p>
      <hr/>
      <p><b>Pesan / Motivasi:</b><br/>${String(pesan).replace(/\n/g, "<br/>")}</p>
      <br>
      <small>Dikirim dari website SMK Perintis 1 Depok - ${new Date().toLocaleString()}</small>
    </div>
  `;

  try {
    await transporter.verify();
  } catch (e) {
    console.error("SMTP verify failed:", e?.message);
    return res.status(500).json({ ok: false, message: "Konfigurasi email (SMTP) belum benar. Cek file .env Anda." });
  }

  try {
    const info = await transporter.sendMail({
      from: process.env.MAIL_FROM || '"PPDB SMK Perintis 1 Depok" <no-reply@smkperintis1depok.sch.id>',
      to: toList,
      subject: `Pendaftaran PPDB: ${namaLengkap} - ${jurusan}`,
      replyTo: email,
      html
    });
    return res.json({ ok: true, message: "Pendaftaran berhasil dikirim.", id: info.messageId });
  } catch (e) {
    console.error("Send email error:", e?.message);
    return res.status(500).json({ ok: false, message: "Gagal mengirim email. Silakan coba lagi nanti." });
  }
});

app.get("/api/health", (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});
