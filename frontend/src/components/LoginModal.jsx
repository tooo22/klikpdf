import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { GoogleLogin } from '@react-oauth/google';
import { Capacitor } from '@capacitor/core';
import * as Icons from 'lucide-react';

// Hatched Wireframe Logo Mark matching the Stitch / Blueprint aesthetic
const HatchedLogo = () => (
  <svg
    width="22"
    height="22"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="text-zinc-100"
  >
    <mask id="modal-logo-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
      <path d="M12 2L3 22H7.5L9.5 17H14.5L16.5 22H21L12 2ZM12 7.5L13.8 13H10.2L12 7.5Z" fill="white" />
    </mask>
    <g mask="url(#modal-logo-mask)">
      <line x1="0" y1="2" x2="24" y2="2" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="4" x2="24" y2="4" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="6" x2="24" y2="6" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="8" x2="24" y2="8" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="10" x2="24" y2="10" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="12" x2="24" y2="12" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="14" x2="24" y2="14" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="16" x2="24" y2="16" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="18" x2="24" y2="18" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="20" x2="24" y2="20" stroke="currentColor" strokeWidth="1.2" />
      <line x1="0" y1="22" x2="24" y2="22" stroke="currentColor" strokeWidth="1.2" />
    </g>
  </svg>
);

export const LoginModal = () => {
  const { isLoginModalOpen, setIsLoginModalOpen, loginWithGoogle, googleClientId } = useAuth();
  const { lang } = useLanguage();
  const [hasGoogleError, setHasGoogleError] = useState(false);

  if (!isLoginModalOpen) return null;

  const isNative = Capacitor.isNativePlatform();

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in"
      onClick={() => setIsLoginModalOpen(false)}
    >
      <div
        className="relative w-full max-w-[420px] bg-[#121214] border border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl text-white select-none animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Subtle Close Button */}
        <button
          onClick={() => setIsLoginModalOpen(false)}
          className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center text-zinc-500 hover:text-white hover:bg-zinc-800 transition-colors cursor-pointer"
          aria-label="Close"
        >
          <Icons.X size={16} />
        </button>

        {/* Top Hatched Logo */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xs">
            <HatchedLogo />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center tracking-tight">
          Sign in to KlikPDF
        </h2>
        <p className="text-xs text-zinc-400 text-center mt-1 mb-6">
          {lang === 'id'
            ? 'Masuk untuk mengakses riwayat dan seluruh fitur dokumen'
            : 'Sign in to access your account and use all features'}
        </p>

        {/* Real Google OAuth Login */}
        <div className="space-y-3.5">
          {!isNative && googleClientId ? (
            <div className="flex flex-col items-center justify-center w-full">
              <div className="w-full flex justify-center py-1">
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
                  theme="filled_black"
                  shape="pill"
                  size="large"
                  text="continue_with"
                  width="350"
                />
              </div>
            </div>
          ) : null}
          {/* Info if WebView restricts Google popups */}
          {(isNative || hasGoogleError) && (
            <p className="text-[11px] text-zinc-500 text-center leading-relaxed">
              {lang === 'id'
                ? 'Browser atau aplikasi mendeteksi pembatasan pop-up Google OAuth. Pastikan izin pop-up aktif.'
                : 'Popup restricted. Please allow pop-ups for Google Sign-In.'}
            </p>
          )}
        </div>

        {/* Cloudflare Turnstile / Success Verification Badge (Matching Image #2) */}
        <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/90 flex items-center justify-between mt-5">
          <div className="flex items-center gap-2.5">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-black">
              <Icons.Check size={13} strokeWidth={3} />
            </div>
            <span className="text-xs font-medium text-zinc-200">Success!</span>
          </div>

          {/* Cloudflare Mark */}
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-sans">
            <svg className="w-4 h-4 text-[#F6821F]" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.4 13.2c-.2-.9-.8-1.6-1.6-2-.3-.1-.5-.2-.8-.2-.3-1.6-1.5-2.9-3.1-3.2-1.3-.3-2.6.2-3.5 1.1-.5-.3-1.1-.4-1.7-.3-1 .2-1.8.9-2.1 1.9-.9.2-1.6.8-1.9 1.7-.3.8-.2 1.8.3 2.5.5.7 1.3 1.1 2.2 1.1h11.4c1 0 1.9-.5 2.3-1.4.5-.8.5-1.8-.1-2.6l-1.4 1.4z" />
            </svg>
            <span className="font-bold text-zinc-300">CLOUDFLARE</span>
            <span className="text-zinc-600">•</span>
            <a href="#" className="hover:underline text-zinc-400">
              Privacy
            </a>
            <span className="text-zinc-600">•</span>
            <a href="#" className="hover:underline text-zinc-400">
              Help
            </a>
          </div>
        </div>

        {/* Footer Legal Terms */}
        <p className="text-[11px] text-zinc-500 text-center mt-5 leading-relaxed">
          By signing in, you agree to our{' '}
          <a href="#" className="underline text-zinc-400 hover:text-white transition-colors">
            Terms of Service
          </a>{' '}
          and{' '}
          <a href="#" className="underline text-zinc-400 hover:text-white transition-colors">
            Privacy Policy
          </a>
          .
        </p>
      </div>
    </div>
  );
};