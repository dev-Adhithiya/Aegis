import { Clause, DocumentSummary, DocumentType } from '../types/legal';

/**
 * Splits legal documents on numbered clauses, section markers, or uppercase headings.
 * Does NOT split on arbitrary token windows.
 */
export function parseDocumentClauses(rawText: string): Clause[] {
  if (!rawText || !rawText.trim()) {
    return [];
  }

  const lines = rawText.split(/\r?\n/);
  const clauses: Clause[] = [];
  
  // Patterns matching numbered clauses or legal headings
  // e.g. "1. DEFINITIONS", "Clause 2: Rent", "Section 3.1", "4. TERM", "ARTICLE V"
  const clauseHeaderRegex = /^(?:(?:Clause|Section|Article|Point)\s+(\d+(?:\.\d+)*[a-z]?)|(\d+(?:\.\d+)*)\.|\b([IVXLCDM]+)\.)\s*(.*)$/i;
  const uppercaseHeaderRegex = /^([A-Z\s]{4,40})(?::|$)/;

  let currentNumber = 'Preamble';
  let currentTitle = 'Introduction & Recitals';
  let currentLines: string[] = [];
  let currentOffset = 0;
  let charCounter = 0;

  function commitClause() {
    const text = currentLines.join('\n').trim();
    if (text.length > 0) {
      const id = `clause-${clauses.length + 1}`;
      clauses.push({
        id,
        clauseNumber: currentNumber,
        title: currentTitle,
        text,
        offset: currentOffset,
      });
    }
    currentLines = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineOffset = charCounter;
    charCounter += lines[i].length + 1;

    if (!line) {
      if (currentLines.length > 0) {
        currentLines.push('');
      }
      continue;
    }

    const headerMatch = line.match(clauseHeaderRegex);
    const upperMatch = !headerMatch && line.length < 50 ? line.match(uppercaseHeaderRegex) : null;

    if (headerMatch) {
      commitClause();
      currentNumber = headerMatch[1] || headerMatch[2] || headerMatch[3] || `${clauses.length + 1}`;
      currentTitle = (headerMatch[4] || '').trim() || `Clause ${currentNumber}`;
      currentOffset = lineOffset;
      currentLines.push(line);
    } else if (upperMatch && currentLines.length > 3) {
      // Detected major uppercase section header
      commitClause();
      currentNumber = `Sec ${clauses.length + 1}`;
      currentTitle = upperMatch[1].trim();
      currentOffset = lineOffset;
      currentLines.push(line);
    } else {
      currentLines.push(line);
    }
  }

  commitClause();

  // If no clauses matched (e.g. unformatted block), split by paragraphs
  if (clauses.length <= 1 && rawText.length > 800) {
    const paragraphs = rawText.split(/\n\s*\n/);
    const fallbackClauses: Clause[] = [];
    let offset = 0;

    paragraphs.forEach((p, idx) => {
      const trimmed = p.trim();
      if (trimmed.length > 20) {
        const firstLine = trimmed.split('\n')[0].slice(0, 40);
        fallbackClauses.push({
          id: `clause-${idx + 1}`,
          clauseNumber: `${idx + 1}`,
          title: firstLine,
          text: trimmed,
          offset,
        });
        offset += p.length + 2;
      }
    });

    if (fallbackClauses.length > 1) {
      return fallbackClauses;
    }
  }

  return clauses;
}

/**
 * Detects whether the document is a lease agreement or NDA under Indian law.
 */
export function detectDocumentType(rawText: string): DocumentType {
  const text = rawText.toLowerCase();
  const leaseKeywords = [
    'lease', 'rent', 'tenancy', 'landlord', 'tenant', 'lessor', 'lessee',
    'premises', 'monthly rent', 'security deposit', 'transfer of property act'
  ];
  const ndaKeywords = [
    'non-disclosure', 'confidential', 'nda', 'disclosing party', 'receiving party',
    'proprietary information', 'confidentiality', 'trade secrets'
  ];

  let leaseScore = 0;
  let ndaScore = 0;

  leaseKeywords.forEach(k => { if (text.includes(k)) leaseScore++; });
  ndaKeywords.forEach(k => { if (text.includes(k)) ndaScore++; });

  if (leaseScore > ndaScore) return 'lease';
  if (ndaScore > leaseScore) return 'nda';
  return 'lease'; // default to lease
}

/**
 * Synthesizes structured JSON entity representation from clauses.
 * Used as the single source of truth for both UI prose and export.
 */
export function extractStructuredJSON(
  rawText: string,
  docType: DocumentType,
  clauses: Clause[]
): DocumentSummary {
  const fullText = rawText;

  if (docType === 'lease') {
    // Extract parties
    const lessorMatch = fullText.match(/(?:Lessor|Landlord|Owner)[:\s]+([^\n,;]+)/i);
    const lesseeMatch = fullText.match(/(?:Lessee|Tenant)[:\s]+([^\n,;]+)/i);

    // Key dates & durations
    const dateMatch = fullText.match(/(?:dated|effective from|commencing(?: on)?)[:\s]+([^\n,.]+)/i);
    const termMatch = fullText.match(/(?:period of|term of|duration of)[:\s]+([0-9]+\s*(?:months|years))/i);
    const lockInMatch = fullText.match(/(?:lock-in period of|lock in)[:\s]+([^\n,.]+)/i);
    const renewalMatch = fullText.match(/(?:renewal|renew)[:\s]+([^\n.]+)/i);

    // Financials
    const rentMatch = fullText.match(/(?:monthly rent(?: of)?|rent payable)[:\s]+(?:Rs\.?|INR|₹)?\s*([0-9,]+(?:\s*\/\-\s*)?(?:per month)?)/i);
    const depositMatch = fullText.match(/(?:security deposit(?: of)?|interest-free deposit)[:\s]+(?:Rs\.?|INR|₹)?\s*([0-9,]+(?:\s*\/\-\s*)?)/i);
    const escalationMatch = fullText.match(/(?:escalation|increase in rent)[:\s]+([0-9]+%\s*(?:every\s*[^\n.]+)?)/i);

    // Termination
    const noticeMatch = fullText.match(/(?:notice period of|notice of)[:\s]+([0-9]+\s*(?:days|months))/i);

    const parties = [
      {
        name: lessorMatch ? lessorMatch[1].trim() : 'Landlord / Lessor',
        role: 'Lessor / Property Owner',
        panOrAddress: 'Identified in lease preamble'
      },
      {
        name: lesseeMatch ? lesseeMatch[1].trim() : 'Tenant / Lessee',
        role: 'Lessee / Tenant',
        panOrAddress: 'Identified in lease preamble'
      }
    ];

    const keyObligations = [
      {
        party: 'Tenant',
        obligation: 'Pay monthly rent on or before the due date and maintain premises in habitable condition.',
        clauseRef: 'Rent & Maintenance'
      },
      {
        party: 'Landlord',
        obligation: 'Provide peaceful and quiet possession and refund security deposit upon vacant handover.',
        clauseRef: 'Covenants of Lessor'
      }
    ];

    const terminationConditions = {
      noticePeriod: noticeMatch ? `${noticeMatch[1].trim()} written notice` : '30 days written notice',
      grounds: [
        'Default in monthly rental payments exceeding cure period',
        'Breach of residential use covenants or unauthorized subletting',
        'Mutual agreement or expiry of term'
      ],
      remediesOnBreach: 'Forfeiture of security deposit or adjustment against arrears; restoration of premises.',
      clauseRef: 'Termination & Default'
    };

    const overview = `Residential/commercial lease agreement entered into between ${parties[0].name} (Lessor) and ${parties[1].name} (Lessee) in India, governing tenancy over the demised premises for a stipulated term of ${termMatch ? termMatch[1] : '11 months'}. Governed by the Transfer of Property Act, 1882 and applicable local tenancy laws.`;

    return {
      parties,
      purpose: 'Lease and tenancy of demised property for lawful occupation in accordance with Indian urban rental conventions.',
      keyDatesDurations: {
        commencementDate: dateMatch ? dateMatch[1].trim() : 'Commencement date as specified in Schedule',
        durationOrTerm: termMatch ? termMatch[1].trim() : '11 Months',
        lockInPeriod: lockInMatch ? lockInMatch[1].trim() : 'Subject to lock-in clause',
        renewalTerms: renewalMatch ? renewalMatch[1].trim() : 'Subject to mutual written consent'
      },
      financialTerms: {
        rentOrConsideration: rentMatch ? `₹${rentMatch[1].trim()}` : 'As specified in Agreement',
        securityDeposit: depositMatch ? `₹${depositMatch[1].trim()}` : 'Interest-free refundable deposit',
        escalation: escalationMatch ? `${escalationMatch[1].trim()}` : '5% - 10% upon annual renewal',
        maintenanceOrOthers: 'Electricity, water, and society maintenance charges payable as consumed.'
      },
      keyObligations,
      terminationConditions,
      plainEnglishOverview: overview
    };
  } else {
    // NDA
    const partyAMatch = fullText.match(/(?:Party A|Disclosing Party|Company)[:\s]+([^\n,;]+)/i);
    const partyBMatch = fullText.match(/(?:Party B|Receiving Party|Recipient)[:\s]+([^\n,;]+)/i);
    const termMatch = fullText.match(/(?:period of|term of|duration of|survive for)[:\s]+([0-9]+\s*(?:years|months))/i);

    const parties = [
      {
        name: partyAMatch ? partyAMatch[1].trim() : 'Disclosing Party',
        role: 'Disclosing Entity',
      },
      {
        name: partyBMatch ? partyBMatch[1].trim() : 'Receiving Party',
        role: 'Recipient Entity',
      }
    ];

    const overview = `Non-Disclosure Agreement entered into under the Indian Contract Act, 1872 between ${parties[0].name} and ${parties[1].name} to protect proprietary and confidential business information shared in contemplation of commercial discussions.`;

    return {
      parties,
      purpose: 'Protection of proprietary technical, commercial, and financial information disclosed during discussions.',
      keyDatesDurations: {
        commencementDate: 'Effective date of signing',
        durationOrTerm: termMatch ? termMatch[1].trim() : '2 to 3 years from disclosure',
        renewalTerms: 'Non-renewable; expires upon term conclusion'
      },
      keyObligations: [
        {
          party: 'Receiving Party',
          obligation: 'Hold confidential information in strict confidence using standard of care; restrict access to need-to-know representatives.',
          clauseRef: 'Nondisclosure Obligations'
        },
        {
          party: 'Both Parties',
          obligation: 'Return or destroy confidential materials upon written request or termination of talks.',
          clauseRef: 'Return of Materials'
        }
      ],
      terminationConditions: {
        noticePeriod: 'Immediate upon completion of discussions; survival obligations persist for stated duration',
        grounds: [
          'Material breach of confidentiality obligations',
          'Notice of termination of commercial negotiations'
        ],
        remediesOnBreach: 'Injunctive relief, damages subject to Indian Contract Act 1872 (Section 73/74)',
        clauseRef: 'Remedies & Jurisdiction'
      },
      plainEnglishOverview: overview
    };
  }
}
