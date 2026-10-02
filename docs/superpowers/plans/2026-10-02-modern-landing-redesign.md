# Modern Landing Page & Bento UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the landing page, top navigation, and footer of KlikPDF to match the provided modern, high-conversion visual design standard with rich aesthetics, Plus Jakarta Sans typography, split hero dropzone, bento suite grid, live preview comparison slider, and full dark/light theme support.

**Architecture:** Extend the Tailwind theme tokens with the new Rose/Crimson palette (`#e11d48`) and dark surfaces. Update `index.html` with Plus Jakarta Sans and Material Symbols. Revamp `Navbar.jsx` and `Footer.jsx` with modern glassmorphism and 5-column structure. Rebuild `HomePage.jsx` into modular, highly aesthetic sections (Split Hero + Interactive Action Dropzone, Bento Grid, Compression Slider, 3-Step Flow, CTA Banner, and Expandable 24+ Tools Catalog) while preserving all existing tool execution hooks, Google Auth, and chatbot.

**Tech Stack:** React 18, Vite, Tailwind CSS 3, Lucide React, Google Material Symbols Outlined, Plus Jakarta Sans.

## Global Constraints
- Primary color: `#e11d48` (`primary`), hover `#be123c` (`primary-container`).
- Typography: `Plus Jakarta Sans` as global font family.
- Dark mode: full class-based support (`darkMode: 'class'`) for every section with seamless contrast.
- Zero feature regression: Google Auth, Recent Files Modal, Chatbot, and routing to `ToolWorkspace` must remain 100% functional.

---

### Task 1: Design System, Typography, and Tailwind Config Setup

**Files:**
- Modify: `frontend/index.html`
- Modify: `frontend/tailwind.config.js`

**Interfaces:**
- Consumes: Google Fonts (`Plus Jakarta Sans` & `Material Symbols Outlined`).
- Produces: Tailwind utility classes (`bg-primary`, `text-primary`, `bg-surface`, `bg-surface-canvas`, `font-sans`, etc.).

- [ ] **Step 1: Update `frontend/index.html` with Plus Jakarta Sans and Material Symbols**

Add Google Fonts links for `Plus Jakarta Sans` (400, 500, 600, 700, 800) and `Material Symbols Outlined` in `<head>`.

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet">
```

- [ ] **Step 2: Update `frontend/tailwind.config.js` with new tokens & font family**

Extend Tailwind color palette with `primary`, `surface`, `surface-canvas`, `surface-subtle`, `surface-card`, `surface-container-low`, `text-primary`, `text-muted`, `border-subtle`, `border-strong`, `success`, and set `fontFamily.sans` to `['"Plus Jakarta Sans"', 'sans-serif']`.

- [ ] **Step 3: Verify Vite build succeeds**

Run: `npm run build` in `frontend/`
Expected: Build passes with 0 errors.

- [ ] **Step 4: Commit**

```bash
git add frontend/index.html frontend/tailwind.config.js
git commit -m "style: configure Plus Jakarta Sans and modern design tokens in tailwind"
```

---

### Task 2: Modern Glassmorphic Header & Navbar Redesign

**Files:**
- Modify: `frontend/src/components/Navbar.jsx`

**Interfaces:**
- Consumes: `useLanguage()`, `useTheme()`, `useAuth()`, `onSelectTool`, `onGoHome`.
- Produces: Fixed top bar with glassmorphic blur, search trigger, quick tool links, dark mode toggle, language switcher, and Google Auth login/avatar dropdown.

- [ ] **Step 1: Refactor `Navbar.jsx` layout and styles**

1. Set container to `fixed top-0 left-0 right-0 z-50 bg-white/85 dark:bg-[#0f1117]/85 backdrop-blur-xl border-b border-border-subtle/70 dark:border-slate-800`.
2. Update brand logo styling with modern typography and click-to-home handler.
3. Center navigation links: `Semua Alat` (scrolls to `#semua-alat`), `Gabungkan PDF` (`onSelectTool('merge')`), `Pisahkan PDF` (`onSelectTool('split')`), `Kompres PDF` (`onSelectTool('compress')`), `Konversi PDF` (with hover dropdown).
4. Right action controls:
   - Search button.
   - Theme toggle button (Sun/Moon icon for Dark/Light mode).
   - Language selector pill (`ID` / `EN`).
   - Auth button: Google Login button or authenticated user avatar menu with `Riwayat File Saya` and `Keluar`.

- [ ] **Step 2: Test Navbar responsiveness & interactions**

Verify in browser or test that:
- Logo clicks navigate home.
- Nav buttons trigger tool selection.
- Dark mode toggle switches between light and dark backgrounds.
- Login button opens `LoginModal`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Navbar.jsx
git commit -m "feat: modernize navbar with glassmorphic header, search, and theme switcher"
```

---

### Task 3: Rich 5-Column Footer Redesign

**Files:**
- Modify: `frontend/src/components/Footer.jsx`

**Interfaces:**
- Consumes: None (receives theme from parent).
- Produces: 5-column footer with brand info, 256-bit SSL badge, 2-hour auto-delete badge, tool categories, legal links, and copyright.

- [ ] **Step 1: Refactor `Footer.jsx`**

Implement 5 columns:
1. Brand description with KlikPDF logo, 256-bit SSL badge, and 2-Hour Auto Delete badge.
2. Konversi PDF quick links.
3. Organisasi quick links.
4. Keamanan & Bantuan links.
5. Bottom row: Copyright notice (`© 2026 KlikPDF`), server status, author credit (`@toooowys`).
Ensure dark mode styling (`dark:bg-[#0d0f15] dark:border-slate-800`).

- [ ] **Step 2: Verify Vite build**

Run: `npm run build` in `frontend/`
Expected: Build passes.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/Footer.jsx
git commit -m "feat: redesign footer into rich 5-column layout with security badges"
```

---

### Task 4: Split Hero & Interactive Dropzone on HomePage

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx`

**Interfaces:**
- Consumes: `onSelectTool(toolId, files)`, `useLanguage()`.
- Produces: Split Hero with copy, real-time live visitors/users stats, Quick Action pills (`Gabung PDF`, `Kompres PDF`, `PDF ke Word`), and responsive drag & drop upload box.

- [ ] **Step 1: Implement Left Column of Hero**

1. Trust badge: "100% Gratis & Tanpa Batas Harian", "Bebas Watermark", plus real-time online active users count.
2. Gradient main headline: "Olah Dokumen PDF Lebih Cepat & Praktis".
3. Subtitle copywriting.
4. Quick CTA buttons: "Unggah Dokumen Sekarang" (scrolls to dropzone) & "Jelajahi 24+ Alat" (scrolls to bento/catalog).
5. Social proof rating: 4.9 / 5.0 with total visitor count.

- [ ] **Step 2: Implement Right Column (Interactive Dropzone Box)**

1. Quick Action Mode selector pills: `Gabung PDF` (`'merge'`), `Kompres PDF` (`'compress'`), `PDF ke Word` (`'pdf-to-word'`).
2. Reactive state for currently selected quick action (updates heading text and icon).
3. Dropzone drag-and-drop area with file input:
   - Handle dragover, dragleave, drop events.
   - When files are dropped or selected, immediately route: `onSelectTool(currentAction, files)`.
   - Fallback: If dropped file is Word/Image and action is different, open smart quick action modal.
4. Cloud import buttons (Drive, Dropbox) and 256-bit SSL encryption badge.
5. Full dark mode support (`dark:bg-[#18181B] dark:border-slate-700`).

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/HomePage.jsx
git commit -m "feat: implement split hero section with interactive quick action dropzone"
```

---

### Task 5: Bento Productivity Grid & Interactive Compression Slider

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx`

**Interfaces:**
- Consumes: `onSelectTool(toolId)`.
- Produces: 9-card Bento Productivity Suite and an interactive before/after compression slider.

- [ ] **Step 1: Implement Bento Productivity Suite Grid**

1. Card 1 (7 columns): "Kompres PDF Pintar" with mini interactive size reduction bar (15.0 MB -> 1.8 MB, 82% savings, < 3s indicator). Click routes to `onSelectTool('compress')`.
2. Card 2 (5 columns): "Gabungkan PDF" with stacked preview cards. Click routes to `onSelectTool('merge')`.
3. Micro-cards:
   - PDF ke Word (4 cols) -> `onSelectTool('pdf-to-word')`
   - Pisahkan PDF (4 cols) -> `onSelectTool('split')`
   - Tanda Tangan PDF (4 cols) -> `onSelectTool('sign')`
   - Kunci Dokumen (3 cols) -> `onSelectTool('protect')`
   - PDF ke Excel (3 cols) -> `onSelectTool('pdf-to-excel')`
   - Putar Halaman (3 cols) -> `onSelectTool('rotate')`
   - Watermark PDF (3 cols) -> `onSelectTool('watermark')`

- [ ] **Step 2: Implement Live Comparison Slider Section**

1. Title and metadata badges: Sebelum (15.0 MB), Penghematan (-88%), Sesudah (1.8 MB).
2. Canvas container with Before layer (original document rendering) and After layer (clipped to `sliderValue%`).
3. Center slider handle with drag icon and synchronized `<input type="range" min="0" max="100" value={sliderValue} />`.
4. Dark and light mode styling.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/pages/HomePage.jsx
git commit -m "feat: add bento productivity grid and interactive compression slider"
```

---

### Task 6: 3-Step Flow, CTA Banner, and Expandable 24+ Tools Catalog

**Files:**
- Modify: `frontend/src/pages/HomePage.jsx`

**Interfaces:**
- Consumes: `TOOLS` from `toolsConfig.js`, `ToolCard` component.
- Produces: 3-step guide, high-conversion bottom banner, and expandable full tool catalog with category filter pills and FAQ.

- [ ] **Step 1: Implement 3-Step Flow Section**

3 cards with oversized 01, 02, 03 numbers:
1. "01 Pilih / Tarik File"
2. "02 Proses Otomatis"
3. "03 Unduh Dokumen"

- [ ] **Step 2: Implement High-Conversion CTA Banner**

Full-width rounded card (`bg-[#0B1329] text-white`) with rose ambient glow, "Olah Dokumen Anda Sekarang dengan KlikPDF" heading, and "Mulai Sekarang Gratis" rocket launch button that smoothly scrolls to the hero dropzone.

- [ ] **Step 3: Implement Expandable 24+ Tools Catalog & FAQ**

1. "Lihat Semua 24+ Alat KlikPDF" button in Bento grid toggles `showAllTools` and smooth-scrolls to `#semua-alat`.
2. When expanded (or by default visible below), displays category pills (Semua, Populer, Atur PDF, Konversi, Keamanan) and rendered `ToolCard` items.
3. FAQ accordion section retained with modern card styling.

- [ ] **Step 4: Commit**

```bash
git add frontend/src/pages/HomePage.jsx
git commit -m "feat: add 3-step flow, cta banner, and full tools catalog toggle"
```

---

### Task 7: Final Verification & Responsive Testing

**Files:**
- Review: `frontend/src/App.jsx`
- Review: `frontend/src/pages/HomePage.jsx`
- Review: `frontend/src/components/Navbar.jsx`
- Review: `frontend/src/components/Footer.jsx`

- [ ] **Step 1: Run production build**

Run: `npm run build` in `frontend/`
Expected: Output files generated in `frontend/dist/` without errors or warnings.

- [ ] **Step 2: Test local dev server and browser interaction**

Verify:
- Navbar glassmorphism and links work properly.
- Dark mode toggle switches smoothly across all sections.
- Quick action tabs in hero dropzone update prompt and handle file uploads correctly.
- Bento cards and all tool cards click through to their respective tool workspace.
- Before/After compression slider moves smoothly.
- Mobile layout is responsive without horizontal scrollbars.

- [ ] **Step 3: Commit and summarize**

```bash
git commit -am "chore: finalize modern landing page redesign verification"
```
