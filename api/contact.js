// /api/contact.js — Kirim pesan kontak via Resend
import { Resend } from 'resend';

export default async function handler(req, res){
  if(req.method !== 'POST'){
    return res.status(405).json({ ok:false, error: 'Method not allowed' });
  }
  const { name, email, subject, message } = req.body || {};
  if(!name || !email || !subject || !message){
    return res.status(400).json({ ok:false, error:'Data tidak lengkap' });
  }
  try{
    const resend = new Resend('re_M6uYBAZU_7Bjg7AmxJjc6na7opBW5pHK8');
    const to = 'narenskii@gmail.com';
    const html = `
      <h2>Pesan Kontak Website</h2>
      <p><strong>Nama:</strong> ${name}</p>
      <p><strong>Email:</strong> ${email}</p>
      <p><strong>Subjek:</strong> ${subject}</p>
      <p><strong>Pesan:</strong></p>
      <p>${message.replace(/\n/g,'<br/>')}</p>
    `;
    const from = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
    await resend.emails.send({ from, to, subject: `[Kontak Website] ${subject}`, html });
    return res.status(200).json({ ok:true });
  }catch(err){
    console.error(err);
    return res.status(500).json({ ok:false, error: 'Gagal mengirim email' });
  }
}

