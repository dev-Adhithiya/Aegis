import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  FolderPlus,
  Plus,
  FileText,
  AlertTriangle,
  Scale,
  Shield,
  Send,
  Sparkles,
  ChevronRight,
  ExternalLink,
  MessageSquare,
  GitCompare,
  Trash2,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { Workspace, StructuredDocument, ClauseInconsistency, RiskFlag } from '../types/legal';

interface WorkspaceViewProps {
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onSelectWorkspace: (id: string) => void;
  onCreateWorkspace: (name: string, description: string, documentIds: string[]) => Promise<void>;
  onSelectDocument: (docId: string) => void;
  onOpenCompareWithDocs?: (doc1Id: string, doc2Id: string) => void;
  availableDocuments: StructuredDocument[];
}

export const WorkspaceView: React.FC<WorkspaceViewProps> = ({
  workspaces,
  activeWorkspaceId,
  onSelectWorkspace,
  onCreateWorkspace,
  onSelectDocument,
  onOpenCompareWithDocs,
  availableDocuments,
}) => {
  const [workspaceData, setWorkspaceData] = useState<{
    workspace: Workspace;
    documents: StructuredDocument[];
    crossInconsistencies: ClauseInconsistency[];
    allInconsistencies: ClauseInconsistency[];
    aggregatedRiskFlags: RiskFlag[];
    highRiskCount: number;
  } | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'qa' | 'inconsistencies'>('overview');

  // New workspace modal state
  const [isCreating, setIsCreating] = useState(false);
  const [newWsName, setNewWsName] = useState('');
  const [newWsDesc, setNewWsDesc] = useState('');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Workspace Q&A state
  const [query, setQuery] = useState('');
  const [isQuerying, setIsQuerying] = useState(false);
  const [qaHistory, setQaHistory] = useState<Array<{
    id: string;
    question: string;
    answer: string;
    citations: any[];
    timestamp: string;
  }>>([]);

  // Fetch workspace details when activeWorkspaceId changes
  useEffect(() => {
    if (!activeWorkspaceId) return;

    const fetchWorkspaceDetails = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/workspaces/${activeWorkspaceId}`);
        if (res.ok) {
          const data = await res.json();
          setWorkspaceData(data);
        }
      } catch (err) {
        console.error('Error fetching workspace details:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkspaceDetails();
  }, [activeWorkspaceId]);

  const handleCreateWorkspaceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWsName.trim()) return;
    await onCreateWorkspace(newWsName, newWsDesc, selectedDocIds);
    setIsCreating(false);
    setNewWsName('');
    setNewWsDesc('');
    setSelectedDocIds([]);
  };

  const handleWorkspaceQA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim() || !activeWorkspaceId || isQuerying) return;

    const userQuestion = query.trim();
    setQuery('');
    setIsQuerying(true);

    try {
      const res = await fetch(`/api/workspaces/${activeWorkspaceId}/qa`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: userQuestion }),
      });

      if (res.ok) {
        const data = await res.json();
        setQaHistory(prev => [
          {
            id: `ws-qa-${Date.now()}`,
            question: userQuestion,
            answer: data.answer || data.text,
            citations: data.citations || [],
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Workspace Q&A error:', err);
    } finally {
      setIsQuerying(false);
    }
  };

  const activeWorkspace = workspaces.find(w => w.id === activeWorkspaceId) || workspaces[0];

  return (
    <div className="flex-1 h-full overflow-y-auto bg-[#FFFFFF] p-6 sm:p-10 font-sans">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Workspace Matter Header & Selector */}
        <div className="pb-5 border-b border-[#E4E4E7] flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest font-mono text-[#71717A]">
              <Briefcase className="w-3.5 h-3.5 text-[#2563EB]" />
              <span>Legal Case & Matter Workspace</span>
            </div>
            <h1 className="font-serif text-2xl sm:text-3xl font-semibold text-[#18181B] mt-1">
              {activeWorkspace ? activeWorkspace.name : 'Select a Case Matter'}
            </h1>
            <p className="text-xs text-[#71717A] mt-1">
              {activeWorkspace?.description || 'Group related agreements, check cross-document contradictions, and run multi-document Q&A.'}
            </p>
          </div>

          {/* Action buttons: Switch Matter & + New Matter */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={activeWorkspaceId || ''}
              onChange={(e) => onSelectWorkspace(e.target.value)}
              className="bg-[#FFFFFF] border border-[#E4E4E7] rounded-xl px-3 py-2 text-xs text-[#09090B] font-medium focus:outline-none focus:ring-2 focus:ring-[#18181B]/10"
            >
              {workspaces.map(ws => (
                <option key={ws.id} value={ws.id}>
                  {ws.name} ({ws.documentCount || ws.documentIds?.length || 0} docs)
                </option>
              ))}
            </select>

            <button
              onClick={() => setIsCreating(true)}
              className="flex items-center gap-1.5 px-3 py-2 bg-[#18181B] hover:bg-[#27272A] text-[#FFFFFF] rounded-xl text-xs font-medium transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New Matter</span>
            </button>
          </div>
        </div>

        {/* Create Workspace Modal */}
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#09090B]/60 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#E4E4E7] w-full max-w-md p-6 space-y-4">
              <h2 className="text-sm font-semibold text-[#09090B] flex items-center gap-2">
                <FolderPlus className="w-4 h-4 text-[#2563EB]" />
                <span>Create New Case / Matter Workspace</span>
              </h2>

              <form onSubmit={handleCreateWorkspaceSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-[#09090B] mb-1">
                    Matter Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Indiranagar Commercial Sub-Lease Matter"
                    value={newWsName}
                    onChange={(e) => setNewWsName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#E4E4E7] rounded-xl text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#18181B]/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#09090B] mb-1">
                    Description / Legal Context
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief scope of negotiations or parties involved"
                    value={newWsDesc}
                    onChange={(e) => setNewWsDesc(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#FFFFFF] border border-[#E4E4E7] rounded-xl text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#18181B]/10"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#09090B] mb-1">
                    Assign Existing Documents
                  </label>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto p-2 bg-[#FAFAF9] border border-[#E4E4E7] rounded-xl">
                    {availableDocuments.map(doc => (
                      <label key={doc.id} className="flex items-center gap-2 text-xs text-[#09090B] cursor-pointer hover:bg-[#F4F4F5] p-1.5 rounded-lg">
                        <input
                          type="checkbox"
                          checked={selectedDocIds.includes(doc.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedDocIds(prev => [...prev, doc.id]);
                            } else {
                              setSelectedDocIds(prev => prev.filter(id => id !== doc.id));
                            }
                          }}
                          className="rounded border-[#E4E4E7] text-[#18181B] focus:ring-0"
                        />
                        <span className="truncate">{doc.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-3 py-2 text-xs text-[#71717A] hover:bg-[#F4F4F5] rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#18181B] hover:bg-[#27272A] text-[#FFFFFF] rounded-xl text-xs font-medium"
                  >
                    Create Matter
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex bg-[#F4F4F5] p-1 rounded-xl border border-[#E4E4E7] text-xs font-medium self-start w-fit">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'bg-[#FFFFFF] text-[#09090B] shadow-xs font-semibold'
                : 'text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <span>Matter Overview</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#E4E4E7] text-[#18181B]">
              {workspaceData?.documents.length || 0} docs
            </span>
          </button>
          <button
            onClick={() => setActiveTab('qa')}
            className={`px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
              activeTab === 'qa'
                ? 'bg-[#FFFFFF] text-[#09090B] shadow-xs font-semibold'
                : 'text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <span>Cross-Document Q&A</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#ECFDF5] text-[#065F46] font-bold">
              SCOPED
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
            <span>Cross Contradictions</span>
            <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
              (workspaceData?.crossInconsistencies.length || 0) > 0
                ? 'bg-[#FEE2E2] text-[#DC2626] font-bold'
                : 'bg-[#E4E4E7] text-[#71717A]'
            }`}>
              {workspaceData?.crossInconsistencies.length || 0}
            </span>
          </button>
        </div>

        {/* Content Tabs */}
        {isLoading ? (
          <div className="p-12 text-center text-xs text-[#71717A]">
            <div className="w-6 h-6 border-2 border-[#18181B] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <span>Loading matter documents and synthesizing risks...</span>
          </div>
        ) : (
          <>
            {/* TAB 1: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Metrics Banner */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-[#E4E4E7]">
                    <span className="text-[10px] font-mono uppercase text-[#71717A]">Linked Contracts</span>
                    <div className="text-xl font-bold text-[#09090B] mt-0.5">
                      {workspaceData?.documents.length || 0} Documents
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-[#E4E4E7]">
                    <span className="text-[10px] font-mono uppercase text-[#71717A]">Cross Contradictions</span>
                    <div className={`text-xl font-bold mt-0.5 ${
                      (workspaceData?.crossInconsistencies.length || 0) > 0 ? 'text-[#DC2626]' : 'text-[#10B981]'
                    }`}>
                      {workspaceData?.crossInconsistencies.length || 0} Conflicts
                    </div>
                  </div>
                  <div className="p-4 rounded-2xl bg-[#FAFAF9] border border-[#E4E4E7]">
                    <span className="text-[10px] font-mono uppercase text-[#71717A]">Aggregated Risk Flags</span>
                    <div className="text-xl font-bold text-[#B45309] mt-0.5">
                      {workspaceData?.aggregatedRiskFlags.length || 0} ({workspaceData?.highRiskCount || 0} High)
                    </div>
                  </div>
                </div>

                {/* Documents in this Matter */}
                <div className="space-y-3">
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-[#09090B]">
                    Constituent Documents in this Matter
                  </h3>

                  {(!workspaceData || workspaceData.documents.length === 0) ? (
                    <div className="p-8 text-center bg-[#FAFAF9] border border-[#E4E4E7] rounded-2xl text-xs text-[#71717A]">
                      No documents currently assigned to this matter. Add files above.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {workspaceData.documents.map(doc => (
                        <div
                          key={doc.id}
                          className="p-4 rounded-2xl bg-[#FFFFFF] border border-[#E4E4E7] hover:border-[#18181B]/30 shadow-xs transition-all space-y-3"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-xl bg-[#F4F4F5] border border-[#E4E4E7] flex items-center justify-center text-[#18181B] shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                              <div className="min-w-0">
                                <h4 className="font-semibold text-xs text-[#09090B] truncate">
                                  {doc.name}
                                </h4>
                                <span className="text-[10px] text-[#71717A]">
                                  {doc.docType.toUpperCase()} • {doc.clauses.length} Clauses
                                </span>
                              </div>
                            </div>
                            <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-lg bg-[#FEF3C7] text-[#92400E] border border-[#FDE68A] shrink-0">
                              {doc.riskFlags.length} Flags
                            </span>
                          </div>

                          <div className="flex items-center gap-2 pt-2 border-t border-[#F4F4F5]">
                            <button
                              onClick={() => onSelectDocument(doc.id)}
                              className="flex items-center gap-1 text-xs text-[#18181B] hover:text-[#000000] font-medium"
                            >
                              <span>View Analysis</span>
                              <ExternalLink className="w-3 h-3" />
                            </button>

                            {workspaceData.documents.length > 1 && onOpenCompareWithDocs && (
                              <button
                                onClick={() => {
                                  const other = workspaceData.documents.find(d => d.id !== doc.id);
                                  if (other) onOpenCompareWithDocs(doc.id, other.id);
                                }}
                                className="ml-auto flex items-center gap-1 text-xs text-[#2563EB] hover:text-[#1D4ED8] font-medium"
                              >
                                <GitCompare className="w-3 h-3" />
                                <span>Compare in Matter</span>
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB 2: CROSS-DOCUMENT Q&A */}
            {activeTab === 'qa' && (
              <div className="space-y-6">
                {/* Prompt Box */}
                <form onSubmit={handleWorkspaceQA} className="p-4 rounded-2xl bg-[#FAFAF9] border border-[#E4E4E7] space-y-3">
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#09090B]">
                    <Sparkles className="w-4 h-4 text-[#2563EB]" />
                    <span>Ask Questions Across All Documents in "{activeWorkspace?.name}"</span>
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="e.g. Which document governs notice periods, and do they contradict each other?"
                      className="flex-1 px-4 py-2.5 text-xs bg-[#FFFFFF] border border-[#E4E4E7] rounded-xl text-[#09090B] focus:outline-none focus:ring-2 focus:ring-[#18181B]/10"
                    />
                    <button
                      type="submit"
                      disabled={isQuerying || !query.trim()}
                      className="flex items-center gap-1.5 px-4 py-2.5 bg-[#18181B] hover:bg-[#27272A] text-[#FFFFFF] rounded-xl text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{isQuerying ? 'Analyzing...' : 'Ask Matter'}</span>
                    </button>
                  </div>
                  <p className="text-[11px] text-[#71717A]">
                    Retrieves relevant clauses from all linked contracts in this matter, cites exact document names and clause numbers, and highlights any cross-document contradictions.
                  </p>
                </form>

                {/* Q&A Stream / History */}
                <div className="space-y-4">
                  {qaHistory.length === 0 ? (
                    <div className="p-8 text-center bg-[#FAFAF9] border border-[#E4E4E7] rounded-2xl text-xs text-[#71717A] space-y-2">
                      <MessageSquare className="w-6 h-6 mx-auto text-[#A1A1AA]" />
                      <div className="font-semibold text-[#09090B]">No Matter Questions Yet</div>
                      <p className="max-w-md mx-auto">
                        Ask about notice periods, liability caps, or conflicting provisions between the primary agreement and any addenda in this workspace.
                      </p>
                    </div>
                  ) : (
                    qaHistory.map((item) => (
                      <div key={item.id} className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-xs space-y-3 text-xs">
                        <div className="flex items-center justify-between text-[#71717A] text-[11px]">
                          <span className="font-semibold text-[#09090B]">Q: {item.question}</span>
                          <span>{item.timestamp}</span>
                        </div>

                        <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#1E293B] leading-relaxed">
                          {item.answer}
                        </div>

                        {item.citations && item.citations.length > 0 && (
                          <div className="pt-2">
                            <span className="text-[10px] font-mono uppercase font-semibold text-[#71717A]">
                              Document Citations ({item.citations.length})
                            </span>
                            <div className="mt-1 space-y-1.5">
                              {item.citations.map((cit: any, cIdx: number) => (
                                <div key={cIdx} className="p-2 rounded-lg bg-[#FAFAF9] border border-[#E4E4E7] text-[11px]">
                                  <div className="font-semibold text-[#09090B]">{cit.clauseTitle}</div>
                                  <div className="font-serif text-[#52525B] italic mt-0.5">"{cit.exactQuote}"</div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* TAB 3: CROSS CONTRADICTIONS */}
            {activeTab === 'inconsistencies' && (
              <div className="space-y-4">
                {(!workspaceData || workspaceData.crossInconsistencies.length === 0) ? (
                  <div className="p-8 text-center bg-[#F0FDF4] border border-[#BBF7D0] rounded-2xl">
                    <CheckCircle2 className="w-8 h-8 text-[#16A34A] mx-auto mb-2" />
                    <div className="font-serif text-lg font-semibold text-[#166534]">
                      No Cross-Document Contradictions Detected
                    </div>
                    <p className="text-xs text-[#15803D] mt-1 max-w-md mx-auto">
                      All agreements in this matter maintain aligned covenants regarding notice, deposits, and liability.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3.5 rounded-xl bg-[#FEF2F2] border border-[#FECACA] flex items-center gap-3 text-xs text-[#991B1B]">
                      <AlertCircle className="w-5 h-5 shrink-0 text-[#EF4444]" />
                      <p>
                        Found <strong>{workspaceData.crossInconsistencies.length} contradiction(s)</strong> between documents in this matter. These discrepancies must be clarified before executing any addendum.
                      </p>
                    </div>

                    {workspaceData.crossInconsistencies.map((incon, idx) => (
                      <div key={idx} className="p-5 rounded-2xl bg-[#FFFFFF] border border-[#E4E4E7] shadow-xs space-y-3 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-[#09090B]">
                            {incon.title}
                          </span>
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-lg bg-[#FEE2E2] text-[#991B1B] font-bold">
                            {incon.severity} risk
                          </span>
                        </div>

                        <p className="text-xs text-[#3F3F46] leading-relaxed">
                          {incon.description}
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
                          <div className="p-3 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                            <div className="font-semibold text-[11px] text-[#1E293B] mb-1">
                              Clause {incon.clauseA.clauseNumber}: {incon.clauseA.title || 'Draft A Provision'}
                            </div>
                            <p className="font-serif text-[11px] text-[#334155] italic">
                              "{incon.clauseA.excerpt.slice(0, 240)}..."
                            </p>
                            <div className="mt-2 text-[10px] font-medium text-[#1E293B] bg-[#FFFFFF] p-1.5 rounded-lg border border-[#E2E8F0]">
                              Stated: {incon.clauseA.statedTerm}
                            </div>
                          </div>

                          <div className="p-3 rounded-xl bg-[#FFFBEB] border border-[#FDE68A]">
                            <div className="font-semibold text-[11px] text-[#92400E] mb-1">
                              Clause {incon.clauseB.clauseNumber}: {incon.clauseB.title || 'Draft B Provision'}
                            </div>
                            <p className="font-serif text-[11px] text-[#78350F] italic">
                              "{incon.clauseB.excerpt.slice(0, 240)}..."
                            </p>
                            <div className="mt-2 text-[10px] font-medium text-[#92400E] bg-[#FFFFFF] p-1.5 rounded-lg border border-[#FDE68A]">
                              Stated: {incon.clauseB.statedTerm}
                            </div>
                          </div>
                        </div>

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
          </>
        )}
      </div>
    </div>
  );
};
