---
name: agy-1
description: Antigravity Customization Specialist (Skills, Rules, Plugins, Hooks, MCP Servers). Use when the user mentions "agy-1", "agy1", or asks to customize Antigravity agent behavior, create new skills, rules, hooks, or MCP configurations.
---

# Antigravity Customization Specialist (agy-1)

Use this skill whenever the user calls `agy-1` or requests customization of the Antigravity agent environment.

---

## 1. Quick Reference: Customization Types

| Tipe | Lokasi File / Folder | Cakupan | Fungsi Utama |
| :--- | :--- | :--- | :--- |
| **Rules** | `AGENTS.md`, `GEMINI.md`, `.agents/rules/*.md` | Kontekstual / Hirarki | Menetapkan pedoman coding, style guide, dan aturan eksekusi otomatis. |
| **Skills** | `.agents/skills/<name>/SKILL.md` atau `~/.gemini/config/skills/` | On-Demand (Dipanggil saat relevan) | Mengajarkan alur kerja terstruktur multi-langkah dan runbook tugas. |
| **Plugins** | `plugins/<name>/plugin.json` | Bundel | Memaketkan kombinasi skills, rules, dan MCP ke dalam satu unit. |
| **Hooks** | `hooks.json` | Event Lifecycle | Menjalankan script otomatis sebelum/sesudah tool dijalankan (pre/post-tool). |
| **MCP Servers** | `mcp_config.json` | Integrasi Tools | Menghubungkan agen ke layanan eksternal via Model Context Protocol. |

---

## 2. Hirarki & Prioritas Loading (Tinggi ke Rendah)

1. **Workspace Project**: Folder `.agents/` di root proyek saat ini.
2. **Declared Config**: Konfigurasi eksplisit di `skills.json` / `plugins.json` workspace.
3. **Global Discovery**: Folder `~/.gemini/config/` (berlaku di semua proyek lokal).
4. **Built-in Customizations**: Skill bawaan sistem Antigravity.
5. **Global Declared Config**: Konfigurasi eksplisit di JSON global.

---

## 3. Template Pembuatan Cepat

### A. Membuat Workspace Rule Baru
Buat file di `.agents/rules/<nama-rule>.md`:
```markdown
# [Judul Aturan]

## Pedoman
1. [Pedoman 1]
2. [Pedoman 2]
```

### B. Membuat Skill Baru
Buat folder `.agents/skills/<nama-skill>/` dan file `SKILL.md`:
```markdown
---
name: nama-skill
description: Deskripsi jelas kapan agen harus mengaktifkan skill ini (gunakan sudut pandang orang ketiga).
---

# [Nama Skill]

## Prosedur Langkah-demi-Langkah
1. Langkah 1
2. Langkah 2
```

### C. Menghubungkan MCP Server
Buat atau edit `mcp_config.json`:
```json
{
  "mcpServers": {
    "my-server": {
      "command": "npx",
      "args": ["-y", "nama-package-mcp"]
    }
  }
}
```

---

## 4. Eksekusi Tindakan Mandiri
Saat user meminta implementasi atau kustomisasi baru lewat `agy-1`:
1. Tentukan jenis kustomisasi yang paling tepat (Rule vs Skill vs MCP vs Hook).
2. Langsung buat file konfigurasi di lokasi yang sesuai (`.agents/rules/` atau `.agents/skills/`).
3. Berikan konfirmasi ringkas dan contoh cara memanggilnya.
