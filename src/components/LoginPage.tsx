import React, { useState } from 'react';
import { Shield, Lock, Mail, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { AegisLogo } from './AegisLogo';
import { AuthUser } from '../types/legal';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    const payload = isRegister
      ? { email: email.trim(), name: name.trim(), password }
      : { email: email.trim(), password };

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed. Please check your credentials.');
      }

      setSuccessMessage(isRegister ? 'Account created successfully!' : 'Authentication verified.');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 400);
    } catch (err: any) {
      setErrorMessage(err.message || 'An error occurred during authentication.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#FAFAF9] flex flex-col justify-between font-sans select-none">
      {/* Top Navbar */}
      <header className="h-16 border-b border-[#E4E4E7] bg-[#FFFFFF] px-6 sm:px-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <AegisLogo size={24} showText={true} theme="dark" />
        </div>
        <div className="flex items-center gap-2 text-xs text-[#71717A]">
          <Shield className="w-3.5 h-3.5 text-[#18181B]" />
          <span>Encrypted Legal Workspace</span>
        </div>
      </header>

      {/* Center Auth Card */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-[#FFFFFF] border border-[#E4E4E7] rounded-2xl shadow-sm overflow-hidden">
          {/* Header Banner */}
          <div className="p-8 pb-6 border-b border-[#E4E4E7] bg-[#FAFAF9]/60">
            <div className="w-10 h-10 rounded-xl bg-[#18181B] text-[#FFFFFF] flex items-center justify-center mb-4 shadow-xs">
              <Lock className="w-5 h-5" />
            </div>
            <h1 className="font-serif text-2xl font-semibold text-[#09090B]">
              {isRegister ? 'Create Legal Workspace' : 'Sign in to Aegis'}
            </h1>
            <p className="text-xs text-[#71717A] mt-1.5 leading-relaxed">
              {isRegister
                ? 'Register your counsel account to review, compare, and audit Indian contracts with cited statutory analysis.'
                : 'Access your encrypted workspace, clause consistency reports, and negotiation simulator.'}
            </p>
          </div>

          {/* Form Area */}
          <div className="p-8 pt-6 space-y-6">
            {/* Mode Switcher */}
            <div className="flex p-1 rounded-xl bg-[#FAFAF9] border border-[#E4E4E7] text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  !isRegister
                    ? 'bg-[#FFFFFF] text-[#09090B] shadow-xs font-semibold'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsRegister(true);
                  setErrorMessage(null);
                  setSuccessMessage(null);
                }}
                className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
                  isRegister
                    ? 'bg-[#FFFFFF] text-[#09090B] shadow-xs font-semibold'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Error or Success Notice */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-2.5 text-xs text-[#991B1B]">
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-xl bg-[#F0FDF4] border border-[#BBF7D0] flex items-center gap-2.5 text-xs text-[#166534]">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#22C55E]" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div className="space-y-1.5">
                  <label className="block text-[11px] font-semibold text-[#52525B] uppercase tracking-wider">
                    Full Name & Title
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-[#71717A]" />
                    <input
                      type="text"
                      required={isRegister}
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Legal Practitioner / Counsel Name"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#FAFAF9] border border-[#E4E4E7] text-xs text-[#09090B] placeholder-[#A1A1AA] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#18181B] transition-colors"
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[11px] font-semibold text-[#52525B] uppercase tracking-wider">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#71717A]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="counsel@chambers.law or practitioner@domain.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#FAFAF9] border border-[#E4E4E7] text-xs text-[#09090B] placeholder-[#A1A1AA] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#18181B] transition-colors"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-[11px] font-semibold text-[#52525B] uppercase tracking-wider">
                    Password
                  </label>
                  {isRegister && (
                    <span className="text-[10px] text-[#71717A]">Min. 6 characters</span>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-[#71717A]" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#FAFAF9] border border-[#E4E4E7] text-xs text-[#09090B] placeholder-[#A1A1AA] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#18181B] transition-colors"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#18181B] hover:bg-[#09090B] disabled:opacity-40 text-[#FFFFFF] text-xs font-medium transition-colors shadow-xs cursor-pointer"
              >
                <span>{isLoading ? 'Verifying...' : isRegister ? 'Create Account & Enter' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Security Guarantee Pills */}
            <div className="pt-2 text-[10px] text-[#71717A] space-y-1.5 border-t border-[#E4E4E7]/60">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#18181B]" />
                <span>Encrypted with AES-256-GCM at rest & in transit</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#18181B]" />
                <span>Complies with India Digital Personal Data Protection Act 2023</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="h-12 border-t border-[#E4E4E7] bg-[#FFFFFF] px-6 flex items-center justify-between text-[11px] text-[#71717A]">
        <div>Aegis Contract Intelligence • India Jurisdiction</div>
        <div>Transfer of Property Act 1882 & Indian Contract Act 1872</div>
      </footer>
    </div>
  );
};
