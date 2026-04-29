# 📊 MakloondReport — Marketing Dashboard

Dashboard laporan harian tim marketing untuk 4 brand:
- **Zona Nyam** (TikTok & Shopee)
- **Sentral Basreng** (TikTok & Shopee)
- **Ngaciin** (TikTok & Shopee)
- **Paberik 101** (Meta)

---

## 🚀 Cara Setup GRATIS (GitHub + Vercel)

### Langkah 1 — Install Node.js
Unduh dan install dari: https://nodejs.org (pilih versi LTS)

### Langkah 2 — Buat akun GitHub
1. Daftar di https://github.com
2. Buat repository baru: klik "New" → beri nama `makloond-report` → klik "Create repository"

### Langkah 3 — Upload kode ke GitHub
Buka terminal/command prompt di folder ini, lalu jalankan:
```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/NAMAAKUN/makloond-report.git
git push -u origin main
```
Ganti `NAMAAKUN` dengan username GitHub kamu.

### Langkah 4 — Deploy GRATIS di Vercel
1. Daftar di https://vercel.com (bisa login pakai GitHub)
2. Klik "New Project"
3. Import repository `makloond-report` dari GitHub
4. **Framework Preset:** pilih `Vite`
5. Klik **Deploy** → tunggu ~2 menit

✅ Aplikasi kamu akan live di URL seperti: `https://makloond-report.vercel.app`

---

## 💻 Cara Jalankan di Lokal (untuk development)

```bash
# Masuk ke folder project
cd makloond-report

# Install dependencies
npm install

# Jalankan di browser
npm run dev
```

Buka browser ke: `http://localhost:5173`

---

## 📁 Struktur File

```
makloond-report/
├── src/
│   ├── context/
│   │   └── AppContext.jsx     ← State management & data storage
│   ├── pages/
│   │   ├── Dashboard.jsx      ← Halaman utama dengan grafik
│   │   ├── InputForm.jsx      ← Form input 6 divisi tim
│   │   └── Analysis.jsx       ← Analisis & insight otomatis
│   ├── App.jsx                ← Layout & navigasi utama
│   ├── index.jsx              ← Entry point
│   └── index.css              ← Global styles + dark mode
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## 🔒 Penting: Data Storage

Saat ini data disimpan di **localStorage browser** (gratis, tidak perlu server).
- Data per perangkat/browser
- Jika ingin data bisa diakses banyak orang sekaligus, perlu upgrade ke database seperti **Supabase** (juga ada free tier)

---

## ✨ Fitur Aplikasi

- ✅ Dashboard dengan grafik GMV, Spending Ads, Traffic, Konversi
- ✅ Form input lengkap untuk 6 divisi: KOL, Marketplace, Live, Konten, CS Marketplace, CS WA
- ✅ ROI & rata-rata belanja dihitung otomatis
- ✅ Perbandingan harian (tren hari ke hari)
- ✅ Analisis produk terlaris
- ✅ Insight otomatis (kondisi baik/kurang/saran)
- ✅ Perbandingan antar 4 brand
- ✅ Dark mode
- ✅ Filter tanggal

---

## 📞 Support

Jika ada pertanyaan setup, tanyakan ke Claude di claude.ai
