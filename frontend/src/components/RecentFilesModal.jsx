import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { X, History, Trash2, FileText, Clock, ExternalLink } from 'lucide-react';

export const RecentFilesModal = () => {
  const { isRecentModalOpen, setIsRecentModalOpen, recentFiles, clearRecentFiles, user } = useAuth();
  const { lang } = useLanguage();

  if (!isRecentModalOpen) return null;

  const formatDate = (isoString) => {
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString(lang === 'id' ? 'id-ID' : 'en-US', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-lg bg-white dark:bg-[#1E1E22] rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2E2E33] overflow-hidden flex flex-col max-h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-[#2E2E33] flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-red-50 dark:bg-red-950/40 text-[#E5322D] flex items-center justify-center">
              <History size={20} />
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 dark:text-white">
                {lang === 'id' ? 'Riwayat File Saya' : 'My Recent Files'}
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user ? user.name : (lang === 'id' ? 'Pengguna' : 'User')} • {recentFiles.length} {lang === 'id' ? 'dokumen' : 'files'}
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsRecentModalOpen(false)}
            className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-[#27272A] text-gray-500 dark:text-gray-400 transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        {/* File List Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-3">
          {recentFiles.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-14 h-14 bg-gray-100 dark:bg-[#27272A] rounded-2xl flex items-center justify-center mx-auto text-gray-400">
                <FileText size={28} />
              </div>
              <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                {lang === 'id' ? 'Belum Ada Riwayat File' : 'No Recent Files Yet'}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                {lang === 'id' 
                  ? 'File yang Anda proses atau konversi melalui alat KlikPDF akan otomatis tercatat di sini.' 
                  : 'Files processed or converted using KlikPDF tools will automatically appear here.'}
              </p>
            </div>
          ) : (
            recentFiles.map((file) => (
              <div
                key={file.id}
                className="p-3.5 rounded-2xl bg-gray-50 dark:bg-[#27272A]/50 border border-gray-100 dark:border-[#2E2E33] flex items-center justify-between hover:border-gray-200 dark:hover:border-gray-600 transition-all group"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-white dark:bg-[#1E1E22] shadow-sm flex items-center justify-center text-[#E5322D] shrink-0 border border-gray-100 dark:border-[#2E2E33]">
                    <FileText size={18} />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-gray-900 dark:text-white truncate">
                      {file.name}
                    </p>
                    <div className="flex items-center space-x-2 text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
                      <span className="bg-red-50 dark:bg-red-950/40 text-[#E5322D] dark:text-[#FF6B66] font-semibold px-1.5 py-0.5 rounded text-[10px]">
                        {file.toolName}
                      </span>
                      <span>•</span>
                      <span className="flex items-center space-x-1">
                        <Clock size={11} />
                        <span>{formatDate(file.timestamp)}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer Actions */}
        {recentFiles.length > 0 && (
          <div className="px-6 py-4 bg-gray-50 dark:bg-[#18181B] border-t border-gray-100 dark:border-[#2E2E33] flex justify-between items-center">
            <button
              onClick={clearRecentFiles}
              className="text-xs text-red-600 dark:text-red-400 hover:text-red-700 font-semibold flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Trash2 size={14} />
              <span>{lang === 'id' ? 'Hapus Semua Riwayat' : 'Clear All History'}</span>
            </button>
            <button
              onClick={() => setIsRecentModalOpen(false)}
              className="px-4 py-2 rounded-xl bg-gray-200 dark:bg-[#27272A] hover:bg-gray-300 dark:hover:bg-[#333338] text-xs font-bold text-gray-800 dark:text-gray-200 transition-colors cursor-pointer"
            >
              {lang === 'id' ? 'Tutup' : 'Close'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
