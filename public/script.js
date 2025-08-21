// SMK Perintis 1 Depok — Interactions & data

// Mobile nav toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');
if (navToggle && navMenu){
  navToggle.addEventListener('click', () => {
    const open = navMenu.classList.toggle('show');
    navToggle.setAttribute('aria-expanded', String(open));
  });
}

// Year
document.getElementById('year') && (document.getElementById('year').textContent = new Date().getFullYear());

// AOS (Intersection Observer)
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(e=>{
    if(e.isIntersecting){
      e.target.classList.add('aos-animate');
      observer.unobserve(e.target);
    }
  })
},{threshold:.14});
document.querySelectorAll('.aos').forEach(el=>observer.observe(el));

// Fake data for news, achievements, gallery, testimonials (can be swapped to CMS later)
const NEWS = [
  { title: 'Pelatihan Digital Marketing untuk Siswa BDP', date: '2025-06-12', excerpt: 'Kolaborasi dengan mitra industri menghadirkan pembicara profesional.', link: '#' },
  { title: 'Juara 1 Lomba Akuntansi Kota Depok', date: '2025-05-28', excerpt: 'Siswa A&KL menorehkan prestasi gemilang pada ajang tingkat kota.', link: '#' },
  { title: 'Kunjungan Industri ke Perusahaan Teknologi', date: '2025-04-20', excerpt: 'Siswa OTKP mempelajari otomasi perkantoran modern.', link: '#' },
  { title: 'Seminar Karier & Kewirausahaan', date: '2025-03-18', excerpt: 'Membangun mindset wirausaha untuk generasi muda.', link: '#' },
  { title: 'Workshop Perpajakan Dasar', date: '2025-02-10', excerpt: 'Pengenalan e-filing dan perhitungan pajak sederhana.', link: '#' },
  { title: 'MoU dengan Dunia Usaha & Industri', date: '2025-01-22', excerpt: 'Perluasan jejaring untuk penempatan magang dan rekrutmen.', link: '#' }
];

const ACHIEVEMENTS = [
  { year: '2025', title: 'Juara 1 Lomba Akuntansi Kota Depok', detail: 'Kategori Laporan Keuangan.' },
  { year: '2024', title: 'Top 5 Inovasi Pemasaran Digital', detail: 'Kompetisi tingkat provinsi.' },
  { year: '2023', title: 'Juara 2 Lomba Administrasi Perkantoran', detail: 'Bidang kearsipan digital.' },
  { year: '2022', title: 'Lolos LKS Tingkat Kota', detail: 'Bidang Pemasaran.' }
];

const GALLERY = Array.from({length: 10}).map((_,i)=>({src:`/gallery/${(i%6)+1}.jpg`, alt:`Dokumentasi ${i+1}`}));

const TESTI = [
  { name:'Orang Tua Siswa', text:'Sekolahnya bagus, guru-gurunya perhatian dan fasilitasnya lengkap.' },
  { name:'Alumni 2024', text:'Lulus langsung kerja berkat bimbingan praktik dan jaringan DUDI.' },
  { name:'Mitra Industri', text:'Lulusan siap kerja dan cepat beradaptasi di tempat kami.' }
];

// Render News with progressive loading
const newsList = document.getElementById('newsList');
const loadMore = document.getElementById('loadMoreNews');
let newsIndex = 0;
const NEWS_CHUNK = 3;
function renderNews(){
  const chunk = NEWS.slice(newsIndex, newsIndex+NEWS_CHUNK);
  chunk.forEach(n=>{
    const el = document.createElement('article');
    el.className = 'card';
    el.innerHTML = `<h3>${n.title}</h3>
      <p class="muted">${new Date(n.date).toLocaleDateString('id-ID',{year:'numeric',month:'long',day:'numeric'})}</p>
      <p>${n.excerpt}</p>
      <a href="${n.link}" class="btn btn--sm btn--ghost">Baca selengkapnya</a>`;
    newsList && newsList.appendChild(el);
  });
  newsIndex += chunk.length;
  if(newsIndex >= NEWS.length && loadMore){ loadMore.style.display = 'none'; }
}
if(newsList){ renderNews(); }
loadMore && loadMore.addEventListener('click', e=>{ e.preventDefault(); renderNews(); });

// Render Achievements Timeline
const timeline = document.getElementById('achievementsTimeline');
if(timeline){
  ACHIEVEMENTS.forEach(a=>{
    const item = document.createElement('div');
    item.className = 'timeline-item card';
    item.innerHTML = `<h4>${a.title}</h4><p class="muted">${a.year}</p><p>${a.detail}</p>`;
    timeline.appendChild(item);
  });
}

// Render Gallery
const gallery = document.getElementById('galleryGrid');
if(gallery){
  GALLERY.forEach(g=>{
    const item = document.createElement('figure');
    item.className = 'masonry-item';
    item.innerHTML = `<img src="${g.src}" alt="${g.alt}"/>`;
    gallery.appendChild(item);
  });
}

// Simple testimonial slider
const slider = document.getElementById('testiSlider');
if(slider){
  TESTI.forEach((t, idx)=>{
    const slide = document.createElement('div');
    slide.className = 'slide' + (idx===0?' active':'');
    slide.innerHTML = `<div class="card"><p>"${t.text}"</p><p class="muted" style="margin-top:.5rem">— ${t.name}</p></div>`;
    slider.appendChild(slide);
  });
  let i = 0;
  setInterval(()=>{
    const slides = Array.from(document.querySelectorAll('#testiSlider .slide'));
    slides[i].classList.remove('active');
    i = (i+1)%slides.length;
    slides[i].classList.add('active');
  }, 4200);
}

// Contact form submit -> /api/contact (Vercel Function)
async function postJSON(url, data){
  const res = await fetch(url,{
    method:'POST',
    headers:{'Content-Type':'application/json'},
    body: JSON.stringify(data)
  });
  return res.json();
}

const contactForm = document.getElementById('contactForm');
if(contactForm){
  contactForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const form = new FormData(contactForm);
    const payload = Object.fromEntries(form.entries());
    const status = document.getElementById('contactStatus');
    status.textContent = 'Mengirim...';
    try{
      const json = await postJSON('/api/contact', payload);
      status.textContent = json.ok ? 'Terkirim! Terima kasih.' : ('Gagal: ' + (json.error || 'Terjadi kesalahan'));
      contactForm.reset();
    }catch(err){
      status.textContent = 'Gagal mengirim. Coba lagi nanti.';
    }
  });
}

// PPDB form -> /api/ppdb
const ppdbForm = document.getElementById('ppdbForm');
if(ppdbForm){
  ppdbForm.addEventListener('submit', async (e)=>{
    e.preventDefault();
    const form = new FormData(ppdbForm);
    const payload = Object.fromEntries(form.entries());
    const status = document.getElementById('ppdbStatus');
    status.textContent = 'Mengirim...';
    try{
      const json = await postJSON('/api/ppdb', payload);
      status.textContent = json.ok ? 'Pendaftaran berhasil terkirim! Cek email Anda.' : ('Gagal: ' + (json.error || 'Terjadi kesalahan'));
      if(json.ok) ppdbForm.reset();
    }catch(err){
      status.textContent = 'Gagal mengirim. Coba lagi nanti.';
    }
  });
}
