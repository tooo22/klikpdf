---
name: web-security-hardening
description: Specialist in Web Security, Content Security Policy (CSP), file input sanitization, anti-XSS, rate limiting, and defensive coding for KlikPDF. Use when auditing vulnerabilities, securing API endpoints, sanitizing user-uploaded documents, or configuring security headers.
---

# Web Security & Defense Specialist

Comprehensive guidelines for safeguarding KlikPDF against common web vulnerabilities, malicious file uploads, injection attacks, and denial of service.

## 1. File Upload Defense & Sanitization

* **MIME-Type & Magic Byte Validation:**
  - Never trust the client-provided `file.type` alone. Always inspect file headers (e.g. `%PDF-` magic bytes for PDF files, `PK\x03\x04` for docx/zip).
* **DOM Sanitization:**
  - Always sanitize HTML output from `mammoth.js` using `DOMPurify` before injecting into the DOM or converting with `html2canvas`/`jsPDF`.
* **Zero Server Storage (Privacy-First):**
  - All files processed client-side must reside only in volatile RAM (`ArrayBuffer`).
  - Any temporary files in backend (`backend/temp/`) must be removed immediately in `finally` blocks after response streaming.

## 2. Security Headers (`vercel.json`)

Ensure production responses include industry-standard security headers:
* `X-Content-Type-Options: nosniff`
* `X-Frame-Options: SAMEORIGIN`
* `X-XSS-Protection: 1; mode=block`
* `Referrer-Policy: strict-origin-when-cross-origin`
* `Permissions-Policy: camera=(self), microphone=(), geolocation=()`

## 3. Rate Limiting & Abuse Prevention

* FastAPI backend should enforce IP-based rate limiting (e.g., max 20 heavy conversions per minute per IP) using slowapi / Redis.
* Client-side button throttling (`isProcessing` state) to prevent multiple simultaneous processing requests.
