# Profil Akun Antigravity CLI (agy-1 & agy-2)

Perintah terminal PowerShell untuk multi-akun Google Antigravity:

1. **`agy-1`**:
   - Menjalankan Antigravity CLI (`agy`) otomatis beralih ke **Akun Pro 1** (`3t.ardiansyah@gmail.com`).
   - Menyimpan kredensial mandiri di `~/.gemini/profiles/pro1/`.

2. **`agy-2`**:
   - Menjalankan Antigravity CLI (`agy`) otomatis beralih ke **Akun Pro 2**.
   - Menyimpan kredensial mandiri di `~/.gemini/profiles/pro2/`.

3. **Perintah Pendukung**:
   - `agy-status`: Melihat profil dan email akun Google yang sedang aktif.
   - `agy-save 1` / `agy-save 2`: Menyimpan akun yang sedang login ke slot profil 1 atau 2.
   - `agy-switch 1` / `agy-switch 2`: Beralih profil tanpa langsung meluncurkan CLI.
   - `agy-logout`: Menghapus sesi aktif sementara untuk login ke akun baru.
