# SukaPDF (KlikPDF)

Aplikasi web & mobile untuk manipulasi PDF: konversi, OCR, merge/split, dan editing gambar.

## Tech Stack
- **Frontend**: React 18 + Vite + TailwindCSS + Capacitor (Android/iOS)
- **Backend**: FastAPI + PyMuPDF + Tesseract OCR
- **Deploy**: Vercel (frontend), Heroku/Render (backend)

## Setup Cepat

### Backend
```bash
cd backend
pip install -r requirements.txt
python run.py
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env  # Isi VITE_GOOGLE_CLIENT_ID
npm run dev
```

### Mobile (Capacitor)
```bash
npm run android   # atau npm run ios
```

## Environment Variables
| Variable | Deskripsi |
|----------|-----------|
| `VITE_GOOGLE_CLIENT_ID` | Google OAuth Client ID |
| `CORS_ORIGINS` | Daftar origin yang diizinkan (comma-separated) |

## Scripts
| Command | Fungsi |
|---------|--------|
| `npm run dev` | Jalankan frontend dev server |
| `npm run build` | Build frontend untuk production |
| `npm run android` | Build & buka Android project |
| `npm run ios` | Build & buka iOS project |

## Testing
```bash
cd backend
pytest
```

## License
MIT

</content>