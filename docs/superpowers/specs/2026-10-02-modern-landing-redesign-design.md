# Design Specification: Modern Landing Page & Bento UI Redesign for KlikPDF

## 1. Overview & Goals
Redesign the core landing page, top navigation, and footer of KlikPDF (SukaPDF) to match a modern, high-conversion visual design standard with rich aesthetics, Plus Jakarta Sans typography, and full dark/light theme support.

### Key Objectives
- Modernize the overall look & feel with a Rose/Crimson primary accent (`#e11d48`), smooth gradients, glassmorphism headers, and sleek card layouts.
- Implement a Split Hero Section with high-trust copywriting, real-time social stats, and a high-utility interactive Dropzone with quick action tabs (Gabung PDF, Kompres PDF, PDF ke Word).
- Implement a Bento Productivity Suite grid highlighting primary tools with custom infographics (size reduction comparison bar, document card stack, micro-cards).
- Implement an interactive Before vs. After Live Preview Comparison Slider demonstrating lossless PDF compression quality.
- Provide a clear 3-Step Flow guide, high-conversion bottom CTA banner, and a comprehensive 5-column footer.
- Maintain full compatibility with all 24+ existing tools, React contexts (Theme, Language, Auth), Google Login, Recent Files Modal, and floating AI Chatbot.

---

## 2. Design System & Theme Configuration

### 2.1 Typography & Icons
- **Primary Font**: `Plus Jakarta Sans` imported via Google Fonts in `frontend/index.html` (weights 400, 500, 600, 700, 800).
- **Icons**:
  - Google `Material Symbols Outlined` via Google Fonts CDN for specialized mockup icons.
  - `lucide-react` for system icons, auth indicators, and tool workspaces.

### 2.2 Color Tokens (`frontend/tailwind.config.js`)
- `primary`: `#e11d48`
- `primary-container`: `#be123c`
- `surface`: `#f8f9ff` (Light) / `#0f1117` (Dark)
- `surface-canvas`: `#f8fafc` (Light) / `#141720` (Dark)
- `surface-card`: `#ffffff` (Light) / `#1a1d26` (Dark)
- `surface-subtle`: `#f1f5f9` (Light) / `#222634` (Dark)
- `surface-container-low`: `#eff4ff` (Light) / `#12151f` (Dark)
- `text-primary`: `#0b1329` (Light) / `#f1f5f9` (Dark)
- `text-muted`: `#64748b` (Light) / `#94a3b8` (Dark)
- `border-subtle`: `#e2e8f0` (Light) / `#2e3446` (Dark)
- `border-strong`: `#cbd5e1` (Light) / `#3b4259` (Dark)
- `success`: `#10b981`
- `warning`: `#f59e0b`

---

## 3. Component Architecture & Specifications

### 3.1 Header / Navbar (`frontend/src/components/Navbar.jsx`)
- **Container**: `fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-[#0f1117]/80 backdrop-blur-xl border-b border-border-subtle/70 dark:border-slate-800`.
- **Branding**: KlikPDF logo with interactive hover animation.
- **Center Navigation**:
  - Direct quick navigation: `Semua Alat` (scrolls to tools catalog), `Gabungkan PDF`, `Pisahkan PDF`, `Kompres PDF`, `Konversi` (triggers existing mega dropdown menu).
- **Right Action Items**:
  - Search icon trigger.
  - **Dark/Light Mode Switcher**: Moon/Sun toggle invoking `useTheme()`.
  - **Language Selector**: ID/EN pill button invoking `useLanguage()`.
  - **Auth Controls**:
    - Unauthenticated: "Masuk" / "Mulai Gratis" button opening `LoginModal`.
    - Authenticated: Google user avatar, name, and dropdown menu with "Riwayat File Saya" and "Keluar".

### 3.2 Split Hero & Compact Interactive Dropzone (`frontend/src/pages/HomePage.jsx`)
- **Left Column**:
  - Trust Badge: 100% Gratis & Tanpa Batas Harian, Bebas Watermark, and real-time active users counter.
  - Heading: "Olah Dokumen PDF Lebih Cepat & Praktis" with gradient text.
  - Subtitle describing file joining, compression, and conversion.
  - CTA Buttons: "Unggah Dokumen Sekarang" (smooth scrolls to dropzone) & "Jelajahi 24+ Alat" (smooth scrolls to bento/catalog).
  - Social Proof Rating: 4.9/5.0 stars with total visitor counter.
- **Right Column (Interactive Dropzone Box)**:
  - **Quick Action Selector**: 3 pill buttons (`Gabung PDF`, `Kompres PDF`, `PDF ke Word`) with active indicator.
  - Selecting an action updates the central icon, title, and descriptive subtitle.
  - **Dropzone Area**:
    - Supports drag-and-drop with drag-over visual feedback (`ring-4 ring-rose-500/20`).
    - Hidden file input triggered by clicking "Pilih Dokumen PDF" or the zone.
    - When file(s) are uploaded:
      - Directly launches the selected action tool with `onSelectTool(selectedAction, files)`.
      - Fallback: Opens smart contextual picker if arbitrary unsupported formats are uploaded.
  - **Cloud Import Triggers**: Drive and Dropbox buttons.
  - **Security Guarantee**: SSL 256-bit encryption badge.

### 3.3 Bento Productivity Suite Grid
- Grid of 9 highlighted tools:
  1. **Kompres PDF Pintar** (7 columns): Size comparison infographic (15.0 MB -> 1.8 MB, 82% savings, < 3s indicator).
  2. **Gabungkan PDF** (5 columns): Stacked multi-page preview visual.
  3. **PDF ke Word** (4 columns): DOCX high precision conversion badge.
  4. **Pisahkan PDF** (4 columns): Selective page split badge.
  5. **Tanda Tangan PDF** (4 columns): Legal e-Sign badge.
  6. **Kunci Dokumen** (3 columns): 128-bit encryption badge.
  7. **PDF ke Excel** (3 columns): Instant table extraction badge.
  8. **Putar Halaman** (3 columns): Orientation badge.
  9. **Watermark PDF** (3 columns): Copyright protection badge.
- **All Tools Catalog Toggle**:
  - Button "Lihat Semua 24+ Alat KlikPDF" smoothly toggles/scrolls to the full 24+ tools grid with category filter pills (Semua, Populer, Atur PDF, Konversi, Keamanan).

### 3.4 Live Preview Comparison Slider
- Section titled "Kecilkan Ukuran Dokumen, Pertahankan Kualitas Asli".
- Top stats summary: Sebelum (15.0 MB), Penghematan (-88%), Sesudah (1.8 MB).
- Document canvas with Before layer (original document rendering) and After layer (clipped to `sliderValue%`).
- Draggable center slider handle and synchronized range input slider.
- High contrast, dark and light mode responsive.

### 3.5 3-Step Flow Section
- 3 cards with oversized indices (01, 02, 03):
  1. Pilih / Tarik File
  2. Proses Otomatis
  3. Unduh Dokumen

### 3.6 High-Conversion CTA Banner
- Full-width rounded dark card (`bg-[#0B1329] dark:bg-[#070b18]`) with radial rose glow.
- Headline: "Olah Dokumen Anda Sekarang dengan KlikPDF".
- Primary button: "Mulai Sekarang Gratis" with rocket launch icon.

### 3.7 Comprehensive 5-Column Footer (`frontend/src/components/Footer.jsx`)
- Column 1: Brand Info, logo, SSL 256-bit and 2-Hour Auto Delete badges.
- Column 2: Konversi PDF links.
- Column 3: Organisasi PDF links.
- Column 4: Keamanan & Bantuan links.
- Column 5 & Bottom Bar: Copyright notice, server status indicator, author credit.

---

## 4. State Management & Data Flow
- `activeHeroAction`: String state (`'merge'` | `'compress'` | `'pdf-to-word'`), determines dropzone prompt and default routing.
- `sliderValue`: Number state (0 to 100), controls the visual width of the after-compression document preview.
- `showAllTools`: Boolean state, controls the expansion of the complete 24+ tools catalog.
- Theme switching is reactive through `useTheme()` and adds `.dark` class to `document.documentElement`.
- Google Auth integration connects to `useAuth()` to trigger `setIsLoginModalOpen(true)` or toggle profile popover.

---

## 5. Verification & Testing Strategy
- Verify Vite dev server build without syntax or linter errors.
- Test responsive layout across desktop (1280px+), tablet (768px), and mobile (375px).
- Verify dark mode toggle correctly styles all sections (Navbar, Hero, Dropzone, Bento Grid, Slider, Footer).
- Verify file drop and file select routes properly to `onSelectTool` with passed files.
- Verify interactive slider dragging and percentage clipping work smoothly.
- Verify complete 24+ tools section expands and filters operate correctly.
