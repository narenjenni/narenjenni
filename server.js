import express from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import { RateLimiterMemory } from "rate-limiter-flexible";
import multer from "multer";
import dayjs from "dayjs";
import fs from "fs";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({ contentSecurityPolicy: false }));
app.use(cors({ origin: true }));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use("/uploads", express.static("uploads"));

const rateLimiter = new RateLimiterMemory({ points: 5, duration: 60 });

const validatePayload = (body) => {
  const reqs = ["namaLengkap","nisn","email","telepon","alamat","asalSekolah","jurusan","pesan"];
  for (const k of reqs) if (!body[k] || String(body[k]).trim()==="") return `Field "${k}" wajib diisi.`;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.email)) return "Format email tidak valid.";
  if (!/^\+?\d{9,15}$/.test(body.telepon)) return "Nomor telepon/WA tidak valid.";
  return null;
};

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 465),
  secure: String(process.env.SMTP_SECURE || "true")==="true",
  auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
});

const DATA_FILE = "data/pendaftar.json";
const loadPendaftar = () => { try { return JSON.parse(fs.readFileSync(DATA_FILE,"utf-8")); } catch { return []; } };
const savePendaftar = (list) => fs.writeFileSync(DATA_FILE, JSON.stringify(list,null,2));

async function pushToSheets(payload){
  const url = process.env.SHEETS_WEBHOOK_URL;
  if (!url) return;
  try {
    await fetch(url, { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(payload) });
  } catch(e){ console.error("Sheets webhook error:", e?.message); }
}

app.post("/api/ppdb", async (req,res)=>{
  try{ await rateLimiter.consume(req.ip); }catch{ return res.status(429).json({ok:false,message:"Terlalu banyak percobaan"}) }
  const err = validatePayload(req.body||{});
  if (err) return res.status(400).json({ok:false,message:err});
  const { namaLengkap, nisn, email, telepon, alamat, asalSekolah, jurusan, pesan } = req.body;
  try { await transporter.verify(); } catch(e){ return res.status(500).json({ok:false, message:"Konfigurasi email (SMTP) belum benar."}); }
  try{
    const item = { id: Date.now().toString(36), waktu: dayjs().toISOString(), namaLengkap, nisn, email, telepon, alamat, asalSekolah, jurusan };
    const list = loadPendaftar(); list.push(item); savePendaftar(list); await pushToSheets({source:"ppdb", ...item});
    const html = `<div style="font-family: ui-sans-serif, system-ui;">
      <h2>Formulir PPDB Baru</h2>
      <p><b>Nama Lengkap:</b> ${namaLengkap}</p>
      <p><b>NISN:</b> ${nisn}</p>
      <p><b>Email:</b> ${email}</p>
      <p><b>Telepon/WA:</b> ${telepon}</p>
      <p><b>Alamat:</b> ${alamat}</p>
      <p><b>Asal Sekolah:</b> ${asalSekolah}</p>
      <p><b>Jurusan Pilihan:</b> ${jurusan}</p>
      <hr/><p><b>Pesan:</b><br/>${String(pesan||"").replace(/\n/g,"<br/>")}</p></div>`;
    const toList = (process.env.PPDB_TO_EMAIL||"narenskii@gmail.com").split(",").map(s=>s.trim()).filter(Boolean);
    const info = await transporter.sendMail({ from: process.env.MAIL_FROM || '"PPDB SMK Perintis 1 Depok" <no-reply@smkperintis1depok.sch.id>', to: toList, subject:`Pendaftaran PPDB: ${namaLengkap} - ${jurusan}`, replyTo: email, html });
    res.json({ ok:true, message:"Pendaftaran berhasil dikirim.", id: info.messageId });
  }catch(e){ res.status(500).json({ok:false, message:"Gagal mengirim email."}); }
});

// Upload
const storage = multer.diskStorage({
  destination: (req,file,cb)=>cb(null,"uploads"),
  filename: (req,file,cb)=>{ const ext = (file.originalname.split(".").pop()||"").toLowerCase(); cb(null, Date.now()+"-"+Math.round(Math.random()*1e9)+"."+ext); }
});
const upload = multer({
  storage, limits:{ fileSize: 5*1024*1024 },
  fileFilter: (req,file,cb)=>{
    const ok = ["application/pdf","image/jpeg","image/png"].includes(file.mimetype);
    cb(ok?null:new Error("Format berkas harus PDF/JPG/PNG"), ok);
  }
});

app.post("/api/ppdb-with-files", upload.array("berkas",3), async (req,res)=>{
  try{ await rateLimiter.consume(req.ip); }catch{ return res.status(429).json({ok:false,message:"Terlalu banyak percobaan"}) }
  const err = validatePayload(req.body||{});
  if (err) return res.status(400).json({ok:false,message:err});
  const b = req.body;
  const files = (req.files||[]).map(f=>({ path:f.path, filename:f.originalname, contentType:f.mimetype }));
  try{ await transporter.verify(); }catch(e){ return res.status(500).json({ok:false,message:"Konfigurasi email (SMTP) belum benar."}); }
  try{
    const item = { id: Date.now().toString(36), waktu: dayjs().toISOString(), ...b, files: files.map(f=>f.path) };
    const list = loadPendaftar(); list.push(item); savePendaftar(list); await pushToSheets({source:"ppdb_files", ...item});
    const toList = (process.env.PPDB_TO_EMAIL||"narenskii@gmail.com").split(",").map(s=>s.trim()).filter(Boolean);
    const html = `<div style="font-family: ui-sans-serif, system-ui;"><h2>Formulir PPDB Baru (dengan berkas)</h2>
      <p><b>Nama Lengkap:</b> ${b.namaLengkap}</p><p><b>NISN:</b> ${b.nisn}</p><p><b>Email:</b> ${b.email}</p>
      <p><b>Telepon/WA:</b> ${b.telepon}</p><p><b>Alamat:</b> ${b.alamat}</p><p><b>Asal Sekolah:</b> ${b.asalSekolah}</p>
      <p><b>Jurusan Pilihan:</b> ${b.jurusan}</p><hr/><p><b>Pesan:</b><br/>${String(b.pesan||"").replace(/\n/g,"<br/>")}</p></div>`;
    const info = await transporter.sendMail({ from: process.env.MAIL_FROM || '"PPDB SMK Perintis 1 Depok" <no-reply@smkperintis1depok.sch.id>', to: toList, subject:`Pendaftaran PPDB: ${b.namaLengkap} - ${b.jurusan}`, replyTo: b.email, html, attachments: files.map(f=>({ path:f.path, filename:f.filename, contentType:f.contentType })) });
    res.json({ ok:true, message:"Pendaftaran + berkas terkirim.", id: info.messageId });
  }catch(e){ res.status(500).json({ok:false, message:"Gagal mengirim email."}); }
});

// Admin endpoints (list & export)
function checkAdmin(req){ const key = req.headers["x-admin-key"] || req.query.key; return key && key===(process.env.ADMIN_KEY||"ubah-key-ini"); }
app.get("/api/admin/list",(req,res)=>{ if(!checkAdmin(req)) return res.status(401).json({ok:false,message:"Unauthorized"}); res.json({ok:true, data: loadPendaftar()}); });
app.get("/api/admin/export",(req,res)=>{
  if(!checkAdmin(req)) return res.status(401).json({ok:false,message:"Unauthorized"});
  const list = loadPendaftar();
  const header = Object.keys(list[0]||{ id:"", waktu:"", namaLengkap:"", nisn:"", email:"", telepon:"", alamat:"", asalSekolah:"", jurusan:"" });
  const rows = [header.join(",")].concat(list.map(o=>header.map(k=>JSON.stringify(o[k]||"")).join(",")));
  const csv = rows.join("\n");
  res.setHeader("Content-Type","text/csv"); res.setHeader("Content-Disposition","attachment; filename=pendaftar.csv"); res.send(csv);
});

app.get("/api/health",(req,res)=>res.json({ok:true,time:new Date().toISOString()}));

app.listen(PORT, ()=>console.log("Server http://localhost:"+PORT));
