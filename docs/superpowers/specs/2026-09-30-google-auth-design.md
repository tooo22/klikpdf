# Design Document: Google Authentication & User Profile in KlikPDF

**Date:** 2026-09-30  
**Status:** Approved  
**Author:** Pair Programming Agent & User  

---

## 1. Overview
Fitur Google Authentication memungkinkan pengguna KlikPDF untuk masuk (*sign in*) menggunakan akun Google mereka secara langsung di frontend menggunakan Google Identity Services (`@react-oauth/google` / GIS) dan library `jwt-decode`. Setelah masuk, pengguna mendapatkan pengalaman yang dipersonalisasi:
- Menampilkan foto profil, nama, dan email di Navbar.
- Menyimpan dan melihat riwayat file yang telah dikonversi/diproses (*My Recent Files*).
- Menyediakan mode *Quick Demo Login* jika `VITE_GOOGLE_CLIENT_ID` belum dikonfigurasi di file `.env`.

---

## 2. Architecture & Data Flow

### 2.1 State Management (`AuthContext.jsx`)
- **Key Storage**:
  - `localStorage.getItem('klikpdf_auth_user')`: Menyimpan data sesi pengguna `{ id, name, email, picture, isDemo }`.
  - `localStorage.getItem('klikpdf_user_recent_files')`: Menyimpan riwayat aktivitas file pengguna `[{ id, name, tool, timestamp, size }]`.
- **Functions**:
  - `loginWithGoogle(credentialResponse)`: Mendekode credential JWT dari Google menggunakan `jwt-decode` dan menyimpan info profil.
  - `loginDemo()`: Menyediakan login simulasi instan untuk keperluan uji coba lokal.
  - `logout()`: Membersihkan sesi dari `localStorage` dan mereset user state ke `null`.
  - `addRecentFile(fileInfo)`: Menambahkan catatan proses file ke daftar riwayat.
  - `clearRecentFiles()`: Menghapus riwayat file.

### 2.2 Provider Hierarchy (`App.jsx`)
```jsx
<ThemeProvider>
  <LanguageProvider>
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  </LanguageProvider>
</ThemeProvider>
```
Jika `VITE_GOOGLE_CLIENT_ID` tersedia, `AuthProvider` membungkus aplikasi dengan `<GoogleOAuthProvider clientId={CLIENT_ID}>`.

---

## 3. UI Components

### 3.1 `Navbar.jsx`
- **Logged-out State**:
  - Menampilkan tombol **"Masuk" / "Sign in"** dengan ikon Google di samping tombol ganti tema/bahasa.
  - Mengklik tombol membuka `LoginModal`.
- **Logged-in State**:
  - Menampilkan avatar foto profil Google pengguna (dengan fallback inisial jika tidak ada gambar).
  - Mengklik avatar membuka dropdown profil:
    - Informasi pengguna: Foto, Nama lengkap, Email, dan badge "Akun Google" / "Demo".
    - Menu item: **"Riwayat File Saya"** (Membuka `RecentFilesModal`).
    - Menu item: **"Keluar"** (Logout).

### 3.2 `LoginModal.jsx`
- Desain modal popup yang modern, konsisten dengan tema terang & gelap (*dark/light mode*), mendukung Bahasa Indonesia & Inggris.
- Tombol resmi **Google Sign In** via `@react-oauth/google`.
- Tombol **Demo Login** sebagai fallback ramah developer.
- Menjelaskan manfaat login: Simpan riwayat file dan kemudahan akses.

### 3.3 `RecentFilesModal.jsx`
- Modal untuk melihat daftar riwayat proses file PDF.
- Menampilkan nama file, tanggal/waktu, jenis operasi (misal: *Gabung PDF*, *Kompres PDF*, dll.), dan tombol hapus riwayat.

---

## 4. Error Handling & Edge Cases
- **No Google Client ID configured**: UI menampilkan tombol Google Sign-In dinonaktifkan dengan panduan singkat, serta menyediakan tombol Demo Login agar developer/tester tetap bisa mencoba fungsionalitas UI secara penuh.
- **JWT Decode Error / Token Expired**: Ditangkap secara aman (*try/catch*), dengan feedback notifikasi dan fallback state bersih.
- **Offline / Network issue**: Notifikasi toast/pesan kesalahan yang ramah pengguna.

---

## 5. Security & Privacy Considerations
- Token JWT didekode di sisi klien hanya untuk mengambil informasi profil publik (nama, email, avatar).
- Tidak ada password atau data sensitif yang disimpan di browser.
- File PDF yang diproses tetap diproses secara aman sesuai privasi yang ada.
