// KlikPDF Intelligent Client-Side AI Assistant Knowledge Engine

export const getSuggestionChips = (lang = 'id') => {
  if (lang === 'id') {
    return [
      'Bagaimana cara menggabungkan file PDF?',
      'Cara kompres PDF agar ukuran lebih kecil?',
      'Bisa konversi Word ke PDF?',
      'Cara meningkatkan resolusi foto HD?',
      'Apakah file PDF saya di sini aman?'
    ];
  }
  return [
    'How to merge multiple PDF files?',
    'How to compress PDF to smaller size?',
    'Can I convert Word to PDF?',
    'How to enhance image to HD resolution?',
    'Is my PDF file data safe and secure?'
  ];
};

export const getBotResponse = (userInput, lang = 'id') => {
  const query = userInput.toLowerCase().trim();

  // Helper matching
  const has = (...keywords) => keywords.some((k) => query.includes(k));

  // 1. GABUNGKAN / MERGE PDF
  if (has('gabung', 'merge', 'satukan', 'combine', 'gabungkan')) {
    return {
      text: lang === 'id'
        ? 'Untuk menggabungkan beberapa file PDF menjadi satu, gunakan alat **Gabungkan PDF**. Anda bisa upload beberapa file sekaligus, lalu atur urutan halaman sesuai keinginan sebelum digabungkan.'
        : 'To combine multiple PDF files into a single document, use our **Merge PDF** tool. You can upload multiple files, reorder them, and merge them in seconds.',
      toolId: 'merge',
      toolName: lang === 'id' ? 'Buka Gabungkan PDF' : 'Open Merge PDF'
    };
  }

  // 2. PISAHKAN / SPLIT PDF
  if (has('pisah', 'split', 'potong', 'ekstrak halaman', 'extract page')) {
    return {
      text: lang === 'id'
        ? 'Gunakan alat **Pisahkan PDF** untuk memotong atau mengambil halaman tertentu dari file PDF Anda (misalnya halaman 1-5 atau halaman ganjil saja).'
        : 'Use our **Split PDF** tool to extract specific pages or page ranges (e.g., pages 1-5 or individual pages) from your PDF document.',
      toolId: 'split',
      toolName: lang === 'id' ? 'Buka Pisahkan PDF' : 'Open Split PDF'
    };
  }

  // 3. KOMPRES / COMPRESS PDF
  if (has('kompres', 'compress', 'kecilkan', 'perkecil', 'reduce size', 'ukuran')) {
    return {
      text: lang === 'id'
        ? 'Alat **Kompres PDF** dapat memperkecil ukuran file PDF Anda secara signifikan tanpa merusak kualitas teks dan visual dokumen. Sangat cocok untuk upload berkas lamaran atau instansi.'
        : 'The **Compress PDF** tool significantly reduces the file size of your PDF while maintaining sharp text and image quality, perfect for email or online uploads.',
      toolId: 'compress',
      toolName: lang === 'id' ? 'Buka Kompres PDF' : 'Open Compress PDF'
    };
  }

  // 4. WORD TO PDF
  if (has('word ke pdf', 'doc ke pdf', 'docx ke pdf', 'word to pdf', 'convert word')) {
    return {
      text: lang === 'id'
        ? 'Anda bisa mengonversi file Microsoft Word (.doc / .docx) menjadi dokumen PDF dengan format dan layout yang rapi menggunakan fitur **Word ke PDF**.'
        : 'You can convert Microsoft Word documents (.doc / .docx) into pristine PDF files with exact formatting using our **Word to PDF** tool.',
      toolId: 'word-to-pdf',
      toolName: lang === 'id' ? 'Buka Word ke PDF' : 'Open Word to PDF'
    };
  }

  // 5. PDF TO WORD
  if (has('pdf ke word', 'pdf to word', 'ubah ke docx', 'edit pdf di word')) {
    return {
      text: lang === 'id'
        ? 'Fitur **PDF ke Word** memungkinkan Anda mengubah file PDF menjadi dokumen Word yang bisa diedit kembali dengan format teks dan tabel yang tetap terjaga.'
        : 'The **PDF to Word** tool transforms your PDF into an editable DOCX document while preserving layout, text styles, and tables.',
      toolId: 'pdf-to-word',
      toolName: lang === 'id' ? 'Buka PDF ke Word' : 'Open PDF to Word'
    };
  }

  // 6. HD IMAGE / ENHANCE
  if (has('hd', 'resolusi', 'tingkatkan foto', 'jernihkan', 'enhance', 'upscale', 'kualitas foto', 'gambar hd')) {
    return {
      text: lang === 'id'
        ? 'Ingin foto atau scan dokumen jadi lebih jernih dan tajam? Gunakan fitur **Foto HD**. Fitur ini meningkatkan resolusi dan ketajaman gambar secara instan hingga 2x-4x!'
        : 'Want to upscale or sharpen photos and scanned documents? Use our **HD Image** tool to instantly increase clarity and resolution up to 4x!',
      toolId: 'hd-image',
      toolName: lang === 'id' ? 'Buka Foto HD' : 'Open HD Image'
    };
  }

  // 7. IMAGE TO PDF / JPG TO PDF
  if (has('jpg ke pdf', 'gambar ke pdf', 'foto ke pdf', 'png ke pdf', 'image to pdf', 'jpg to pdf')) {
    return {
      text: lang === 'id'
        ? 'Ubah foto dan gambar JPG/PNG Anda menjadi dokumen PDF dalam hitungan detik dengan alat **JPG ke PDF**.'
        : 'Convert your JPG, PNG, and photo files into a single neat PDF document in seconds with our **JPG to PDF** tool.',
      toolId: 'image-to-pdf',
      toolName: lang === 'id' ? 'Buka JPG ke PDF' : 'Open JPG to PDF'
    };
  }

  // 8. PDF TO IMAGE / PDF TO JPG
  if (has('pdf ke jpg', 'pdf ke gambar', 'pdf ke foto', 'pdf to jpg', 'pdf to image')) {
    return {
      text: lang === 'id'
        ? 'Ekstrak setiap halaman PDF menjadi gambar berkualitas tinggi dengan alat **PDF ke JPG**.'
        : 'Extract every page of your PDF into high-resolution JPG images with the **PDF to JPG** tool.',
      toolId: 'pdf-to-image',
      toolName: lang === 'id' ? 'Buka PDF ke JPG' : 'Open PDF to JPG'
    };
  }

  // 9. EXCEL / POWERPOINT
  if (has('excel', 'xlsx', 'spreadsheet')) {
    return {
      text: lang === 'id'
        ? 'KlikPDF mendukung konversi dua arah untuk Microsoft Excel: **PDF ke Excel** dan **Excel ke PDF**.'
        : 'KlikPDF supports bidirectional Excel conversion: **PDF to Excel** and **Excel to PDF**.',
      toolId: 'excel-to-pdf',
      toolName: lang === 'id' ? 'Buka Excel ke PDF' : 'Open Excel to PDF'
    };
  }

  if (has('ppt', 'powerpoint', 'slide', 'presentasi')) {
    return {
      text: lang === 'id'
        ? 'Ubah slide presentasi PowerPoint Anda menjadi PDF yang siap dibagikan dengan fitur **PowerPoint ke PDF**.'
        : 'Turn your PowerPoint presentation slides into shareable PDF documents with **PowerPoint to PDF**.',
      toolId: 'powerpoint-to-pdf',
      toolName: lang === 'id' ? 'Buka PPT ke PDF' : 'Open PPT to PDF'
    };
  }

  // 10. OCR (Pindai Teks)
  if (has('ocr', 'scan', 'baca teks', 'ekstrak teks', 'extract text')) {
    return {
      text: lang === 'id'
        ? 'Fitur **OCR PDF** membaca teks dari dokumen hasil scan atau gambar agar teksnya bisa dicopy dan dicari (*searchable*).'
        : 'The **OCR PDF** tool scans image-based documents to recognize text and make it searchable and copyable.',
      toolId: 'ocr-pdf',
      toolName: lang === 'id' ? 'Buka OCR PDF' : 'Open OCR PDF'
    };
  }

  // 11. WATERMARK & ROTATE
  if (has('watermark', 'cap', 'tanda air')) {
    return {
      text: lang === 'id'
        ? 'Tambahkan cap teks atau tanda air custom pada dokumen PDF Anda dengan alat **Watermark PDF**.'
        : 'Add custom text stamps or watermarks to your PDF pages using **Watermark PDF**.',
      toolId: 'watermark',
      toolName: lang === 'id' ? 'Buka Watermark PDF' : 'Open Watermark PDF'
    };
  }

  if (has('putar', 'rotate', 'miring', 'balik halaman', 'orientasi')) {
    return {
      text: lang === 'id'
        ? 'Putar halaman PDF yang miring atau terbalik ke orientasi yang benar dengan alat **Putar PDF**.'
        : 'Rotate sideways or upside-down PDF pages to the correct orientation with **Rotate PDF**.',
      toolId: 'rotate',
      toolName: lang === 'id' ? 'Buka Putar PDF' : 'Open Rotate PDF'
    };
  }

  // 12. PROTECT & UNLOCK
  if (has('kunci', 'password', 'protect', 'sandi', 'lindungi', 'enkripsi', 'encrypt')) {
    return {
      text: lang === 'id'
        ? 'Lindungi dokumen rahasia Anda dengan password dan enkripsi kuat menggunakan alat **Lindungi PDF**.'
        : 'Secure sensitive PDF documents with strong encryption and password protection using **Protect PDF**.',
      toolId: 'protect',
      toolName: lang === 'id' ? 'Buka Lindungi PDF' : 'Open Protect PDF'
    };
  }

  if (has('buka kunci', 'unlock', 'hapus password', 'hilangkan sandi')) {
    return {
      text: lang === 'id'
        ? 'Hapus proteksi password pada file PDF Anda menggunakan alat **Buka Kunci PDF**.'
        : 'Remove password restrictions from your PDF files with our **Unlock PDF** tool.',
      toolId: 'unlock',
      toolName: lang === 'id' ? 'Buka Buka Kunci PDF' : 'Open Unlock PDF'
    };
  }

  // 13. KEAMANAN & PRIVASI (SECURITY & PRIVACY)
  if (has('aman', 'privasi', 'privacy', 'safe', 'secure', 'data bocor', 'disimpan')) {
    return {
      text: lang === 'id'
        ? '🔒 **Keamanan & Privasi Terjamin:**\nSemua proses utama berjalan langsung di browser Anda secara client-side, dan file yang diproses di server akan otomatis dihapus secara permanen dalam hitungan menit. Kami tidak pernah menyimpan atau membagikan isi dokumen Anda.'
        : '🔒 **Guaranteed Privacy & Security:**\nCore conversions happen directly on your client-side browser, and temporary files on our processing servers are automatically deleted permanently within minutes. We never store or share your documents.'
    };
  }

  // 14. BIAYA / GRATIS (FREE PRICING)
  if (has('gratis', 'bayar', 'biaya', 'free', 'price', 'langganan', 'tarif')) {
    return {
      text: lang === 'id'
        ? '🎉 **100% Gratis!** Semua fitur di KlikPDF dapat Anda gunakan tanpa biaya, tanpa batasan tersembunyi, dan tanpa perlu kartu kredit.'
        : '🎉 **100% Free!** All tools on KlikPDF are completely free to use with no hidden fees or subscription required.'
    };
  }

  // 15. SALAM / GREETINGS
  if (has('halo', 'hi', 'hai', 'hello', 'selamat', 'pagi', 'siang', 'sore', 'malam', 'p')) {
    return {
      text: lang === 'id'
        ? 'Halo! 👋 Saya Asisten AI KlikPDF. Ada yang bisa saya bantu terkait pengelolaan file PDF, gambar, atau konversi dokumen Anda hari ini?'
        : 'Hello! 👋 I am your KlikPDF AI Assistant. How can I help you manage, convert, or enhance your PDF documents today?'
    };
  }

  if (has('terima kasih', 'thanks', 'makasih', 'thank you', 'ok', 'oke', 'siap')) {
    return {
      text: lang === 'id'
        ? 'Sama-sama! 😊 Senang bisa membantu. Jika ada pertanyaan lain seputar dokumen PDF, jangan ragu untuk bertanya lagi!'
        : 'You are welcome! 😊 Glad I could help. Feel free to ask anytime if you need more help with your PDF files!'
    };
  }

  // DEFAULT SMART FALLBACK
  return {
    text: lang === 'id'
      ? 'Saya memahami Anda membutuhkan bantuan terkait dokumen. KlikPDF menyediakan alat lengkap seperti **Gabungkan PDF**, **Pisahkan**, **Kompres**, **Konversi Word/Excel/PPT**, **Foto HD**, hingga **Kunci PDF**. Anda bisa pilih salah satu alat atau tanyakan cara penggunaannya!'
      : 'I understand you are working with documents. KlikPDF offers tools like **Merge PDF**, **Split**, **Compress**, **Word/Excel/PPT to PDF**, **HD Image**, and **Protect PDF**. You can select any tool or ask me for specific instructions!'
  };
};
