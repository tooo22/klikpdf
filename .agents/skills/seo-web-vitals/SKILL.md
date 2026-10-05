---
name: seo-web-vitals
description: Specialist in Technical SEO, Core Web Vitals optimization, Google Search ranking, Schema.org JSON-LD structured data, metadata, sitemaps, and Open Graph optimization for KlikPDF. Use when improving page speed, search visibility, social sharing previews, or auditing web performance.
---

# SEO & Web Vitals Specialist

Guidance and checklists for ensuring KlikPDF maintains #1 ranking on Google for PDF conversion keywords and achieves 95+ scores on Google Lighthouse / PageSpeed Insights.

## 1. Technical SEO Checklist

* **Meta Tags & Title Structure:**
  - Format: `{Tool Name} Online Gratis & Cepat - KlikPDF`
  - Meta description: 140-155 characters with clear Call-to-Action (CTA).
* **Schema.org Structured Data (JSON-LD):**
  - Use `SoftwareApplication` and `WebApplication` schema on all tool pages with `applicationCategory: "UtilitiesApplication"`, `operatingSystem: "All"`, and `offers.price: "0"`.
* **Sitemap & Robots:**
  - Ensure `frontend/public/sitemap.xml` lists all canonical routes (`/`, `/#/merge`, `/#/split`, `/#/word-to-pdf`, etc.) with `priority: 0.9` and `changefreq: weekly`.
  - Maintain clean `robots.txt` allowing all crawlers to access public assets and documentation.

## 2. Core Web Vitals Optimization

* **Largest Contentful Paint (LCP < 2.0s):**
  - Preload key fonts and brand SVG icons in `index.html`.
  - Use modern WebP / optimized SVGs for illustrations.
* **First Input Delay / INP (< 100ms):**
  - Offload heavy PDF parsing to Web Workers or background asynchronous micro-tasks.
* **Cumulative Layout Shift (CLS = 0):**
  - Explicit `width` and `height` on all image tags and tool cards to prevent layout jumps during lazy loading.
* **Vite Bundle Splitting:**
  - Chunk heavy dependencies (`pdf-lib`, `jspdf`, `mammoth`, `lucide-react`) dynamically using `manualChunks` in `vite.config.js`.
