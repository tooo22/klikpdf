import React, { useState } from 'react';
import { CheckCircle2, Download, ArrowLeft, RefreshCw, Star, Heart, Check } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const ResultDownload = ({ downloadUrl, fileName, toolName, onGoHome, onReset }) => {
  const { t, lang } = useLanguage();
  const [rating, setRating] = useState(() => {
    try {
      const saved = localStorage.getItem('klikpdf_last_rating');
      return saved ? parseInt(saved, 10) : 0;
    } catch {
      return 0;
    }
  });
  const [hoverRating, setHoverRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);
  const [userComment, setUserComment] = useState('');
  const [showCommentBox, setShowCommentBox] = useState(false);

  const ratingLabels = {
    1: { id: 'Perlu Ditingkatkan 😞', en: 'Needs Improvement 😞' },
    2: { id: 'Kurang Puas 😐', en: 'Fair 😐' },
    3: { id: 'Cukup Baik 🙂', en: 'Good 🙂' },
    4: { id: 'Sangat Puas! 😊', en: 'Very Satisfied! 😊' },
    5: { id: 'Luar Biasa! 🤩', en: 'Exceptional! 🤩' },
  };

  const handleRate = (stars) => {
    setRating(stars);
    setHasRated(true);
    setShowCommentBox(true);

    try {
      const existing = JSON.parse(localStorage.getItem('klikpdf_user_reviews') || '[]');
      existing.unshift({
        id: 'rev_' + Date.now(),
        rating: stars,
        fileName: fileName || 'Dokumen',
        toolName: toolName || 'Dokumen',
        timestamp: new Date().toISOString()
      });
      localStorage.setItem('klikpdf_user_reviews', JSON.stringify(existing));
      localStorage.setItem('klikpdf_last_rating', stars.toString());
    } catch (e) {
      console.warn('Storage warning:', e);
    }
  };

  const handleSaveComment = (e) => {
    e.preventDefault();
    if (!userComment.trim()) return;

    try {
      const existing = JSON.parse(localStorage.getItem('klikpdf_user_reviews') || '[]');
      if (existing.length > 0) {
        existing[0].feedback = userComment.trim();
        localStorage.setItem('klikpdf_user_reviews', JSON.stringify(existing));
      }
    } catch (e) {
      console.warn('Storage warning:', e);
    }
    setShowCommentBox(false);
  };

  const activeLevel = hoverRating || rating;

  return (
    <div className="max-w-2xl mx-auto my-12 bg-white dark:bg-[#18181B] border border-border-subtle/90 dark:border-slate-800 rounded-3xl p-8 sm:p-12 text-center shadow-xl transition-colors duration-200">
      <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xs">
        <CheckCircle2 size={44} />
      </div>

      <h2 className="text-2xl sm:text-3xl font-black text-text-primary dark:text-white mb-2">
        {t('success.title') || 'Dokumen Selesai Diproses!'}
      </h2>
      <p className="text-xs sm:text-sm text-secondary dark:text-slate-400 mb-4">
        {t('success.subtitle') || 'Berkas Anda siap diunduh ke perangkat Anda.'}
      </p>

      {fileName && (
        <div className="mb-6">
          <span className="inline-flex items-center gap-1.5 bg-surface-subtle dark:bg-[#121520] text-slate-700 dark:text-slate-200 px-4 py-1.5 rounded-full text-xs font-semibold max-w-sm sm:max-w-md truncate border border-border-subtle dark:border-slate-800">
            <span>📄</span>
            <span className="font-bold text-primary truncate">{fileName}</span>
          </span>
        </div>
      )}

      {/* Main Download Button */}
      <a
        href={downloadUrl}
        download={fileName || 'klikpdf_output.pdf'}
        className="bg-primary hover:bg-primary-container active:scale-95 text-white text-lg sm:text-xl font-black px-10 py-4.5 rounded-2xl shadow-xl shadow-primary/25 hover:shadow-2xl transition-all inline-flex items-center space-x-3 mb-8 cursor-pointer"
      >
        <Download size={26} />
        <span>{lang === 'id' ? 'Unduh Berkas Sekarang' : 'Download File Now'}</span>
      </a>

      {/* Interactive In-Page Rating Prompt */}
      <div className="mb-8 p-5 rounded-2xl bg-surface-canvas dark:bg-[#121520] border border-border-subtle/80 dark:border-slate-800 text-center transition-all">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
          <Heart size={14} className="text-primary fill-current" />
          <span>
            {lang === 'id' 
              ? (toolName ? `Bagaimana kepuasan Anda setelah memakai alat ${toolName}?` : 'Bagaimana kepuasan Anda dengan hasil proses ini?') 
              : (toolName ? `How satisfied are you with ${toolName}?` : 'How satisfied are you with this result?')}
          </span>
        </div>

        {/* Stars */}
        <div className="flex items-center justify-center gap-1.5 my-2.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 text-slate-300 hover:text-amber-400 transition-transform active:scale-90 cursor-pointer"
              title={`${star} Bintang`}
            >
              <Star
                size={28}
                className={`transition-colors duration-150 ${
                  star <= activeLevel
                    ? 'text-amber-400 fill-amber-400 drop-shadow-sm scale-110'
                    : 'text-slate-300 dark:text-slate-700'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Dynamic Label */}
        {activeLevel > 0 && (
          <p className="text-xs font-bold text-primary dark:text-rose-400 animate-in fade-in">
            {ratingLabels[activeLevel]?.[lang] || ratingLabels[activeLevel]?.id}
          </p>
        )}

        {/* Thank you feedback and optional comment */}
        {hasRated && (
          <div className="mt-3 pt-3 border-t border-border-subtle/60 dark:border-slate-800/80 animate-in fade-in">
            <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 dark:text-emerald-400">
              <Check size={14} />
              <span>{lang === 'id' ? 'Terima kasih atas ulasan bintang Anda!' : 'Thank you for your rating!'}</span>
            </span>

            {showCommentBox && (
              <form onSubmit={handleSaveComment} className="mt-2.5 max-w-sm mx-auto flex items-center gap-2">
                <input
                  type="text"
                  value={userComment}
                  onChange={(e) => setUserComment(e.target.value)}
                  placeholder={lang === 'id' ? 'Tulis masukan singkat... (opsional)' : 'Optional feedback comment...'}
                  className="flex-1 bg-white dark:bg-[#18181B] border border-border-subtle dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all cursor-pointer"
                >
                  {lang === 'id' ? 'Kirim' : 'Submit'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-border-subtle/80 dark:border-slate-800">
        <button
          onClick={onReset}
          className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer px-4 py-2 rounded-xl hover:bg-surface-subtle dark:hover:bg-slate-800"
        >
          <RefreshCw size={15} />
          <span>{lang === 'id' ? 'Proses Berkas Lain' : 'Process Another File'}</span>
        </button>
        <button
          onClick={onGoHome}
          className="flex items-center space-x-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-300 hover:text-primary transition-colors cursor-pointer px-4 py-2 rounded-xl hover:bg-surface-subtle dark:hover:bg-slate-800"
        >
          <ArrowLeft size={15} />
          <span>{lang === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}</span>
        </button>
      </div>
    </div>
  );
};
