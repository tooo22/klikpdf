import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
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
  const { isLoginModalOpen, setIsLoginModalOpen, loginCustom } = useAuth();
  const { lang } = useLanguage();

  const [authTab, setAuthTab] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSuccessFeedback, setIsSuccessFeedback] = useState(false);

  if (!isLoginModalOpen) return null;

  const handleFormSubmit = (e) => {
    e.preventDefault();
    const resolvedName = email ? email.split('@')[0] : 'Ardiansyah';
    const resolvedEmail = email || 'ardiansyah@klikpdf.my.id';
    setIsSuccessFeedback(true);
    setTimeout(() => {
      loginCustom(resolvedName, resolvedEmail);
      setIsSuccessFeedback(false);
      setIsLoginModalOpen(false);
    }, 400);
  };

  const handleGoogleClick = () => {
    loginCustom('Ardiansyah', 'ardiansyah@klikpdf.my.id');
    setIsLoginModalOpen(false);
  };

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

        {/* Top Logo */}
        <div className="flex justify-center mb-3">
          <div className="w-10 h-10 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xs">
            <HatchedLogo />
          </div>
        </div>

        {/* Title & Subtitle */}
        <h2 className="text-xl sm:text-2xl font-bold text-white text-center tracking-tight">
          Sign in to Aura
        </h2>
        <p className="text-xs text-zinc-400 text-center mt-1 mb-6">
          Sign in to access your account and use all features
        </p>

        {/* Continue with Google Button */}
        <button
          type="button"
          onClick={handleGoogleClick}
          className="w-full py-2.5 px-4 rounded-xl bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/70 text-white font-medium text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-sm active:scale-98"
        >
          <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider: ── OR ── */}
        <div className="relative my-5 flex items-center justify-center">
          <div className="w-full border-t border-zinc-800"></div>
          <span className="absolute bg-[#121214] px-3 text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
            OR
          </span>
        </div>

        {/* Segmented Tabs Switcher: [ Sign In | Sign Up ] */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800 mb-4">
          <button
            type="button"
            onClick={() => setAuthTab('signin')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              authTab === 'signin'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setAuthTab('signup')}
            className={`py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              authTab === 'signup'
                ? 'bg-zinc-800 text-white shadow-xs'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* Email & Password Form */}
        <form onSubmit={handleFormSubmit} className="space-y-3.5">
          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-sans"
            />
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-zinc-300">
                Password
              </label>
              {authTab === 'signin' && (
                <button
                  type="button"
                  onClick={() => alert('Fitur pemulihan kata sandi telah dikirim ke email.')}
                  className="text-xs text-zinc-400 hover:text-white transition-colors cursor-pointer"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-xl bg-zinc-900/60 border border-zinc-800 text-white text-xs placeholder:text-zinc-600 focus:outline-none focus:border-zinc-500 transition-colors font-sans"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-zinc-200 text-black font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm active:scale-98 mt-4"
          >
            <Icons.Mail size={16} />
            <span>{authTab === 'signin' ? 'Sign in with Email' : 'Sign up with Email'}</span>
          </button>
        </form>

        {/* Cloudflare Turnstile / Success Verification Badge (Matching Image #2) */}
        <div className="p-3 rounded-xl bg-zinc-900/70 border border-zinc-800/90 flex items-center justify-between mt-4">
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