import React, { useState } from 'react';
import { Shield, Lock, Mail, User as UserIcon, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { AegisLogo } from './AegisLogo';
import { AuthUser } from '../types/legal';

interface LoginPageProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLoginSuccess }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('askadhithiya@gmail.com');
  const [password, setPassword] = useState('aegis1234');
  const [name, setName] = useState('Adv. Adhithiya');
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

  const handleQuickSignIn = async () => {
    setEmail('askadhithiya@gmail.com');
    setPassword('aegis1234');
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'askadhithiya@gmail.com', password: 'aegis1234' }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Quick login failed.');

      setSuccessMessage('Welcome back, Adv. Adhithiya.');
      setTimeout(() => {
        onLoginSuccess(data.user);
      }, 350);
    } catch (err: any) {
      setErrorMessage(err.message);
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

      {/* Main Login Card */}
      <main className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md bg-[#FFFFFF] rounded-2xl border border-[#E4E4E7] shadow-sm overflow-hidden flex flex-col">
          {/* Card Header */}
          <div className="p-7 sm:p-8 border-b border-[#E4E4E7] bg-[#FAFAF9] text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-xl bg-[#09090B] flex items-center justify-center text-[#FFFFFF] shadow-sm">
              <AegisLogo size={26} showText={false} theme="light" />
            </div>
            <h1 className="font-serif text-xl sm:text-2xl font-semibold text-[#09090B] tracking-tight pt-1">
              {isRegister ? 'Create Aegis Account' : 'Sign In to Aegis'}
            </h1>
            <p className="text-xs text-[#71717A] max-w-xs mx-auto">
              Indian Statutory Contract Intelligence & Citation-Grounded Advisory
            </p>
          </div>

          {/* Form Area */}
          <div className="p-7 sm:p-8 space-y-5">
            {/* Mode Switcher */}
            <div className="grid grid-cols-2 gap-1 p-1 bg-[#F4F4F5] rounded-lg text-xs font-medium">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(false);
                  setErrorMessage(null);
                }}
                className={`py-2 rounded-md transition-colors ${
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
                }}
                className={`py-2 rounded-md transition-colors ${
                  isRegister
                    ? 'bg-[#FFFFFF] text-[#09090B] shadow-xs font-semibold'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                Register
              </button>
            </div>

            {/* Error / Success Alerts */}
            {errorMessage && (
              <div className="p-3.5 rounded-lg bg-[#FEF2F2] border border-[#FCA5A5] text-xs text-[#991B1B] flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{errorMessage}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3.5 rounded-lg bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#166534] flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMessage}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {isRegister && (
                <div>
                  <label className="block text-xs font-medium text-[#09090B] mb-1.5">
                    Full Legal Name
                  </label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 absolute left-3.5 top-3 text-[#71717A]" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="Adv. Adhithiya"
                      className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#FAFAF9] border border-[#E4E4E7] text-xs text-[#09090B] placeholder-[#A1A1AA] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#18181B] transition-colors"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-[#09090B] mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[#71717A]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="askadhithiya@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-lg bg-[#FAFAF9] border border-[#E4E4E7] text-xs text-[#09090B] placeholder-[#A1A1AA] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#18181B] transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#09090B] mb-1.5">
                  Password
                </label>
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
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg bg-[#18181B] hover:bg-[#09090B] disabled:opacity-40 text-[#FFFFFF] text-xs font-medium transition-colors shadow-xs"
              >
                <span>{isLoading ? 'Verifying...' : isRegister ? 'Create Account & Enter' : 'Sign In'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>

            {/* Quick 1-Click Login Option */}
            <div className="pt-2 border-t border-[#E4E4E7] text-center">
              <button
                type="button"
                onClick={handleQuickSignIn}
                disabled={isLoading}
                className="w-full py-2.5 px-3 rounded-lg bg-[#FAFAF9] hover:bg-[#F4F4F5] border border-[#E4E4E7] text-xs text-[#18181B] font-medium flex items-center justify-center gap-2 transition-colors"
              >
                <span>⚡ Instant Sign In as Adv. Adhithiya</span>
              </button>
            </div>

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
