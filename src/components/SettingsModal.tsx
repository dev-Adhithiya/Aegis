import React, { useState } from 'react';
import {
  X,
  User,
  KeyRound,
  ShieldCheck,
  Lock,
  Cookie,
  CheckCircle2,
  AlertCircle,
  Save,
} from 'lucide-react';
import { AuthUser } from '../types/legal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: AuthUser | null;
  onUpdateProfile?: (newName: string) => Promise<void>;
  onOpenCookies?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateProfile,
  onOpenCookies,
}) => {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'security'>('profile');
  const [name, setName] = useState(currentUser?.name || '');
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  if (!isOpen) return null;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Display name cannot be empty.' });
      return;
    }
    setIsLoading(true);
    setStatusMessage(null);
    try {
      if (onUpdateProfile) {
        await onUpdateProfile(name);
      } else {
        const res = await fetch('/api/auth/profile', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name }),
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || 'Failed to update profile.');
        }
      }
      setStatusMessage({ type: 'success', text: 'Profile name updated successfully.' });
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Error updating profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 6) {
      setStatusMessage({ type: 'error', text: 'New password must be at least 6 characters.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setStatusMessage({ type: 'error', text: 'New passwords do not match.' });
      return;
    }

    setIsLoading(true);
    setStatusMessage(null);
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Password update failed.');
      }
      setStatusMessage({ type: 'success', text: 'Password reset successfully.' });
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to reset password.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E4E4E7] w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E4E4E7] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center text-[#18181B]">
              <User className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#09090B]">Account & Security Settings</h2>
              <p className="text-xs text-[#71717A]">Manage practitioner profile and encryption credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-[#F4F4F5] text-[#71717A] hover:text-[#09090B] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-[#E4E4E7] px-6 bg-[#FAFAF9] gap-4">
          <button
            onClick={() => { setActiveTab('profile'); setStatusMessage(null); }}
            className={`py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'profile'
                ? 'border-[#18181B] text-[#09090B]'
                : 'border-transparent text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            Profile Details
          </button>
          <button
            onClick={() => { setActiveTab('password'); setStatusMessage(null); }}
            className={`py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'password'
                ? 'border-[#18181B] text-[#09090B]'
                : 'border-transparent text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            Change Password
          </button>
          <button
            onClick={() => { setActiveTab('security'); setStatusMessage(null); }}
            className={`py-3 text-xs font-medium border-b-2 transition-colors ${
              activeTab === 'security'
                ? 'border-[#18181B] text-[#09090B]'
                : 'border-transparent text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            Security & Compliance
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {statusMessage && (
            <div
              className={`mb-4 p-3 rounded-xl flex items-center gap-2.5 text-xs ${
                statusMessage.type === 'success'
                  ? 'bg-[#ECFDF5] border border-[#A7F3D0] text-[#065F46]'
                  : 'bg-[#FEF2F2] border border-[#FECACA] text-[#991B1B]'
              }`}
            >
              {statusMessage.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-[#10B981]" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
              )}
              <span>{statusMessage.text}</span>
            </div>
          )}

          {activeTab === 'profile' && (
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#09090B] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  disabled
                  value={currentUser?.email || 'askadhithiya@gmail.com'}
                  className="w-full px-3 py-2 text-xs bg-[#F4F4F5] border border-[#E4E4E7] rounded-xl text-[#71717A] cursor-not-allowed"
                />
                <p className="text-[11px] text-[#71717A] mt-1">
                  Primary identifier for authenticated AES-256-GCM document vaults.
                </p>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#09090B] mb-1">
                  Display Name / Title
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Adv. Adhithiya"
                  className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#E4E4E7] rounded-xl text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#18181B]/10 focus:border-[#18181B]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#18181B] hover:bg-[#27272A] text-[#FFFFFF] rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Saving...' : 'Save Profile'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'password' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#09090B] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#E4E4E7] rounded-xl text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#18181B]/10 focus:border-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#09090B] mb-1">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#E4E4E7] rounded-xl text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#18181B]/10 focus:border-[#18181B]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#09090B] mb-1">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm new password"
                  className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#E4E4E7] rounded-xl text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#18181B]/10 focus:border-[#18181B]"
                />
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-2 bg-[#18181B] hover:bg-[#27272A] text-[#FFFFFF] rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Updating...' : 'Update Password'}</span>
                </button>
              </div>
            </form>
          )}

          {activeTab === 'security' && (
            <div className="space-y-4 text-xs">
              <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAF9] space-y-2">
                <div className="flex items-center gap-2 text-[#09090B] font-medium">
                  <Lock className="w-4 h-4 text-[#10B981]" />
                  <span>Payload Encryption</span>
                </div>
                <p className="text-[#71717A] text-[11px] leading-relaxed">
                  All uploaded agreements and analysis summaries are encrypted with authenticated <strong>AES-256-GCM</strong> using per-record Initialization Vectors.
                </p>
              </div>

              <div className="p-3.5 rounded-xl border border-[#E4E4E7] bg-[#FAFAF9] space-y-2">
                <div className="flex items-center gap-2 text-[#09090B] font-medium">
                  <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
                  <span>DPDP Act 2023 Governance</span>
                </div>
                <p className="text-[#71717A] text-[11px] leading-relaxed">
                  Data processing adheres to Section 6 of India Digital Personal Data Protection Act 2023. Privileged legal contracts are never persisted in unencrypted formats.
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#E4E4E7]">
                <span className="text-[#71717A]">Cookie Preferences</span>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onOpenCookies) onOpenCookies();
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#E4E4E7] hover:bg-[#FAFAF9] text-[#09090B] font-medium text-xs transition-colors"
                >
                  <Cookie className="w-3.5 h-3.5" />
                  <span>Manage Cookies</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
