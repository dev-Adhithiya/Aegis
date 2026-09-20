import React, { useState } from 'react';
import {
  Users,
  Calendar,
  DollarSign,
  FileCheck,
  AlertOctagon,
  Code,
  Copy,
  Check,
} from 'lucide-react';
import { StructuredDocument } from '../types/legal';

interface StructuredEntityViewerProps {
  document: StructuredDocument;
}

export const StructuredEntityViewer: React.FC<StructuredEntityViewerProps> = ({ document }) => {
  const [showRawJson, setShowRawJson] = useState(false);
  const [copied, setCopied] = useState(false);
  const summary = document.summary;

  const handleCopyJson = () => {
    navigator.clipboard.writeText(JSON.stringify(summary, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#FFFFFF] p-6 sm:p-10 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header with Raw JSON Toggle */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#EAEAE5]">
          <div>
            <div className="text-[11px] uppercase tracking-widest font-mono text-[#8E8E93]">
              Intermediate Representation
            </div>
            <h2 className="font-serif text-2xl font-semibold text-[#18181B] mt-0.5">
              Structured Contract Entities
            </h2>
            <p className="text-xs text-[#71717A] mt-1">
              Extracted from clauses into canonical JSON — UI prose and exports strictly render from this single source of truth.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowRawJson(!showRawJson)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E2E1DC] bg-[#FAF9F5] hover:bg-[#F2F1EC] text-xs font-medium text-[#3F3F46] transition-colors"
            >
              <Code className="w-3.5 h-3.5" />
              <span>{showRawJson ? 'View Structured Cards' : 'View Raw JSON'}</span>
            </button>

            {showRawJson && (
              <button
                onClick={handleCopyJson}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-[#E2E1DC] bg-[#FAF9F5] hover:bg-[#F2F1EC] text-xs font-medium text-[#3F3F46] transition-colors"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-[#16A34A]" /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy</span>
              </button>
            )}
          </div>
        </div>

        {showRawJson ? (
          <div className="bg-[#18181B] text-[#E4E4E7] p-5 rounded-xl font-mono text-xs overflow-x-auto shadow-inner border border-[#27272A]">
            <pre>{JSON.stringify(summary, null, 2)}</pre>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Plain English Executive Overview */}
            <div className="p-5 rounded-xl bg-[#FAF9F5] border border-[#E8E7E2]">
              <div className="text-xs font-semibold text-[#52525B] uppercase tracking-wider mb-2">
                Executive Synthesis (Rendered from JSON)
              </div>
              <p className="font-serif text-[#18181B] text-base leading-relaxed">
                {summary.plainEnglishOverview}
              </p>
            </div>

            {/* 1. Contracting Parties */}
            <div className="p-5 rounded-xl border border-[#E8E7E2] bg-[#FFFFFF]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#18181B] uppercase tracking-wider mb-3">
                <Users className="w-4 h-4 text-[#B45309]" />
                <span>Contracting Parties</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {summary.parties.map((p, idx) => (
                  <div key={idx} className="p-3.5 rounded-lg bg-[#FAF9F5] border border-[#EFEFEA]">
                    <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-[#EAEAE5] text-[#52525B]">
                      {p.role}
                    </span>
                    <div className="font-semibold text-sm text-[#18181B] mt-1.5">{p.name}</div>
                    {p.panOrAddress && (
                      <div className="text-xs text-[#71717A] mt-1">{p.panOrAddress}</div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 2. Key Dates & Durations */}
            <div className="p-5 rounded-xl border border-[#E8E7E2] bg-[#FFFFFF]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#18181B] uppercase tracking-wider mb-3">
                <Calendar className="w-4 h-4 text-[#0284C7]" />
                <span>Key Dates & Durations</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EFEFEA]">
                  <div className="text-[10px] text-[#71717A]">Commencement Date</div>
                  <div className="font-semibold text-[#18181B] mt-1">
                    {summary.keyDatesDurations.commencementDate || 'Effective Date'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EFEFEA]">
                  <div className="text-[10px] text-[#71717A]">Duration / Term</div>
                  <div className="font-semibold text-[#18181B] mt-1">
                    {summary.keyDatesDurations.durationOrTerm || 'Not specified'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EFEFEA]">
                  <div className="text-[10px] text-[#71717A]">Lock-in Period</div>
                  <div className="font-semibold text-[#18181B] mt-1">
                    {summary.keyDatesDurations.lockInPeriod || 'None noted'}
                  </div>
                </div>
                <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EFEFEA]">
                  <div className="text-[10px] text-[#71717A]">Renewal Terms</div>
                  <div className="font-semibold text-[#18181B] mt-1">
                    {summary.keyDatesDurations.renewalTerms || 'Mutual written consent'}
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Financial Terms (if lease) */}
            {summary.financialTerms && (
              <div className="p-5 rounded-xl border border-[#E8E7E2] bg-[#FFFFFF]">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#18181B] uppercase tracking-wider mb-3">
                  <DollarSign className="w-4 h-4 text-[#16A34A]" />
                  <span>Financial Consideration & Deposits</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EFEFEA]">
                    <div className="text-[10px] text-[#71717A]">Monthly Rent / Consideration</div>
                    <div className="font-semibold text-[#18181B] text-sm mt-1">
                      {summary.financialTerms.rentOrConsideration || 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EFEFEA]">
                    <div className="text-[10px] text-[#71717A]">Security Deposit</div>
                    <div className="font-semibold text-[#18181B] text-sm mt-1">
                      {summary.financialTerms.securityDeposit || 'N/A'}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EFEFEA]">
                    <div className="text-[10px] text-[#71717A]">Escalation & Maintenance</div>
                    <div className="font-semibold text-[#18181B] text-sm mt-1">
                      {summary.financialTerms.escalation || 'Standard'}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Key Obligations */}
            <div className="p-5 rounded-xl border border-[#E8E7E2] bg-[#FFFFFF]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#18181B] uppercase tracking-wider mb-3">
                <FileCheck className="w-4 h-4 text-[#7C3AED]" />
                <span>Primary Obligations by Party</span>
              </div>
              <div className="space-y-2.5">
                {summary.keyObligations.map((ob, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EFEFEA] text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-semibold text-[#18181B]">{ob.party}: </span>
                      <span className="text-[#3F3F46]">{ob.obligation}</span>
                    </div>
                    {ob.clauseRef && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#EAEAE5] text-[#52525B] shrink-0">
                        {ob.clauseRef}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* 5. Termination & Breach Conditions */}
            <div className="p-5 rounded-xl border border-[#E8E7E2] bg-[#FFFFFF]">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#18181B] uppercase tracking-wider mb-3">
                <AlertOctagon className="w-4 h-4 text-[#DC2626]" />
                <span>Termination Grounds & Breach Remedies</span>
              </div>
              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EFEFEA]">
                  <div className="text-[10px] text-[#71717A]">Stipulated Notice Period</div>
                  <div className="font-semibold text-[#18181B] mt-0.5">
                    {summary.terminationConditions.noticePeriod}
                  </div>
                </div>

                {summary.terminationConditions.grounds && summary.terminationConditions.grounds.length > 0 && (
                  <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EFEFEA]">
                    <div className="text-[10px] text-[#71717A] mb-1">Termination Grounds</div>
                    <ul className="list-disc list-inside space-y-1 text-[#3F3F46]">
                      {summary.terminationConditions.grounds.map((g, idx) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {summary.terminationConditions.remediesOnBreach && (
                  <div className="p-3 rounded-lg bg-[#FAF9F5] border border-[#EFEFEA]">
                    <div className="text-[10px] text-[#71717A]">Remedies On Breach</div>
                    <div className="text-[#3F3F46] mt-0.5">
                      {summary.terminationConditions.remediesOnBreach}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
