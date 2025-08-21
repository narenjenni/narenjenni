// /api/ppdb.js — Kirim data PPDB via Resend (ke admin & ke pendaftar)
import { Resend } from 'resend';

export default async function handler(req, res){
  if(req.method !== 'POST'){
    return res.status(405).json({ ok:false, error:'Method not allowed' });
  }
  const data = req.body || {};
  const required = ['nama','nik','tempat_lahir','tanggal_lahir','jenis_kelamin','asal_sekolah','jurusan','email','hp','alamat'];
  for(const k of required){
    if(!data[k]) return res.status(400).json({ ok:false, error:`Field ${k} wajib diisi` });
  }
  try{
    const resend = new Resend(process.env.'re_AEp1AVvw_FsxdK6pLYks564cSg7GKv2bw');
    const from = process.env.FROM_EMAIL || 'noreply@yourdomain.com';

    // Email ke admin
    const adminHtml = `
      <h2>Pendaftaran PPDB Baru</h2>
      <table cellpadding="6" cellspacing="0" border="0">
        ${Object.entries(data).map(([k,v])=>`<tr><td><strong>${k}</strong></td><td>${String(v).replace(/\n/g,'<br/>')}</td></tr>`).join('')}
      </table>
    `;
    await resend.emails.send({
      from, to: 'narenskii@gmail.com', subject: `[PPDB] Pendaftaran Baru — ${data.nama}`, html: adminHtml
    });

    // Email konfirmasi ke pendaftar
    const userHtml = `
      <h2>Terima kasih, ${data.nama}!</h2>
      <p>Pendaftaran PPDB Anda telah kami terima. Berikut ringkasan data:</p>
      <table cellpadding="6" cellspacing="0" border="0">
        ${Object.entries(data).map(([k,v])=>`<tr><td><strong>${k}</strong></td><td>${String(v).replace(/\n/g,'<br/>')}</td></tr>`).join('')}
      </table>
      <p>Kami akan menghubungi Anda melalui email/WhatsApp untuk tahap berikutnya.</p>
      <p>Salam hangat,<br/>SMK Perintis 1 Depok</p>
    `;
    await resend.emails.send({
      from, to: data.email, subject: 'Konfirmasi Pendaftaran PPDB — SMK Perintis 1 Depok', html: userHtml
    });

    return res.status(200).json({ ok:true });
  }catch(err){
    console.error(err);
    return res.status(500).json({ ok:false, error:'Gagal mengirim email' });
  }
}
