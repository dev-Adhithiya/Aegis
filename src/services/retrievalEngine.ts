import { Clause, Citation, QnAResponse } from '../types/legal';

/**
 * Computes BM25/keyword relevance score between a query and a clause chunk.
 */
function scoreChunkRelevance(query: string, clause: Clause): number {
  const queryTerms = query
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter(t => t.length > 2);

  if (queryTerms.length === 0) return 0;

  const titleLower = clause.title.toLowerCase();
  const textLower = clause.text.toLowerCase();
  let score = 0;

  for (const term of queryTerms) {
    // Title matches get high boost
    if (titleLower.includes(term)) {
      score += 4.0;
    }
    // Clause text match
    const matches = textLower.split(term).length - 1;
    if (matches > 0) {
      score += Math.min(matches * 1.2, 5.0);
    }
  }

  // Exact phrase match bonus
  if (textLower.includes(query.toLowerCase().trim())) {
    score += 8.0;
  }

  return score;
}

/**
 * Retrieves the most relevant clause chunks for a query using RAG.
 * Never dumps the entire document into the prompt.
 */
export function retrieveRelevantClauses(
  query: string,
  clauses: Clause[],
  topK: number = 3
): Array<{ clause: Clause; score: number }> {
  if (!clauses || clauses.length === 0) return [];

  const scored = clauses.map(clause => ({
    clause,
    score: scoreChunkRelevance(query, clause),
  }));

  // Filter chunks with positive score and sort descending
  const relevant = scored
    .filter(item => item.score > 0)
    .sort((a, b) => b.score - a.score);

  return relevant.slice(0, topK);
}

/**
 * Builds grounded citation objects from matched chunks.
 */
export function buildCitations(matchedChunks: Array<{ clause: Clause; score: number }>): Citation[] {
  return matchedChunks.map(({ clause }) => {
    const snippet = clause.text.length > 220 
      ? clause.text.slice(0, 220) + '...' 
      : clause.text;

    return {
      clauseId: clause.id,
      clauseNumber: clause.clauseNumber,
      clauseTitle: clause.title,
      snippet,
    };
  });
}

/**
 * Fallback local grounded answer generator when Gemini API is offline or key not provided.
 * Follows exact legal precision: If nothing supports answer, explicitly says so!
 */
export function generateLocalGroundedAnswer(
  query: string,
  relevantChunks: Array<{ clause: Clause; score: number }>
): QnAResponse {
  const scopeNote = 'Informational summary based solely on document text. Does not constitute legal advice.';

  if (relevantChunks.length === 0 || relevantChunks[0].score < 1.0) {
    return {
      question: query,
      answer: 'No provision in the document addresses this question. The text of this agreement contains no terms or clauses regarding this matter.',
      citations: [],
      isSupportedByDocument: false,
      scopeNote,
    };
  }

  const citations = buildCitations(relevantChunks);
  const primaryClause = relevantChunks[0].clause;

  // Synthesize cited factual answer from primary and secondary clauses
  const excerptClean = primaryClause.text.replace(/\s+/g, ' ').slice(0, 320);
  
  const answer = `According to [Clause ${primaryClause.clauseNumber}: ${primaryClause.title}], the agreement states: "${excerptClean}..."${
    relevantChunks.length > 1 
      ? ` Additionally, [Clause ${relevantChunks[1].clause.clauseNumber}] provides relevant context.` 
      : ''
  }`;

  return {
    question: query,
    answer,
    citations,
    isSupportedByDocument: true,
    scopeNote,
  };
}
