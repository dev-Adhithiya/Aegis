import React, { useState, useEffect } from 'react';
import { Shield, Cookie, Trash2, CheckCircle2, Lock, AlertTriangle, ExternalLink, RefreshCw } from 'lucide-react';
import { CookieItem } from '../types/legal';

interface CookieManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogout?: () => void;
}

export const CookieManagementModal: React.FC<CookieManagementModalProps> = ({
  isOpen,
  onClose,
  onLogout,
}) => {
  const [cookies, setCookies] = useState<CookieItem[]>([]);
  const [dpdpNotice, setDpdpNotice] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [functionalCookiesEnabled, setFunctionalCookiesEnabled] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchCookieStatus = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/cookies/status');
        if (res.ok) {
          const data = await res.json();
          setCookies(data.cookies || []);
          setDpdpNotice(data.dpdpNotice || '');
        }
      } catch (err) {
        console.error('Failed to fetch cookie status:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCookieStatus();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleClearOptional = async () => {
    try {
      const res = await fetch('/api/cookies/clear', { method: 'POST' });
      if (res.ok) {
        setFunctionalCookiesEnabled(false);
        setActionNotice('Optional preference cookies cleared.');
        setTimeout(() => setActionNotice(null), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleRevokeAll = async () => {
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      if (onLogout) {
        onLogout();
      }
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#09090B]/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-2xl bg-[#FFFFFF] rounded-xl border border-[#E4E4E7] shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 border-b border-[#E4E4E7] bg-[#FAFAF9] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded bg-[#FFFFFF] border border-[#E4E4E7] text-[#18181B]">
              <Cookie className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-base font-semibold text-[#09090B] tracking-tight">
                Cookie & Session Security Management
              </h2>
              <p className="text-xs text-[#71717A]">
                India Digital Personal Data Protection (DPDP) Act 2023 & Security Auditing
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#09090B] p-1.5 rounded hover:bg-[#E4E4E7]/60 text-xs transition-colors"
          >
            ✕
          </button>
        </div>

        {/* Content Area */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {actionNotice && (
            <div className="p-3 rounded-lg bg-[#F0FDF4] border border-[#86EFAC] text-xs text-[#166534] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{actionNotice}</span>
            </div>
          )}

          {/* DPDP Legal Compliance Box */}
          <div className="p-3.5 rounded-lg bg-[#FAFAF9] border border-[#E4E4E7] space-y-1.5">
            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#09090B]">
              <Shield className="w-3.5 h-3.5 text-[#18181B]" />
              <span>Statutory Data Protection Notice</span>
            </div>
            <p className="text-xs text-[#3F3F46] leading-relaxed">
              {dpdpNotice ||
                'Under the Digital Personal Data Protection Act 2023 (India), Aegis processes necessary authentication cookies strictly for maintaining encrypted session boundaries and document confidentiality. No third-party tracking or advertising beacons are deployed.'}
            </p>
          </div>

          {/* Active Cookies List */}
          <div className="space-y-2.5">
            <div className="text-[11px] font-semibold text-[#09090B] flex items-center justify-between">
              <span>Active Cookies in Your Browser</span>
              <span className="text-[10px] text-[#71717A] font-mono">3 Registered</span>
            </div>

            <div className="space-y-2">
              {cookies.map((cookie, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7] space-y-2 hover:border-[#D4D4D8] transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-[#09090B]">
                        {cookie.name}
                      </span>
                      <span
                        className={`text-[9px] font-medium px-1.5 py-0.5 rounded border uppercase tracking-wider ${
                          cookie.category === 'essential'
                            ? 'bg-[#F4F4F5] text-[#18181B] border-[#D4D4D8]'
                            : cookie.category === 'security'
                            ? 'bg-[#FAFAF9] text-[#18181B] border-[#E4E4E7]'
                            : 'bg-[#FFFFFF] text-[#71717A] border-[#E4E4E7]'
                        }`}
                      >
                        {cookie.category}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-[10px] text-[#71717A]">
                      {cookie.isHttpOnly && (
                        <span className="flex items-center gap-1 font-mono text-[#18181B]">
                          <Lock className="w-2.5 h-2.5" />
                          <span>HttpOnly</span>
                        </span>
                      )}
                      <span>TTL: {cookie.expiry}</span>
                    </div>
                  </div>

                  <p className="text-xs text-[#3F3F46] leading-relaxed">
                    {cookie.purpose}
                  </p>

                  <div className="flex items-center justify-between pt-1 border-t border-[#F4F4F5] text-[10px] text-[#71717A]">
                    <span className="font-mono">Value: {cookie.valueMasked}</span>
                    {cookie.canDisable ? (
                      <label className="flex items-center gap-1.5 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={functionalCookiesEnabled}
                          onChange={e => {
                            setFunctionalCookiesEnabled(e.target.checked);
                            if (!e.target.checked) handleClearOptional();
                          }}
                          className="rounded border-[#D4D4D8] text-[#18181B] focus:ring-0"
                        />
                        <span>Enabled</span>
                      </label>
                    ) : (
                      <span className="text-[#71717A] font-medium">Strictly Required</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Guarantee List */}
          <div className="p-3.5 rounded-lg bg-[#FAFAF9] border border-[#E4E4E7] space-y-1.5 text-[11px] text-[#3F3F46]">
            <div className="font-semibold text-[#09090B]">Security & Storage Guarantees:</div>
            <ul className="space-y-1">
              <li>• All confidential contract text stored in memory is encrypted with AES-256-GCM.</li>
              <li>• Sessions are validated server-side to prevent Insecure Direct Object References (IDOR).</li>
              <li>• Authentication tokens are sealed with SameSite=Lax/Strict and HttpOnly flags.</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-[#E4E4E7] bg-[#FAFAF9] flex items-center justify-between gap-3">
          <button
            onClick={handleRevokeAll}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#FFFFFF] hover:bg-[#FEF2F2] border border-[#FCA5A5] text-xs font-medium text-[#991B1B] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Revoke All & Sign Out</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={handleClearOptional}
              className="px-3 py-1.5 rounded bg-[#FFFFFF] hover:bg-[#F4F4F5] border border-[#E4E4E7] text-xs font-medium text-[#18181B] transition-colors"
            >
              Clear Optional Cookies
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded bg-[#18181B] hover:bg-[#09090B] text-xs font-medium text-[#FFFFFF] transition-colors"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
