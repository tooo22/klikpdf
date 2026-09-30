import React from 'react';
import { Heart } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-white dark:bg-[#18181B] border-t border-gray-200 dark:border-[#27272A] py-8 text-center text-xs text-gray-500 dark:text-gray-400 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-1 font-semibold text-gray-700 dark:text-gray-300">
          <span>© 2026 KlikPDF. Dibuat dengan</span>
          <Heart size={14} className="text-[#E5322D] fill-current" />
          <span>oleh</span>
          <a
            href="https://instagram.com/toooowys"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#E5322D] hover:text-[#ff4742] font-bold underline decoration-dotted hover:decoration-solid hover:scale-105 transition-all duration-150 inline-block"
          >
            @toooowys
          </a>
          <span>untuk kemudahan pengolahan PDF Anda.</span>
        </div>
        <div className="flex space-x-4">
          <a href="#" className="hover:underline hover:text-[#E5322D]">Privasi</a>
          <a href="#" className="hover:underline hover:text-[#E5322D]">Syarat & Ketentuan</a>
          <a href="#" className="hover:underline hover:text-[#E5322D]">Kontak</a>
        </div>
      </div>
    </footer>
  );
};
