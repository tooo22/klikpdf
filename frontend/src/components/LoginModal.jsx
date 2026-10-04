import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { GoogleLogin } from '@react-oauth/google';
import { X, ShieldCheck, History, Sparkles, UserCheck } from 'lucide-react';

export const LoginModal = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, loginWithGoogle, loginDemo, googleClientId } = useAuth();
  const { lang } = useLanguage();

  if (!isLoginModalOpen) return null;

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
              ? 'Akses riwayat file dan kelola dokumen PDF Anda dengan mudah' 
              : 'Access your file history and manage PDF documents effortlessly'}
          </p>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-8 space-y-4 sm:space-y-6">
          {/* Features highlight */}
          <div className="space-y-3 bg-gray-50 dark:bg-[#27272A]/50 p-4 rounded-2xl border border-gray-100 dark:border-[#2E2E33]">
            <div className="flex items-center space-x-3 text-xs text-gray-700 dark:text-gray-300">
              <div className="w-6 h-6 rounded-lg bg-red-100 dark:bg-red-950/60 text-[#E5322D] flex items-center justify-center shrink-0">
                <History size={14} />
              </div>
              <span className="font-semibold">
                {lang === 'id' ? 'Simpan Riwayat File Otomatis' : 'Automatic Recent Files History'}
              </span>
            </div>
            <div className="flex items-center space-x-3 text-xs text-gray-700 dark:text-gray-300">
              <div className="w-6 h-6 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center shrink-0">
                <Sparkles size={14} />
              </div>
              <span className="font-semibold">
                {lang === 'id' ? 'Akses Cepat Semua Fitur PDF' : 'Fast Access to All PDF Tools'}
              </span>
            </div>
          </div>

          {/* Google Sign-in or Demo Section */}
          <div className="flex flex-col items-center justify-center space-y-3 pt-2">
            {googleClientId ? (
              <div className="w-full flex justify-center">
                <GoogleLogin
                  onSuccess={(credentialResponse) => {
                    const success = loginWithGoogle(credentialResponse);
                    if (!success) {
                      alert(lang === 'id' ? 'Gagal memproses login Google' : 'Failed to process Google sign-in');
                    }
                  }}
                  onError={() => {
                    alert(lang === 'id' ? 'Login Google dibatalkan atau gagal' : 'Google sign-in cancelled or failed');
                  }}
                  useOneTap
                  theme="filled_blue"
                  shape="pill"
                  size="large"
                  text="signin_with"
                />
              </div>
            ) : (
              <div className="w-full text-center space-y-3">
                <div className="text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-800/50">
                  <p className="font-medium">
                    {lang === 'id' 
                      ? 'Google Client ID belum dikonfigurasi di file .env (VITE_GOOGLE_CLIENT_ID).' 
                      : 'Google Client ID is not configured in .env (VITE_GOOGLE_CLIENT_ID).'}
                  </p>
                </div>

                <button
                  onClick={loginDemo}
                  className="w-full py-3 px-4 rounded-xl bg-[#E5322D] hover:bg-[#CC2520] text-white font-bold text-sm shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 cursor-pointer active:scale-98"
                >
                  <UserCheck size={18} />
                  <span>{lang === 'id' ? 'Masuk Mode Demo (1-Klik)' : 'Instant Demo Sign-in (1-Click)'}</span>
                </button>
              </div>
            )}

            {/* Optional Demo Login Button even if Google Client ID is configured */}
            {googleClientId && (
              <button
                onClick={loginDemo}
                className="text-xs text-gray-500 dark:text-gray-400 hover:text-[#E5322D] dark:hover:text-[#FF6B66] underline transition-colors pt-2 cursor-pointer"
              >
                {lang === 'id' ? 'Atau coba dengan Akun Demo' : 'Or try with Demo Account'}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 dark:bg-[#18181B] border-t border-gray-100 dark:border-[#2E2E33] text-center">
          <p className="text-[11px] text-gray-500 dark:text-gray-400">
            {lang === 'id' 
              ? 'Dengan masuk, Anda menyetujui Ketentuan Layanan & Kebijakan Privasi KlikPDF.' 
              : 'By signing in, you agree to KlikPDF Terms of Service & Privacy Policy.'}
          </p>
        </div>
      </div>
    </div>
  );
};
