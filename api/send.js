import nodemailer from "nodemailer";
export default async function handler(req,res){
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if(req.method==="OPTIONS") return res.status(200).end();
  if(req.method!=="POST") return res.status(405).json({ok:false,message:"Method not allowed"});
  try{
    const {nama,email,jurusan,pesan,telp}=req.body||{};
    if(!nama||!email||!jurusan) return res.status(400).json({ok:false,message:"Nama, Email, dan Jurusan wajib diisi."});
    const host=process.env.SMTP_HOST||"smtp.gmail.com";
    const port=Number(process.env.SMTP_PORT||465);
    const secure=process.env.SMTP_SECURE?process.env.SMTP_SECURE==="true":true;
    const user=process.env.EMAIL_USER;
    const pass=process.env.EMAIL_PASS;
    const to=process.env.TO_EMAIL||"narenskii@gmail.com";
    if(!user||!pass) return res.status(500).json({ok:false,message:"Konfigurasi email belum lengkap (EMAIL_USER/EMAIL_PASS)."});
    const transporter=nodemailer.createTransport({host,port,secure,auth:{user,pass}});
    await transporter.sendMail({
      from:`"PPDB Website" <${user}>`, to, replyTo: email,
      subject:`PPDB: ${nama} mendaftar (${jurusan})`,
      html:`<h2>Form PPDB Baru</h2>
      <p><b>Nama:</b> ${nama}</p><p><b>Email:</b> ${email}</p><p><b>Telp/WA:</b> ${telp||"-"}</p>
      <p><b>Jurusan:</b> ${jurusan}</p><p><b>Pesan:</b><br>${(pesan||"").replace(/\n/g,"<br>")}</p>
      <hr><p>Pesan ini dikirim otomatis dari website SMK Perintis 1 Depok.</p>`,
      text:`Nama: ${nama}\nEmail: ${email}\nTelp/WA: ${telp||"-"}\nJurusan: ${jurusan}\nPesan:\n${pesan||""}`
    });
    return res.status(200).json({ok:true,message:"Terima kasih! Data PPDB berhasil terkirim."});
  }catch(err){
    console.error("Email error:",err);
    return res.status(500).json({ok:false,message:"Maaf, pengiriman email gagal. Coba beberapa saat lagi."});
  }
}