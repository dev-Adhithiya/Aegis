import React, { useState } from 'react';
import {
  ArrowLeft,
  Award,
  CheckCircle2,
  FileText,
  Copy,
  Check,
  Download,
  RotateCcw,
  Layers,
  Sparkles,
  MessageSquare,
  Shield,
} from 'lucide-react';
import { PracticeSessionFeedback, StructuredDocument, VaultItem } from '../types/legal';
import { AegisLogo } from './AegisLogo';

interface PracticeFeedbackPageProps {
  feedback: PracticeSessionFeedback;
  document: StructuredDocument;
  onBackToQA: () => void;
  onBackToDocument: () => void;
  onRestartPractice: () => void;
  onAddToVault: (item: Omit<VaultItem, 'id' | 'createdAt'>) => void;
}

export const PracticeFeedbackPage: React.FC<PracticeFeedbackPageProps> = ({
  feedback,
  document,
  onBackToQA,
  onBackToDocument,
  onRestartPractice,
  onAddToVault,
}) => {
  const [copied, setCopied] = useState(false);
  const [vaultAdded, setVaultAdded] = useState(false);

  const handleCopy = () => {
    const report = `AEGIS ORAL PRACTICE FEEDBACK REPORT
Document: ${document.name}
Jurisdiction: ${document.jurisdiction}
Overall Rating: ${feedback.overallRating}
Spoken Clarity Score: ${feedback.clarityScore}/10
Document Accuracy Score: ${feedback.accuracyScore}/10

CLARITY EVALUATION:
${feedback.clarityEvaluation}

TEXTUAL ACCURACY VS CONTRACT:
${feedback.textualAccuracy}

KEY OBSERVED STRENGTHS:
${feedback.keyStrengths.map(s => `- ${s}`).join('\n')}

RECOMMENDED NEGOTIATION ADJUSTMENTS:
${feedback.keyAdjustments.map(a => `- ${a}`).join('\n')}

DISCLAIMER:
${feedback.nonLegalDisclaimer}
`;
    navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleExport = () => {
    const report = `AEGIS ORAL PRACTICE FEEDBACK REPORT
Document: ${document.name}
Jurisdiction: ${document.jurisdiction}
Overall Assessment: ${feedback.overallRating}
Clarity: ${feedback.clarityScore}/10 | Accuracy: ${feedback.accuracyScore}/10
Generated: ${new Date().toLocaleString()}

--------------------------------------------------
CLARITY & VERBAL ARTICULATION:
${feedback.clarityEvaluation}

--------------------------------------------------
TEXTUAL ACCURACY AGAINST PARSED CLAUSES:
${feedback.textualAccuracy}

--------------------------------------------------
OBSERVED STRENGTHS:
${feedback.keyStrengths.map(s => `• ${s}`).join('\n')}

--------------------------------------------------
NEGOTIATION ADJUSTMENTS:
${feedback.keyAdjustments.map(a => `• ${a}`).join('\n')}

--------------------------------------------------
STATUTORY NOTICE:
${feedback.nonLegalDisclaimer}
`;
    const blob = new Blob([report], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `Aegis_Practice_Feedback_${document.name.replace(/\.[^/.]+$/, '')}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const handleSaveToVault = () => {
    onAddToVault({
      title: `Practice Feedback: ${document.name}`,
      category: 'practice-feedback',
      documentId: document.id,
      documentName: document.name,
      fileSize: '3.2 KB',
      isEncrypted: true,
      contentSnippet: `Clarity: ${feedback.clarityScore}/10, Accuracy: ${feedback.accuracyScore}/10 - ${feedback.overallRating}`,
      fullData: feedback,
    });
    setVaultAdded(true);
    setTimeout(() => setVaultAdded(false), 3000);
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAF9] font-sans antialiased text-[#18181B] select-none">
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Navigation */}
        <header className="h-14 border-b border-[#E4E4E7] bg-[#FFFFFF] px-6 flex items-center justify-between gap-4 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onBackToQA}
              className="flex items-center gap-1.5 text-xs font-medium text-[#71717A] hover:text-[#09090B] p-1.5 rounded hover:bg-[#FAFAF9] transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Q&A Practice</span>
            </button>

            <span className="text-[#E4E4E7]">|</span>

            <div className="flex items-center gap-2">
              <AegisLogo size={18} showText={false} theme="dark" />
              <span className="font-semibold text-xs sm:text-sm text-[#09090B]">
                Oral Negotiation Feedback Report
              </span>
              <span className="text-[11px] text-[#71717A] hidden md:inline">
                • {document.name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleSaveToVault}
              className="flex items-center gap-1.5 text-xs font-medium text-[#18181B] bg-[#FFFFFF] hover:bg-[#FAFAF9] border border-[#E4E4E7] px-3 py-1.5 rounded transition-colors"
            >
              <Layers className="w-3.5 h-3.5" />
              <span>{vaultAdded ? 'Saved in Vault' : 'Add to Vault'}</span>
            </button>

            <button
              onClick={handleExport}
              className="flex items-center gap-1.5 text-xs font-medium text-[#71717A] hover:text-[#09090B] bg-[#FFFFFF] hover:bg-[#FAFAF9] border border-[#E4E4E7] px-3 py-1.5 rounded transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Report</span>
            </button>

            <button
              onClick={onRestartPractice}
              className="flex items-center gap-1.5 text-xs font-medium text-[#FFFFFF] bg-[#18181B] hover:bg-[#09090B] px-3 py-1.5 rounded transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Practice Again</span>
            </button>
          </div>
        </header>

        {/* Scrollable Report Content */}
        <main className="flex-1 overflow-y-auto p-6 sm:p-10 select-text">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Main Assessment Header Card */}
            <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-xl bg-[#FAFAF9] border border-[#E4E4E7] flex items-center justify-center text-[#18181B]">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <h1 className="font-serif text-lg font-semibold text-[#09090B]">
                      Post-Session Negotiation Assessment
                    </h1>
                    <p className="text-xs text-[#71717A]">
                      Contract: {document.name} ({document.clauses.length} parsed clauses)
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1 rounded-full bg-[#FAFAF9] border border-[#E4E4E7] text-[#09090B]">
                    {feedback.overallRating} Performance
                  </span>
                  <span className="text-xs px-3 py-1 rounded-full bg-[#F4F4F5] text-[#52525B]">
                    {document.jurisdiction}
                  </span>
                </div>
              </div>

              {/* Dual KPI Metric Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-[#FAFAF9] border border-[#E4E4E7] space-y-1">
                  <div className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                    Spoken Clarity & Conciseness
                  </div>
                  <div className="text-3xl font-semibold text-[#09090B]">
                    {feedback.clarityScore}
                    <span className="text-sm font-normal text-[#71717A]"> / 10</span>
                  </div>
                  <p className="text-xs text-[#52525B] leading-relaxed pt-1">
                    Evaluates firmness, structure, and verbal articulation during opposing pushback.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#FAFAF9] border border-[#E4E4E7] space-y-1">
                  <div className="text-[11px] font-semibold text-[#71717A] uppercase tracking-wider">
                    Document Text Accuracy
                  </div>
                  <div className="text-3xl font-semibold text-[#09090B]">
                    {feedback.accuracyScore}
                    <span className="text-sm font-normal text-[#71717A]"> / 10</span>
                  </div>
                  <p className="text-xs text-[#52525B] leading-relaxed pt-1">
                    Verifies whether spoken assertions matched written contract clauses and statutory rules.
                  </p>
                </div>
              </div>
            </div>

            {/* Critique Details Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Clarity Critique */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#09090B]">
                  <CheckCircle2 className="w-4 h-4 text-[#18181B]" />
                  <span>Clarity & Verbal Articulation Critique</span>
                </div>
                <p className="text-xs text-[#3F3F46] leading-relaxed">
                  {feedback.clarityEvaluation}
                </p>
              </div>

              {/* Document Accuracy Critique */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#09090B]">
                  <FileText className="w-4 h-4 text-[#18181B]" />
                  <span>Factual Textual Alignment vs Document</span>
                </div>
                <p className="text-xs text-[#3F3F46] leading-relaxed">
                  {feedback.textualAccuracy}
                </p>
              </div>
            </div>

            {/* Strengths & Adjustments Breakdown */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Observed Strengths */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-xs space-y-3">
                <div className="text-xs font-semibold text-[#09090B]">
                  Observed Communication Strengths
                </div>
                <ul className="space-y-2 text-xs text-[#3F3F46]">
                  {feedback.keyStrengths.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#10B981] font-bold mt-0.5">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Recommended Adjustments */}
              <div className="p-6 rounded-2xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-xs space-y-3">
                <div className="text-xs font-semibold text-[#09090B]">
                  Actionable Adjustments for Counterparties
                </div>
                <ul className="space-y-2 text-xs text-[#3F3F46]">
                  {feedback.keyAdjustments.map((a, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-[#18181B] font-bold mt-0.5">→</span>
                      <span>{a}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Non-Legal Statutory Notice */}
            <div className="p-5 rounded-xl bg-[#FAFAF9] border border-[#E4E4E7] text-xs text-[#71717A] leading-relaxed space-y-1">
              <div className="font-semibold text-[#09090B] flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-[#18181B]" />
                <span>Statutory & Non-Legal Notice</span>
              </div>
              <p>{feedback.nonLegalDisclaimer}</p>
            </div>

            {/* Bottom Actions */}
            <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-[#E4E4E7]">
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#18181B] bg-[#FFFFFF] hover:bg-[#FAFAF9] border border-[#E4E4E7] px-3.5 py-2 rounded-lg transition-colors"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-[#10B981]" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Full Report'}</span>
                </button>

                <button
                  onClick={onBackToQA}
                  className="flex items-center gap-1.5 text-xs font-medium text-[#71717A] hover:text-[#09090B] bg-[#FFFFFF] hover:bg-[#FAFAF9] border border-[#E4E4E7] px-3.5 py-2 rounded-lg transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>Discuss Report in Q&A</span>
                </button>
              </div>

              <button
                onClick={onBackToDocument}
                className="text-xs font-medium text-[#18181B] hover:underline"
              >
                Return to Document Analysis →
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
