export type DocumentType = 'lease' | 'nda' | 'other';

export interface Clause {
  id: string; // e.g. "clause-1"
  clauseNumber: string; // e.g. "1", "2.1", "Clause 4"
  title: string; // e.g. "Security Deposit and Deductions"
  text: string;
  offset: number;
  riskTags?: string[];
}

export interface DocumentSummary {
  parties: Array<{
    name: string;
    role: string;
    panOrAddress?: string;
  }>;
  purpose: string;
  keyDatesDurations: {
    commencementDate?: string;
    durationOrTerm?: string;
    lockInPeriod?: string;
    renewalTerms?: string;
  };
  keyObligations: Array<{
    party: string;
    obligation: string;
    clauseRef?: string;
  }>;
  financialTerms?: {
    rentOrConsideration?: string;
    securityDeposit?: string;
    escalation?: string;
    maintenanceOrOthers?: string;
  };
  terminationConditions: {
    noticePeriod?: string;
    grounds?: string[];
    remediesOnBreach?: string;
    clauseRef?: string;
  };
  plainEnglishOverview: string;
}

export type RiskSeverity = 'high' | 'medium' | 'low';
export type RiskCategory = 'Statutory Compliance' | 'General Practice Concern';

export interface RiskOption {
  id: string;
  actionType: 'negotiate' | 'clarify' | 'review';
  title: string;
  description: string;
}

export interface RiskFlag {
  id: string;
  ruleId: string;
  ruleName: string;
  severity: RiskSeverity;
  category: RiskCategory;
  matchedClauseId: string;
  matchedClauseNumber: string;
  matchedClauseExcerpt: string;
  plainEnglishExplanation: string;
  statutoryProvision: string | null; // e.g. "Transfer of Property Act 1882, Section 106" or null
  recommendationForLawyer: string;
  yourOptions?: RiskOption[]; // Plain-English informational paths: negotiate, clarify, review
}

export interface ClauseInconsistency {
  id: string;
  title: string;
  description: string;
  severity: 'high' | 'medium' | 'low';
  clauseA: {
    documentId?: string;
    documentName?: string;
    clauseId: string;
    clauseNumber: string;
    title?: string;
    excerpt: string;
    statedTerm: string;
  };
  clauseB: {
    documentId?: string;
    documentName?: string;
    clauseId: string;
    clauseNumber: string;
    title?: string;
    excerpt: string;
    statedTerm: string;
  };
  potentialImpact: string;
  options: RiskOption[];
}

export interface Workspace {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  documentIds: string[];
}

export interface StructuredDocument {
  id: string;
  name: string;
  docType: DocumentType;
  jurisdiction: string; // "India (Transfer of Property Act 1882)" | "India (Indian Contract Act 1872)"
  rawText: string;
  clauses: Clause[];
  summary: DocumentSummary;
  riskFlags: RiskFlag[];
  inconsistencies?: ClauseInconsistency[];
  workspaceId?: string;
  createdAt: string;
  fileSize?: string;
  fileFormat: 'pdf' | 'docx' | 'txt';
  source: 'upload' | 'sample' | 'drive';
  ownerId?: string;
  isEncrypted?: boolean;
  driveInfo?: {
    fileId?: string;
    fileName?: string;
    lastSyncedAt?: string;
    syncedAt?: string;
    lastModified?: string;
    driveAccount?: string;
  };
}

export interface PracticeSessionFeedback {
  overallRating: 'Strong' | 'Moderate' | 'Needs Polish';
  clarityScore: number;
  accuracyScore: number;
  clarityEvaluation: string;
  textualAccuracy: string;
  keyStrengths: string[];
  keyAdjustments: string[];
  nonLegalDisclaimer: string;
  generatedAt?: string;
}

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'counsel' | 'admin';
  isDemo?: boolean;
}

export interface CookieItem {
  name: string;
  category: 'essential' | 'functional' | 'security';
  purpose: string;
  expiry: string;
  isHttpOnly: boolean;
  valueMasked: string;
  canDisable: boolean;
  enabled: boolean;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  citations?: Citation[];
  statutoryGrounding?: string;
  scopeNote?: string;
}

export interface Citation {
  clauseId: string;
  clauseNumber: string;
  clauseTitle: string;
  snippet?: string;
  excerpt?: string;
}

export interface QnAResponse {
  question: string;
  answer: string;
  citations: Citation[];
  isSupportedByDocument: boolean;
  scopeNote: string;
}

export interface ComparisonCategory {
  topic: string;
  doc1Value: string;
  doc1Clause?: string;
  doc1ClauseId?: string;
  doc2Value: string;
  doc2Clause?: string;
  doc2ClauseId?: string;
  analysis: string;
  riskAssessment: string;
}

export interface ComparisonResult {
  doc1: { id: string; name: string; type: DocumentType };
  doc2: { id: string; name: string; type: DocumentType };
  summary: string;
  categories: ComparisonCategory[];
  recommendationChecklist: string[];
}

export interface VaultItem {
  id: string;
  title: string;
  category: 'contract' | 'structured-summary' | 'practice-feedback' | 'advisory-memo';
  documentId: string;
  documentName: string;
  createdAt: string;
  fileSize: string;
  isEncrypted: boolean;
  contentSnippet?: string;
  fullData?: any;
}

export interface PinnedChat {
  id: string;
  messageId: string;
  documentId: string;
  documentName: string;
  question: string;
  answerSummary: string;
  timestamp: string;
  citations?: Citation[];
}

export interface QASessionHistory {
  id: string;
  documentId: string;
  documentName: string;
  title: string;
  timestamp: string;
  messages: ChatMessage[];
}

