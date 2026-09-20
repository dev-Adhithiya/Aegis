import React, { useState, useEffect } from 'react';
import { Cookie, X, Shield } from 'lucide-react';

interface CookieBannerProps {
  onOpenPreferences: () => void;
}

export const CookieBanner: React.FC<CookieBannerProps> = ({ onOpenPreferences }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem('aegis_cookie_consent');
    if (!consent) {
      // Show banner after brief delay
      const timer = setTimeout(() => setIsVisible(true), 600);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('aegis_cookie_consent', 'accepted');
    setIsVisible(false);
  };

  const handleDismiss = () => {
    localStorage.setItem('aegis_cookie_consent', 'dismissed');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Cookie consent"
      className="fixed bottom-4 right-4 left-4 sm:left-auto sm:max-w-md z-40 bg-[#FFFFFF] border border-[#E4E4E7] shadow-xl rounded-2xl p-4 animate-in slide-in-from-bottom-5 duration-300 font-sans"
    >
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center shrink-0 text-[#18181B] mt-0.5">
          <Cookie className="w-4 h-4 text-[#D97706]" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-xs font-semibold text-[#09090B] flex items-center gap-1.5">
              <span>Security & Essential Cookies</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#065F46] font-normal border border-[#A7F3D0]">
                DPDP 2023
              </span>
            </h2>
            <button
              onClick={handleDismiss}
              className="text-[#71717A] hover:text-[#09090B] p-1 rounded-lg hover:bg-[#F4F4F5] transition-colors"
              title="Dismiss notice"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <p className="text-[11px] text-[#71717A] mt-1 leading-relaxed">
            Aegis uses essential HttpOnly cookies to authenticate your legal session and defend against CSRF attacks. No third-party ad trackers are used.
          </p>

          <div className="flex items-center gap-2 mt-3 pt-1">
            <button
              onClick={handleAccept}
              className="px-3 py-1.5 rounded-xl bg-[#18181B] hover:bg-[#27272A] text-[#FFFFFF] text-xs font-medium transition-colors"
            >
              Acknowledge & Proceed
            </button>
            <button
              onClick={() => {
                handleDismiss();
                onOpenPreferences();
              }}
              className="px-3 py-1.5 rounded-xl border border-[#E4E4E7] hover:bg-[#FAFAF9] text-[#71717A] hover:text-[#09090B] text-xs font-medium transition-colors"
            >
              Preferences
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
