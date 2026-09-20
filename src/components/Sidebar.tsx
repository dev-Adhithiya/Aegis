import React from 'react';
import {
  FileText,
  GitCompare,
  FolderOpen,
  Plus,
  Scale,
  Shield,
  MessageSquare,
  Layers,
  Briefcase,
  Settings,
} from 'lucide-react';
import { StructuredDocument, AuthUser, Workspace } from '../types/legal';
import { AegisLogo } from './AegisLogo';

interface SidebarProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  documents: StructuredDocument[];
  workspaces?: Workspace[];
  activeDocumentId: string | null;
  onSelectDocument: (docId: string) => void;
  onOpenUpload: () => void;
  onOpenDrive: () => void;
  onOpenCompare: () => void;
  currentUser?: AuthUser | null;
  onOpenSettings?: () => void;
  onOpenCookies?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  setCurrentView,
  documents,
  workspaces = [],
  activeDocumentId,
  onSelectDocument,
  onOpenUpload,
  onOpenDrive,
  onOpenCompare,
  currentUser,
  onOpenSettings,
  onOpenCookies,
}) => {
  return (
    <aside className="w-60 bg-[#0A0A0B] text-[#A1A1AA] flex flex-col h-screen border-r border-[#18181B] select-none shrink-0 font-sans z-20">
      {/* Brand Header with AEGIS Logo */}
      <div className="p-4 border-b border-[#18181B]">
        <button
          onClick={() => setCurrentView('landing')}
          className="cursor-pointer text-left w-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F3F46] rounded-lg"
          id="brand-header-link"
          aria-label="Aegis Legal Intelligence Home"
        >
          <AegisLogo size={24} showText={true} theme="light" />
        </button>
      </div>

      {/* Primary Action: + Upload Document */}
      <div className="p-3">
        <button
          id="btn-new-document"
          onClick={onOpenUpload}
          className="w-full flex items-center justify-center gap-2 bg-[#FFFFFF] hover:bg-[#F4F4F5] text-[#09090B] font-medium text-xs py-2 px-3 rounded-xl transition-colors"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Upload Document</span>
        </button>
      </div>

      {/* Main Navigation */}
      <div className="px-3 py-1 space-y-1 text-xs font-medium">
        {/* Workspaces / Case Matters */}
        <button
          id="nav-item-workspaces"
          onClick={() => setCurrentView('workspaces')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
            currentView === 'workspaces'
              ? 'bg-[#18181B] text-[#FFFFFF]'
              : 'hover:bg-[#18181B]/50 text-[#71717A] hover:text-[#FFFFFF]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Briefcase className="w-3.5 h-3.5" />
            <span>Workspaces</span>
          </div>
          {workspaces.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#27272A] text-[#A1A1AA] rounded-md">
              {workspaces.length}
            </span>
          )}
        </button>

        {/* Documents */}
        <button
          id="nav-item-documents"
          onClick={() => setCurrentView('landing')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
            currentView === 'landing' || currentView === 'document'
              ? 'bg-[#18181B] text-[#FFFFFF]'
              : 'hover:bg-[#18181B]/50 text-[#71717A] hover:text-[#FFFFFF]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <FileText className="w-3.5 h-3.5" />
            <span>Documents</span>
          </div>
          {documents.length > 0 && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 bg-[#27272A] text-[#A1A1AA] rounded-md">
              {documents.length}
            </span>
          )}
        </button>

        {/* Citation Q&A Separate Page */}
        <button
          id="nav-item-citation-qa"
          onClick={() => setCurrentView('citation-qa')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
            currentView === 'citation-qa'
              ? 'bg-[#18181B] text-[#FFFFFF]'
              : 'hover:bg-[#18181B]/50 text-[#71717A] hover:text-[#FFFFFF]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Citation Q&A</span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#27272A] text-[#10B981] rounded-md font-semibold">
            PRACTICE
          </span>
        </button>

        {/* Encrypted Vault */}
        <button
          id="nav-item-vault"
          onClick={() => setCurrentView('vault')}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
            currentView === 'vault'
              ? 'bg-[#18181B] text-[#FFFFFF]'
              : 'hover:bg-[#18181B]/50 text-[#71717A] hover:text-[#FFFFFF]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Layers className="w-3.5 h-3.5" />
            <span>Vault</span>
          </div>
          <span className="text-[9px] font-mono px-1.5 py-0.5 bg-[#27272A] text-[#A1A1AA] rounded-md">
            AES-256
          </span>
        </button>

        <button
          id="nav-item-compare"
          onClick={onOpenCompare}
          className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors ${
            currentView === 'compare'
              ? 'bg-[#18181B] text-[#FFFFFF]'
              : 'hover:bg-[#18181B]/50 text-[#71717A] hover:text-[#FFFFFF]'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <GitCompare className="w-3.5 h-3.5" />
            <span>Compare</span>
          </div>
        </button>

        <button
          id="nav-item-gdrive"
          onClick={onOpenDrive}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl hover:bg-[#18181B]/50 text-[#71717A] hover:text-[#FFFFFF] transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <FolderOpen className="w-3.5 h-3.5" />
            <span>Cloud Storage</span>
          </div>
        </button>
      </div>

      {/* Documents List */}
      <div className="flex-1 overflow-y-auto px-3 py-3 border-t border-[#18181B] mt-2">
        <div className="px-2.5 mb-2 text-[10px] uppercase tracking-wider font-semibold text-[#52525B]">
          Active Contracts
        </div>

        {documents.length === 0 ? (
          <div className="px-2.5 py-4 text-[11px] text-[#52525B] leading-relaxed">
            No contracts loaded. Drop a file to begin review.
          </div>
        ) : (
          <div className="space-y-1">
            {documents.map(doc => {
              const isActive = activeDocumentId === doc.id && (currentView === 'document' || currentView === 'citation-qa');
              const flagCount = doc.riskFlags.length;

              return (
                <button
                  key={doc.id}
                  id={`sidebar-doc-${doc.id}`}
                  onClick={() => {
                    onSelectDocument(doc.id);
                    setCurrentView('document');
                  }}
                  className={`w-full text-left px-2.5 py-2 rounded-xl transition-colors ${
                    isActive
                      ? 'bg-[#18181B] text-[#FFFFFF]'
                      : 'hover:bg-[#18181B]/40 text-[#A1A1AA] hover:text-[#FFFFFF]'
                  }`}
                >
                  <div className="flex items-center justify-between gap-1">
                    <span className="truncate text-xs font-medium block">
                      {doc.name}
                    </span>
                    {flagCount > 0 && (
                      <span className="text-[9px] font-mono px-1 py-0.5 rounded-md bg-[#27272A] text-[#D4D4D8] shrink-0">
                        {flagCount}
                      </span>
                    )}
                  </div>
                  <div className="text-[10px] text-[#52525B] mt-0.5 truncate">
                    {doc.docType === 'lease' ? 'Lease (TPA 1882)' : 'NDA (ICA 1872)'}
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Jurisdiction & Guardrail Notice */}
      <div className="px-4 py-2.5 bg-[#0A0A0B] border-t border-[#18181B] text-[10px] text-[#52525B] space-y-1">
        <div className="flex items-center justify-between text-[#71717A] font-medium">
          <div className="flex items-center gap-1">
            <Scale className="w-3 h-3" />
            <span>India Law Engine</span>
          </div>
          <span className="flex items-center gap-1 text-[9px] text-[#A1A1AA] font-mono">
            <Shield className="w-2.5 h-2.5 text-[#10B981]" />
            <span>AES-256</span>
          </span>
        </div>
        <p className="leading-tight text-[9px]">
          TPA 1882 & ICA 1872 • DPDP Act 2023 Compliant
        </p>
      </div>

      {/* Bottom-Left Profile (Only Name/Email, Clicking Opens Settings Panel) */}
      <button
        id="btn-profile-settings"
        onClick={onOpenSettings}
        className="p-3 border-t border-[#18181B] bg-[#0A0A0B] cursor-pointer hover:bg-[#18181B]/50 transition-colors flex items-center justify-between gap-2 w-full text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#3F3F46]"
        title="Account & Security Settings"
        aria-label="Account & Security Settings"
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-xl bg-[#18181B] border border-[#27272A] flex items-center justify-center text-[#FFFFFF] text-xs shrink-0 font-medium">
            {currentUser ? currentUser.name.charAt(0).toUpperCase() : 'A'}
          </div>
          <div className="leading-tight truncate">
            <div className="text-xs font-semibold text-[#E4E4E7] truncate">
              {currentUser?.name || 'Legal Practitioner'}
            </div>
            <div className="text-[11px] text-[#71717A] truncate">
              {currentUser?.email || 'Active Session'}
            </div>
          </div>
        </div>

        <Settings className="w-4 h-4 text-[#71717A] shrink-0" aria-hidden="true" />
      </button>
    </aside>
  );
};
