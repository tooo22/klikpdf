# Desain Spesifikasi: Optimalisasi Antarmuka Mobile (HP) & Logo Google Search (Favicon Branding)

**Tanggal:** 2026-10-03  
**Proyek:** KlikPDF (Frontend Web Application)  
**Status:** Disetujui (Approved)  

---

## 1. Latar Belakang & Tujuan
1. **Logo Google Search (Favicon & Branding):**
   * Pada hasil pencarian Google (`klikpdf.my.id`), cuplikan situs masih menampilkan ikon default bola dunia abu-abu (`🌐`) karena tidak adanya berkas `favicon.ico` dan berkas ikon PNG kelipatan 48px persegi (`favicon-48x48.png`, `favicon-96x96.png`, `favicon-192x192.png`), serta belum lengkapnya tag `<link rel="icon">` dan `site.webmanifest` yang dipersyaratkan oleh Google Search Central.
   * Tujuan: Menyediakan paket aset favicon standar Google & browser lengkap, serta memperbarui metadata `index.html` dan Schema.org JSON-LD agar Googlebot segera menampilkan logo resmi KlikPDF pada hasil pencarian.

2. **Optimalisasi Tampilan Mobile (Smartphone):**
   * Antarmuka di layar HP (`< 768px`) mengalami kepadatan elemen (header berdesakan antara logo, admin, search, theme, language, dan CTA), ketiadaan menu navigasi mobile (drawer/hamburger), serta dua tombol floating di pojok bawah (Admin & Chatbot AI) yang saling bersaing dan berpotensi menutupi konten.
   * Jendela obrolan AI Chatbot saat dibuka memiliki lebar tetap (`360px` + margin) yang meluber ke luar layar pada ponsel berlayar 360–375px.
   * Halaman kerja (*Tool Workspace*) menempatkan tombol proses di bagian paling bawah setelah pratinjau dokumen, sehingga pengguna HP harus menggulir jauh.
   * Tujuan: Menerapkan antarmuka bergaya *Modern Native-App* yang responsif, rapi, bebas overflow horizontal, serta ramah penggunaan satu tangan (*thumb-friendly*).

---

## 2. Rincian Desain Arsitektur & Komponen

### A. Paket Aset Favicon & Metadata Google Search
1. **Aset Gambar di `frontend/public/`:**
   * `favicon.ico`: Berkas multi-resolusi (16x16, 32x32, 48x48) untuk fallback browser & crawler legacy.
   * `favicon-48x48.png`: Ukuran minimal standar Google Search Result snippet.
   * `favicon-96x96.png`: Ikon resolusi medium untuk layar retina/desktop browser tab.
   * `favicon-192x192.png` & `favicon-512x512.png`: Ikon high-resolution untuk Android Chrome & PWA.
   * `apple-touch-icon.png`: Ikon 180x180 untuk Apple iOS/iPadOS home screen bookmark.
   * `site.webmanifest`: Konfigurasi PWA standar yang mendaftarkan ikon, nama aplikasi, dan warna tema (`#E5322D`).
   * `favicon.svg`: Vektor SVG resolusi tajam dengan background merah khas KlikPDF, dokumen putih, dan aksen layer.
2. **Metadata `<head>` di `frontend/index.html`:**
   * Deklarasi relasi ikon yang lengkap:
     ```html
     <link rel="icon" type="image/x-icon" href="/favicon.ico" />
     <link rel="icon" type="image/png" sizes="48x48" href="/favicon-48x48.png" />
     <link rel="icon" type="image/png" sizes="96x96" href="/favicon-96x96.png" />
     <link rel="icon" type="image/png" sizes="192x192" href="/favicon-192x192.png" />
     <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
     <link rel="manifest" href="/site.webmanifest" />
     ```
   * Pembaruan JSON-LD Schema `Organization` logo URL ke `https://klikpdf.my.id/favicon-192x192.png`.

---

### B. Header & Navigasi Mobile (Navbar + Mobile Drawer)
1. **Navbar Responsif:**
   * Di layar desktop (`lg:`): Tetap mempertahankan tautan navigasi horizontal lengkap dan dropdown mega-menu.
   * Di layar mobile (`< lg`):
     * **Kiri:** Tombol Logo KlikPDF yang ringkas dan proporsional. Tombol teks "Admin" di pojok kiri atas desktop disembunyikan di HP dan dipindahkan ke dalam Drawer.
     * **Kanan:** Tombol Cari (`search`), Tombol Ganti Tema (`dark_mode`), dan Tombol **Hamburger Menu** (`Menu` / `X`).
2. **Mobile Drawer Component (`Navbar.jsx`):**
   * Panel samping geser (*slide-over*) dari sisi kanan dengan backdrop gelap semi-transparan (`bg-black/60 backdrop-blur-sm`).
   * Bagian dalam Drawer:
     * Header drawer dengan Logo & tombol Tutup.
     * Status Akun / Tombol Masuk atau Profil Pengguna jika sudah login.
     * Tombol Akses Cepat Admin (dengan badge keamanan).
     * Pengalih Bahasa (ID / EN) yang jelas.
     * Kategori Alat: Pintasan langsung ke *Gabungkan PDF*, *Pisahkan PDF*, *Kompres PDF*, *Word ke PDF*, *PDF ke Word*, *HD-kan Foto*, dan tombol *Semua Alat*.
   * Mengklik salah satu alat akan otomatis menutup drawer dan membuka alat yang dipilih.

---

### C. Penataan Tombol Melayang (Floating Actions)
1. **Tombol Floating Admin:**
   * Diubah menjadi `hidden md:flex fixed bottom-6 left-6`: disembunyikan pada layar HP agar tidak menumpuk dengan antarmuka konten dan chatbot.
   * Pengguna HP tetap dapat mengakses Admin melalui Mobile Drawer atau tombol "Akses Admin" di footer.
2. **Tombol & Dialog AI Chatbot (`ChatbotWidget.jsx`):**
   * Tombol pemicu diposisikan di `bottom-4 right-4` pada mobile (`bottom-6 right-6` pada desktop).
   * Dialog obrolan AI saat dibuka di HP menggunakan lebar adaptif `w-[calc(100vw-2rem)]` (maksimal 410px), tinggi `h-[calc(100dvh-5.5rem)]` dengan border-radius rapi, sehingga tidak pernah meluber atau terpotong ke kiri layar ponsel.

---

### D. Penyesuaian Halaman Utama (HomePage) & Touch Ergonomics
1. **Hero & Dropzone:**
   * Ukuran padding luar dan dalam disesuaikan untuk HP (`p-4 sm:p-7`).
   * Dropzone sentuh memiliki ukuran tombol CTA yang nyaman ditekan ibu jari (*thumb-friendly target* minimal 44px tinggi).
   * Tagline teks dan badge status menggunakan ukuran tipografi yang responsif (*fluid typography*).
2. **Bento Grid & Alat Populer:**
   * Bento card otomatis diatur menjadi 1 kolom di HP dengan padding proporsional (`p-5`).
   * Slider sebelum/sesudah kompresi mendukung event `onTouchStart`, `onTouchMove`, dan `onTouchEnd` untuk penggeseran mulus di layar sentuh HP.
3. **Katalog 24+ Alat:**
   * Tab filter kategori (Semua, Populer, Konversi, Organisasi, Keamanan) dapat digeser horizontal dengan jari (*touch swipeable*) dengan `overflow-x-auto no-scrollbar`.
   * Grid kartu alat diatur 1 kolom di HP kecil (<640px) dan 2 kolom di tablet kecil.

---

### E. Tool Workspace (Halaman Pengerjaan Dokumen di HP)
1. **Top Bar & Pratinjau File:**
   * Tombol kembali ke Beranda ringkas dan mudah ditekan.
   * Pratinjau berkas yang diunggah menyesuaikan tata letak grid 2-kolom di HP.
2. **Sticky Bottom Action Bar / Akses Cepat Proses:**
   * Di HP, sidebar opsi dan tombol "Proses Sekarang" berada di posisi yang mudah dijangkau tanpa harus scroll berlebihan, atau mengambang di bagian bawah dengan `sticky bottom-0`.
3. **Halaman Hasil Unduh (`ResultDownload.jsx`):**
   * Tombol "Unduh Berkas Sekarang" tampil *full-width* dengan ukuran teks yang proporsional di layar ponsel.

---

## 3. Rencana Pengujian & Kriteria Keberhasilan
1. **Verifikasi Aset Favicon:**
   * Semua berkas (`favicon.ico`, `favicon-48x48.png`, `favicon-96x96.png`, `favicon-192x192.png`, `apple-touch-icon.png`, `site.webmanifest`) dapat diakses langsung via URL (HTTP 200).
   * Tag `<link>` di `index.html` valid dan mengarah ke berkas yang sesuai.
2. **Verifikasi Responsif Mobile:**
   * Diuji pada viewport ponsel (lebar 360px, 375px, 390px, 412px):
     * Tidak ada overflow horizontal (`window.innerWidth === document.documentElement.clientWidth`).
     * Header rapi, logo tidak terpotong, tombol hamburger berfungsi mulus.
     * Mobile drawer membuka dan menutup dengan animasi mulus dan dapat memilih alat.
     * Pop-up Chatbot AI pas di dalam layar HP tanpa terpotong ke kiri.
     * Tool Workspace nyaman digunakan dan tombol unduh berfungsi dengan baik.
3. **Build Valid:**
   * `npm run build` di direktori `frontend` berhasil tanpa error.
