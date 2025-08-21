# SMK Perintis 1 Depok — Website

Website sekolah modern, responsif, dan informatif. Termasuk fitur:
- Navigasi responsif dengan hamburger (mobile)
- Halaman Beranda lengkap (tentang, jurusan, berita, prestasi, fasilitas, galeri, testimoni, peta)
- Formulir Kontak (mengirim email ke **narenskii@gmail.com**)
- Halaman PPDB dengan email ke admin & konfirmasi ke pendaftar
- Animasi modern menggunakan IntersectionObserver (tanpa library)
- Siap deploy ke **Vercel** (static + serverless functions)

## Struktur
```
/api          → Serverless functions (email via Resend)
/public       → Aset statis (HTML, CSS, JS, gambar)
vercel.json   → Konfigurasi Vercel
package.json  → Dependensi (Resend)
```

## Warna Brand
Warna situs diatur lewat CSS variables pada `public/styles.css`:
```css
:root{
  --brand-primary:#0B63CE;
  --brand-accent:#FFB703;
}
```
Ubah sesuai warna pada logo **SMK Perintis 1 Depok** agar benar-benar selaras.

## Deploy ke Vercel
1. Buat project baru di Vercel dan impor repo/folder ini.
2. Tambahkan **Environment Variables**:
   - `RESEND_API_KEY` → API key dari https://resend.com (gratis tier tersedia).
   - `FROM_EMAIL` → alamat yang diverifikasi di Resend (mis: no-reply@domain-anda.com).
3. Jalankan deploy. Rute:
   - Halaman utama: `/`
   - PPDB: `/ppdb.html`
   - API: `/api/contact` dan `/api/ppdb` (method POST, JSON)
4. Uji formulir kontak & PPDB di URL deploy. Jika gagal, cek **Logs** di tab Functions.

> Jika Anda ingin menggunakan Gmail/Nodemailer, aktifkan App Password dan ganti implementasi pada `/api/*` sesuai kredensial SMTP Anda.

## Kustomisasi Konten
- Berita/Fasilitas/Galeri/Testimoni saat ini contoh statis di `public/script.js`. Anda dapat mengganti isi array `NEWS`, `ACHIEVEMENTS`, `GALLERY`, `TESTI` atau mengarahkan ke CMS nantinya.
- Gambar dapat diganti di folder `public/gallery`, `public/majors`, `public/facilities`.

## Aksesibilitas & Responsif
- Komponen tombol, input, dan navigasi memiliki target sentuh besar serta fokus yang jelas.
- Layout menggunakan grid responsif dan skala tipografi yang nyaman di HP & PC.

Selamat menggunakan! 🎉
