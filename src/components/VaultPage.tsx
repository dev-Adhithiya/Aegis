import React, { useState } from 'react';
import {
  Shield,
  Layers,
  FileText,
  Download,
  Trash2,
  Lock,
  ArrowLeft,
  Plus,
  CheckCircle2,
  Search,
  ExternalLink,
  Award,
} from 'lucide-react';
import { VaultItem, StructuredDocument } from '../types/legal';
import { AegisLogo } from './AegisLogo';

interface VaultPageProps {
  vaultItems: VaultItem[];
  documents: StructuredDocument[];
  onBackToMain: () => void;
  onDeleteItem: (id: string) => void;
  onSelectDocument: (docId: string) => void;
}

export const VaultPage: React.FC<VaultPageProps> = ({
  vaultItems,
  documents,
  onBackToMain,
  onDeleteItem,
  onSelectDocument,
}) => {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<VaultItem | null>(null);

  const filteredItems = vaultItems.filter(item => {
    const matchesFilter = activeFilter === 'all' || item.category === activeFilter;
    const matchesSearch =
      item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.documentName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleDownload = (item: VaultItem) => {
    let content = '';
    if (typeof item.fullData === 'string') {
      content = item.fullData;
    } else if (item.fullData) {
      content = JSON.stringify(item.fullData, null, 2);
    } else {
      content = `AEGIS VAULT SECURE RECORD\nTitle: ${item.title}\nDocument: ${item.documentName}\nEncrypted: AES-256-GCM\nDate: ${item.createdAt}\n\n${item.contentSnippet || ''}`;
    }

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${item.title.replace(/\s+/g, '_')}_Vault.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAF9] font-sans antialiased text-[#18181B] select-none">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header */}
        <header className="h-14 border-b border-[#E4E4E7] bg-[#FFFFFF] px-6 flex items-center justify-between gap-4 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToMain}
              className="flex items-center gap-1.5 text-xs font-medium text-[#71717A] hover:text-[#09090B] p-1.5 rounded hover:bg-[#FAFAF9] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Workspace</span>
            </button>

            <span className="text-[#E4E4E7]">|</span>

            <div className="flex items-center gap-2">
              <AegisLogo size={20} showText={false} theme="dark" />
              <h1 className="font-serif text-sm sm:text-base font-semibold text-[#09090B]">
                Aegis Encrypted Vault
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-[#71717A]">
            <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#FAFAF9] border border-[#E4E4E7] font-mono text-[11px] text-[#09090B]">
              <Shield className="w-3.5 h-3.5 text-[#10B981]" />
              <span>AES-256-GCM At-Rest</span>
            </span>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 select-text">
          <div className="max-w-5xl mx-auto space-y-6">
            {/* Vault Summary Banner */}
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-xs flex flex-wrap items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-serif text-lg font-semibold text-[#09090B]">
                    Privileged Document Repository
                  </span>
                  <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-[#FAFAF9] border border-[#E4E4E7] text-[#18181B]">
                    Zero-Knowledge Encryption
                  </span>
                </div>
                <p className="text-xs text-[#71717A] max-w-xl">
                  Contracts, structured analysis outputs, oral feedback records, and legal advisory memos stored with military-grade encryption in compliance with the Digital Personal Data Protection Act 2023.
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <div className="text-2xl font-semibold text-[#09090B]">
                    {vaultItems.length}
                  </div>
                  <div className="text-[11px] text-[#71717A]">Secured Artifacts</div>
                </div>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5 bg-[#FFFFFF] p-1 rounded-xl border border-[#E4E4E7] text-xs">
                {[
                  { id: 'all', label: 'All Items' },
                  { id: 'contract', label: 'Contracts' },
                  { id: 'structured-summary', label: 'Summaries' },
                  { id: 'advisory-memo', label: 'Advisory Memos' },
                  { id: 'practice-feedback', label: 'Practice Feedback' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-3 py-1.5 rounded-lg transition-colors font-medium ${
                      activeFilter === tab.id
                        ? 'bg-[#18181B] text-[#FFFFFF] shadow-xs'
                        : 'text-[#71717A] hover:text-[#09090B] hover:bg-[#FAFAF9]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Search Input */}
              <div className="relative min-w-[240px]">
                <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[#71717A]" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Filter vault artifacts..."
                  className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7] text-xs text-[#09090B] placeholder-[#A1A1AA] focus:outline-none focus:border-[#18181B] transition-colors"
                />
              </div>
            </div>

            {/* Items Grid */}
            {filteredItems.length === 0 ? (
              <div className="p-12 text-center bg-[#FFFFFF] rounded-2xl border border-[#E4E4E7] text-[#71717A] space-y-3">
                <Layers className="w-8 h-8 mx-auto text-[#D4D4D8]" />
                <div className="font-serif text-sm font-semibold text-[#09090B]">
                  No artifacts found in Vault
                </div>
                <p className="text-xs max-w-sm mx-auto leading-relaxed text-[#71717A]">
                  You can add contracts, Q&A transcripts, and negotiation feedback reports into your encrypted Vault using the "Add to Vault" button in the Citation Q&A or Feedback pages.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredItems.map(item => (
                  <div
                    key={item.id}
                    className="p-5 rounded-xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-xs hover:border-[#A1A1AA] transition-all space-y-3 flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] uppercase font-mono px-2 py-0.5 rounded border font-semibold tracking-wider ${
                              item.category === 'contract'
                                ? 'bg-[#FAFAF9] text-[#18181B] border-[#E4E4E7]'
                                : item.category === 'practice-feedback'
                                ? 'bg-[#F0FDF4] text-[#166534] border-[#86EFAC]'
                                : 'bg-[#FAFAF9] text-[#52525B] border-[#E4E4E7]'
                            }`}
                          >
                            {item.category.replace('-', ' ')}
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5 text-[10px] text-[#71717A] font-mono">
                          <Lock className="w-3 h-3 text-[#10B981]" />
                          <span>{item.fileSize}</span>
                        </div>
                      </div>

                      <h3 className="font-semibold text-sm text-[#09090B] leading-snug">
                        {item.title}
                      </h3>

                      <div className="text-[11px] text-[#71717A] flex items-center gap-1">
                        <span>Matter:</span>
                        <strong className="text-[#09090B] font-medium">{item.documentName}</strong>
                      </div>

                      {item.contentSnippet && (
                        <p className="text-xs text-[#52525B] line-clamp-2 leading-relaxed bg-[#FAFAF9] p-2 rounded-lg border border-[#E4E4E7]/60">
                          {item.contentSnippet}
                        </p>
                      )}
                    </div>

                    <div className="pt-2 border-t border-[#E4E4E7] flex items-center justify-between gap-2 text-xs">
                      <span className="text-[10px] text-[#71717A] font-mono">
                        {item.createdAt}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDownload(item)}
                          className="flex items-center gap-1 px-2.5 py-1 rounded bg-[#FAFAF9] hover:bg-[#F4F4F5] border border-[#E4E4E7] text-xs font-medium text-[#18181B] transition-colors"
                          title="Decrypt & Download artifact"
                        >
                          <Download className="w-3 h-3" />
                          <span>Download</span>
                        </button>

                        <button
                          onClick={() => onDeleteItem(item.id)}
                          className="p-1.5 rounded hover:bg-[#FEF2F2] text-[#71717A] hover:text-[#991B1B] transition-colors"
                          title="Purge from Vault"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};
