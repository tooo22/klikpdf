import React, { useState } from 'react';
import { Star, X, CheckCircle, Heart, MessageSquare } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export const RatingModal = ({ isOpen, onClose, toolName = null }) => {
  const { lang } = useLanguage();
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const ratingLabels = {
    1: { id: 'Perlu Ditingkatkan 😞', en: 'Needs Improvement 😞' },
    2: { id: 'Kurang Puas 😐', en: 'Fair 😐' },
    3: { id: 'Cukup Baik 🙂', en: 'Good 🙂' },
    4: { id: 'Sangat Puas! 😊', en: 'Very Satisfied! 😊' },
    5: { id: 'Luar Biasa! 🤩', en: 'Exceptional! 🤩' },
  };

  const currentLevel = hoverRating || rating;

  const handleSubmit = (e) => {
    e.preventDefault();
    const reviewData = {
      id: 'rev_' + Date.now(),
      rating,
      feedback: feedback.trim(),
      toolName: toolName || 'Umum',
      timestamp: new Date().toISOString()
    };

    try {
      const existing = JSON.parse(localStorage.getItem('klikpdf_user_reviews') || '[]');
      existing.unshift(reviewData);
      localStorage.setItem('klikpdf_user_reviews', JSON.stringify(existing));
      localStorage.setItem('klikpdf_last_rating', rating.toString());
    } catch (err) {
      console.warn('Storage error:', err);
    }

    setIsSubmitted(true);
    setTimeout(() => {
      onClose();
      setIsSubmitted(false);
      setFeedback('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#18181B] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-border-subtle dark:border-slate-800 relative transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-xl flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-surface-subtle dark:hover:bg-slate-800 text-lg font-bold transition-colors cursor-pointer"
        >
          ✕
        </button>

        {isSubmitted ? (
          <div className="py-8 text-center animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-500 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <CheckCircle size={36} />
            </div>
            <h3 className="text-xl font-black text-text-primary dark:text-white mb-1">
              {lang === 'id' ? 'Terima Kasih!' : 'Thank You!'}
            </h3>
            <p className="text-xs text-secondary dark:text-slate-300 max-w-xs mx-auto">
              {lang === 'id' 
                ? 'Ulasan Anda sangat berharga untuk terus menyempurnakan layanan KlikPDF.' 
                : 'Your rating is greatly appreciated and helps us improve KlikPDF.'}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 dark:bg-rose-950/60 text-primary flex items-center justify-center mx-auto mb-3 shadow-xs">
                <Heart size={24} className="fill-current text-primary" />
              </div>
              <h3 className="text-xl font-black text-text-primary dark:text-white">
                {lang === 'id' ? 'Beri Penilaian untuk KlikPDF' : 'Rate Your Experience'}
              </h3>
              <p className="text-xs text-secondary dark:text-slate-400 mt-1">
                {toolName 
                  ? (lang === 'id' ? `Bagaimana kepuasan Anda setelah memakai alat ${toolName}?` : `How was your experience with ${toolName}?`)
                  : (lang === 'id' ? 'Bantu kami memberikan layanan pengolahan dokumen terbaik.' : 'Help us provide the best free PDF service for you.')}
              </p>
            </div>

            {/* Interactive Stars */}
            <div className="flex flex-col items-center justify-center mb-6">
              <div className="flex items-center gap-2 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="p-1 text-slate-300 hover:text-amber-400 transition-transform active:scale-90 cursor-pointer"
                  >
                    <Star
                      size={32}
                      className={`transition-colors duration-150 ${
                        star <= currentLevel
                          ? 'text-amber-400 fill-amber-400 drop-shadow-sm scale-105'
                          : 'text-slate-300 dark:text-slate-700'
                      }`}
                    />
                  </button>
                ))}
              </div>
              <span className="text-xs font-bold text-primary dark:text-rose-400 tracking-wide">
                {ratingLabels[currentLevel]?.[lang] || ratingLabels[currentLevel]?.id}
              </span>
            </div>

            {/* Optional Feedback Input */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5 flex items-center gap-1.5">
                <MessageSquare size={13} className="text-slate-400" />
                <span>{lang === 'id' ? 'Tulis Ulasan atau Masukan (Opsional):' : 'Write Feedback (Optional):'}</span>
              </label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                rows={3}
                placeholder={lang === 'id' ? 'Apa yang Anda sukai atau perlu kami tingkatkan?...' : 'What did you like or what can we improve?...'}
                className="w-full bg-slate-50 dark:bg-[#121520] border border-border-subtle dark:border-slate-800 rounded-xl p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all resize-none placeholder:text-slate-400"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-sm shadow-md shadow-primary/25 active:scale-98 transition-all cursor-pointer"
            >
              {lang === 'id' ? 'Kirim Penilaian Sekarang' : 'Submit Review'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
