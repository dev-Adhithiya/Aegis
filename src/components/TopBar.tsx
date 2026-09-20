import React, { useState } from 'react';
import {
  Download,
  ChevronDown,
  FileText,
  LogOut,
} from 'lucide-react';
import { StructuredDocument } from '../types/legal';

interface TopBarProps {
  documents: StructuredDocument[];
  activeDocument: StructuredDocument;
  onSelectDocument: (docId: string) => void;
  onOpenExport: () => void;
  onLogout: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  documents,
  activeDocument,
  onSelectDocument,
  onOpenExport,
  onLogout,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="h-14 border-b border-[#E4E4E7] bg-[#FFFFFF] px-4 sm:px-6 flex items-center justify-between gap-3 shrink-0 z-10 font-sans select-none">
      {/* Left: Which Contract It Is (Selector) */}
      <div className="flex items-center gap-3 min-w-0">
        <div className="relative">
          <button
            id="btn-matter-dropdown"
            onClick={() => setDropdownOpen(!dropdownOpen)}
            aria-expanded={dropdownOpen}
            aria-haspopup="listbox"
            aria-label={`Current contract: ${activeDocument.name}. Click to switch contract`}
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold text-[#09090B] hover:text-[#27272A] px-3 py-1.5 rounded-xl hover:bg-[#FAFAF9] border border-transparent hover:border-[#E4E4E7] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#18181B]"
            title="Switch Contract Matter"
          >
            <FileText className="w-4 h-4 text-[#18181B] shrink-0" aria-hidden="true" />
            <span className="truncate max-w-[240px] sm:max-w-[380px]">
              {activeDocument.name}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-[#71717A] shrink-0" aria-hidden="true" />
          </button>

          {/* Document Switcher Dropdown */}
          {dropdownOpen && (
            <div
              role="listbox"
              aria-label="Active Contracts"
              className="absolute top-full left-0 mt-1 w-80 bg-[#FFFFFF] border border-[#E4E4E7] rounded-2xl shadow-xl py-1 z-30 text-xs animate-in fade-in duration-100 overflow-hidden"
            >
              <div className="px-3.5 py-2 text-[10px] uppercase font-semibold text-[#71717A] border-b border-[#E4E4E7]">
                Active Contracts
              </div>
              <div className="max-h-60 overflow-y-auto p-1 space-y-0.5">
                {documents.map(doc => (
                  <button
                    key={doc.id}
                    role="option"
                    aria-selected={doc.id === activeDocument.id}
                    onClick={() => {
                      onSelectDocument(doc.id);
                      setDropdownOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl flex items-center justify-between hover:bg-[#FAFAF9] transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#18181B] ${
                      doc.id === activeDocument.id
                        ? 'bg-[#F4F4F5] font-semibold text-[#09090B]'
                        : 'text-[#52525B]'
                    }`}
                  >
                    <span className="truncate">{doc.name}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#FAFAF9] border border-[#E4E4E7] text-[#71717A] font-mono shrink-0 ml-2">
                      {doc.docType.toUpperCase()}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: ONLY Export Button & Logout Button */}
      <div className="flex items-center gap-2">
        <button
          id="btn-topbar-export"
          onClick={onOpenExport}
          className="flex items-center gap-1.5 text-xs font-medium text-[#18181B] bg-[#FFFFFF] hover:bg-[#F4F4F5] border border-[#E4E4E7] px-3.5 py-1.5 rounded-xl transition-colors shadow-2xs"
          title="Export advisory memo & contract summary"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Export</span>
        </button>

        <button
          id="btn-topbar-logout"
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs font-medium text-[#71717A] hover:text-[#09090B] hover:bg-[#FAFAF9] px-3.5 py-1.5 rounded-xl border border-transparent hover:border-[#E4E4E7] transition-colors"
          title="Sign out of Aegis"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </header>
  );
};
