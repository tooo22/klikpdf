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
    <div className="aura-dock max-w-2xl mx-auto my-6 sm:my-12 bg-white/90 dark:bg-[#0E1320]/90 border border-slate-200/80 dark:border-white/[0.08] rounded-3xl p-6 sm:p-12 text-center backdrop-blur-2xl shadow-2xl transition-colors duration-200">
      <div className="w-16 h-16 sm:w-20 sm:h-20 bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xs">
        <CheckCircle2 size={36} className="sm:w-11 sm:h-11" />
      </div>

      <h2 className="text-xl sm:text-3xl font-black text-text-primary dark:text-white mb-2">
        {t('success.title') || 'Dokumen Selesai Diproses!'}
      </h2>
      <p className="text-xs sm:text-sm text-secondary dark:text-slate-400 mb-5">
        {t('success.subtitle') || 'Berkas Anda siap diunduh ke perangkat Anda.'}
      </p>

      {fileName && (
        <div className="mb-6">
          <span className="aura-pill inline-flex items-center gap-1.5 bg-slate-100/80 dark:bg-[#141A29] text-slate-700 dark:text-slate-200 px-4 py-2 rounded-full text-xs font-semibold max-w-full truncate border border-slate-200/80 dark:border-white/10">
            <span>📄</span>
            <span className="font-bold text-primary truncate max-w-[220px] sm:max-w-xs">{fileName}</span>
          </span>
        </div>
      )}

      {/* Main Download Button */}
      <a
        href={downloadUrl}
        download={fileName || 'klikpdf_output.pdf'}
        className="btn-shimmer w-full sm:w-auto bg-gradient-to-r from-crimson-primary via-primary to-rose-600 hover:from-primary hover:to-crimson-dark active:scale-95 text-white text-base sm:text-lg font-black px-8 sm:px-12 py-4 rounded-full shadow-xl shadow-rose-500/25 hover:shadow-2xl transition-all inline-flex items-center justify-center space-x-2.5 mb-6 sm:mb-8 cursor-pointer"
      >
        <Download size={22} className="sm:w-6 sm:h-6" />
        <span>{lang === 'id' ? 'Unduh Berkas Sekarang' : 'Download File Now'}</span>
      </a>

      {/* Interactive In-Page Rating Prompt */}
      <div className="aura-card mb-6 sm:mb-8 p-5 sm:p-6 rounded-2xl bg-slate-50/80 dark:bg-[#090D16]/60 border border-slate-200/80 dark:border-white/[0.06] text-center transition-all">
        <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-slate-800 dark:text-slate-200 mb-2">
          <Heart size={14} className="text-primary fill-current" />
          <span>
            {lang === 'id' 
              ? (toolName ? `Bagaimana kepuasan Anda setelah memakai alat ${toolName}?` : 'Bagaimana kepuasan Anda dengan hasil proses ini?') 
              : (toolName ? `How satisfied are you with ${toolName}?` : 'How satisfied are you with this result?')}
          </span>
        </div>

        {/* Stars with larger touch targets for mobile */}
        <div className="flex items-center justify-center gap-1 sm:gap-1.5 my-2.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => handleRate(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1.5 sm:p-1 text-slate-300 hover:text-amber-400 transition-transform active:scale-90 cursor-pointer"
              title={`${star} Bintang`}
            >
              <Star
                size={26}
                className={`sm:w-7 sm:h-7 transition-colors duration-150 ${
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
          <div className="mt-3 pt-3 border-t border-slate-200/60 dark:border-white/[0.06] animate-in fade-in">
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
                  className="flex-1 bg-white dark:bg-[#090D16] border border-slate-200 dark:border-white/10 rounded-full px-3.5 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-primary"
                />
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-full bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all cursor-pointer shadow-xs"
                >
                  {lang === 'id' ? 'Kirim' : 'Submit'}
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-4 pt-4 border-t border-slate-100 dark:border-white/[0.06]">
        <button
          onClick={onReset}
          className="aura-pill w-full sm:w-auto flex items-center justify-center space-x-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors cursor-pointer px-5 py-2.5 rounded-full bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 shadow-2xs"
        >
          <RefreshCw size={15} />
          <span>{lang === 'id' ? 'Proses Berkas Lain' : 'Process Another File'}</span>
        </button>
        <button
          onClick={onGoHome}
          className="aura-pill w-full sm:w-auto flex items-center justify-center space-x-2 text-xs sm:text-sm font-bold text-slate-700 dark:text-slate-200 hover:text-primary transition-colors cursor-pointer px-5 py-2.5 rounded-full bg-white dark:bg-white/[0.04] border border-slate-200/80 dark:border-white/10 shadow-2xs"
        >
          <ArrowLeft size={15} />
          <span>{lang === 'id' ? 'Kembali ke Beranda' : 'Back to Home'}</span>
        </button>
      </div>
    </div>
  );
};
