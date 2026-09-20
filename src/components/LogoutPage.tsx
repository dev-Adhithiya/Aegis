import React, { useEffect, useState } from 'react';
import { ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { AegisLogo } from './AegisLogo';

interface LogoutPageProps {
  onRedirectToLogin: () => void;
}

export const LogoutPage: React.FC<LogoutPageProps> = ({ onRedirectToLogin }) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    // Perform server-side session cleanup
    fetch('/api/auth/logout', { method: 'POST' }).catch(err => console.warn('Logout error:', err));

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          onRedirectToLogin();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [onRedirectToLogin]);

  return (
    <div className="min-h-screen w-full bg-[#FAFAF9] flex flex-col justify-between font-sans select-none">
      {/* Top Bar */}
      <header className="h-16 border-b border-[#E4E4E7] bg-[#FFFFFF] px-6 sm:px-10 flex items-center justify-between">
        <AegisLogo size={24} showText={true} theme="dark" />
        <div className="flex items-center gap-1.5 text-xs text-[#71717A]">
          <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
          <span>Session Terminated</span>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#FFFFFF] rounded-2xl border border-[#E4E4E7] shadow-sm p-8 text-center space-y-6">
          <div className="w-14 h-14 mx-auto rounded-full bg-[#FAFAF9] border border-[#E4E4E7] flex items-center justify-center text-[#09090B]">
            <AegisLogo size={28} showText={false} theme="dark" />
          </div>

          <div className="space-y-2">
            <h1 className="font-serif text-2xl font-semibold text-[#09090B] tracking-tight">
              Signed Out of Aegis
            </h1>
            <p className="text-xs text-[#71717A] leading-relaxed max-w-sm mx-auto">
              Your privileged session has been safely closed. Encrypted in-memory document handles have been cleared.
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#FAFAF9] border border-[#E4E4E7] space-y-2 text-xs text-[#3F3F46]">
            <div className="flex items-center justify-center gap-2 text-[#166534] font-medium">
              <CheckCircle2 className="w-4 h-4 text-[#166534]" />
              <span>HttpOnly Session Token Purged</span>
            </div>
            <p className="text-[11px] text-[#71717A]">
              Redirecting to Aegis Login in <strong className="text-[#09090B] font-mono">{countdown}s</strong>...
            </p>
          </div>

          <button
            onClick={onRedirectToLogin}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#18181B] hover:bg-[#09090B] text-[#FFFFFF] text-xs font-medium transition-colors shadow-xs"
          >
            <span>Return to Login Immediately</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-[#E4E4E7] bg-[#FFFFFF] px-6 flex items-center justify-center text-[11px] text-[#71717A]">
        Aegis Encrypted Legal Workspace • DPDP Act 2023 Compliant
      </footer>
    </div>
  );
};
