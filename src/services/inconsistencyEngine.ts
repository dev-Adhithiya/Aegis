import { Clause, ClauseInconsistency, RiskFlag, RiskOption, StructuredDocument } from '../types/legal';

/**
 * Generate standardized, non-directive "Your Options" informational paths
 * for a specific risk or inconsistency. Never uses prescriptive "you must" or "you should".
 */
export function generateRiskOptions(
  ruleName: string,
  clauseNumber: string,
  docType: 'lease' | 'nda' | 'other'
): RiskOption[] {
  const rule = ruleName.toLowerCase();

  if (rule.includes('renewal') || rule.includes('automatic')) {
    return [
      {
        id: `opt-${clauseNumber}-neg`,
        actionType: 'negotiate',
        title: 'Option A: Propose Bilateral Written Renewal',
        description:
          'Request amending Clause ' + clauseNumber + ' so any subsequent term requires affirmative mutual written consent at least 45 to 60 days prior to expiry, removing the automatic binding trigger.',
      },
      {
        id: `opt-${clauseNumber}-cla`,
        actionType: 'clarify',
        title: 'Option B: Request Written Clarification on Escalation',
        description:
          'Inquire in writing whether the landlord intends the escalation rate to be open to renegotiation based on prevailing local market rates rather than a mandatory fixed jump.',
      },
      {
        id: `opt-${clauseNumber}-rev`,
        actionType: 'review',
        title: 'Option C: Seek Advocate Review on Determination Rules',
        description:
          'Consult legal counsel on how Section 111 of the Transfer of Property Act 1882 applies to lease determinations, ensuring your right to vacate upon term expiry is preserved.',
      },
    ];
  }

  if (rule.includes('indemnity') || rule.includes('liability')) {
    return [
      {
        id: `opt-${clauseNumber}-neg`,
        actionType: 'negotiate',
        title: 'Option A: Propose Financial Liability Cap',
        description:
          'Propose capping maximum tenant liability to a fixed benchmark (e.g., 2 months of rent or the security deposit sum) and explicitly excluding remote or consequential losses under Section 73 ICA 1872.',
      },
      {
        id: `opt-${clauseNumber}-cla`,
        actionType: 'clarify',
        title: 'Option B: Clarify Exclusions for Standard Wear & Tear',
        description:
          'Ask the drafting party to confirm in writing that routine aging, electrical wear, and structural defects outside your control are excluded from indemnity coverage.',
      },
      {
        id: `opt-${clauseNumber}-rev`,
        actionType: 'review',
        title: 'Option C: Have Counsel Audit Cross-Indemnification',
        description:
          'Have an advocate assess whether mutual indemnification is appropriate for common areas managed by the Resident Welfare Association (RWA).',
      },
    ];
  }

  if (rule.includes('termination') || rule.includes('notice') || rule.includes('lock-in')) {
    return [
      {
        id: `opt-${clauseNumber}-neg`,
        actionType: 'negotiate',
        title: 'Option A: Propose Equal Reciprocal Notice',
        description:
          'Propose matching notice periods (e.g. 30 days written notice for both parties) following a reasonable 3-month lock-in, replacing one-sided termination or total forfeiture.',
      },
      {
        id: `opt-${clauseNumber}-cla`,
        actionType: 'clarify',
        title: 'Option B: Request Clarification on Exit Conditions',
        description:
          'Inquire whether early termination with legitimate cause (such as job relocation, medical emergency, or unresolved structural habitability issues) waives lock-in penalties.',
      },
      {
        id: `opt-${clauseNumber}-rev`,
        actionType: 'review',
        title: 'Option C: Consult Advocate on Section 74 Penalty Defense',
        description:
          'Seek professional legal guidance on Indian Contract Act 1872 Section 74 regarding whether automatic deposit forfeiture constitutes an unenforceable contractual penalty.',
      },
    ];
  }

  if (rule.includes('deposit') || rule.includes('deduction')) {
    return [
      {
        id: `opt-${clauseNumber}-neg`,
        actionType: 'negotiate',
        title: 'Option A: Request Itemized Invoices & Inspection Protocol',
        description:
          'Propose adding a condition that any deposit deductions require a joint pre-move-out walkthrough and documented GST contractor receipts within 15 calendar days.',
      },
      {
        id: `opt-${clauseNumber}-cla`,
        actionType: 'clarify',
        title: 'Option B: Clarify Painting & Repainting Deductions',
        description:
          'Clarify whether painting deductions apply only if the premises were freshly painted at handover and the tenancy duration is under a specified threshold.',
      },
      {
        id: `opt-${clauseNumber}-rev`,
        actionType: 'review',
        title: 'Option C: Counsel Review for Escrow or Fixed Refund Timelines',
        description:
          'Consult legal counsel to verify whether local rent authority or Model Tenancy guidelines cap deposit retention periods in your jurisdiction.',
      },
    ];
  }

  if (rule.includes('entry') || rule.includes('inspection')) {
    return [
      {
        id: `opt-${clauseNumber}-neg`,
        actionType: 'negotiate',
        title: 'Option A: Add 24-48 Hours Advance Written Notice',
        description:
          'Propose that all inspections require at least 24 hours prior written notice (via email or message) and take place exclusively during reasonable daytime hours.',
      },
      {
        id: `opt-${clauseNumber}-cla`,
        actionType: 'clarify',
        title: 'Option B: Clarify Emergency Entry Exceptions',
        description:
          'Confirm that unannounced entry is strictly limited to verified emergencies (e.g. water leaks, electrical hazards) with immediate follow-up notification.',
      },
      {
        id: `opt-${clauseNumber}-rev`,
        actionType: 'review',
        title: 'Option C: Review Tenant Right to Quiet Enjoyment',
        description:
          'Consult legal counsel regarding Transfer of Property Act 1882 Section 108(c) protections guaranteeing tenant quiet possession without landlord disturbance.',
      },
    ];
  }

  if (rule.includes('non-compete') || rule.includes('restraint')) {
    return [
      {
        id: `opt-${clauseNumber}-neg`,
        actionType: 'negotiate',
        title: 'Option A: Strike Restrictive Covenant Entirely',
        description:
          'Request striking Clause ' + clauseNumber + ' in full on the basis that preliminary confidentiality agreements should not govern commercial competition or hiring.',
      },
      {
        id: `opt-${clauseNumber}-cla`,
        actionType: 'clarify',
        title: 'Option B: Narrow Scope to Targeted Solicitation',
        description:
          'If the counterparty insists on non-solicitation, clarify that it applies only to direct poaching of key personnel specifically introduced during discussions, not general employment advertisements.',
      },
      {
        id: `opt-${clauseNumber}-rev`,
        actionType: 'review',
        title: 'Option C: Advocate Review on Section 27 Void Status',
        description:
          'Obtain formal legal confirmation on Section 27 of the Indian Contract Act 1872 and landmark Supreme Court rulings (e.g. Percept D’Mark) rendering post-term non-competes void ab initio.',
      },
    ];
  }

  // Default generic 3 paths
  return [
    {
      id: `opt-${clauseNumber}-neg`,
      actionType: 'negotiate',
      title: 'Option A: Propose Balanced Mutual Wording',
      description:
        'Request revising Clause ' + clauseNumber + ' to establish reciprocal obligations or standard industry-standard qualifications.',
    },
    {
      id: `opt-${clauseNumber}-cla`,
      actionType: 'clarify',
      title: 'Option B: Request Written Clarification on Scope',
      description:
        'Seek written confirmation from the other party clarifying the intended practical enforcement of this clause before signing.',
    },
    {
      id: `opt-${clauseNumber}-rev`,
      actionType: 'review',
      title: 'Option C: Seek Professional Legal Guidance',
      description:
        'Have an advocate review this provision in light of Indian contract jurisprudence to assess your risk exposure.',
    },
  ];
}

/**
 * Detects internal inconsistencies within a single structured document.
 */
export function detectDocumentInconsistencies(doc: StructuredDocument): ClauseInconsistency[] {
  const inconsistencies: ClauseInconsistency[] = [];
  const clauses = doc.clauses;

  if (doc.docType === 'lease') {
    // 1. Lock-in vs Unilateral Landlord Termination
    const lockInClause = clauses.find(c =>
      /lock-in|lock in|remainder of the.*term/i.test(c.text)
    );
    const shortNoticeClause = clauses.find(c =>
      /7\s*days|seven\s*days|terminate at any time|without assigning any cause/i.test(c.text)
    );

    if (lockInClause && shortNoticeClause && lockInClause.id !== shortNoticeClause.id) {
      inconsistencies.push({
        id: `incon-${doc.id}-lockin-term`,
        title: 'Contradictory Exit Obligations: Lock-in vs. 7-Day Unilateral Exit',
        description: `Clause ${lockInClause.clauseNumber} mandates a strict 11-month lock-in with total deposit forfeiture, whereas Clause ${shortNoticeClause.clauseNumber} allows the Lessor to terminate on just 7 days notice without cause.`,
        severity: 'high',
        clauseA: {
          clauseId: lockInClause.id,
          clauseNumber: lockInClause.clauseNumber,
          title: lockInClause.title,
          excerpt: lockInClause.text.slice(0, 220) + '...',
          statedTerm: '11-month mandatory tenant lock-in with full forfeiture upon exit',
        },
        clauseB: {
          clauseId: shortNoticeClause.id,
          clauseNumber: shortNoticeClause.clauseNumber,
          title: shortNoticeClause.title,
          excerpt: shortNoticeClause.text.slice(0, 220) + '...',
          statedTerm: 'Lessor may terminate at any time with 7 days notice without cause',
        },
        potentialImpact:
          'Creates a direct contractual imbalance where the tenant is legally bound to pay for 11 months while facing potential eviction on 7 days notice without recourse.',
        options: [
          {
            id: 'opt-inc-1',
            actionType: 'negotiate',
            title: 'Option A: Harmonize to Bilateral 30-Day Notice',
            description:
              'Propose replacing both clauses with a standard 3-month lock-in followed by reciprocal 30-day notice for both landlord and tenant.',
          },
          {
            id: 'opt-inc-2',
            actionType: 'clarify',
            title: 'Option B: Clarify 7-Day Notice Grounds',
            description:
              'Request written confirmation whether the 7-day notice is intended only for uncured material breach (e.g. non-payment) rather than no-fault eviction.',
          },
          {
            id: 'opt-inc-3',
            actionType: 'review',
            title: 'Option C: Advocate Consultation on Section 106 TPA',
            description:
              'Consult counsel regarding statutory notice floors under Section 106 of the Transfer of Property Act 1882 (minimum 15 days for monthly tenancy).',
          },
        ],
      });
    }

    // 2. Fixed Duration vs Automatic Renewal
    const termClause = clauses.find(c =>
      /fixed term|commencing from.*to|11\s*\(eleven\)\s*months/i.test(c.text) &&
      !c.text.toLowerCase().includes('automatically renewed')
    );
    const autoRenewClause = clauses.find(c =>
      /automatically renewed|deemed to be renewed|automatic renewal/i.test(c.text)
    );

    if (termClause && autoRenewClause && termClause.id !== autoRenewClause.id) {
      inconsistencies.push({
        id: `incon-${doc.id}-term-renewal`,
        title: 'Tenure Discrepancy: Fixed Term Determination vs. Automatic Perpetual Extension',
        description: `Clause ${termClause.clauseNumber} defines a fixed 11-month period expiring on a specific date, while Clause ${autoRenewClause.clauseNumber} stipulates automatic renewal with mandatory escalation without requiring bilateral written agreement.`,
        severity: 'medium',
        clauseA: {
          clauseId: termClause.id,
          clauseNumber: termClause.clauseNumber,
          title: termClause.title,
          excerpt: termClause.text.slice(0, 200) + '...',
          statedTerm: 'Fixed 11-month lease concluding at term end',
        },
        clauseB: {
          clauseId: autoRenewClause.id,
          clauseNumber: autoRenewClause.clauseNumber,
          title: autoRenewClause.title,
          excerpt: autoRenewClause.text.slice(0, 200) + '...',
          statedTerm: 'Deemed automatic renewal with 12% escalation unless landlord terminates',
        },
        potentialImpact:
          'Leaves tenant tenure ambiguous at the 11th month, potentially creating unintentional liability for escalated rent if formal notice is missed.',
        options: [
          {
            id: 'opt-inc-renew-1',
            actionType: 'negotiate',
            title: 'Option A: Require Mutual Written Consent for Extension',
            description:
              'Propose that any renewal requires an executed written addendum 60 days before expiry.',
          },
          {
            id: 'opt-inc-renew-2',
            actionType: 'clarify',
            title: 'Option B: Clarify Notice Window to Prevent Rollover',
            description:
              'Confirm in writing the exact timeline for the tenant to declare intention to vacate at the end of the 11-month term without penalty.',
          },
          {
            id: 'opt-inc-renew-3',
            actionType: 'review',
            title: 'Option C: Counsel Review on Determination of Lease',
            description:
              'Review legal precedents under Transfer of Property Act Sec 111 regarding determination by efflux of time.',
          },
        ],
      });
    }

    // 3. Maintenance Allocation vs Absolute Tenant Indemnity
    const maintenanceClause = clauses.find(c =>
      /maintenance charges.*directly to the resident welfare|rwa/i.test(c.text)
    );
    const indemnityClause = clauses.find(c =>
      /fully indemnify.*irrespective of contributory negligence|all claims.*losses/i.test(c.text)
    );

    if (maintenanceClause && indemnityClause) {
      inconsistencies.push({
        id: `incon-${doc.id}-maint-indemnity`,
        title: 'Maintenance Cost Allocation vs. Uncapped Structural Liability',
        description: `Clause ${maintenanceClause.clauseNumber} obligates tenant to pay monthly maintenance to the RWA for building facilities, yet Clause ${indemnityClause.clauseNumber} imposes absolute uncapped liability on tenant for all losses irrespective of building faults or third-party negligence.`,
        severity: 'medium',
        clauseA: {
          clauseId: maintenanceClause.id,
          clauseNumber: maintenanceClause.clauseNumber,
          title: maintenanceClause.title,
          excerpt: maintenanceClause.text.slice(0, 200) + '...',
          statedTerm: 'Tenant pays ₹4,500 monthly maintenance directly to RWA for premises upkeep',
        },
        clauseB: {
          clauseId: indemnityClause.id,
          clauseNumber: indemnityClause.clauseNumber,
          title: indemnityClause.title,
          excerpt: indemnityClause.text.slice(0, 200) + '...',
          statedTerm: 'Tenant indemnifies landlord against all losses regardless of contributory negligence',
        },
        potentialImpact:
          'Tenant pays for communal building maintenance but assumes legal responsibility for damages that may originate from structural or society failures.',
        options: [
          {
            id: 'opt-inc-ind-1',
            actionType: 'negotiate',
            title: 'Option A: Exclude Structural & RWA-Maintained Elements',
            description:
              'Amend indemnity to apply strictly to negligent acts within the apartment interior, explicitly excluding common amenities and building infrastructure.',
          },
          {
            id: 'opt-inc-ind-2',
            actionType: 'clarify',
            title: 'Option B: Delineate Landlord vs. RWA Repair Channels',
            description:
              'Establish written protocol defining who bears cost for exterior seepage, plumbing shafts, and lift maintenance.',
          },
          {
            id: 'opt-inc-ind-3',
            actionType: 'review',
            title: 'Option C: Legal Counsel Assessment of Tortious Liability',
            description:
              'Have counsel review indemnification boundaries under Indian Contract Act 1872 Section 73.',
          },
        ],
      });
    }
  } else if (doc.docType === 'nda') {
    // NDA: Oral disclosure writing requirement omission vs exclusions
    const defClause = clauses.find(c => /without any requirement that oral disclosures be reduced to writing/i.test(c.text));
    const exclusionClause = clauses.find(c => /already lawfully known|public domain/i.test(c.text));

    if (defClause && exclusionClause) {
      inconsistencies.push({
        id: `incon-${doc.id}-nda-evidentiary`,
        title: 'Evidentiary Ambiguity: Unrecorded Oral Disclosures vs. Burden of Exclusions',
        description: `Clause ${defClause.clauseNumber} classifies unrecorded oral conversations as confidential without memorialization, while Clause ${exclusionClause.clauseNumber} requires proving prior lawful possession to escape liability.`,
        severity: 'medium',
        clauseA: {
          clauseId: defClause.id,
          clauseNumber: defClause.clauseNumber,
          title: defClause.title,
          excerpt: defClause.text.slice(0, 220) + '...',
          statedTerm: 'Oral disclosures confidential without requirement to be reduced to writing',
        },
        clauseB: {
          clauseId: exclusionClause.id,
          clauseNumber: exclusionClause.clauseNumber,
          title: exclusionClause.title,
          excerpt: exclusionClause.text.slice(0, 220) + '...',
          statedTerm: 'Exclusions apply only if lawful prior knowledge is affirmatively documented',
        },
        potentialImpact:
          'Creating an impossible evidentiary burden where unwritten casual discussions can later be alleged as proprietary secrets.',
        options: [
          {
            id: 'opt-nda-inc-1',
            actionType: 'negotiate',
            title: 'Option A: Add Standard 15-Day Written Memorialization Rule',
            description:
              'Propose that oral disclosures must be identified as confidential at time of discussion and summarized in writing within 15 days to remain protected.',
          },
          {
            id: 'opt-nda-inc-2',
            actionType: 'clarify',
            title: 'Option B: Clarify Scope of Technical Brainstorming',
            description:
              'Clarify in writing that general industry knowledge and unpatented ideas discussed orally do not trigger perpetual confidentiality.',
          },
          {
            id: 'opt-nda-inc-3',
            actionType: 'review',
            title: 'Option C: Counsel Review for Section 27 Restraint Risks',
            description:
              'Consult counsel on ensuring broad definitions are not weaponized as de facto non-competes under Section 27 of ICA 1872.',
          },
        ],
      });
    }
  }

  return inconsistencies;
}

/**
 * Detects cross-document contradictions between two documents (e.g. Primary Agreement vs Addendum, or in Comparison mode).
 */
export function detectCrossDocumentInconsistencies(
  docA: StructuredDocument,
  docB: StructuredDocument
): ClauseInconsistency[] {
  const inconsistencies: ClauseInconsistency[] = [];

  // Comparison 1: Notice Period Discrepancies
  const noticeA = docA.summary.terminationConditions?.noticePeriod;
  const noticeB = docB.summary.terminationConditions?.noticePeriod;

  const clauseNoticeA = docA.clauses.find(c => /notice|terminat/i.test(c.text));
  const clauseNoticeB = docB.clauses.find(c => /notice|terminat/i.test(c.text));

  if (clauseNoticeA && clauseNoticeB && noticeA && noticeB && noticeA !== noticeB) {
    inconsistencies.push({
      id: `cross-incon-${docA.id}-${docB.id}-notice`,
      title: `Notice Period Conflict: ${noticeA} (${docA.name}) vs. ${noticeB} (${docB.name})`,
      description: `${docA.name} stipulates a notice period of "${noticeA}" in Clause ${clauseNoticeA.clauseNumber}, whereas ${docB.name} specifies "${noticeB}" in Clause ${clauseNoticeB.clauseNumber}.`,
      severity: 'high',
      clauseA: {
        documentId: docA.id,
        documentName: docA.name,
        clauseId: clauseNoticeA.id,
        clauseNumber: clauseNoticeA.clauseNumber,
        title: clauseNoticeA.title,
        excerpt: clauseNoticeA.text.slice(0, 200) + '...',
        statedTerm: `${noticeA} in ${docA.name}`,
      },
      clauseB: {
        documentId: docB.id,
        documentName: docB.name,
        clauseId: clauseNoticeB.id,
        clauseNumber: clauseNoticeB.clauseNumber,
        title: clauseNoticeB.title,
        excerpt: clauseNoticeB.text.slice(0, 200) + '...',
        statedTerm: `${noticeB} in ${docB.name}`,
      },
      potentialImpact:
        'If a dispute or early exit arises, it is legally unclear which document’s notice window controls, creating exposure to forfeiture or breach claims.',
      options: [
        {
          id: 'opt-cross-not-1',
          actionType: 'negotiate',
          title: 'Option A: Execute Supremacy / Precedence Clause',
          description:
            'Propose a specific precedence clause stating explicitly which document overrides in the event of a conflict between terms.',
        },
        {
          id: 'opt-cross-not-2',
          actionType: 'clarify',
          title: 'Option B: Request Written Harmonization',
          description:
            'Ask the counterparty to formally confirm which notice timeline applies for standard vacating vs default events.',
        },
        {
          id: 'opt-cross-not-3',
          actionType: 'review',
          title: 'Option C: Counsel Review on Novation & Amendment Validity',
          description:
            'Seek advocate review under Section 62 of the Indian Contract Act 1872 regarding the doctrine of novation and amendment hierarchy.',
        },
      ],
    });
  }

  // Comparison 2: Lock-in Period Discrepancies
  const lockInA = docA.summary.keyDatesDurations?.lockInPeriod;
  const lockInB = docB.summary.keyDatesDurations?.lockInPeriod;
  if (lockInA && lockInB && lockInA !== lockInB) {
    const clA = docA.clauses.find(c => /lock-in|lock in/i.test(c.text)) || docA.clauses[0];
    const clB = docB.clauses.find(c => /lock-in|lock in/i.test(c.text)) || docB.clauses[0];

    inconsistencies.push({
      id: `cross-incon-${docA.id}-${docB.id}-lockin`,
      title: `Lock-in Commitment Discrepancy: ${lockInA} vs. ${lockInB}`,
      description: `${docA.name} enforces a lock-in of ${lockInA}, while ${docB.name} establishes ${lockInB}.`,
      severity: 'high',
      clauseA: {
        documentId: docA.id,
        documentName: docA.name,
        clauseId: clA.id,
        clauseNumber: clA.clauseNumber,
        title: clA.title,
        excerpt: clA.text.slice(0, 200) + '...',
        statedTerm: `${lockInA} in ${docA.name}`,
      },
      clauseB: {
        documentId: docB.id,
        documentName: docB.name,
        clauseId: clB.id,
        clauseNumber: clB.clauseNumber,
        title: clB.title,
        excerpt: clB.text.slice(0, 200) + '...',
        statedTerm: `${lockInB} in ${docB.name}`,
      },
      potentialImpact:
        'Disagreement over lock-in expiration leaves both parties exposed to premature forfeiture disputes.',
      options: [
        {
          id: 'opt-cross-lock-1',
          actionType: 'negotiate',
          title: 'Option A: Align to the Shorter Lock-in Period',
          description:
            'Request formal confirmation adopting the shorter, more balanced lock-in period across both agreements.',
        },
        {
          id: 'opt-cross-lock-2',
          actionType: 'clarify',
          title: 'Option B: Clarify Commencement Date of Lock-in',
          description:
            'Confirm whether the lock-in runs from original possession date or the date of the supplementary instrument.',
        },
        {
          id: 'opt-cross-lock-3',
          actionType: 'review',
          title: 'Option C: Advocate Review on Liquidated Damages',
          description:
            'Have counsel verify whether remaining-term rent demands violate Section 74 of the Indian Contract Act 1872.',
        },
      ],
    });
  }

  // Comparison 3: Escalation Discrepancy
  const escA = docA.summary.financialTerms?.escalation;
  const escB = docB.summary.financialTerms?.escalation;
  if (escA && escB && escA !== escB) {
    const clA = docA.clauses.find(c => /escalat|increase|renewal/i.test(c.text)) || docA.clauses[0];
    const clB = docB.clauses.find(c => /escalat|increase|renewal/i.test(c.text)) || docB.clauses[0];

    inconsistencies.push({
      id: `cross-incon-${docA.id}-${docB.id}-escalation`,
      title: `Rent Escalation Rate Contradiction: ${escA} vs. ${escB}`,
      description: `${docA.name} states an escalation of "${escA}", while ${docB.name} specifies "${escB}".`,
      severity: 'medium',
      clauseA: {
        documentId: docA.id,
        documentName: docA.name,
        clauseId: clA.id,
        clauseNumber: clA.clauseNumber,
        title: clA.title,
        excerpt: clA.text.slice(0, 200) + '...',
        statedTerm: `${escA} in ${docA.name}`,
      },
      clauseB: {
        documentId: docB.id,
        documentName: docB.name,
        clauseId: clB.id,
        clauseNumber: clB.clauseNumber,
        title: clB.title,
        excerpt: clB.text.slice(0, 200) + '...',
        statedTerm: `${escB} in ${docB.name}`,
      },
      potentialImpact:
        'Financial ambiguity regarding the exact monthly rent payable upon extension or anniversary of the lease.',
      options: [
        {
          id: 'opt-cross-esc-1',
          actionType: 'negotiate',
          title: 'Option A: Confirm Lower Escalation Percentage',
          description:
            'Propose confirming the lower escalation percentage in writing prior to lease renewal.',
        },
        {
          id: 'opt-cross-esc-2',
          actionType: 'clarify',
          title: 'Option B: Request Written Rent Schedule',
          description:
            'Request an explicit month-by-month financial schedule signed by both parties.',
        },
        {
          id: 'opt-cross-esc-3',
          actionType: 'review',
          title: 'Option C: Counsel Review for State Rent Control Norms',
          description:
            'Check standard urban rent escalation benchmarks under applicable state tenancy guidelines.',
        },
      ],
    });
  }

  return inconsistencies;
}
