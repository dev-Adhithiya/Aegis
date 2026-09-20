import React, { useState } from 'react';
import {
  X,
  Printer,
  Copy,
  Check,
  Download,
  FileText,
  AlertTriangle,
  Scale,
  CheckSquare,
} from 'lucide-react';
import { StructuredDocument } from '../types/legal';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  document: StructuredDocument | null;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  document,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !document) return null;

  const summary = document.summary;

  const generateMarkdownPacket = () => {
    return `# LEGAL DOCUMENT REVIEW PACKET: ${document.name}
Jurisdiction: ${document.jurisdiction}
Date: ${new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
Document Type: ${document.docType.toUpperCase()}
Disclaimer: Prepared for advocate consultation. Does not constitute legal advice.

---

## 1. EXECUTIVE SUMMARY
${summary.plainEnglishOverview}

### Contracting Parties:
${summary.parties.map(p => `- **${p.role}**: ${p.name} (${p.panOrAddress || 'Details in draft'})`).join('\n')}

### Key Dates & Terms:
- **Commencement**: ${summary.keyDatesDurations.commencementDate || 'Effective Date'}
- **Duration / Term**: ${summary.keyDatesDurations.durationOrTerm || 'N/A'}
- **Lock-in Period**: ${summary.keyDatesDurations.lockInPeriod || 'None specified'}
- **Renewal Conditions**: ${summary.keyDatesDurations.renewalTerms || 'Mutual consent'}

${
  summary.financialTerms
    ? `### Financial Terms:
- **Rent / Consideration**: ${summary.financialTerms.rentOrConsideration || 'N/A'}
- **Security Deposit**: ${summary.financialTerms.securityDeposit || 'N/A'}
- **Escalation & Maintenance**: ${summary.financialTerms.escalation || 'N/A'}`
    : ''
}

---

## 2. STATUTORY RISK REGISTER (${document.riskFlags.length} Flags Identified)
${
  document.riskFlags.length === 0
    ? 'No major statutory anomalies detected under Indian legal standards.'
    : document.riskFlags
        .map(
          (f, idx) => `### ${idx + 1}. ${f.ruleName} [${f.severity.toUpperCase()} RISK]
- **Matched Clause**: Clause ${f.matchedClauseNumber}
- **Statutory Provision**: ${f.statutoryProvision || 'General Practice Concern'}
- **Plain-English Impact**: ${f.plainEnglishExplanation}
- **Excerpt**: "${f.matchedClauseExcerpt}"
- **Recommendation for Lawyer**: ${f.recommendationForLawyer}
`
        )
        .join('\n')
}

---

## 3. CHECKLIST: QUESTIONS TO ASK YOUR ADVOCATE
${
  document.riskFlags.length > 0
    ? document.riskFlags.map(f => `- [ ] "${f.recommendationForLawyer}" (Ref Clause ${f.matchedClauseNumber})`).join('\n')
    : `- [ ] Confirm dispute resolution venue and arbitration clause applicability.\n- [ ] Verify standard 30-day reciprocal termination notice.`
}
`;
  };

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(generateMarkdownPacket());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-[#000000]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-[#FFFFFF] w-full max-w-4xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#E5E5DF]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#EAEAE5] flex items-center justify-between bg-[#FAF9F5]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[#18181B] text-[#FFFFFF] flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#18181B]">
                Export Executive Legal Packet
              </h2>
              <p className="text-xs text-[#71717A]">
                Structured summary + Indian statutory risk register + lawyer discussion checklist
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyMarkdown}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#DCDCD6] bg-[#FFFFFF] hover:bg-[#F5F5F0] text-xs font-medium text-[#18181B] transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied Markdown' : 'Copy Markdown'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#18181B] hover:bg-[#27272A] text-xs font-medium text-[#FFFFFF] transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print / Save as PDF</span>
            </button>

            <button
              onClick={onClose}
              className="text-[#71717A] hover:text-[#18181B] p-1.5 rounded-lg hover:bg-[#EFEFEA] transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Printable Document Body */}
        <div className="flex-1 overflow-y-auto p-8 font-sans space-y-8 print:p-0 print:space-y-6">
          {/* Cover / Letterhead */}
          <div className="border-b border-[#EAEAE5] pb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-[10px] uppercase font-mono tracking-widest text-[#8E8E93]">
                CONFIDENTIAL • ADVOCATE PREPARATION BRIEF
              </div>
              <h1 className="font-serif text-2xl font-bold text-[#18181B] mt-1">
                {document.name}
              </h1>
              <div className="text-xs text-[#71717A] mt-1">
                Applicable Laws: {document.jurisdiction}
              </div>
            </div>

            <div className="text-right text-xs text-[#71717A] font-mono shrink-0">
              <div>Generated: {new Date().toLocaleDateString('en-IN')}</div>
              <div className="text-[10px] text-[#A1A1AA]">Engine: Aegis Legal Vertical</div>
            </div>
          </div>

          {/* Section 1: Plain English Executive Overview */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-[#18181B]" />
              <span>1. Executive Summary & Structured Terms</span>
            </h3>
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E8E7E2] text-xs leading-relaxed space-y-3">
              <p className="font-serif text-sm text-[#18181B] leading-relaxed">
                {summary.plainEnglishOverview}
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-2 border-t border-[#EAEAE5]">
                {summary.parties.map((p, i) => (
                  <div key={i}>
                    <span className="font-semibold text-[#18181B]">{p.role}: </span>
                    <span className="text-[#3F3F46]">{p.name}</span>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#EAEAE5] text-[11px]">
                <div>
                  <span className="text-[#71717A]">Term: </span>
                  <span className="font-semibold text-[#18181B]">{summary.keyDatesDurations.durationOrTerm}</span>
                </div>
                <div>
                  <span className="text-[#71717A]">Lock-in: </span>
                  <span className="font-semibold text-[#18181B]">{summary.keyDatesDurations.lockInPeriod || 'None'}</span>
                </div>
                {summary.financialTerms && (
                  <>
                    <div>
                      <span className="text-[#71717A]">Rent/Value: </span>
                      <span className="font-semibold text-[#18181B]">{summary.financialTerms.rentOrConsideration}</span>
                    </div>
                    <div>
                      <span className="text-[#71717A]">Deposit: </span>
                      <span className="font-semibold text-[#18181B]">{summary.financialTerms.securityDeposit}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Section 2: Statutory Risk Register */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-[#DC2626]" />
              <span>2. Risk Register & Statutory Grounding ({document.riskFlags.length} Flags)</span>
            </h3>
            <div className="space-y-3">
              {document.riskFlags.map((flag, idx) => (
                <div
                  key={flag.id}
                  className="p-4 rounded-xl border border-[#E5E5DF] bg-[#FFFFFF] text-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[10px] px-1.5 py-0.5 rounded bg-[#18181B] text-[#FFFFFF]">
                        #{idx + 1}
                      </span>
                      <span className="font-semibold text-sm text-[#18181B]">
                        {flag.ruleName}
                      </span>
                      <span
                        className={`text-[9px] uppercase font-mono font-bold px-1.5 py-0.2 rounded ${
                          flag.severity === 'high'
                            ? 'bg-[#FEE2E2] text-[#991B1B]'
                            : 'bg-[#FEF3C7] text-[#92400E]'
                        }`}
                      >
                        {flag.severity}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-[#71717A]">
                      Clause {flag.matchedClauseNumber}
                    </span>
                  </div>

                  <p className="text-[#3F3F46] leading-relaxed">
                    {flag.plainEnglishExplanation}
                  </p>

                  <div className="p-2 rounded bg-[#FAF9F5] border border-[#EAEAE5] text-[11px] font-mono text-[#52525B]">
                    <strong>Statutory Foundation: </strong>
                    {flag.statutoryProvision || 'General Practice Concern (Indian Urban Standard)'}
                  </div>

                  <div className="text-[11px] text-[#92400E] bg-[#FFFBEB] p-2 rounded border border-[#FDE68A]">
                    <strong>Advocate Action Point: </strong>
                    {flag.recommendationForLawyer}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Lawyer Questions Checklist */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-[#71717A] mb-2 flex items-center gap-1.5">
              <CheckSquare className="w-3.5 h-3.5 text-[#16A34A]" />
              <span>3. "Questions to Ask Your Lawyer" Checklist</span>
            </h3>
            <div className="p-4 rounded-xl bg-[#FAF9F5] border border-[#E8E7E2] space-y-2 text-xs">
              {document.riskFlags.map((flag, idx) => (
                <div key={idx} className="flex items-start gap-2.5">
                  <input
                    type="checkbox"
                    className="mt-0.5 rounded border-[#DCDCD6] text-[#18181B] focus:ring-0"
                  />
                  <span className="text-[#27272A] leading-relaxed">
                    {flag.recommendationForLawyer} (Reference: Clause {flag.matchedClauseNumber})
                  </span>
                </div>
              ))}
              <div className="flex items-start gap-2.5">
                <input
                  type="checkbox"
                  className="mt-0.5 rounded border-[#DCDCD6] text-[#18181B] focus:ring-0"
                />
                <span className="text-[#27272A] leading-relaxed">
                  Verify jurisdiction clause and arbitration seat under the Arbitration & Conciliation Act 1996.
                </span>
              </div>
            </div>
          </div>

          {/* Legal Disclaimer */}
          <div className="pt-4 border-t border-[#EAEAE5] text-[10px] text-[#8E8E93] leading-relaxed">
            <strong>Statutory Disclaimer:</strong> This legal review packet was automatically generated for informational and preparation purposes under the Indian legal vertical. It does not create an attorney-client relationship and does not substitute for independent legal examination by an enrolled advocate under the Advocates Act, 1961.
          </div>
        </div>
      </div>
    </div>
  );
};
