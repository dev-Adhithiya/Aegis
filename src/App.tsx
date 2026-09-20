import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { TopBar } from './components/TopBar';
import { LandingView } from './components/LandingView';
import { DocumentViewer } from './components/DocumentViewer';
import { StructuredEntityViewer } from './components/StructuredEntityViewer';
import { RiskFlagsPanel } from './components/RiskFlagsPanel';
import { ComparisonModal } from './components/ComparisonModal';
import { ExportModal } from './components/ExportModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { UploadModal } from './components/UploadModal';
import { LoginPage } from './components/LoginPage';
import { LogoutPage } from './components/LogoutPage';
import { CitationQAPage } from './components/CitationQAPage';
import { PracticeFeedbackPage } from './components/PracticeFeedbackPage';
import { VaultPage } from './components/VaultPage';
import { CookieManagementModal } from './components/CookieManagementModal';
import { CookieBanner } from './components/CookieBanner';
import { SettingsModal } from './components/SettingsModal';
import { WorkspaceView } from './components/WorkspaceView';
import { initialVaultItems } from './data/initialVault';
import {
  StructuredDocument,
  RiskFlag,
  AuthUser,
  PracticeSessionFeedback,
  VaultItem,
  Workspace,
} from './types/legal';
import { MessageSquare, FileText, AlertTriangle, ArrowRight, Briefcase } from 'lucide-react';

export default function App() {
  const [documents, setDocuments] = useState<StructuredDocument[]>([]);
  const [activeDocumentId, setActiveDocumentId] = useState<string | null>(null);

  // Workspaces State
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);

  // Application Page Flow: 'login' -> 'document' (main) -> 'citation-qa' -> 'practice-feedback' -> 'vault' -> 'workspaces' -> 'logout' -> 'login'
  const [currentView, setCurrentView] = useState<
    'login' | 'document' | 'citation-qa' | 'practice-feedback' | 'vault' | 'workspaces' | 'logout' | 'landing'
  >('document');

  // Sub-tab inside the document viewer: 'clauses' | 'summary' | 'flags'
  const [docTab, setDocTab] = useState<'clauses' | 'summary' | 'flags'>('clauses');
  const [targetClauseId, setTargetClauseId] = useState<string | null>(null);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>({
    id: 'user-counsel-1',
    email: 'askadhithiya@gmail.com',
    name: 'Adv. Adhithiya',
    role: 'counsel',
  });

  // Vault Items State
  const [vaultItems, setVaultItems] = useState<VaultItem[]>(initialVaultItems);

  // Feedback State for the dedicated Feedback Page
  const [latestFeedback, setLatestFeedback] = useState<PracticeSessionFeedback | null>(null);

  // Modals
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isDriveOpen, setIsDriveOpen] = useState(false);
  const [isCompareOpen, setIsCompareOpen] = useState(false);
  const [compareDoc1Id, setCompareDoc1Id] = useState<string | undefined>(undefined);
  const [compareDoc2Id, setCompareDoc2Id] = useState<string | undefined>(undefined);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isCookiesOpen, setIsCookiesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Load session from server
  const checkAuth = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setCurrentUser(data.user);
        }
      }
    } catch (err) {
      console.warn('Session check:', err);
    }
  };

  // Fetch contracts
  const loadDocuments = async () => {
    try {
      const res = await fetch('/api/documents');
      if (res.ok) {
        const docs = await res.json();
        setDocuments(docs);
        if (docs.length > 0 && !activeDocumentId) {
          setActiveDocumentId(docs[0].id);
        }
      }
    } catch (err) {
      console.error('Error fetching contracts:', err);
    }
  };

  // Fetch workspaces
  const loadWorkspaces = async () => {
    try {
      const res = await fetch('/api/workspaces');
      if (res.ok) {
        const wsList = await res.json();
        setWorkspaces(wsList);
        if (wsList.length > 0 && !activeWorkspaceId) {
          setActiveWorkspaceId(wsList[0].id);
        }
      }
    } catch (err) {
      console.error('Error loading workspaces:', err);
    }
  };

  useEffect(() => {
    checkAuth();
    loadDocuments();
    loadWorkspaces();
  }, []);

  const handleCreateWorkspace = async (name: string, description: string, documentIds: string[]) => {
    try {
      const res = await fetch('/api/workspaces', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, description, documentIds }),
      });
      if (res.ok) {
        const newWs = await res.json();
        setWorkspaces(prev => [newWs, ...prev]);
        setActiveWorkspaceId(newWs.id);
      }
    } catch (err) {
      console.error('Error creating workspace:', err);
    }
  };

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setCurrentView('document');
    loadDocuments();
    loadWorkspaces();
  };

  const handleInitiateLogout = () => {
    // Flow requirement: login -> main page -> logout page -> redirect to login page
    setCurrentView('logout');
  };

  const handleCompleteLogoutRedirect = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const activeDocument = documents.find(d => d.id === activeDocumentId) || documents[0] || null;

  const handleSelectDocument = (docId: string) => {
    setActiveDocumentId(docId);
    setTargetClauseId(null);
  };

  const handleDocumentLoaded = (newDoc: StructuredDocument) => {
    setDocuments(prev => {
      const exists = prev.find(d => d.id === newDoc.id);
      if (exists) {
        return prev.map(d => (d.id === newDoc.id ? newDoc : d));
      }
      return [newDoc, ...prev];
    });
    setActiveDocumentId(newDoc.id);
    setCurrentView('document');
    setDocTab('clauses');
    loadWorkspaces();
  };

  const handleAddToVault = (item: Omit<VaultItem, 'id' | 'createdAt'>) => {
    const newItem: VaultItem = {
      ...item,
      id: `vault-${Date.now()}`,
      createdAt: new Date().toLocaleString([], {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
      }),
    };
    setVaultItems(prev => [newItem, ...prev]);
  };

  const handleDeleteVaultItem = (id: string) => {
    setVaultItems(prev => prev.filter(item => item.id !== id));
  };

  const handleOpenCompareWithDocs = (doc1Id: string, doc2Id: string) => {
    setCompareDoc1Id(doc1Id);
    setCompareDoc2Id(doc2Id);
    setIsCompareOpen(true);
  };

  // If user is explicitly on login page
  if (currentView === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  // If user is on dedicated logout page
  if (currentView === 'logout') {
    return <LogoutPage onRedirectToLogin={handleCompleteLogoutRedirect} />;
  }

  // If user is on dedicated Citation Q&A Practice page
  if (currentView === 'citation-qa' && activeDocument) {
    return (
      <CitationQAPage
        document={activeDocument}
        documents={documents}
        onBackToDocument={() => setCurrentView('document')}
        onSelectDocument={handleSelectDocument}
        onNavigateToFeedback={feedback => {
          setLatestFeedback(feedback);
          setCurrentView('practice-feedback');
        }}
        onAddToVault={handleAddToVault}
      />
    );
  }

  // If user is on dedicated Practice Feedback page
  if (currentView === 'practice-feedback' && activeDocument) {
    const fallbackFeedback: PracticeSessionFeedback = latestFeedback || {
      overallRating: 'Strong',
      clarityScore: 8.5,
      accuracyScore: 9.0,
      clarityEvaluation:
        'Counsel maintained a firm, structured cadence, citing the 11-month statutory lease tenure accurately without conceding premature deductions.',
      textualAccuracy:
        'Explicitly verified Clause 3 and Indian Contract Act 1872 Section 74, asserting that liquidated damages require proof of actual damage rather than automatic forfeiture.',
      keyStrengths: [
        'Immediate citation of written notice requirements',
        'Polite but assertive stance against unconditional deposit retention',
        'Referenced reciprocal obligations for repairs',
      ],
      keyAdjustments: [
        'Specify a definite 15-day banking day refund window',
        'Demand itemized tax receipts for any alleged structural damages',
      ],
      nonLegalDisclaimer:
        'This simulation assessment is strictly for communication clarity and negotiation preparation. It does not constitute formal legal counsel under the Advocates Act 1961.',
    };

    return (
      <PracticeFeedbackPage
        feedback={fallbackFeedback}
        document={activeDocument}
        onBackToQA={() => setCurrentView('citation-qa')}
        onBackToDocument={() => setCurrentView('document')}
        onRestartPractice={() => setCurrentView('citation-qa')}
        onAddToVault={handleAddToVault}
      />
    );
  }

  // If user is on dedicated Vault page
  if (currentView === 'vault') {
    return (
      <VaultPage
        vaultItems={vaultItems}
        documents={documents}
        onBackToMain={() => setCurrentView('document')}
        onDeleteItem={handleDeleteVaultItem}
        onSelectDocument={docId => {
          handleSelectDocument(docId);
          setCurrentView('document');
        }}
      />
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAF9] font-sans antialiased text-[#18181B] select-none">
      {/* 1. Left Minimalist Sidebar */}
      <Sidebar
        currentView={currentView}
        setCurrentView={setCurrentView}
        documents={documents}
        workspaces={workspaces}
        activeDocumentId={activeDocumentId}
        onSelectDocument={handleSelectDocument}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenDrive={() => setIsDriveOpen(true)}
        onOpenCompare={() => setIsCompareOpen(true)}
        currentUser={currentUser}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenCookies={() => setIsCookiesOpen(true)}
      />

      {/* 2. Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {currentView === 'workspaces' ? (
          <WorkspaceView
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            onSelectWorkspace={(wsId) => setActiveWorkspaceId(wsId)}
            onCreateWorkspace={handleCreateWorkspace}
            onSelectDocument={(docId) => {
              handleSelectDocument(docId);
              setCurrentView('document');
            }}
            onOpenCompareWithDocs={handleOpenCompareWithDocs}
            availableDocuments={documents}
          />
        ) : currentView === 'landing' ? (
          <LandingView
            documents={documents}
            onSelectDocument={docId => {
              handleSelectDocument(docId);
              setCurrentView('document');
            }}
            onOpenUpload={() => setIsUploadOpen(true)}
            onOpenDrive={() => setIsDriveOpen(true)}
            onOpenCompare={() => setIsCompareOpen(true)}
            onQuickAsk={() => {
              setCurrentView('citation-qa');
            }}
          />
        ) : activeDocument ? (
          <>
            {/* Top Bar: ONLY Which Contract It Is, Export Button, and Logout (as strictly requested) */}
            <TopBar
              documents={documents}
              activeDocument={activeDocument}
              onSelectDocument={handleSelectDocument}
              onOpenExport={() => setIsExportOpen(true)}
              onLogout={handleInitiateLogout}
            />

            {/* Sub-Header Toolbar: View Modes & Quick Access to Citation Q&A */}
            <div className="h-11 px-6 bg-[#FAFAF9] border-b border-[#E4E4E7] flex items-center justify-between gap-3 text-xs select-none">
              {/* Left: Document Tabs (Clauses, Structured Entities, Risk Flags) */}
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setDocTab('clauses')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors ${
                    docTab === 'clauses'
                      ? 'bg-[#FFFFFF] text-[#09090B] border border-[#E4E4E7] shadow-xs'
                      : 'text-[#71717A] hover:text-[#09090B]'
                  }`}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Clauses ({activeDocument.clauses.length})</span>
                </button>

                <button
                  onClick={() => setDocTab('summary')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors ${
                    docTab === 'summary'
                      ? 'bg-[#FFFFFF] text-[#09090B] border border-[#E4E4E7] shadow-xs'
                      : 'text-[#71717A] hover:text-[#09090B]'
                  }`}
                >
                  <span>Key Terms & Entities</span>
                </button>

                <button
                  onClick={() => setDocTab('flags')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium transition-colors ${
                    docTab === 'flags'
                      ? 'bg-[#FFFFFF] text-[#09090B] border border-[#E4E4E7] shadow-xs'
                      : 'text-[#71717A] hover:text-[#09090B]'
                  }`}
                >
                  <AlertTriangle className="w-3.5 h-3.5 text-[#E11D48]" />
                  <span>Risk Flags & Inconsistencies ({activeDocument.riskFlags.length})</span>
                </button>
              </div>

              {/* Right: Quick Action to open the dedicated Citation Q&A page */}
              <button
                id="btn-open-citation-qa"
                onClick={() => setCurrentView('citation-qa')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#18181B] hover:bg-[#09090B] text-[#FFFFFF] font-medium transition-colors shadow-xs"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Open Citation Q&A Practice</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Document Viewer Main Body */}
            <div className="flex-1 flex overflow-hidden">
              <main className="flex-1 overflow-hidden flex flex-col bg-[#FFFFFF]">
                {docTab === 'clauses' && (
                  <DocumentViewer
                    document={activeDocument}
                    targetClauseId={targetClauseId}
                    onStartOralPractice={() => setCurrentView('citation-qa')}
                  />
                )}

                {docTab === 'summary' && (
                  <StructuredEntityViewer document={activeDocument} />
                )}

                {docTab === 'flags' && (
                  <RiskFlagsPanel
                    document={activeDocument}
                    onJumpToClause={clauseId => {
                      setDocTab('clauses');
                      setTargetClauseId(clauseId);
                    }}
                  />
                )}
              </main>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-center text-[#71717A]">
            <div>
              <div className="font-serif text-xl text-[#18181B] mb-2">No Document Selected</div>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 bg-[#18181B] text-[#FFFFFF] rounded-xl text-xs font-medium"
              >
                Upload Document
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Cookie Consent Banner (Dismissible) */}
      <CookieBanner onOpenPreferences={() => setIsCookiesOpen(true)} />

      {/* Modals & Dialogs */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onDocumentLoaded={handleDocumentLoaded}
      />

      <GoogleDriveModal
        isOpen={isDriveOpen}
        onClose={() => setIsDriveOpen(false)}
        onImportDocument={handleDocumentLoaded}
      />

      <ComparisonModal
        isOpen={isCompareOpen}
        onClose={() => {
          setIsCompareOpen(false);
          setCompareDoc1Id(undefined);
          setCompareDoc2Id(undefined);
        }}
        documents={documents}
        initialDoc1Id={compareDoc1Id || activeDocument?.id}
        onSelectDocument={handleSelectDocument}
      />

      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        document={activeDocument}
      />

      <CookieManagementModal
        isOpen={isCookiesOpen}
        onClose={() => setIsCookiesOpen(false)}
        onLogout={handleInitiateLogout}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        currentUser={currentUser}
        onUserUpdated={setCurrentUser}
      />
    </div>
  );
}
