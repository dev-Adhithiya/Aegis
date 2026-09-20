import React, { useState, useRef, useEffect } from 'react';
import {
  Send,
  FileText,
  ExternalLink,
  MessageSquare,
  Mic,
  FolderOpen,
  Award,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import {
  ChatMessage,
  Citation,
  StructuredDocument,
  PracticeSessionFeedback,
} from '../types/legal';
import { OralPracticePanel } from './OralPracticePanel';

interface ChatPanelProps {
  document: StructuredDocument;
  onCitationClick: (clauseId: string) => void;
  onViewRiskFlags: () => void;
  onOpenDrive: () => void;
  initialMode?: 'chat' | 'practice' | 'feedback';
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  document,
  onCitationClick,
  onViewRiskFlags,
  onOpenDrive,
  initialMode = 'chat',
}) => {
  const [panelMode, setPanelMode] = useState<'chat' | 'practice' | 'feedback'>(initialMode);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [latestFeedback, setLatestFeedback] = useState<PracticeSessionFeedback | null>(null);
  const [copiedFeedback, setCopiedFeedback] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome & contract overview
  useEffect(() => {
    const flagCount = document.riskFlags.length;
    const initialText = `Analyzed **${document.name}** (${document.clauses.length} clauses) under **${document.jurisdiction}**.

${
  flagCount > 0
    ? `Identified **${flagCount} provisions** with potential statutory or commercial imbalances.`
    : 'All parsed clauses align with standard reciprocal provisions.'
}

Ask questions to trace specific clauses, or switch to **Oral Practice** to rehearse negotiations.`;

    setMessages([
      {
        id: `msg-welcome-${document.id}`,
        sender: 'assistant',
        text: initialText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: document.riskFlags.slice(0, 3).map(f => ({
          clauseId: f.matchedClauseId,
          clauseNumber: f.matchedClauseNumber,
          clauseTitle: f.ruleName,
          excerpt: f.plainEnglishExplanation,
        })),
      },
    ]);
  }, [document.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

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
        throw new Error('Failed to fetch response');
      }
    } catch (err) {
      console.error('Error in chat:', err);
      const errorMessage: ChatMessage = {
        id: `msg-err-${Date.now()}`,
        sender: 'assistant',
        text: 'Unable to retrieve answer. Please verify your connection or try rephrasing.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSessionComplete = (feedback: PracticeSessionFeedback) => {
    setLatestFeedback(feedback);
    setPanelMode('feedback');

    // Also notify user in chat stream with a scannable summary card
    const feedbackChatMessage: ChatMessage = {
      id: `msg-feedback-${Date.now()}`,
      sender: 'assistant',
      text: `Completed Oral Practice Session for **${document.name}**.

• **Clarity Score:** ${feedback.clarityScore}/10 (${feedback.overallRating})
• **Document Accuracy:** ${feedback.accuracyScore}/10
• **Critique:** ${feedback.clarityEvaluation}

You can view the full constructive critique and textual alignment report in the **Practice Feedback** tab.`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      scopeNote: feedback.nonLegalDisclaimer,
    };
    setMessages(prev => [...prev, feedbackChatMessage]);
  };

  const handleCopyFeedback = () => {
    if (!latestFeedback) return;
    const summaryText = `AEGIS ORAL PRACTICE FEEDBACK SUMMARY
Document: ${document.name}
Overall Rating: ${latestFeedback.overallRating}
Clarity & Articulation Score: ${latestFeedback.clarityScore}/10
Document Text Accuracy: ${latestFeedback.accuracyScore}/10

CLARITY CRITIQUE:
${latestFeedback.clarityEvaluation}

TEXTUAL ALIGNMENT VS CONTRACT:
${latestFeedback.textualAccuracy}

KEY OBSERVED STRENGTHS:
${latestFeedback.keyStrengths.map(s => `- ${s}`).join('\n')}

RECOMMENDED NEGOTIATION ADJUSTMENTS:
${latestFeedback.keyAdjustments.map(a => `- ${a}`).join('\n')}

NOTICE:
${latestFeedback.nonLegalDisclaimer}`;

    navigator.clipboard.writeText(summaryText);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  const handleAskAboutFeedback = () => {
    if (!latestFeedback) return;
    setPanelMode('chat');
    handleSendMessage(
      `Based on my practice feedback (Clarity: ${latestFeedback.clarityScore}/10, Accuracy: ${latestFeedback.accuracyScore}/10), how can I better frame my objection against the lock-in and termination clauses in this agreement?`
    );
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
    <div className="w-88 sm:w-96 bg-[#FFFFFF] border-l border-[#E4E4E7] flex flex-col h-full shrink-0 font-sans select-none">
      {/* Top 3-Way Segmented Mode Switcher */}
      <div className="p-2 border-b border-[#E4E4E7] bg-[#FAFAF9] flex items-center justify-between gap-1">
        <div className="grid grid-cols-3 gap-1 bg-[#E4E4E7] p-0.5 rounded w-full text-xs font-medium">
          <button
            onClick={() => setPanelMode('chat')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded transition-colors ${
              panelMode === 'chat'
                ? 'bg-[#FFFFFF] text-[#09090B] shadow-xs font-semibold'
                : 'text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>Citation Q&A</span>
          </button>
          <button
            onClick={() => setPanelMode('practice')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded transition-colors ${
              panelMode === 'practice'
                ? 'bg-[#FFFFFF] text-[#09090B] shadow-xs font-semibold'
                : 'text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <Mic className="w-3.5 h-3.5" />
            <span>Oral Practice</span>
          </button>
          <button
            onClick={() => setPanelMode('feedback')}
            className={`flex items-center justify-center gap-1 py-1.5 rounded transition-colors relative ${
              panelMode === 'feedback'
                ? 'bg-[#FFFFFF] text-[#09090B] shadow-xs font-semibold'
                : 'text-[#71717A] hover:text-[#09090B]'
            }`}
          >
            <Award className="w-3.5 h-3.5" />
            <span>Feedback</span>
            {latestFeedback && (
              <span className="w-1.5 h-1.5 rounded-full bg-[#18181B] absolute top-1.5 right-1.5" />
            )}
          </button>
        </div>
      </div>

      {/* Mode 1: Oral Practice Simulation */}
      {panelMode === 'practice' ? (
        <OralPracticePanel
          document={document}
          onJumpToClause={clauseNumber => {
            const matched = document.clauses.find(c => c.clauseNumber === clauseNumber);
            if (matched) onCitationClick(matched.id);
          }}
          onSessionComplete={handleSessionComplete}
        />
      ) : panelMode === 'feedback' ? (
        /* Mode 2: Dedicated Post-Session Practice Feedback View */
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text">
          {latestFeedback ? (
            <div className="space-y-3.5">
              {/* Top Banner */}
              <div className="p-3.5 rounded-lg bg-[#FAFAF9] border border-[#E4E4E7] space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#71717A]">
                    Practice Feedback
                  </span>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E4E4E7] text-[#18181B]">
                    {latestFeedback.overallRating} Assessment
                  </span>
                </div>
                <h3 className="font-serif text-[15px] font-medium text-[#09090B] leading-snug">
                  Oral Defense & Negotiation Critique
                </h3>
                <p className="text-[11px] text-[#71717A] leading-relaxed">
                  Constructive evaluation comparing your spoken assertions against the actual text of {document.name}.
                </p>
              </div>

              {/* Dual Score Cards */}
              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7]">
                  <div className="text-[10px] uppercase font-semibold text-[#71717A]">
                    Spoken Clarity
                  </div>
                  <div className="text-xl font-semibold text-[#09090B] mt-1">
                    {latestFeedback.clarityScore}
                    <span className="text-xs text-[#A1A1AA] font-normal"> / 10</span>
                  </div>
                  <div className="text-[10px] text-[#71717A] mt-1">
                    Tone & structure
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7]">
                  <div className="text-[10px] uppercase font-semibold text-[#71717A]">
                    Document Accuracy
                  </div>
                  <div className="text-xl font-semibold text-[#09090B] mt-1">
                    {latestFeedback.accuracyScore}
                    <span className="text-xs text-[#A1A1AA] font-normal"> / 10</span>
                  </div>
                  <div className="text-[10px] text-[#71717A] mt-1">
                    Clause fidelity
                  </div>
                </div>
              </div>

              {/* Section 1: Clarity & Articulation Critique */}
              <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#09090B]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#18181B]" />
                  <span>Clarity & Negotiation Delivery</span>
                </div>
                <p className="text-xs text-[#3F3F46] leading-relaxed">
                  {latestFeedback.clarityEvaluation}
                </p>
              </div>

              {/* Section 2: Textual Accuracy Compared to Document */}
              <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7] space-y-1.5">
                <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#09090B]">
                  <FileText className="w-3.5 h-3.5 text-[#18181B]" />
                  <span>Textual Accuracy vs. Contract Clauses</span>
                </div>
                <p className="text-xs text-[#3F3F46] leading-relaxed">
                  {latestFeedback.textualAccuracy}
                </p>
              </div>

              {/* Section 3: Observed Strengths */}
              {latestFeedback.keyStrengths && latestFeedback.keyStrengths.length > 0 && (
                <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7] space-y-2">
                  <div className="text-[11px] font-semibold text-[#09090B]">
                    Observed Communication Strengths
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#3F3F46]">
                    {latestFeedback.keyStrengths.map((strength, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#18181B] font-bold mt-0.5">•</span>
                        <span>{strength}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Section 4: Negotiation Adjustments */}
              {latestFeedback.keyAdjustments && latestFeedback.keyAdjustments.length > 0 && (
                <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7] space-y-2">
                  <div className="text-[11px] font-semibold text-[#09090B]">
                    Adjustments for Live Negotiation
                  </div>
                  <ul className="space-y-1.5 text-xs text-[#3F3F46]">
                    {latestFeedback.keyAdjustments.map((adj, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-[#18181B] font-bold mt-0.5">→</span>
                        <span>{adj}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Statutory & Non-Legal Notice */}
              <div className="p-3 rounded bg-[#FAFAF9] border border-[#E4E4E7] text-[10px] text-[#71717A] leading-relaxed">
                <p className="font-semibold text-[#09090B] mb-0.5">Non-Legal Educational Notice</p>
                {latestFeedback.nonLegalDisclaimer}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleCopyFeedback}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#FFFFFF] hover:bg-[#F4F4F5] border border-[#E4E4E7] text-xs font-medium text-[#18181B] transition-colors"
                  >
                    {copiedFeedback ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedFeedback ? 'Copied' : 'Copy Critique'}</span>
                  </button>

                  <button
                    onClick={() => setPanelMode('practice')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded bg-[#18181B] hover:bg-[#09090B] text-xs font-medium text-[#FFFFFF] transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Practice Again</span>
                  </button>
                </div>

                <button
                  onClick={handleAskAboutFeedback}
                  className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 rounded bg-[#FAFAF9] hover:bg-[#F4F4F5] border border-[#E4E4E7] text-xs font-medium text-[#3F3F46] transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#18181B]" />
                  <span>Ask AI to improve these points in Chat</span>
                </button>
              </div>
            </div>
          ) : (
            /* Empty State: No Practice Run Yet */
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 text-[#71717A]">
              <div className="w-10 h-10 rounded-full bg-[#FAFAF9] border border-[#E4E4E7] flex items-center justify-center text-[#18181B]">
                <Award className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="font-serif text-sm font-medium text-[#09090B]">
                  No Practice Feedback Yet
                </div>
                <p className="text-xs max-w-xs leading-relaxed text-[#71717A]">
                  Complete an oral practice questionnaire to receive a non-legal constructive critique evaluating your spoken clarity and factual alignment with this contract.
                </p>
              </div>
              <button
                onClick={() => setPanelMode('practice')}
                className="mt-2 flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#18181B] hover:bg-[#09090B] text-[#FFFFFF] text-xs font-medium transition-colors"
              >
                <Mic className="w-3.5 h-3.5" />
                <span>Start Oral Practice Session</span>
              </button>
            </div>
          )}
        </div>
      ) : (
        /* Mode 3: Citation Q&A Chat */
        <>
          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs select-text">
            {messages.map(msg => {
              const isUser = msg.sender === 'user';

              return (
                <div
                  key={msg.id}
                  className={`flex flex-col ${isUser ? 'items-end' : 'items-start'} space-y-1.5`}
                >
                  <div className="flex items-center gap-1 text-[10px] text-[#71717A] px-1">
                    <span>{isUser ? 'You' : 'AEGIS'}</span>
                    <span>•</span>
                    <span>{msg.timestamp}</span>
                  </div>

                  <div
                    className={`max-w-[92%] rounded-lg p-3 sm:p-3.5 leading-relaxed ${
                      isUser
                        ? 'bg-[#18181B] text-[#FFFFFF]'
                        : 'bg-[#FAFAF9] border border-[#E4E4E7] text-[#09090B]'
                    }`}
                  >
                    <div className="whitespace-pre-wrap">{msg.text}</div>

                    {/* Cited Clauses Badges */}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="mt-3 pt-2.5 border-t border-[#E4E4E7]/60 space-y-1">
                        <div className="text-[10px] uppercase font-semibold tracking-wider text-[#71717A]">
                          Referenced Clauses:
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {msg.citations.map((cite, cIdx) => (
                            <button
                              key={cIdx}
                              onClick={() => onCitationClick(cite.clauseId)}
                              className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E4E4E7] text-[#18181B] hover:border-[#18181B] transition-colors"
                              title={`Jump to Clause ${cite.clauseNumber}`}
                            >
                              <FileText className="w-2.5 h-2.5" />
                              <span>Clause {cite.clauseNumber}</span>
                              <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex items-start gap-2">
                <div className="bg-[#FAFAF9] border border-[#E4E4E7] rounded-lg p-2.5 text-xs text-[#71717A] flex items-center gap-2">
                  <div className="w-3.5 h-3.5 border-2 border-[#18181B] border-t-transparent rounded-full animate-spin" />
                  <span>Scanning contract clauses...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Suggested Quick Prompts */}
          <div className="px-3 py-2 bg-[#FAFAF9] border-t border-[#E4E4E7]">
            <div className="text-[10px] uppercase font-semibold text-[#71717A] mb-1.5">
              Suggested Inquiries
            </div>
            <div className="flex gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {suggestedQuestions.map((q, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(q)}
                  className="text-[11px] px-2.5 py-1 rounded bg-[#FFFFFF] hover:bg-[#F4F4F5] border border-[#E4E4E7] text-[#3F3F46] whitespace-nowrap shrink-0 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={e => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-2.5 bg-[#FFFFFF] border-t border-[#E4E4E7] flex items-center gap-1.5"
          >
            <button
              type="button"
              onClick={onOpenDrive}
              className="p-2 rounded text-[#71717A] hover:text-[#09090B] hover:bg-[#FAFAF9] transition-colors"
              title="Import files from storage"
            >
              <FolderOpen className="w-4 h-4" />
            </button>

            <input
              id="chat-query-input"
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask a question about this contract..."
              className="flex-1 bg-[#FAFAF9] border border-[#E4E4E7] rounded px-3 py-1.5 text-xs text-[#09090B] placeholder-[#A1A1AA] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#18181B] transition-colors"
              disabled={isLoading}
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="bg-[#18181B] hover:bg-[#09090B] disabled:opacity-40 text-[#FFFFFF] p-2 rounded transition-colors shrink-0"
              title="Send question"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </>
      )}
    </div>
  );
};
