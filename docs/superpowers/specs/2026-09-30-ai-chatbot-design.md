# Design Document: Interactive AI Chatbot Widget in KlikPDF

**Date:** 2026-09-30  
**Status:** Approved  
**Author:** Pair Programming Agent & User  

---

## 1. Overview
Fitur AI Chatbot interaktif menyediakan asisten pintar di pojok kanan bawah website KlikPDF yang dapat membantu pengunjung memahami dan memilih fitur PDF yang tepat, menjawab pertanyaan terkait penggunaan, keamanan data, tips konversi, serta menyediakan tautan langsung 1-klik menuju alat PDF terkait.

---

## 2. Architecture & Data Flow

### 2.1 Chatbot Engine (`chatbotEngine.js`)
- **Knowledge Base**:
  - Seluruh informasi tentang alat-alat di KlikPDF (Merge, Split, Compress, Word/Excel/PowerPoint to PDF, PDF to Word/Excel/PowerPoint/Image, OCR, Rotate, Watermark, Page Number, Unlock, Protect, HD Image, dll.).
  - FAQ tentang keamanan, privasi data, batas ukuran file, dan cara penggunaan.
  - Dukungan dwibahasa: Bahasa Indonesia (`id`) & Bahasa Inggris (`en`).
- **Intent Matching**:
  - Algoritma pencocokan kata kunci dan intent cerdas (misal: "gabung", "kecilkan ukuran", "ubah ke word", "foto pecah", "password", dll.).
  - Mengembalikan teks jawaban ramah pengguna dan opsi `toolLink` (toolId dan label tombol) jika relevan.
- **Session Persistence**:
  - Riwayat chat disimpan di `localStorage.getItem('klikpdf_chat_history')` sehingga pengguna tidak kehilangan percakapan saat berpindah halaman.

### 2.2 UI Component (`ChatbotWidget.jsx`)
- **Floating Action Button**:
  - Posisi: `fixed bottom-6 right-6 z-40`.
  - Animasi hover & pulse dot indikator online.
  - Sapaan tooltip kecil "Ada yang bisa dibantu? Tanya AI" jika chat belum dibuka.
- **Chat Window Panel**:
  - Tampilan card responsif dengan tema Glassmorphism (dark & light mode support).
  - Header dengan avatar bot, status "Aktif Sekarang", tombol hapus riwayat, dan tombol minimize/close.
  - Area pesan dengan auto-scroll ke bawah saat pesan baru tiba.
  - Typing indicator animasi saat AI merespons (delay 300-600ms untuk efek natural).
  - Suggestion chips untuk pertanyaan populer yang sering ditanyakan.
  - Kotak input dengan tombol kirim dan dukungan tombol Enter.

---

## 3. Integration Point (`App.jsx`)
- `ChatbotWidget` dipasang di level root `App.jsx` dengan prop `onSelectTool={handleSelectTool}` sehingga ketika user mengklik tombol tautan alat di dalam chat, halaman langsung diarahkan ke workspace alat tersebut secara mulus.
