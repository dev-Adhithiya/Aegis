import React, { useState } from 'react';
import {
  AlertTriangle,
  ChevronRight,
  Shield,
  Scale,
  ExternalLink,
  Info,
  Copy,
  Check,
  GitFork,
  HelpCircle,
  Sparkles,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { RiskFlag, StructuredDocument, RiskOption, ClauseInconsistency } from '../types/legal';

interface RiskFlagsPanelProps {
  document: StructuredDocument;
  onJumpToClause: (clauseId: string) => void;
}

export const RiskFlagsPanel: React.FC<RiskFlagsPanelProps> = ({
  document,
  onJumpToClause,
}) => {
  const [activeTab, setActiveTab] = useState<'flags' | 'inconsistencies'>('flags');
  const [expandedFlagId, setExpandedFlagId] = useState<string | null>(
    document.riskFlags.length > 0 ? document.riskFlags[0].id : null
  );
  const [copiedOptionId, setCopiedOptionId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedFlagId(expandedFlagId === id ? null : id);
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedOptionId(id);
    setTimeout(() => setCopiedOptionId(null), 2000);
  };

  const inconsistencies: ClauseInconsistency[] = document.inconsistencies || [];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#FFFFFF] p-6 sm:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="pb-5 border-b border-[#E4E4E7]">
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-mono text-[#71717A]">
            <Scale className="w-3.5 h-3.5 text-[#B45309]" />
            <span>Indian Statutory Compliance & Practice Review</span>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
            <h2 className="font-serif text-2xl font-semibold text-[#18181B]">
              Legal Risk & Inconsistency Audit
            </h2>

            {/* Navigation Tabs */}
            <div className="flex bg-[#F4F4F5] p-1 rounded-xl border border-[#E4E4E7] text-xs font-medium self-start">
              <button
                onClick={() => setActiveTab('flags')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'flags'
                    ? 'bg-[#FFFFFF] text-[#09090B] shadow-xs font-semibold'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                <span>Risk Flags</span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E4E4E7] text-[#18181B]">
                  {document.riskFlags.length}
                </span>
              </button>
              <button
                onClick={() => setActiveTab('inconsistencies')}
                className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                  activeTab === 'inconsistencies'
                    ? 'bg-[#FFFFFF] text-[#09090B] shadow-xs font-semibold'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                <span>Inconsistencies</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                  inconsistencies.length > 0
                    ? 'bg-[#FEE2E2] text-[#DC2626] font-bold'
                    : 'bg-[#E4E4E7] text-[#71717A]'
                }`}>
                  {inconsistencies.length}
                </span>
              </button>
            </div>
          </div>
          <p className="text-xs text-[#71717A] mt-2 leading-relaxed">
            Rule-based evaluations grounded in Indian law (Transfer of Property Act 1882 & Indian Contract Act 1872) or prevailing urban tenancy benchmarks.
          </p>
        </div>

        {/* TAB 1: RISK FLAGS */}
        {activeTab === 'flags' && (
          <div>
            {document.riskFlags.length === 0 ? (
              <div className="p-8 text-center bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl">
                <Shield className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
                <div className="font-serif text-lg font-semibold text-[#166534]">
                  No High-Risk Anomalies Detected
                </div>
                <p className="text-xs text-[#15803D] mt-1 max-w-md mx-auto">
                  The clauses in this agreement comply with standard balanced contractual norms under Indian jurisdiction.
                </p>
              </div>
            ) : (
              <div className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-2xl overflow-hidden shadow-xs divide-y divide-[#F4F4F5]">
                {document.riskFlags.map(flag => {
                  const isExpanded = expandedFlagId === flag.id;

                  return (
                    <div key={flag.id} className="transition-colors hover:bg-[#FAFAF9]">
                      {/* Summary Row */}
                      <div
                        onClick={() => toggleExpand(flag.id)}
                        className="p-4 sm:px-6 flex items-start sm:items-center justify-between gap-4 cursor-pointer select-none"
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">
                            {flag.severity === 'high' ? (
                              <div className="w-7 h-7 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center justify-center text-[#DC2626]">
                                <AlertTriangle className="w-4 h-4" />
                              </div>
                            ) : (
                              <div className="w-7 h-7 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] flex items-center justify-center text-[#D97706]">
                                <Info className="w-4 h-4" />
                              </div>
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-sm text-[#18181B]">
                                {flag.ruleName}
                              </span>
                              <span
                                className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-lg ${
                                  flag.severity === 'high'
                                    ? 'bg-[#FEE2E2] text-[#991B1B]'
                                    : 'bg-[#FEF3C7] text-[#92400E]'
                                }`}
                              >
                                {flag.severity} risk
                              </span>
                              <span className="text-[10px] font-mono px-2 py-0.5 rounded-lg bg-[#F4F4F5] text-[#52525B] border border-[#E4E4E7]">
                                Clause {flag.matchedClauseNumber}
                              </span>
                            </div>

                            <p className="text-xs text-[#52525B] mt-1 line-clamp-1">
                              {flag.plainEnglishExplanation}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 shrink-0">
                          {flag.statutoryProvision ? (
                            <span className="hidden md:inline-block text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#FAF5FF] text-[#6B21A8] border border-[#E9D5FF]">
                              {flag.statutoryProvision}
                            </span>
                          ) : (
                            <span className="hidden md:inline-block text-[11px] font-mono px-2 py-0.5 rounded-lg bg-[#F4F4F5] text-[#52525B] border border-[#E4E4E7]">
                              General Practice Concern
                            </span>
                          )}

                          <ChevronRight
                            className={`w-4 h-4 text-[#8E8E93] transition-transform duration-200 ${
                              isExpanded ? 'rotate-90' : ''
                            }`}
                          />
                        </div>
                      </div>

                      {/* Expanded Detail Panel */}
                      {isExpanded && (
                        <div className="px-6 pb-6 pt-3 bg-[#FAFAF9] border-t border-[#F4F4F5] space-y-4">
                          {/* Matched Clause Excerpt */}
                          <div className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E4E4E7]">
                            <div className="flex items-center justify-between mb-1.5">
                              <span className="text-[10px] font-mono uppercase text-[#71717A] tracking-wider">
                                Matched Clause Excerpt
                              </span>
                              <button
                                onClick={() => onJumpToClause(flag.matchedClauseId)}
                                className="text-xs font-medium text-[#18181B] hover:text-[#000000] flex items-center gap-1 hover:underline cursor-pointer"
                              >
                                <span>Scroll to Clause {flag.matchedClauseNumber}</span>
                                <ExternalLink className="w-3 h-3" />
                              </button>
                            </div>
                            <p className="font-serif text-xs text-[#27272A] leading-relaxed italic bg-[#F9F9F8] p-3 rounded-xl border border-[#E4E4E7]">
                              "{flag.matchedClauseExcerpt}"
                            </p>
                          </div>

                          {/* Plain-English Explanation */}
                          <div>
                            <h3 className="text-xs font-semibold text-[#18181B] uppercase tracking-wider mb-1">
                              Why This Matters
                            </h3>
                            <p className="text-xs text-[#3F3F46] leading-relaxed">
                              {flag.plainEnglishExplanation}
                            </p>
                          </div>

                          {/* Statutory Grounding */}
                          <div className="flex items-start gap-2.5 p-3 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] text-xs">
                            <Scale className="w-4 h-4 text-[#7C3AED] shrink-0 mt-0.5" />
                            <div>
                              <span className="font-semibold text-[#5B21B6]">Legal Foundation: </span>
                              <span className="text-[#6D28D9]">
                                {flag.statutoryProvision
                                  ? `Governed by ${flag.statutoryProvision}. Indian jurisprudence disfavors unilateral penalties, unrestrained entry, or restraint of trade.`
                                  : 'No direct statutory prohibition; flagged as a General Practice Concern inconsistent with modern Indian urban tenancy standards.'}
                              </span>
                            </div>
                          </div>

                          {/* YOUR OPTIONS (Actionable Redlines & Strategic Paths) */}
                          {flag.yourOptions && flag.yourOptions.length > 0 && (
                            <div className="space-y-3 pt-2">
                              <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold text-[#09090B] uppercase tracking-wider flex items-center gap-1.5">
                                  <GitFork className="w-3.5 h-3.5 text-[#2563EB]" />
                                  <span>Your Options (Strategic Approaches)</span>
                                </h3>
                                <span className="text-[10px] text-[#71717A]">
                                  Informational guidance • Non-directive
                                </span>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                {flag.yourOptions.map((opt, oIdx) => {
                                  const typeBadge = {
                                    negotiate: {
                                      label: 'Propose Redline',
                                      classes: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1E40AF]',
                                    },
                                    clarify: {
                                      label: 'Seek Clarification',
                                      classes: 'border-[#FEF08A] bg-[#FEFCE8] text-[#854D0E]',
                                    },
                                    review: {
                                      label: 'Advocate Review',
                                      classes: 'border-[#E9D5FF] bg-[#FAF5FF] text-[#6B21A8]',
                                    },
                                  }[opt.actionType] || {
                                    label: 'Strategic Option',
                                    classes: 'border-[#E4E4E7] bg-[#F4F4F5] text-[#52525B]',
                                  };

                                  return (
                                    <div
                                      key={opt.id || oIdx}
                                      className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#E4E4E7] flex flex-col justify-between space-y-2 text-xs"
                                    >
                                      <div>
                                        <div className="flex items-center justify-between mb-1.5">
                                          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded-md border ${typeBadge.classes}`}>
                                            {typeBadge.label}
                                          </span>
                                        </div>
                                        <h4 className="font-semibold text-xs text-[#09090B] mb-1">
                                          {opt.title}
                                        </h4>
                                        <p className="text-xs text-[#52525B] leading-relaxed">
                                          {opt.description}
                                        </p>
                                      </div>

                                      <div className="pt-2 border-t border-[#F4F4F5] flex justify-end">
                                        <button
                                          onClick={() => handleCopyText(opt.description, `${flag.id}-${oIdx}`)}
                                          className="flex items-center gap-1 text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-medium"
                                        >
                                          {copiedOptionId === `${flag.id}-${oIdx}` ? (
                                            <>
                                              <Check className="w-3 h-3 text-[#10B981]" />
                                              <span className="text-[#10B981]">Copied</span>
                                            </>
                                          ) : (
                                            <>
                                              <Copy className="w-3 h-3" />
                                              <span>Copy Strategy</span>
                                            </>
                                          )}
                                        </button>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          )}

                          {/* Questions to Ask Your Lawyer */}
                          <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs">
                            <div className="font-semibold text-[#92400E] mb-0.5 flex items-center gap-1.5">
                              <HelpCircle className="w-3.5 h-3.5" />
                              <span>Recommended Discussion for Your Lawyer</span>
                            </div>
                            <p className="text-[#B45309] leading-relaxed">
                              {flag.recommendationForLawyer}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: INCONSISTENCIES & CONTRADICTIONS */}
        {activeTab === 'inconsistencies' && (
          <div className="space-y-4">
            {inconsistencies.length === 0 ? (
              <div className="p-8 text-center bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl">
                <Shield className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
                <div className="font-serif text-lg font-semibold text-[#166534]">
                  Zero Internal Contradictions Found
                </div>
                <p className="text-xs text-[#15803D] mt-1 max-w-md mx-auto">
                  Notice periods, lock-in commitments, deposit refund terms, and termination rights align consistently throughout this document.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-3 text-xs text-[#991B1B]">
                  <AlertCircle className="w-5 h-5 shrink-0 text-[#EF4444]" />
                  <p>
                    <strong>{inconsistencies.length} contradiction(s)</strong> detected between different clauses in this agreement. Contradictory terms create severe ambiguity during dispute resolution.
                  </p>
                </div>

                {inconsistencies.map(incon => (
                  <div
                    key={incon.id}
                    className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-xs space-y-4"
                  >
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-[#09090B]">
                          {incon.title}
                        </span>
                        <span
                          className={`text-[10px] uppercase font-mono font-bold px-2 py-0.5 rounded-lg ${
                            incon.severity === 'high'
                              ? 'bg-[#FEE2E2] text-[#991B1B]'
                              : 'bg-[#FEF3C7] text-[#92400E]'
                          }`}
                        >
                          {incon.severity} priority
                        </span>
                      </div>
                      <span className="text-xs text-[#71717A] font-mono">
                        Clauses {incon.clauseA.clauseNumber} vs {incon.clauseB.clauseNumber}
                      </span>
                    </div>

                    <p className="text-xs text-[#3F3F46] leading-relaxed">
                      {incon.description}
                    </p>

                    {/* Side by side comparison */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                      <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                        <div className="flex items-center justify-between mb-1 text-[11px] font-semibold text-[#1E293B]">
                          <span>Clause {incon.clauseA.clauseNumber}: {incon.clauseA.title || 'Provision A'}</span>
                          <button
                            onClick={() => onJumpToClause(incon.clauseA.clauseId)}
                            className="text-[#2563EB] hover:underline text-[10px] flex items-center gap-0.5"
                          >
                            <span>Jump</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <p className="font-serif text-xs text-[#334155] italic leading-normal">
                          "{incon.clauseA.excerpt}"
                        </p>
                        <div className="mt-2 text-[10px] font-medium text-[#1E293B] bg-[#FFFFFF] p-1.5 rounded-lg border border-[#E2E8F0]">
                          Stated: {incon.clauseA.statedTerm}
                        </div>
                      </div>

                      <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                        <div className="flex items-center justify-between mb-1 text-[11px] font-semibold text-[#92400E]">
                          <span>Clause {incon.clauseB.clauseNumber}: {incon.clauseB.title || 'Provision B'}</span>
                          <button
                            onClick={() => onJumpToClause(incon.clauseB.clauseId)}
                            className="text-[#B45309] hover:underline text-[10px] flex items-center gap-0.5"
                          >
                            <span>Jump</span>
                            <ExternalLink className="w-2.5 h-2.5" />
                          </button>
                        </div>
                        <p className="font-serif text-xs text-[#78350F] italic leading-normal">
                          "{incon.clauseB.excerpt}"
                        </p>
                        <div className="mt-2 text-[10px] font-medium text-[#92400E] bg-[#FFFFFF] p-1.5 rounded-lg border border-[#FDE68A]">
                          Stated: {incon.clauseB.statedTerm}
                        </div>
                      </div>
                    </div>

                    {/* Potential Impact */}
                    <div className="p-3 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7] text-xs">
                      <span className="font-semibold text-[#18181B]">Potential Risk / Impact: </span>
                      <span className="text-[#52525B]">{incon.potentialImpact}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
