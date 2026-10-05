---
name: i18n-auto-sync
description: Specialist in Internationalization (i18n), localization, translation synchronization between id.json and en.json, and scanning hardcoded strings in KlikPDF frontend components. Use when adding new UI strings, localizing features, or keeping English and Indonesian translations aligned.
---

# Internationalization (i18n) & Localization Specialist

Guidelines for maintaining seamless bilingual support (Bahasa Indonesia & English) across the KlikPDF web application.

## 1. File Structure & Conventions

* Translation files:
  - `frontend/src/locales/id.json` (Bahasa Indonesia - Default)
  - `frontend/src/locales/en.json` (English)
* Context Hook: `useLanguage()` from `frontend/src/context/LanguageContext.jsx` provides `{ lang, setLang, t }`.

## 2. Synchronization Rules

* **Key Parity:** Every key present in `id.json` MUST have an exact equivalent in `en.json`.
* **Zero Hardcoded Strings:**
  - Avoid writing static Indonesian or English text directly in JSX.
  - Pattern:
    ```jsx
    const { lang } = useLanguage();
    <span>{lang === 'id' ? 'Gabung PDF' : 'Merge PDF'}</span>
    ```
    or using dictionary lookup:
    ```jsx
    <span>{t('tools.merge.title')}</span>
    ```
* **Tone of Voice:**
  - **Bahasa Indonesia:** Jelas, profesional, ramah, dan ringkas (e.g., "Unggah Dokumen", "Proses Berkas").
  - **English:** Clean, actionable, modern SaaS terminology (e.g., "Upload File", "Process PDF").
