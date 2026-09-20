import React, { useState, useEffect } from 'react';
import {
  Highlighter,
  Search,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Scale,
  Mic,
} from 'lucide-react';
import { StructuredDocument, RiskFlag } from '../types/legal';

interface DocumentViewerProps {
  document: StructuredDocument;
  targetClauseId: string | null;
  onSelectFlag?: (flag: RiskFlag) => void;
  onStartOralPractice?: () => void;
}

export const DocumentViewer: React.FC<DocumentViewerProps> = ({
  document,
  targetClauseId,
  onStartOralPractice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showHighlights, setShowHighlights] = useState(true);
  const [expandedSummaryIds, setExpandedSummaryIds] = useState<Set<string>>(new Set());
  const [copiedClauseId, setCopiedClauseId] = useState<string | null>(null);

  // Auto-scroll and auto-expand when targetClauseId changes
  useEffect(() => {
    if (targetClauseId) {
      setExpandedSummaryIds(prev => new Set(prev).add(targetClauseId));
      const el = document.getElementById(targetClauseId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [targetClauseId]);

  const toggleClauseSummary = (clauseId: string) => {
    setExpandedSummaryIds(prev => {
      const next = new Set(prev);
      if (next.has(clauseId)) {
        next.delete(clauseId);
      } else {
        next.add(clauseId);
      }
      return next;
    });
  };

  const handleCopyClause = (clauseId: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedClauseId(clauseId);
    setTimeout(() => setCopiedClauseId(null), 1800);
  };

  const filteredClauses = document.clauses.filter(clause => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      clause.clauseNumber.toLowerCase().includes(q) ||
      clause.title.toLowerCase().includes(q) ||
      clause.text.toLowerCase().includes(q)
    );
  });

  const totalFlaggedCount = document.riskFlags.length;

  return (
    <div className="flex-1 flex flex-col h-full bg-[#FAFAF9] overflow-hidden select-text">
      {/* Top Document Toolbar - Executive & Minimalist */}
      <div className="h-12 border-b border-[#E4E4E7] bg-[#FFFFFF] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 select-none">
        {/* Left: Text Highlight Toggle */}
        <div className="flex items-center gap-3">
          <button
            id="btn-toggle-highlights"
            onClick={() => setShowHighlights(!showHighlights)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
              showHighlights
                ? 'bg-[#18181B] text-[#FFFFFF] border-[#18181B]'
                : 'bg-[#FFFFFF] text-[#71717A] border-[#E4E4E7] hover:border-[#18181B] hover:text-[#09090B]'
            }`}
            title="Toggle text background & color highlighting for statutory clauses"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Highlights {showHighlights ? 'ON' : 'OFF'}</span>
            {totalFlaggedCount > 0 && (
              <span
                className={`ml-1 text-[10px] font-mono px-1.5 py-0.2 rounded ${
                  showHighlights
                    ? 'bg-[#27272A] text-[#F4F4F5]'
                    : 'bg-[#F4F4F5] text-[#71717A]'
                }`}
              >
                {totalFlaggedCount}
              </span>
            )}
          </button>

          {onStartOralPractice && (
            <button
              onClick={onStartOralPractice}
              className="hidden sm:flex items-center gap-1.5 text-xs text-[#71717A] hover:text-[#09090B] px-2.5 py-1.5 rounded border border-transparent hover:border-[#E4E4E7] transition-colors"
            >
              <Mic className="w-3.5 h-3.5" />
              <span>Practice Negotiation</span>
            </button>
          )}
        </div>

        {/* Right: In-Document Search */}
        <div className="relative w-48 sm:w-64">
          <Search className="w-3.5 h-3.5 text-[#A1A1AA] absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            id="input-clause-search"
            type="text"
            placeholder="Search contract text..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full bg-[#FAFAF9] border border-[#E4E4E7] rounded pl-8 pr-3 py-1 text-xs text-[#09090B] placeholder-[#A1A1AA] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#18181B] transition-colors"
          />
        </div>
      </div>

      {/* Main Document Reading Sheet */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-8">
        <div className="max-w-3xl mx-auto bg-[#FFFFFF] border border-[#E4E4E7] rounded-lg p-6 sm:p-12 space-y-8">
          {/* Document Header */}
          <div className="border-b border-[#E4E4E7] pb-6">
            <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-wider text-[#71717A] mb-2">
              <span className="px-1.5 py-0.5 rounded bg-[#FAFAF9] border border-[#E4E4E7] font-semibold text-[#09090B]">
                {document.fileFormat.toUpperCase()}
              </span>
              <span>•</span>
              <span>{document.jurisdiction || 'Indian Contract Law'}</span>
            </div>

            <h1 className="font-serif text-2xl sm:text-3xl text-[#09090B] font-semibold tracking-tight">
              {document.name.replace(/\.(pdf|docx|txt)$/i, '').replace(/_/g, ' ')}
            </h1>

            <p className="text-xs text-[#71717A] mt-2 leading-relaxed">
              {showHighlights
                ? 'Text highlights are active: Flagged provisions appear with distinct text background & color. Click any clause to view summary.'
                : 'Clean reading layout: Text highlights are disabled. Enable highlights to inspect flagged terms.'}
            </p>
          </div>

          {/* Clauses Stream */}
          <div className="space-y-6">
            {filteredClauses.map(clause => {
              const matchedFlag = document.riskFlags.find(
                f => f.matchedClauseId === clause.id || f.matchedClauseNumber === clause.clauseNumber
              );

              const isTargeted = targetClauseId === clause.id;
              const hasFlag = !!matchedFlag;
              const isSummaryExpanded = showHighlights && hasFlag && (expandedSummaryIds.has(clause.id) || isTargeted);

              return (
                <article
                  key={clause.id}
                  id={clause.id}
                  className={`p-4 sm:p-5 rounded transition-all duration-150 ${
                    isTargeted
                      ? 'bg-[#F4F4F5] border-l-2 border-[#18181B]'
                      : 'border-l-2 border-transparent'
                  }`}
                >
                  {/* Clause Header Row */}
                  <div className="flex items-center justify-between gap-3 mb-2.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-[#FAFAF9] text-[#09090B] border border-[#E4E4E7]">
                        Clause {clause.clauseNumber}
                      </span>
                      <h3 className="font-sans font-semibold text-xs sm:text-sm text-[#09090B]">
                        {clause.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {showHighlights && matchedFlag && (
                        <button
                          onClick={() => toggleClauseSummary(clause.id)}
                          className="flex items-center gap-1 text-[11px] font-medium text-[#71717A] hover:text-[#09090B] px-2 py-0.5 rounded hover:bg-[#FAFAF9] border border-transparent hover:border-[#E4E4E7] transition-colors cursor-pointer"
                        >
                          <span>{isSummaryExpanded ? 'Hide Details' : 'Details'}</span>
                          {isSummaryExpanded ? (
                            <ChevronUp className="w-3 h-3" />
                          ) : (
                            <ChevronDown className="w-3 h-3" />
                          )}
                        </button>
                      )}

                      <button
                        onClick={() => handleCopyClause(clause.id, clause.text)}
                        className="p-1 rounded text-[#71717A] hover:text-[#09090B] transition-colors"
                        title="Copy clause text"
                      >
                        {copiedClauseId === clause.id ? (
                          <Check className="w-3.5 h-3.5 text-[#09090B]" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Clause Text with True Highlighter Text Color & Background */}
                  <div
                    onClick={() => hasFlag && showHighlights && toggleClauseSummary(clause.id)}
                    className={`font-serif text-[15px] sm:text-[16px] leading-[1.7] select-text transition-colors duration-150 ${
                      showHighlights && hasFlag
                        ? 'bg-[#FEF08A]/45 text-[#18181B] px-2 py-1.5 rounded cursor-pointer hover:bg-[#FEF08A]/60'
                        : 'text-[#27272A] bg-transparent'
                    }`}
                  >
                    {clause.text}
                  </div>

                  {/* Subtle Inline Summary & Statutory Reference Drawer */}
                  {showHighlights && matchedFlag && isSummaryExpanded && (
                    <div className="mt-3 p-4 rounded bg-[#FAFAF9] border border-[#E4E4E7] space-y-2.5 text-xs">
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="font-semibold text-[#09090B]">
                          Summary: {matchedFlag.ruleName}
                        </div>
                        {matchedFlag.statutoryProvision && (
                          <div className="flex items-center gap-1 font-mono text-[10px] text-[#71717A] px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E4E4E7]">
                            <Scale className="w-3 h-3 text-[#18181B]" />
                            <span>{matchedFlag.statutoryProvision}</span>
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-[#3F3F46] leading-relaxed">
                        {matchedFlag.plainEnglishExplanation}
                      </p>

                      {matchedFlag.recommendationForLawyer && (
                        <div className="p-3 rounded bg-[#FFFFFF] border border-[#E4E4E7] space-y-1">
                          <div className="flex items-center justify-between text-[10px] font-semibold text-[#71717A]">
                            <span>Suggested Negotiation Script</span>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(matchedFlag.recommendationForLawyer);
                              }}
                              className="text-[#18181B] hover:underline"
                            >
                              Copy
                            </button>
                          </div>
                          <p className="font-serif text-xs text-[#09090B] italic leading-snug">
                            "{matchedFlag.recommendationForLawyer}"
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
