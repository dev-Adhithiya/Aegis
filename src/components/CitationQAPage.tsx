import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft,
  Send,
  FileText,
  Pin,
  Download,
  FolderOpen,
  Mic,
  MessageSquare,
  Sparkles,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  Plus,
  SlidersHorizontal,
  Bookmark,
  Shield,
  Layers,
} from 'lucide-react';
import {
  StructuredDocument,
  ChatMessage,
  Citation,
  PinnedChat,
  PracticeSessionFeedback,
  VaultItem,
} from '../types/legal';
import { OralPracticePanel } from './OralPracticePanel';
import { AegisLogo } from './AegisLogo';

interface CitationQAPageProps {
  document: StructuredDocument;
  documents: StructuredDocument[];
  onBackToDocument: () => void;
  onSelectDocument: (docId: string) => void;
  onNavigateToFeedback: (feedback: PracticeSessionFeedback) => void;
  onAddToVault: (item: Omit<VaultItem, 'id' | 'createdAt'>) => void;
}

export const CitationQAPage: React.FC<CitationQAPageProps> = ({
  document,
  documents,
  onBackToDocument,
  onSelectDocument,
  onNavigateToFeedback,
  onAddToVault,
}) => {
  const [mode, setMode] = useState<'qa' | 'practice'>('qa');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [pinnedChats, setPinnedChats] = useState<PinnedChat[]>([]);
  const [showHistoryDrawer, setShowHistoryDrawer] = useState(false);
  const [activeContextTab, setActiveContextTab] = useState<'outputs' | 'sources'>('sources');
  const [stepsExpanded, setStepsExpanded] = useState(true);
  const [contextExpanded, setContextExpanded] = useState(true);
  const [propertiesExpanded, setPropertiesExpanded] = useState(true);
  const [notificationToast, setNotificationToast] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize sleek, beautifully-formatted Matter Briefing (Fixing the raw markdown format)
  useEffect(() => {
    const flagCount = document.riskFlags.length;
    const initialGreeting: ChatMessage = {
      id: `msg-briefing-${document.id}`,
      sender: 'assistant',
      text: `I have completed the multi-agent legal inspection of **${document.name}** across ${document.clauses.length} numbered clauses.

The agreement has been mapped to statutory provisions under **${document.jurisdiction}**. We identified **${flagCount} provisions** requiring careful counsel review or negotiation adjustments.

Ask any specific question to trace the contract clauses with statutory citations, or start an **Oral Practice** session to rehearse negotiation pushbacks.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      citations: document.riskFlags.slice(0, 3).map(f => ({
        clauseId: f.matchedClauseId,
        clauseNumber: f.matchedClauseNumber,
        clauseTitle: f.ruleName,
        excerpt: f.plainEnglishExplanation,
      })),
      statutoryGrounding:
        document.docType === 'lease'
          ? 'Transfer of Property Act 1882, Sections 106, 108 & Indian Contract Act 1872, Sec 74'
          : 'Indian Contract Act 1872, Sections 27 & 28',
    };

    setMessages([initialGreeting]);
  }, [document.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const showToast = (text: string) => {
    setNotificationToast(text);
    setTimeout(() => setNotificationToast(null), 3000);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text: query.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMessage]);
    if (!textToSend) setInput('');
    setIsLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document.id,
          message: query.trim(),
          history: messages.slice(-6).map(m => ({
            sender: m.sender,
            text: m.text,
          })),
        }),
      });

      if (res.ok) {
        const data = await res.json();
        const assistantMessage: ChatMessage = {
          id: `msg-${Date.now() + 1}`,
          sender: 'assistant',
          text: data.text || data.answer,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          citations: data.citations || [],
          statutoryGrounding: data.statutoryGrounding,
          scopeNote: data.scopeNote,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error('Failed to retrieve response');
      }
    } catch (err) {
      const errorMsg: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to retrieve answer. Please verify your connection or try rephrasing your inquiry.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Pin a chat interaction
  const handlePinChat = (msg: ChatMessage) => {
    // Find preceding user question
    const msgIdx = messages.findIndex(m => m.id === msg.id);
    const userQ = msgIdx > 0 && messages[msgIdx - 1].sender === 'user'
      ? messages[msgIdx - 1].text
      : 'Contract Provision Inquiry';

    const alreadyPinned = pinnedChats.some(p => p.messageId === msg.id);
    if (alreadyPinned) {
      setPinnedChats(prev => prev.filter(p => p.messageId !== msg.id));
      showToast('Unpinned from matter notes');
    } else {
      const newPin: PinnedChat = {
        id: `pin-${Date.now()}`,
        messageId: msg.id,
        documentId: document.id,
        documentName: document.name,
        question: userQ,
        answerSummary: msg.text.slice(0, 160) + '...',
        timestamp: msg.timestamp,
        citations: msg.citations,
      };
      setPinnedChats(prev => [newPin, ...prev]);
      showToast('Pinned to Matter Notes');
    }
  };

  // Export Q&A transcript
  const handleExportTranscript = () => {
    const header = `AEGIS CITATION Q&A TRANSCRIPT\nContract Matter: ${document.name}\nJurisdiction: ${document.jurisdiction}\nGenerated: ${new Date().toLocaleString()}\n\n========================================\n\n`;
    const body = messages
      .map(
        m =>
          `[${m.timestamp}] ${m.sender === 'user' ? 'COUNSEL' : 'AEGIS LEGAL INTELLIGENCE'}:\n${m.text}\n${
            m.citations && m.citations.length > 0
              ? `Referenced Clauses: ${m.citations.map(c => `Clause ${c.clauseNumber} (${c.clauseTitle})`).join(', ')}\n`
              : ''
          }\n----------------------------------------\n`
      )
      .join('\n');

    const blob = new Blob([header + body], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `Aegis_QA_Transcript_${document.name.replace(/\.[^/.]+$/, '')}.txt`;
    a.click();
    URL.revokeObjectURL(a.href);
    showToast('Q&A transcript exported');
  };

  // Add current Q&A to Vault
  const handleAddSessionToVault = () => {
    onAddToVault({
      title: `Citation Q&A Memo: ${document.name}`,
      category: 'advisory-memo',
      documentId: document.id,
      documentName: document.name,
      fileSize: `${Math.round((messages.length * 0.4) * 10) / 10} KB`,
      isEncrypted: true,
      contentSnippet: messages[messages.length - 1]?.text.slice(0, 200) || 'Legal transcript memo',
      fullData: messages,
    });
    showToast('Saved to Aegis Vault');
  };

  const suggestedQuestions =
    document.docType === 'lease'
      ? [
          'Can the landlord enter without prior notice?',
          'What are the deposit deduction terms?',
          'What happens if I terminate before the lock-in period?',
          'Is the notice period reciprocal?',
        ]
      : [
          'Does this NDA contain a non-compete clause?',
          'What is the duration of confidentiality obligations?',
          'Are there carveouts for court orders or regulatory disclosure?',
          'Are remedies on breach capped to actual direct damages?',
        ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#FAFAF9] font-sans antialiased text-[#18181B] select-none">
      {/* Toast Notification */}
      {notificationToast && (
        <div className="fixed top-4 right-4 z-50 bg-[#18181B] text-[#FFFFFF] text-xs px-3.5 py-2 rounded-lg shadow-lg flex items-center gap-2 animate-in fade-in duration-150">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#10B981]" />
          <span>{notificationToast}</span>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar (Inspired by image.png) */}
        <header className="h-14 border-b border-[#E4E4E7] bg-[#FFFFFF] px-4 sm:px-6 flex items-center justify-between gap-4 shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onBackToDocument}
              className="flex items-center gap-1.5 text-xs font-medium text-[#71717A] hover:text-[#09090B] p-1.5 rounded hover:bg-[#FAFAF9] transition-colors"
              title="Return to Document Clauses view"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Back to Document</span>
            </button>

            <span className="text-[#E4E4E7]">|</span>

            <div className="flex items-center gap-2 min-w-0">
              <span className="font-semibold text-xs sm:text-sm text-[#09090B] truncate">
                {document.name}
              </span>
              <span className="text-[11px] text-[#71717A] hidden md:inline truncate">
                Set client matter
              </span>
            </div>
          </div>

          {/* Mode Switcher & Top Actions */}
          <div className="flex items-center gap-2">
            {/* Segmented Mode Button */}
            <div className="grid grid-cols-2 p-0.5 bg-[#F4F4F5] rounded-md text-xs font-medium border border-[#E4E4E7]">
              <button
                onClick={() => setMode('qa')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                  mode === 'qa'
                    ? 'bg-[#FFFFFF] text-[#09090B] shadow-xs font-semibold'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Citation Q&A</span>
              </button>
              <button
                onClick={() => setMode('practice')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded transition-colors ${
                  mode === 'practice'
                    ? 'bg-[#FFFFFF] text-[#09090B] shadow-xs font-semibold'
                    : 'text-[#71717A] hover:text-[#09090B]'
                }`}
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Oral Practice</span>
              </button>
            </div>

            <button
              onClick={() => setShowHistoryDrawer(!showHistoryDrawer)}
              className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded border transition-colors ${
                showHistoryDrawer || pinnedChats.length > 0
                  ? 'bg-[#FFFFFF] text-[#09090B] border-[#18181B]'
                  : 'bg-[#FFFFFF] text-[#71717A] border-[#E4E4E7] hover:text-[#09090B]'
              }`}
              title="Pinned questions & history"
            >
              <Pin className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pinned ({pinnedChats.length})</span>
            </button>

            <button
              onClick={handleExportTranscript}
              className="flex items-center gap-1.5 text-xs font-medium text-[#71717A] hover:text-[#09090B] bg-[#FFFFFF] hover:bg-[#FAFAF9] border border-[#E4E4E7] px-2.5 py-1.5 rounded transition-colors"
              title="Export Q&A transcript"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </header>

        {/* Content Body: Split View (Left Drawer if open + Center Stream + Right Inspector) */}
        <div className="flex-1 flex overflow-hidden">
          {/* Pinned / History Drawer */}
          {showHistoryDrawer && (
            <div className="w-72 bg-[#FFFFFF] border-r border-[#E4E4E7] flex flex-col h-full shrink-0 animate-in slide-in-from-left-2 duration-150">
              <div className="p-3.5 border-b border-[#E4E4E7] bg-[#FAFAF9] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bookmark className="w-3.5 h-3.5 text-[#18181B]" />
                  <span className="font-semibold text-xs text-[#09090B]">Pinned Matter Notes</span>
                </div>
                <button
                  onClick={() => setShowHistoryDrawer(false)}
                  className="text-[#71717A] hover:text-[#09090B] text-xs p-1"
                >
                  ✕
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 text-xs">
                {pinnedChats.length === 0 ? (
                  <div className="p-6 text-center text-[#71717A] space-y-2">
                    <Pin className="w-6 h-6 mx-auto text-[#D4D4D8]" />
                    <p className="text-[11px] leading-relaxed">
                      No pinned inquiries yet. Click the pin icon on any Q&A response to save it here for fast retrieval.
                    </p>
                  </div>
                ) : (
                  pinnedChats.map(pin => (
                    <div
                      key={pin.id}
                      className="p-3 rounded-lg bg-[#FAFAF9] border border-[#E4E4E7] space-y-1.5 hover:border-[#18181B] transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-[11px] text-[#09090B] line-clamp-1">
                          {pin.question}
                        </span>
                        <span className="text-[9px] text-[#71717A] font-mono">{pin.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-[#3F3F46] line-clamp-3 leading-relaxed">
                        {pin.answerSummary}
                      </p>
                      {pin.citations && pin.citations.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {pin.citations.map((c, i) => (
                            <span
                              key={i}
                              className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-[#FFFFFF] border border-[#E4E4E7] text-[#18181B]"
                            >
                              Clause {c.clauseNumber}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* Center Column: Either Citation Q&A Stream OR Oral Practice View */}
          <div className="flex-1 flex flex-col h-full bg-[#FFFFFF] overflow-hidden">
            {mode === 'practice' ? (
              /* Oral Practice View inside Q&A page */
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 max-w-4xl mx-auto w-full">
                <OralPracticePanel
                  document={document}
                  onJumpToClause={cNum => {
                    showToast(`Referenced Clause ${cNum}`);
                  }}
                  onSessionComplete={feedback => {
                    // Redirect towards feedback page after completion of session as requested!
                    onNavigateToFeedback(feedback);
                  }}
                />
              </div>
            ) : (
              /* Citation Q&A Stream */
              <>
                {/* Scrollable Conversation Stream */}
                <div className="flex-1 overflow-y-auto p-6 sm:p-8 space-y-6 text-sm max-w-4xl mx-auto w-full select-text">
                  {messages.map((msg, idx) => {
                    const isUser = msg.sender === 'user';

                    return (
                      <div
                        key={msg.id}
                        className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-2`}
                      >
                        {/* Sender Label */}
                        <div className="flex items-center gap-2 text-xs text-[#71717A] px-1">
                          <span className="font-semibold text-[#09090B]">
                            {isUser ? 'You' : 'Aegis'}
                          </span>
                          <span>•</span>
                          <span>{msg.timestamp}</span>
                        </div>

                        {/* Message Box */}
                        <div
                          className={`max-w-[88%] sm:max-w-[80%] rounded-2xl p-4 sm:p-5 leading-relaxed text-xs sm:text-sm ${
                            isUser
                              ? 'bg-[#18181B] text-[#FFFFFF] rounded-br-xs'
                              : 'bg-[#FAFAF9] border border-[#E4E4E7] text-[#09090B] rounded-bl-xs'
                          }`}
                        >
                          {/* Briefing Card for Initial Message (Formatting Fix) */}
                          {idx === 0 && !isUser ? (
                            <div className="space-y-3">
                              <div className="flex flex-wrap items-center gap-2 pb-2 border-b border-[#E4E4E7]">
                                <span className="font-serif text-sm font-semibold text-[#09090B]">
                                  Matter Briefing
                                </span>
                                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E4E4E7] text-[#18181B]">
                                  {document.docType.toUpperCase()}
                                </span>
                                <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#F4F4F5] text-[#71717A]">
                                  {document.clauses.length} Clauses Analyzed
                                </span>
                              </div>

                              <div className="text-xs text-[#3F3F46] whitespace-pre-wrap leading-relaxed">
                                {msg.text}
                              </div>

                              {msg.statutoryGrounding && (
                                <div className="p-2.5 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7] text-[11px] text-[#52525B]">
                                  <strong className="text-[#09090B]">Statutory Grounding: </strong>
                                  {msg.statutoryGrounding}
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="whitespace-pre-wrap">{msg.text}</div>
                          )}

                          {/* Interactive Citations */}
                          {msg.citations && msg.citations.length > 0 && (
                            <div className="mt-3.5 pt-3 border-t border-[#E4E4E7]/70 space-y-1.5">
                              <div className="text-[10px] uppercase font-semibold tracking-wider text-[#71717A]">
                                Statutory & Contract Citations
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {msg.citations.map((cite, cIdx) => (
                                  <div
                                    key={cIdx}
                                    className="inline-flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded bg-[#FFFFFF] border border-[#E4E4E7] text-[#18181B]"
                                  >
                                    <FileText className="w-3 h-3 text-[#71717A]" />
                                    <span>Clause {cite.clauseNumber}: {cite.clauseTitle}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Pin / Save action on Assistant Message */}
                          {!isUser && (
                            <div className="mt-3 pt-2 flex items-center justify-end gap-2 text-[11px] text-[#71717A]">
                              <button
                                onClick={() => handlePinChat(msg)}
                                className="flex items-center gap-1 hover:text-[#09090B] transition-colors"
                              >
                                <Pin className="w-3 h-3" />
                                <span>Pin note</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {isLoading && (
                    <div className="flex items-start gap-2">
                      <div className="bg-[#FAFAF9] border border-[#E4E4E7] rounded-xl p-3 text-xs text-[#71717A] flex items-center gap-2.5">
                        <div className="w-3.5 h-3.5 border-2 border-[#18181B] border-t-transparent rounded-full animate-spin" />
                        <span>Searching contract AST & cross-referencing Indian statutes...</span>
                      </div>
                    </div>
                  )}

                  <div ref={messagesEndRef} />
                </div>

                {/* Suggested Inquiries */}
                <div className="px-6 py-2 bg-[#FAFAF9] border-t border-[#E4E4E7]">
                  <div className="text-[10px] uppercase font-semibold text-[#71717A] mb-1.5">
                    Suggested Inquiries
                  </div>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {suggestedQuestions.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(q)}
                        className="text-xs px-3 py-1 rounded-full bg-[#FFFFFF] hover:bg-[#F4F4F5] border border-[#E4E4E7] text-[#3F3F46] whitespace-nowrap shrink-0 transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Floating Bottom Chatbar (as in image.png) */}
                <div className="p-4 bg-[#FFFFFF] border-t border-[#E4E4E7]">
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      handleSendMessage();
                    }}
                    className="relative flex items-center bg-[#FAFAF9] border border-[#E4E4E7] rounded-2xl px-3 py-2 focus-within:border-[#18181B] focus-within:bg-[#FFFFFF] transition-all shadow-xs"
                  >
                    <button
                      type="button"
                      onClick={() => showToast('Attach clause snippet or template')}
                      className="p-1.5 rounded-lg text-[#71717A] hover:text-[#09090B] hover:bg-[#E4E4E7]/50 transition-colors mr-1"
                      title="Add attachment or template"
                    >
                      <Plus className="w-4 h-4" />
                    </button>

                    <input
                      type="text"
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      placeholder="Ask Aegis anything..."
                      className="flex-1 bg-transparent text-xs text-[#09090B] placeholder-[#A1A1AA] focus:outline-none"
                      disabled={isLoading}
                    />

                    <div className="flex items-center gap-1.5 ml-2">
                      <button
                        type="button"
                        onClick={() => setMode('practice')}
                        className="p-1.5 rounded-lg text-[#71717A] hover:text-[#09090B] hover:bg-[#E4E4E7]/50 transition-colors"
                        title="Switch to Oral Negotiation Practice"
                      >
                        <Mic className="w-4 h-4" />
                      </button>

                      <button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        className="p-2 rounded-xl bg-[#18181B] hover:bg-[#09090B] disabled:opacity-30 text-[#FFFFFF] transition-colors"
                        title="Submit query"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* Right Inspector Panel (Faithful reproduction of image.png) */}
          <aside className="w-80 bg-[#FAFAF9] border-l border-[#E4E4E7] flex flex-col h-full shrink-0 font-sans select-none overflow-y-auto">
            {/* 1. Progress Section */}
            <div className="border-b border-[#E4E4E7]">
              <button
                onClick={() => setStepsExpanded(!stepsExpanded)}
                className="w-full p-4 flex items-center justify-between text-xs font-semibold text-[#09090B] hover:bg-[#F4F4F5] transition-colors"
              >
                <span>Progress</span>
                <div className="flex items-center gap-2 text-[#71717A] text-[11px] font-normal">
                  <span>4 of 4 steps</span>
                  {stepsExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </div>
              </button>

              {stepsExpanded && (
                <div className="px-4 pb-4 space-y-2.5 text-xs">
                  <div className="flex items-start gap-2 text-[#3F3F46]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span className="leading-tight">Ingest and chunk contract clauses into AST</span>
                  </div>
                  <div className="flex items-start gap-2 text-[#3F3F46]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span className="leading-tight">Verify statutory alignment under ICA 1872 & TPA 1882</span>
                  </div>
                  <div className="flex items-start gap-2 text-[#3F3F46]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span className="leading-tight">Identify commercial & unilateral lock-in imbalances</span>
                  </div>
                  <div className="flex items-start gap-2 text-[#3F3F46]">
                    <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
                    <span className="leading-tight">Synthesize citation-grounded advisory responses</span>
                  </div>
                </div>
              )}
            </div>

            {/* 2. Context Section (Outputs / Sources + Vault Action) */}
            <div className="border-b border-[#E4E4E7]">
              <button
                onClick={() => setContextExpanded(!contextExpanded)}
                className="w-full p-4 flex items-center justify-between text-xs font-semibold text-[#09090B] hover:bg-[#F4F4F5] transition-colors"
              >
                <span>Context</span>
                {contextExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#71717A]" />}
              </button>

              {contextExpanded && (
                <div className="px-4 pb-4 space-y-3">
                  {/* Tabs: Outputs / Sources */}
                  <div className="grid grid-cols-2 p-0.5 bg-[#E4E4E7] rounded-md text-xs font-medium">
                    <button
                      onClick={() => setActiveContextTab('outputs')}
                      className={`py-1 rounded text-center transition-colors ${
                        activeContextTab === 'outputs'
                          ? 'bg-[#FFFFFF] text-[#09090B] shadow-xs'
                          : 'text-[#71717A] hover:text-[#09090B]'
                      }`}
                    >
                      Outputs
                    </button>
                    <button
                      onClick={() => setActiveContextTab('sources')}
                      className={`py-1 rounded text-center transition-colors ${
                        activeContextTab === 'sources'
                          ? 'bg-[#FFFFFF] text-[#09090B] shadow-xs'
                          : 'text-[#71717A] hover:text-[#09090B]'
                      }`}
                    >
                      Sources
                    </button>
                  </div>

                  {/* Active Documents List */}
                  <div className="text-[11px] text-[#71717A] flex items-center justify-between">
                    <span>{documents.length} files available</span>
                  </div>

                  <div className="space-y-1.5">
                    {documents.map((doc, idx) => (
                      <button
                        key={doc.id}
                        onClick={() => onSelectDocument(doc.id)}
                        className={`w-full text-left p-2 rounded-lg border text-xs flex items-center gap-2 transition-colors ${
                          doc.id === document.id
                            ? 'bg-[#FFFFFF] border-[#18181B] text-[#09090B] shadow-xs'
                            : 'bg-[#FFFFFF] border-[#E4E4E7] text-[#52525B] hover:border-[#A1A1AA]'
                        }`}
                      >
                        <FileText className="w-3.5 h-3.5 text-[#71717A] shrink-0" />
                        <span className="truncate flex-1 text-[11px] font-medium">{doc.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Vault & Download Actions */}
                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <button
                      onClick={handleAddSessionToVault}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F4F4F5] border border-[#E4E4E7] text-xs font-medium text-[#09090B] transition-colors"
                      title="Store memo securely in Aegis Vault"
                    >
                      <Layers className="w-3.5 h-3.5" />
                      <span>Add to Vault</span>
                    </button>

                    <button
                      onClick={handleExportTranscript}
                      className="flex items-center justify-center gap-1.5 py-1.5 px-2.5 rounded-lg bg-[#FFFFFF] hover:bg-[#F4F4F5] border border-[#E4E4E7] text-xs font-medium text-[#09090B] transition-colors"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* 3. Properties Section */}
            <div>
              <button
                onClick={() => setPropertiesExpanded(!propertiesExpanded)}
                className="w-full p-4 flex items-center justify-between text-xs font-semibold text-[#09090B] hover:bg-[#F4F4F5] transition-colors"
              >
                <span>Properties</span>
                {propertiesExpanded ? <ChevronDown className="w-3.5 h-3.5 text-[#71717A]" /> : <ChevronRight className="w-3.5 h-3.5 text-[#71717A]" />}
              </button>

              {propertiesExpanded && (
                <div className="px-4 pb-4 space-y-3 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[#71717A]">Agent</span>
                    <div className="flex items-center gap-1.5 font-medium text-[#09090B]">
                      <AegisLogo size={14} showText={false} theme="dark" />
                      <span>Aegis Counsel</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#71717A]">Knowledge</span>
                    <span className="font-mono text-[11px] text-[#09090B] px-1.5 py-0.5 rounded bg-[#E4E4E7]/60">
                      ICA 1872 & TPA 1882
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#71717A]">Model</span>
                    <span className="font-mono text-[11px] text-[#09090B] flex items-center gap-1">
                      <Sparkles className="w-3 h-3 text-[#18181B]" />
                      <span>Gemini 2.5 Flash</span>
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-[#71717A]">Encryption</span>
                    <span className="font-mono text-[11px] text-[#10B981] flex items-center gap-1">
                      <Shield className="w-3 h-3 text-[#10B981]" />
                      <span>AES-256-GCM</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};
