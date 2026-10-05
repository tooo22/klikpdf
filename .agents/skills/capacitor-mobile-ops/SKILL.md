---
name: capacitor-mobile-ops
description: Specialist in Capacitor Android & iOS native mobile builds, mobile UX optimizations, device permissions, splash screens, icons, and offline capabilities for KlikPDF. Use when managing Capacitor sync, mobile builds, Android Studio setup, or native mobile plugins.
---

# Capacitor Mobile Ops Specialist

Specialist guidance and workflow automation for building, testing, and shipping native Android and iOS apps for KlikPDF using Capacitor 8+.

## 1. Quick Terminal Commands

* **Build & Sync Android:**
  ```powershell
  npm run android
  ```
  *(Builds frontend dist, syncs native assets, and opens Android Studio).*
* **Build & Sync iOS:**
  ```powershell
  npm run ios
  ```
* **Sync Plugins Only:**
  ```powershell
  npm run cap:sync
  ```

## 2. Configuration & Asset Rules (`capacitor.config.json`)

* **App ID:** `com.klikpdf.app`
* **App Name:** `KlikPDF`
* **Web Dir:** `frontend/dist`
* **Status Bar & Safe Area:**
  - Status Bar style must respect dark/light mode dynamically via `@capacitor/status-bar`.
  - Android navigation bar color must harmonize with app background (#020617 / #0f172a).
  - Use `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` in Tailwind CSS to avoid camera cutouts / gesture bars.

## 3. Native Storage & Sharing

* Handle mobile file downloads using `@capacitor/app` or native Web Share API (`navigator.share`) when running in mobile webview.
* For Android 13+ (API 33+), ensure scoped storage and media permissions (`READ_MEDIA_IMAGES`) are properly declared in `android/app/src/main/AndroidManifest.xml`.
