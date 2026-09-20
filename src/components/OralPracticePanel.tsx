import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Play,
  ArrowRight,
  RotateCcw,
  Scale,
  FileText,
  Copy,
  Check,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { StructuredDocument, PracticeSessionFeedback } from '../types/legal';

interface OralPracticePanelProps {
  document: StructuredDocument;
  onJumpToClause?: (clauseNumber: string) => void;
  onSessionComplete?: (feedback: PracticeSessionFeedback) => void;
}

interface Question {
  id: string;
  prompt: string;
  targetClauseNumber: string;
  statuteHint: string;
  keyTalkingPoints: string[];
  sampleAnswer: string;
}

interface QuestionnaireData {
  scenarioTitle: string;
  scenarioRole: string;
  description: string;
  questions: Question[];
}

interface PracticeEvaluation {
  rating: 'Strong' | 'Moderate' | 'Needs Polish';
  score: number;
  feedback: string;
  statutoryCitation: string;
  suggestedSpokenReply: string;
}

interface SessionTranscriptItem {
  questionId: string;
  prompt: string;
  userSpokenAnswer: string;
  targetClauseNumber: string;
  score: number;
}

export const OralPracticePanel: React.FC<OralPracticePanelProps> = ({
  document,
  onJumpToClause,
  onSessionComplete,
}) => {
  const [questionnaire, setQuestionnaire] = useState<QuestionnaireData | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [spokenText, setSpokenText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [evaluation, setEvaluation] = useState<PracticeEvaluation | null>(null);
  const [audioVoiceEnabled, setAudioVoiceEnabled] = useState(false);
  const [sessionTranscripts, setSessionTranscripts] = useState<SessionTranscriptItem[]>([]);
  const [sessionFeedback, setSessionFeedback] = useState<PracticeSessionFeedback | null>(null);
  const [isLoadingFeedback, setIsLoadingFeedback] = useState(false);
  const [copiedFeedback, setCopiedFeedback] = useState(false);

  const recognitionRef = useRef<any>(null);

  // Fetch questionnaire on mount or document change
  useEffect(() => {
    const fetchQuestionnaire = async () => {
      try {
        const res = await fetch(`/api/practice/questionnaire/${document.id}`);
        if (res.ok) {
          const data = await res.json();
          setQuestionnaire(data);
          setCurrentIndex(0);
          setEvaluation(null);
          setSpokenText('');
          setSessionTranscripts([]);
          setSessionFeedback(null);
        }
      } catch (err) {
        console.error('Error fetching questionnaire:', err);
      }
    };

    fetchQuestionnaire();
  }, [document.id]);

  // Read question prompt aloud if audioVoiceEnabled
  useEffect(() => {
    if (!questionnaire || !audioVoiceEnabled || sessionFeedback) return;

    const currentQ = questionnaire.questions[currentIndex];
    if (currentQ) {
      speakText(`${questionnaire.scenarioRole} asks: ${currentQ.prompt}`);
    }

    return () => {
      window.speechSynthesis?.cancel();
    };
  }, [currentIndex, questionnaire, audioVoiceEnabled, sessionFeedback]);

  const speakText = (text: string) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.98;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
  };

  // Web Speech API for voice recognition
  const toggleListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please type your response.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript + ' ';
        }
        setSpokenText(transcript.trim());
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition status:', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
      recognitionRef.current = recognition;
      setIsListening(true);
    } catch (err) {
      console.error('Failed to start speech recognition:', err);
      setIsListening(false);
    }
  };

  const handleEvaluateAnswer = async () => {
    if (!questionnaire || !spokenText.trim()) return;

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const currentQ = questionnaire.questions[currentIndex];
    setIsEvaluating(true);

    try {
      const res = await fetch('/api/practice/evaluate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          questionId: currentQ.id,
          questionPrompt: currentQ.prompt,
          userSpokenAnswer: spokenText,
          targetClauseNumber: currentQ.targetClauseNumber,
          docType: document.docType,
        }),
      });

      if (res.ok) {
        const evalData: PracticeEvaluation = await res.json();
        setEvaluation(evalData);

        // Record transcript
        setSessionTranscripts(prev => [
          ...prev.filter(t => t.questionId !== currentQ.id),
          {
            questionId: currentQ.id,
            prompt: currentQ.prompt,
            userSpokenAnswer: spokenText,
            targetClauseNumber: currentQ.targetClauseNumber,
            score: evalData.score,
          },
        ]);

        if (audioVoiceEnabled) {
          speakText(`Feedback: ${evalData.feedback}. Model response: ${evalData.suggestedSpokenReply}`);
        }
      }
    } catch (err) {
      console.error('Error evaluating oral answer:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNextQuestion = () => {
    if (!questionnaire) return;
    if (currentIndex < questionnaire.questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSpokenText('');
      setEvaluation(null);
    } else {
      handleGenerateSessionFeedback();
    }
  };

  const handleGenerateSessionFeedback = async () => {
    if (!questionnaire) return;
    setIsLoadingFeedback(true);

    try {
      const currentQ = questionnaire.questions[currentIndex];
      const transcriptsToSend = [...sessionTranscripts];

      // If user hasn't submitted current question yet but typed/spoke something, include it
      if (spokenText.trim() && !transcriptsToSend.some(t => t.questionId === currentQ.id)) {
        transcriptsToSend.push({
          questionId: currentQ.id,
          prompt: currentQ.prompt,
          userSpokenAnswer: spokenText,
          targetClauseNumber: currentQ.targetClauseNumber,
          score: evaluation?.score || 4,
        });
      }

      const res = await fetch('/api/practice/session-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentId: document.id,
          transcripts: transcriptsToSend,
        }),
      });

      if (res.ok) {
        const feedbackData: PracticeSessionFeedback = await res.json();
        setSessionFeedback(feedbackData);
        if (onSessionComplete) {
          onSessionComplete(feedbackData);
        }
        if (audioVoiceEnabled) {
          speakText(`Practice feedback: Clarity score ${feedbackData.clarityScore} out of 10. Accuracy score ${feedbackData.accuracyScore} out of 10. ${feedbackData.clarityEvaluation}`);
        }
      }
    } catch (err) {
      console.error('Error fetching session feedback:', err);
    } finally {
      setIsLoadingFeedback(false);
    }
  };

  const handleReset = () => {
    setCurrentIndex(0);
    setSpokenText('');
    setEvaluation(null);
    setSessionTranscripts([]);
    setSessionFeedback(null);
  };

  const handleCopyFeedbackText = () => {
    if (!sessionFeedback) return;
    const text = `AEGIS ORAL PRACTICE FEEDBACK SUMMARY
Document: ${document.name}
Overall Rating: ${sessionFeedback.overallRating}
Clarity Score: ${sessionFeedback.clarityScore}/10
Textual Accuracy Score: ${sessionFeedback.accuracyScore}/10

CLARITY EVALUATION (NON-LEGAL):
${sessionFeedback.clarityEvaluation}

ACCURACY COMPARED TO DOCUMENT TEXT:
${sessionFeedback.textualAccuracy}

OBSERVED STRENGTHS:
${sessionFeedback.keyStrengths.map(s => `• ${s}`).join('\n')}

KEY ADJUSTMENTS:
${sessionFeedback.keyAdjustments.map(a => `• ${a}`).join('\n')}

DISCLAIMER:
${sessionFeedback.nonLegalDisclaimer}`;

    navigator.clipboard.writeText(text);
    setCopiedFeedback(true);
    setTimeout(() => setCopiedFeedback(false), 2000);
  };

  if (!questionnaire) {
    return (
      <div className="flex-1 p-8 text-center text-xs text-[#71717A] flex flex-col items-center justify-center">
        <div className="w-5 h-5 border-2 border-[#18181B] border-t-transparent rounded-full animate-spin mb-3" />
        <span>Loading practice scenario...</span>
      </div>
    );
  }

  const currentQ = questionnaire.questions[currentIndex];

  return (
    <div className="w-88 sm:w-96 bg-[#FFFFFF] border-l border-[#E4E4E7] flex flex-col h-full shrink-0 font-sans select-none">
      {/* Executive Minimal Top Bar */}
      <div className="px-4 py-3.5 border-b border-[#E4E4E7] bg-[#FAFAF9] flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold tracking-tight text-[#09090B]">
            {sessionFeedback ? 'Practice Feedback Summary' : 'Oral Practice Session'}
          </div>
          <div className="text-[10px] text-[#71717A] mt-0.5">
            {sessionFeedback
              ? `${sessionTranscripts.length} prompt(s) evaluated`
              : `Question ${currentIndex + 1} of ${questionnaire.questions.length}`}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!sessionFeedback && (
            <button
              onClick={() => {
                const next = !audioVoiceEnabled;
                setAudioVoiceEnabled(next);
                if (!next) window.speechSynthesis?.cancel();
              }}
              className={`p-1.5 rounded border text-xs flex items-center gap-1 transition-colors ${
                audioVoiceEnabled
                  ? 'bg-[#18181B] text-[#FFFFFF] border-[#18181B]'
                  : 'bg-[#FFFFFF] border-[#E4E4E7] text-[#71717A] hover:text-[#09090B]'
              }`}
              title={audioVoiceEnabled ? 'Spoken voice is active' : 'Spoken voice is muted'}
            >
              {audioVoiceEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5" />}
            </button>
          )}

          {!sessionFeedback && sessionTranscripts.length > 0 && (
            <button
              onClick={handleGenerateSessionFeedback}
              disabled={isLoadingFeedback}
              className="text-[11px] font-medium text-[#18181B] bg-[#FFFFFF] hover:bg-[#F4F4F5] border border-[#E4E4E7] px-2.5 py-1 rounded transition-colors"
            >
              {isLoadingFeedback ? 'Generating...' : 'View Summary'}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area: Session Feedback View OR Question Step */}
      {sessionFeedback ? (
        /* Practice Feedback Summary View */
        <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs">
          {/* Header Score Card */}
          <div className="p-4 rounded-lg bg-[#FAFAF9] border border-[#E4E4E7] space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold tracking-wider text-[#71717A]">
                Overall Performance
              </span>
              <span className="text-[11px] font-semibold text-[#18181B] px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E4E4E7]">
                {sessionFeedback.overallRating}
              </span>
            </div>

            {/* Metric Gauges */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="p-2.5 rounded bg-[#FFFFFF] border border-[#E4E4E7]">
                <div className="text-[10px] text-[#71717A]">Clarity of Delivery</div>
                <div className="text-lg font-semibold text-[#09090B] mt-0.5">
                  {sessionFeedback.clarityScore}
                  <span className="text-xs text-[#A1A1AA] font-normal"> / 10</span>
                </div>
              </div>

              <div className="p-2.5 rounded bg-[#FFFFFF] border border-[#E4E4E7]">
                <div className="text-[10px] text-[#71717A]">Document Accuracy</div>
                <div className="text-lg font-semibold text-[#09090B] mt-0.5">
                  {sessionFeedback.accuracyScore}
                  <span className="text-xs text-[#A1A1AA] font-normal"> / 10</span>
                </div>
              </div>
            </div>
          </div>

          {/* Clarity Evaluation (Non-legal) */}
          <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7] space-y-1.5">
            <div className="text-[11px] font-semibold text-[#09090B]">
              Spoken Clarity & Articulation
            </div>
            <p className="text-xs text-[#3F3F46] leading-relaxed">
              {sessionFeedback.clarityEvaluation}
            </p>
          </div>

          {/* Textual Accuracy Compared to Document */}
          <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7] space-y-1.5">
            <div className="text-[11px] font-semibold text-[#09090B] flex items-center justify-between">
              <span>Textual Alignment vs. Contract Terms</span>
              <span className="text-[10px] text-[#71717A] font-mono">Factual Check</span>
            </div>
            <p className="text-xs text-[#3F3F46] leading-relaxed">
              {sessionFeedback.textualAccuracy}
            </p>
          </div>

          {/* Observed Strengths */}
          {sessionFeedback.keyStrengths && sessionFeedback.keyStrengths.length > 0 && (
            <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7] space-y-2">
              <div className="text-[11px] font-semibold text-[#09090B]">
                Key Strengths
              </div>
              <ul className="space-y-1.5 text-xs text-[#3F3F46]">
                {sessionFeedback.keyStrengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#18181B] mt-0.5">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recommended Adjustments */}
          {sessionFeedback.keyAdjustments && sessionFeedback.keyAdjustments.length > 0 && (
            <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7] space-y-2">
              <div className="text-[11px] font-semibold text-[#09090B]">
                Adjustments for Real Negotiation
              </div>
              <ul className="space-y-1.5 text-xs text-[#3F3F46]">
                {sessionFeedback.keyAdjustments.map((a, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <span className="text-[#18181B] mt-0.5">•</span>
                    <span>{a}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Non-legal educational disclaimer */}
          <div className="p-3 rounded bg-[#FAFAF9] border border-[#E4E4E7] text-[10px] text-[#71717A] leading-relaxed">
            {sessionFeedback.nonLegalDisclaimer}
          </div>

          {/* Bottom Actions */}
          <div className="pt-2 flex items-center justify-between gap-2">
            <button
              onClick={handleCopyFeedbackText}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#FFFFFF] hover:bg-[#F4F4F5] border border-[#E4E4E7] text-xs font-medium text-[#18181B] transition-colors"
            >
              {copiedFeedback ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedFeedback ? 'Copied' : 'Copy Summary'}</span>
            </button>

            <button
              onClick={handleReset}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#18181B] hover:bg-[#09090B] text-xs font-medium text-[#FFFFFF] transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Practice Again</span>
            </button>
          </div>
        </div>
      ) : (
        /* Question Answering View */
        <div className="flex-1 overflow-y-auto p-4 space-y-3.5 text-xs">
          {/* Question Prompt Card */}
          <div className="p-4 rounded-lg bg-[#FAFAF9] border border-[#E4E4E7] space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#71717A]">
                {questionnaire.scenarioRole}
              </span>
              {currentQ.targetClauseNumber && (
                <button
                  onClick={() => onJumpToClause && onJumpToClause(currentQ.targetClauseNumber)}
                  className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E4E4E7] text-[#18181B] hover:border-[#18181B] transition-colors"
                  title="View referenced clause in document"
                >
                  Clause {currentQ.targetClauseNumber}
                </button>
              )}
            </div>

            <p className="font-serif text-[14px] text-[#09090B] leading-relaxed">
              "{currentQ.prompt}"
            </p>

            <div className="flex items-center gap-1.5 pt-2 border-t border-[#E4E4E7] text-[10px] text-[#71717A]">
              <Scale className="w-3 h-3 text-[#18181B]" />
              <span>Legal Context: {currentQ.statuteHint}</span>
            </div>
          </div>

          {/* User Spoken Response Input */}
          <div className="p-3.5 rounded-lg bg-[#FFFFFF] border border-[#E4E4E7] space-y-2.5">
            <div className="flex items-center justify-between text-[11px]">
              <span className="font-semibold text-[#09090B]">Your Spoken Response</span>
              {isListening && (
                <span className="text-[10px] text-[#18181B] font-medium">
                  Listening to voice...
                </span>
              )}
            </div>

            <textarea
              value={spokenText}
              onChange={e => setSpokenText(e.target.value)}
              placeholder="Speak your response via microphone, or type here..."
              className="w-full h-24 p-2.5 rounded bg-[#FAFAF9] border border-[#E4E4E7] text-xs text-[#09090B] placeholder-[#A1A1AA] focus:outline-none focus:bg-[#FFFFFF] focus:border-[#18181B] resize-none transition-colors"
            />

            <div className="flex items-center justify-between gap-2">
              <button
                onClick={toggleListening}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium border transition-colors ${
                  isListening
                    ? 'bg-[#18181B] text-[#FFFFFF] border-[#18181B]'
                    : 'bg-[#FFFFFF] text-[#18181B] border-[#E4E4E7] hover:border-[#18181B]'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                <span>{isListening ? 'Stop Mic' : 'Speak'}</span>
              </button>

              <button
                onClick={handleEvaluateAnswer}
                disabled={!spokenText.trim() || isEvaluating}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#18181B] hover:bg-[#09090B] disabled:opacity-40 text-[#FFFFFF] text-xs font-medium transition-colors"
              >
                <span>{isEvaluating ? 'Evaluating...' : 'Evaluate Defense'}</span>
              </button>
            </div>
          </div>

          {/* Evaluation & Model Script */}
          {evaluation && (
            <div className="p-3.5 rounded-lg bg-[#FAFAF9] border border-[#E4E4E7] space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-[11px] text-[#09090B]">
                  Defense Feedback
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-[#FFFFFF] border border-[#E4E4E7] text-[#18181B]">
                  {evaluation.rating} ({evaluation.score}/5)
                </span>
              </div>

              <p className="text-xs text-[#3F3F46] leading-relaxed">
                {evaluation.feedback}
              </p>

              {/* Recommended Spoken Script */}
              <div className="p-2.5 rounded bg-[#FFFFFF] border border-[#E4E4E7] space-y-1">
                <div className="flex items-center justify-between text-[10px] font-semibold text-[#71717A]">
                  <span>Model Script</span>
                  <button
                    onClick={() => speakText(evaluation.suggestedSpokenReply)}
                    className="text-[#18181B] hover:underline flex items-center gap-1"
                  >
                    <Play className="w-3 h-3" />
                    <span>Listen</span>
                  </button>
                </div>
                <p className="font-serif text-xs text-[#09090B] italic leading-relaxed">
                  "{evaluation.suggestedSpokenReply}"
                </p>
              </div>

              {/* Next Question / Finish Session */}
              <div className="pt-1 flex items-center justify-end gap-2">
                {currentIndex < questionnaire.questions.length - 1 ? (
                  <button
                    onClick={handleNextQuestion}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#18181B] hover:bg-[#09090B] text-[#FFFFFF] text-xs font-medium transition-colors"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    onClick={handleGenerateSessionFeedback}
                    disabled={isLoadingFeedback}
                    className="flex items-center gap-1.5 px-3.5 py-1.5 rounded bg-[#18181B] hover:bg-[#09090B] text-[#FFFFFF] text-xs font-medium transition-colors"
                  >
                    <span>{isLoadingFeedback ? 'Generating...' : 'Complete Session & View Feedback'}</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
