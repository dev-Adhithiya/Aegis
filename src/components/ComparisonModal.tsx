import React, { useState, useEffect } from 'react';
import {
  X,
  GitCompare,
  ArrowRight,
  AlertTriangle,
  CheckCircle2,
  FileText,
  ExternalLink,
  AlertCircle,
} from 'lucide-react';
import { StructuredDocument, ClauseInconsistency } from '../types/legal';

interface ComparisonModalProps {
  isOpen: boolean;
  onClose: () => void;
  documents: StructuredDocument[];
  initialDoc1Id?: string;
  onSelectDocument: (docId: string) => void;
}

export const ComparisonModal: React.FC<ComparisonModalProps> = ({
  isOpen,
  onClose,
  documents,
  initialDoc1Id,
  onSelectDocument,
}) => {
  const [doc1Id, setDoc1Id] = useState<string>(initialDoc1Id || documents[0]?.id || '');
  const [doc2Id, setDoc2Id] = useState<string>(
    documents.length > 1 ? documents[1]?.id : documents[0]?.id || ''
  );
  const [comparisonData, setComparisonData] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Sync if initialDoc1Id changes
  useEffect(() => {
    if (initialDoc1Id) {
      setDoc1Id(initialDoc1Id);
      const otherDoc = documents.find(d => d.id !== initialDoc1Id);
      if (otherDoc) setDoc2Id(otherDoc.id);
    }
  }, [initialDoc1Id, documents]);

  useEffect(() => {
    if (!isOpen || !doc1Id || !doc2Id || doc1Id === doc2Id) {
      if (doc1Id === doc2Id && documents.length > 1) {
        const other = documents.find(d => d.id !== doc1Id);
        if (other) setDoc2Id(other.id);
      }
      return;
    }

    const fetchComparison = async () => {
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const res = await fetch('/api/documents/compare', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ doc1Id, doc2Id }),
        });
        if (res.ok) {
          const data = await res.json();
          setComparisonData(data);
        } else {
          const errData = await res.json().catch(() => ({}));
          setErrorMessage(errData.error || 'Failed to compare the selected documents.');
        }
      } catch (err: any) {
        setErrorMessage(err?.message || 'Network error encountered while comparing documents.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchComparison();
  }, [isOpen, doc1Id, doc2Id]);

  if (!isOpen) return null;

  const doc1 = documents.find(d => d.id === doc1Id);
  const doc2 = documents.find(d => d.id === doc2Id);
  const crossInconsistencies: ClauseInconsistency[] = comparisonData?.inconsistencies || [];

  return (
    <div className="fixed inset-0 bg-[#000000]/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 font-sans">
      <div className="bg-[#FFFFFF] w-full max-w-5xl max-h-[90vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-[#E4E4E7]">
        {/* Modal Header */}
        <div className="p-5 border-b border-[#E4E4E7] flex items-center justify-between bg-[#FAFAF9]">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-[#18181B] text-[#FFFFFF] flex items-center justify-center">
              <GitCompare className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-serif text-lg font-semibold text-[#18181B]">
                Two-Document Legal Comparison
              </h2>
              <p className="text-xs text-[#71717A]">
                Side-by-side analysis of key covenants, liability distribution, and cross-document inconsistencies
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#71717A] hover:text-[#18181B] p-1.5 rounded-xl hover:bg-[#F4F4F5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Document Selection Pickers */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-5 bg-[#FAFAF9] border-b border-[#E4E4E7]">
          {/* Doc 1 Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#71717A] mb-1">
              Draft A (Primary Document)
            </label>
            <select
              value={doc1Id}
              onChange={e => setDoc1Id(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E4E4E7] rounded-xl px-3 py-2 text-xs text-[#18181B] font-medium focus:outline-none focus:border-[#18181B]"
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.docType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Doc 2 Selector */}
          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#71717A] mb-1">
              Draft B (Comparison Benchmark)
            </label>
            <select
              value={doc2Id}
              onChange={e => setDoc2Id(e.target.value)}
              className="w-full bg-[#FFFFFF] border border-[#E4E4E7] rounded-xl px-3 py-2 text-xs text-[#18181B] font-medium focus:outline-none focus:border-[#18181B]"
            >
              {documents.map(d => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.docType.toUpperCase()})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {errorMessage && (
            <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-[#EF4444]" />
              <span>{errorMessage}</span>
            </div>
          )}

          {isLoading ? (
            <div className="p-12 text-center text-xs text-[#71717A]">
              <div className="w-6 h-6 border-2 border-[#18181B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
              <span>Analyzing differences and contradictions between clauses...</span>
            </div>
          ) : comparisonData ? (
            <>
              {/* Executive Synthesis */}
              <div className="p-4 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7] text-xs">
                <div className="font-semibold text-[#18181B] mb-1">
                  Comparative Executive Summary
                </div>
                <p className="text-[#3F3F46] leading-relaxed">
                  {comparisonData.summary}
                </p>
              </div>

              {/* Cross-Document Contradiction Section */}
              {crossInconsistencies.length > 0 && (
                <div className="p-4 rounded-xl bg-[#FEF2F2] border border-[#FECACA] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#991B1B]">
                    <AlertCircle className="w-4 h-4 text-[#EF4444]" />
                    <span>Cross-Document Inconsistencies & Contradictions ({crossInconsistencies.length} Detected)</span>
                  </div>
                  <p className="text-[11px] text-[#B91C1C]">
                    The compared documents contain conflicting contractual terms that require explicit reconciliation:
                  </p>
                  <div className="space-y-2">
                    {crossInconsistencies.map((incon, idx) => (
                      <div key={idx} className="p-3.5 rounded-xl bg-[#FFFFFF] border border-[#FECACA] text-xs space-y-1.5">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#09090B]">
                            {incon.title}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#FEE2E2] text-[#991B1B] font-bold">
                            {incon.severity} priority
                          </span>
                        </div>
                        <p className="text-[#3F3F46] leading-relaxed">
                          {incon.description}
                        </p>
                        <p className="text-[#52525B] text-[11px]">
                          <strong>Potential Impact:</strong> {incon.potentialImpact}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Side-by-side Table */}
              <div className="border border-[#E4E4E7] rounded-xl overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#FAFAF9] border-b border-[#E4E4E7] text-[#71717A] font-semibold text-[11px] uppercase tracking-wider">
                      <th className="p-3.5 w-1/4">Key Provision</th>
                      <th className="p-3.5 w-3/8 border-l border-[#E4E4E7] text-[#18181B]">
                        {doc1?.name}
                      </th>
                      <th className="p-3.5 w-3/8 border-l border-[#E4E4E7] text-[#18181B]">
                        {doc2?.name}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F4F4F5]">
                    {comparisonData.categories.map((cat: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[#FAFAF9] transition-colors">
                        <td className="p-3.5 align-top font-semibold text-[#18181B]">
                          <div>{cat.topic}</div>
                          <div className="text-[10px] text-[#71717A] font-normal mt-1 leading-tight">
                            {cat.analysis}
                          </div>
                        </td>

                        <td className="p-3.5 align-top border-l border-[#E4E4E7] text-[#27272A] leading-relaxed">
                          <div>{cat.doc1Value}</div>
                          {cat.doc1Clause && (
                            <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[#52525B] mt-1.5 border border-[#E4E4E7]">
                              Clause {cat.doc1Clause}
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 align-top border-l border-[#E4E4E7] text-[#27272A] leading-relaxed">
                          <div>{cat.doc2Value}</div>
                          {cat.doc2Clause && (
                            <span className="inline-block text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#F4F4F5] text-[#52525B] mt-1.5 border border-[#E4E4E7]">
                              Clause {cat.doc2Clause}
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recommended Action Checklist for Lawyer */}
              <div className="p-4 rounded-xl bg-[#FFFBEB] border border-[#FDE68A] text-xs">
                <div className="font-semibold text-[#92400E] mb-2 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-[#D97706]" />
                  <span>Advocate Negotiation Points Based on Comparison</span>
                </div>
                <ul className="list-disc list-inside space-y-1 text-[#B45309]">
                  {comparisonData.recommendationChecklist.map((item: string, idx: number) => (
                    <li key={idx}>{item}</li>
                  ))}
                </ul>
              </div>
            </>
          ) : (
            <div className="p-8 text-center text-xs text-[#71717A]">
              Please select two different documents above to initiate comparison.
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#E4E4E7] bg-[#FAFAF9] flex items-center justify-between">
          <span className="text-[11px] text-[#71717A]">
            Comparison generated under Indian Contract Act 1872 / Transfer of Property Act 1882.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#18181B] hover:bg-[#27272A] text-[#FFFFFF] text-xs font-medium rounded-xl transition-colors"
          >
            Close Comparison
          </button>
        </div>
      </div>
    </div>
  );
};
