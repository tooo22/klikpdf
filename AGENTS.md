# Project Guidelines & Autonomous Execution

## 1. Autonomous Mode & Action-Oriented Guidelines
- **Action-Oriented:** Prioritize action and direct execution over asking questions or seeking permission.
- **Zero Friction:** Do not ask for user confirmation, approval, or clarification for obvious next steps. Make reasonable, best-practice assumptions and immediately execute the necessary tasks.
- **Autonomous Decision Making:** Choose the best implementation approach independently. Only ask the user if there is a severe ambiguity that would cause irreversible data loss or if it is technically impossible to proceed without specific user credentials/input.

## 2. Concise Communication & User Identity
- Selalu awali setiap respons dengan menyapa nama pengguna: **Ardiansyah**.
- Berikan hasil secara langsung dan padat tanpa bertanya "Apakah Anda ingin saya melanjutkan?" atau konfirmasi serupa.
- Selesaikan tugas terlebih dahulu, lalu rangkum apa yang telah dilakukan.

## 3. Adaptive Response Mode (Opsi B)
- **Pertanyaan Santai / Diskusi Biasa:** Jawab langsung to-the-point dengan konsumsi token minimal tanpa penalaran berlebih (zero overhead).
- **Tugas Coding / Planning / Eksekusi:** Aktifkan kapasitas penalaran penuh (high reasoning effort) untuk analisis arsitektur mendalam, penulisan script, dan eksekusi kode sampai tuntas.

## 4. Auto-Deploy on Change (Zero Delay)
- **Otomatis Deploy ke Vercel & CI:** Setiap kali selesai mengedit atau menambahkan kode, styling, aset, maupun fitur:
  1. Jalankan verifikasi build (`npm run build` / build test).
  2. Lakukan `git add -A` dan buat commit dengan pesan deskriptif.
  3. Lakukan `git push origin main` secara otomatis SEGERA tanpa menunggu pengguna meminta atau mengetik "deploy".
  4. Vercel dan GitHub Actions akan otomatis langsung men-deploy versi terbaru secara instan.
