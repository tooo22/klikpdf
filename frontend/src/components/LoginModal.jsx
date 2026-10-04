import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { GoogleLogin } from '@react-oauth/google';
import { Capacitor } from '@capacitor/core';
import { X, ShieldCheck, History, Sparkles, UserCheck, Smartphone, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export const LoginModal = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, loginWithGoogle, loginCustom, loginDemo, googleClientId } = useAuth();
  const { lang } = useLanguage();
  const [customName, setCustomName] = useState('Ardiansyah');
  const [customEmail, setCustomEmail] = useState('');
  const [showCustomForm, setShowCustomForm] = useState(false);
  const [hasGoogleError, setHasGoogleError] = useState(false);

  if (!isLoginModalOpen) return null;

  const isNative = Capacitor.isNativePlatform();
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';

  const handleCustomSubmit = (e) => {
    e.preventDefault();
    loginCustom(customName, customEmail);
  };

  const handleQuickLogin = () => {
    loginCustom(customName || 'Ardiansyah', customEmail || 'ardiansyah@klikpdf.my.id');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="relative w-full max-w-md bg-white dark:bg-[#1E1E22] rounded-2xl sm:rounded-3xl shadow-2xl border border-gray-100 dark:border-[#2E2E33] overflow-hidden transform transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header decoration */}
        <div className="bg-gradient-to-r from-[#E5322D] to-[#FF5E57] p-5 sm:p-6 text-white text-center relative">
          <button
            onClick={() => setIsLoginModalOpen(false)}
            className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 p-1.5 sm:p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors cursor-pointer"
            aria-label="Close"
          >
            <X size={18} />
          </button>
          
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-2.5 sm:mb-3 shadow-inner backdrop-blur-md">
            <ShieldCheck size={28} className="text-white sm:w-8 sm:h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {lang === 'id' ? 'Masuk ke KlikPDF' : 'Sign in to KlikPDF'}
          </h2>
          <p className="text-xs text-white/90 font-medium mt-1">
            {lang === 'id' 
              ? 'Simpan riwayat file dan kelola dokumen PDF Anda secara aman' 
              : 'Save your file history and manage PDF documents securely'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-7 space-y-4">
          {/* Features highlight */}
          <div className="space-y-2.5 bg-gray-50 dark:bg-[#27272A]/50 p-3.5 rounded-2xl border border-gray-100 dark:border-[#2E2E33]">
            <div className="flex items-center space-x-2.5 text-xs text-gray-700 dark:text-gray-300">
              <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#E5322D] flex items-center justify-center shrink-0">
                <History size={13} />
              </div>
              <span className="font-semibold">
                {lang === 'id' ? 'Simpan Riwayat File & Dokumen Anda' : 'Automatic Recent Files History'}
              </span>
            </div>
            <div className="flex items-center space-x-2.5 text-xs text-gray-700 dark:text-gray-300">
              <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle2 size={13} />
              </div>
              <span className="font-semibold">
                {lang === 'id' ? 'Akses Tanpa Batas & 100% Gratis' : 'Unlimited Access & 100% Free'}
              </span>
            </div>
          </div>

          {/* Notice if origin mismatch or inside Mobile APK */}
          {(isNative || hasGoogleError) && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <Smartphone size={16} className="shrink-0 mt-0.5 text-amber-600" />
              <div className="leading-snug">
                <p className="font-bold">
                  {lang === 'id' ? 'Mode Aplikasi HP / Android' : 'Mobile / Android Mode'}
                </p>
                <p className="text-[11px] mt-0.5 text-amber-700 dark:text-amber-400">
                  {lang === 'id' 
                    ? 'Google OAuth membatasi login pop-up di WebView aplikasi. Silakan gunakan tombol "Masuk Cepat" di bawah untuk langsung terhubung.' 
                    : 'Google OAuth restricts pop-up logins in mobile WebViews. Please use "Quick Sign-In" below to access your account instantly.'}
                </p>
              </div>
            </div>
          )}

          {/* Primary Quick Login (Instant 1-Click for Mobile / HP) */}
          <button
            type="button"
            onClick={handleQuickLogin}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#E5322D] via-rose-600 to-[#CC2520] hover:from-[#CC2520] hover:to-[#E5322D] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            <UserCheck size={18} />
            <span>{lang === 'id' ? 'Masuk Cepat (Akun Ardiansyah)' : 'Instant Sign-in (Ardiansyah)'}</span>
          </button>

          {/* Divider */}
          <div className="flex items-center my-2">
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
            <span className="px-3 text-[11px] font-semibold text-gray-400 uppercase tracking-wider">
              {lang === 'id' ? 'Atau' : 'Or'}
            </span>
            <div className="flex-1 border-t border-gray-200 dark:border-gray-700"></div>
          </div>

          {/* Google Sign-in Section (Only if on Web with Client ID) */}
          {!isNative && googleClientId && (
            <div className="flex flex-col items-center justify-center space-y-2">
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    const success = loginWithGoogle(credentialResponse);
                    if (!success) {
                      alert(lang === 'id' ? 'Gagal memproses login Google' : 'Failed to process Google sign-in');
                    }
                  }}
                  onError={() => {
                    setHasGoogleError(true);
                  }}
                  useOneTap={false}
                  theme="filled_blue"
                  shape="pill"
                  size="large"
                  text="signin_with"
                />
              </div>
              <p className="text-[10px] text-gray-400 text-center">
                {lang === 'id' ? 'Masuk resmi menggunakan akun Google Anda' : 'Sign in using your Google account'}
              </p>
            </div>
          )}

          {/* Custom Name / Email Form Toggle */}
          {!showCustomForm ? (
            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => setShowCustomForm(true)}
                className="text-xs font-semibold text-gray-600 dark:text-gray-400 hover:text-[#E5322D] dark:hover:text-rose-400 transition-colors cursor-pointer"
              >
                {lang === 'id' ? '✏️ Ganti Nama / Email Profil' : '✏️ Custom Name / Email Profile'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleCustomSubmit} className="space-y-3 pt-1 border-t border-gray-100 dark:border-gray-800">
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {lang === 'id' ? 'Nama Anda:' : 'Your Name:'}
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="Contoh: Ardiansyah"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-700 dark:text-gray-300 mb-1">
                  {lang === 'id' ? 'Email (Opsional):' : 'Email (Optional):'}
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="nama@email.com"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#18181B] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-700 dark:hover:bg-slate-600 text-white text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span>{lang === 'id' ? 'Simpan & Masuk' : 'Save & Sign In'}</span>
                <ArrowRight size={13} />
              </button>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-gray-50 dark:bg-[#18181B] border-t border-gray-100 dark:border-[#2E2E33] text-center">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {lang === 'id' 
              ? 'Data login disimpan di penyimpanan lokal perangkat Anda secara privat.' 
              : 'Sign-in data is kept privately in your local device storage.'}
          </p>
        </div>
      </div>
    </div>
  );
};
