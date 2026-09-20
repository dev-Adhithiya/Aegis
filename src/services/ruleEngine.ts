import { Clause, DocumentSummary, RiskFlag } from '../types/legal';
import { generateRiskOptions } from './inconsistencyEngine';

export interface RuleDefinition {
  id: string;
  name: string;
  docType: 'lease' | 'nda';
  statutoryProvision: string | null;
  severity: 'high' | 'medium' | 'low';
  category: 'Statutory Compliance' | 'General Practice Concern';
  evaluate: (clauses: Clause[], summary?: DocumentSummary) => RiskFlag | null;
}

export const INDIAN_LEGAL_RULES: RuleDefinition[] = [
  // ==========================================
  // LEASE / RENTAL AGREEMENT RULES (INDIA)
  // ==========================================
  {
    id: 'lease-auto-renewal',
    name: 'Automatic Renewal Without Explicit Written Notice',
    docType: 'lease',
    statutoryProvision: 'Transfer of Property Act 1882, Sections 106 & 111',
    severity: 'high',
    category: 'Statutory Compliance',
    evaluate: (clauses) => {
      const match = clauses.find(c => {
        const text = c.text.toLowerCase();
        return (
          (text.includes('auto') || text.includes('automatic') || text.includes('deemed to be renewed')) &&
          (text.includes('renew') || text.includes('extension')) &&
          !text.includes('mutual written consent') &&
          !text.includes('express written agreement')
        );
      });

      if (!match) return null;

      return {
        id: 'flag-lease-auto-renew',
        ruleId: 'lease-auto-renewal',
        ruleName: 'Automatic Renewal Without Explicit Written Notice',
        severity: 'high',
        category: 'Statutory Compliance',
        matchedClauseId: match.id,
        matchedClauseNumber: match.clauseNumber,
        matchedClauseExcerpt: match.text.slice(0, 280) + (match.text.length > 280 ? '...' : ''),
        plainEnglishExplanation:
          'This clause automatically locks you into a subsequent lease term without requiring an affirmative, written renewal from both parties. Under Indian law (Transfer of Property Act 1882, Sec 106/111), a tenancy should determine upon term expiry unless holding over or explicit mutual extension is agreed.',
        statutoryProvision: 'Transfer of Property Act 1882, Sections 106 & 111',
        recommendationForLawyer:
          'Ask your lawyer to redline this clause so renewal strictly requires at least 45–60 days advance written notice and mutual written agreement.'
      };
    }
  },
  {
    id: 'lease-uncapped-liability',
    name: 'Uncapped Tenant Indemnity & Consequential Liability',
    docType: 'lease',
    statutoryProvision: 'Indian Contract Act 1872, Sections 73 & 74',
    severity: 'high',
    category: 'Statutory Compliance',
    evaluate: (clauses) => {
      const match = clauses.find(c => {
        const text = c.text.toLowerCase();
        return (
          (text.includes('indemnify') || text.includes('hold harmless')) &&
          (text.includes('all losses') || text.includes('consequential') || text.includes('indirect') || text.includes('any and all damages')) &&
          !text.includes('capped at') &&
          !text.includes('limited to')
        );
      });

      if (!match) return null;

      return {
        id: 'flag-lease-uncapped-liability',
        ruleId: 'lease-uncapped-liability',
        ruleName: 'Uncapped Tenant Indemnity & Consequential Liability',
        severity: 'high',
        category: 'Statutory Compliance',
        matchedClauseId: match.id,
        matchedClauseNumber: match.clauseNumber,
        matchedClauseExcerpt: match.text.slice(0, 280) + (match.text.length > 280 ? '...' : ''),
        plainEnglishExplanation:
          'You are asked to indemnify the landlord against broad, uncapped claims including third-party and indirect losses. Section 73 of the Indian Contract Act 1872 limits compensation strictly to losses that naturally arose in the usual course of things, and prohibits remote/indirect damages.',
        statutoryProvision: 'Indian Contract Act 1872, Sections 73 & 74',
        recommendationForLawyer:
          'Instruct counsel to cap total tenant liability (typically not exceeding 2–3 months of rent or the security deposit) and explicitly exclude indirect, special, or consequential damages.'
      };
    }
  },
  {
    id: 'lease-one-sided-termination',
    name: 'Asymmetric Termination & Deposit Forfeiture Rights',
    docType: 'lease',
    statutoryProvision: 'Indian Contract Act 1872, Section 74',
    severity: 'high',
    category: 'Statutory Compliance',
    evaluate: (clauses) => {
      const match = clauses.find(c => {
        const text = c.text.toLowerCase();
        return (
          (text.includes('terminat') || text.includes('lock-in')) &&
          (text.includes('forfeit') || text.includes('without cause') || text.includes('immediate termination')) &&
          (text.includes('landlord may') || text.includes('lessor may'))
        );
      });

      if (!match) return null;

      return {
        id: 'flag-lease-one-sided-termination',
        ruleId: 'lease-one-sided-termination',
        ruleName: 'Asymmetric Termination & Deposit Forfeiture Rights',
        severity: 'high',
        category: 'Statutory Compliance',
        matchedClauseId: match.id,
        matchedClauseNumber: match.clauseNumber,
        matchedClauseExcerpt: match.text.slice(0, 280) + (match.text.length > 280 ? '...' : ''),
        plainEnglishExplanation:
          'The agreement grants the landlord immediate or short-notice termination rights with full forfeiture of your security deposit, while subjecting the tenant to stringent lock-in penalties. Under Section 74 of the Indian Contract Act 1872, liquidated damages or forfeiture cannot act as an unreasonable penalty.',
        statutoryProvision: 'Indian Contract Act 1872, Section 74',
        recommendationForLawyer:
          'Request reciprocal termination rights with identical notice periods (typically 30–60 days) and stipulate that deposit deductions must reflect actual documented damages.'
      };
    }
  },
  {
    id: 'lease-excessive-security-deposit',
    name: 'Disproportionate Security Deposit & Unilateral Deduction',
    docType: 'lease',
    statutoryProvision: null, // General practice concern
    severity: 'medium',
    category: 'General Practice Concern',
    evaluate: (clauses) => {
      const match = clauses.find(c => {
        const text = c.text.toLowerCase();
        return (
          (text.includes('security deposit') || text.includes('interest-free deposit')) &&
          (text.includes('sole discretion') || text.includes('non-refundable') || text.includes('deduct') || text.includes('6 months') || text.includes('10 months'))
        );
      });

      if (!match) return null;

      return {
        id: 'flag-lease-deposit',
        ruleId: 'lease-excessive-security-deposit',
        ruleName: 'Disproportionate Security Deposit & Unilateral Deduction',
        severity: 'medium',
        category: 'General Practice Concern',
        matchedClauseId: match.id,
        matchedClauseNumber: match.clauseNumber,
        matchedClauseExcerpt: match.text.slice(0, 280) + (match.text.length > 280 ? '...' : ''),
        plainEnglishExplanation:
          'The landlord retains sole discretion to determine deductions from the security deposit upon vacating without requiring joint inspection or contractor receipts. In modern Indian urban leasing standards (and Model Tenancy framework), residential deposits are commonly 2 months rent and must be refunded within 30 days of handover.',
        statutoryProvision: null,
        recommendationForLawyer:
          'Ensure the clause mandates a joint move-out inspection, written notice with itemized repair bills, and a 14 to 30 day timeline for full refund.'
      };
    }
  },
  {
    id: 'lease-unclear-notice-period',
    name: 'Unclear or Sub-Statutory Eviction Notice Period',
    docType: 'lease',
    statutoryProvision: 'Transfer of Property Act 1882, Section 106',
    severity: 'medium',
    category: 'Statutory Compliance',
    evaluate: (clauses) => {
      const match = clauses.find(c => {
        const text = c.text.toLowerCase();
        return (
          (text.includes('notice') && (text.includes('vacate') || text.includes('quit') || text.includes('handover'))) &&
          (text.includes('7 days') || text.includes('3 days') || text.includes('forthwith') || text.includes('at will'))
        );
      });

      if (!match) return null;

      return {
        id: 'flag-lease-notice',
        ruleId: 'lease-unclear-notice-period',
        ruleName: 'Unclear or Sub-Statutory Eviction Notice Period',
        severity: 'medium',
        category: 'Statutory Compliance',
        matchedClauseId: match.id,
        matchedClauseNumber: match.clauseNumber,
        matchedClauseExcerpt: match.text.slice(0, 280) + (match.text.length > 280 ? '...' : ''),
        plainEnglishExplanation:
          'The agreement stipulates an eviction or vacation notice period of less than 15 days or allows eviction without reasonable cure periods. Section 106 of the Transfer of Property Act 1882 provides for at least 15 days notice expiring with the month of tenancy for month-to-month leases.',
        statutoryProvision: 'Transfer of Property Act 1882, Section 106',
        recommendationForLawyer:
          'Harmonize the notice period to a minimum of 30 days for both parties with at least 15 days cure period for remediable defaults.'
      };
    }
  },
  {
    id: 'lease-unrestricted-landlord-entry',
    name: 'Unrestricted Landlord Entry & Breach of Quiet Enjoyment',
    docType: 'lease',
    statutoryProvision: 'Transfer of Property Act 1882, Section 108(c)',
    severity: 'medium',
    category: 'Statutory Compliance',
    evaluate: (clauses) => {
      const match = clauses.find(c => {
        const text = c.text.toLowerCase();
        return (
          (text.includes('inspect') || text.includes('entry') || text.includes('enter the premises')) &&
          (text.includes('at any time') || text.includes('without notice') || !text.includes('prior notice'))
        );
      });

      if (!match) return null;

      return {
        id: 'flag-lease-entry',
        ruleId: 'lease-unrestricted-landlord-entry',
        ruleName: 'Unrestricted Landlord Entry & Breach of Quiet Enjoyment',
        severity: 'medium',
        category: 'Statutory Compliance',
        matchedClauseId: match.id,
        matchedClauseNumber: match.clauseNumber,
        matchedClauseExcerpt: match.text.slice(0, 280) + (match.text.length > 280 ? '...' : ''),
        plainEnglishExplanation:
          'The landlord reserves right to enter the leased property at any time without prior written notification. Under Section 108(c) of the Transfer of Property Act 1882, the lessor covenants that the lessee shall hold the property without interruption (quiet enjoyment).',
        statutoryProvision: 'Transfer of Property Act 1882, Section 108(c)',
        recommendationForLawyer:
          'Add a stipulation requiring at least 24–48 hours advance written notice (except bona fide emergency) and entry only during reasonable daytime hours.'
      };
    }
  },

  // ==========================================
  // NDA / CONFIDENTIALITY AGREEMENT RULES (INDIA)
  // ==========================================
  {
    id: 'nda-overbroad-definition',
    name: 'Overbroad Definition of Confidential Information',
    docType: 'nda',
    statutoryProvision: null, // General practice concern
    severity: 'medium',
    category: 'General Practice Concern',
    evaluate: (clauses) => {
      const match = clauses.find(c => {
        const text = c.text.toLowerCase();
        return (
          text.includes('confidential information') &&
          (text.includes('all information') || text.includes('tangible or intangible') || text.includes('whether or not marked')) &&
          (text.includes('oral') && !text.includes('reduced to writing within'))
        );
      });

      if (!match) return null;

      return {
        id: 'flag-nda-overbroad',
        ruleId: 'nda-overbroad-definition',
        ruleName: 'Overbroad Definition of Confidential Information',
        severity: 'medium',
        category: 'General Practice Concern',
        matchedClauseId: match.id,
        matchedClauseNumber: match.clauseNumber,
        matchedClauseExcerpt: match.text.slice(0, 280) + (match.text.length > 280 ? '...' : ''),
        plainEnglishExplanation:
          'The definition treats any verbal remark or general information as confidential without requiring oral disclosures to be marked or confirmed in writing within 15–30 days. This creates ambiguity over what is proprietary.',
        statutoryProvision: null,
        recommendationForLawyer:
          'Ask counsel to insert a clause requiring oral disclosures to be confirmed as confidential in writing within 15 days of disclosure.'
      };
    }
  },
  {
    id: 'nda-perpetual-duration',
    name: 'Perpetual or Unreasonable Confidentiality Duration',
    docType: 'nda',
    statutoryProvision: 'Indian Contract Act 1872, Section 27',
    severity: 'high',
    category: 'Statutory Compliance',
    evaluate: (clauses) => {
      const match = clauses.find(c => {
        const text = c.text.toLowerCase();
        return (
          (text.includes('term') || text.includes('duration') || text.includes('survival')) &&
          (text.includes('in perpetuity') || text.includes('perpetual') || text.includes('indefinitely') || text.includes('shall survive forever')) &&
          !text.includes('trade secrets')
        );
      });

      if (!match) return null;

      return {
        id: 'flag-nda-duration',
        ruleId: 'nda-perpetual-duration',
        ruleName: 'Perpetual or Unreasonable Confidentiality Duration',
        severity: 'high',
        category: 'Statutory Compliance',
        matchedClauseId: match.id,
        matchedClauseNumber: match.clauseNumber,
        matchedClauseExcerpt: match.text.slice(0, 280) + (match.text.length > 280 ? '...' : ''),
        plainEnglishExplanation:
          'Standard commercial information is restricted in perpetuity rather than for a defined term (typically 2 to 3 years in India). Indefinite covenants that impede ordinary profession or business may draw scrutiny under Section 27 of the Indian Contract Act 1872.',
        statutoryProvision: 'Indian Contract Act 1872, Section 27',
        recommendationForLawyer:
          'Limit the confidentiality survival term to 2–3 years post-termination, reserving indefinite survival strictly for bona fide technical trade secrets.'
      };
    }
  },
  {
    id: 'nda-missing-regulatory-carveouts',
    name: 'Missing or Restricted Regulatory & Court Order Carve-Outs',
    docType: 'nda',
    statutoryProvision: 'Indian Contract Act 1872, Section 28',
    severity: 'high',
    category: 'Statutory Compliance',
    evaluate: (clauses) => {
      const match = clauses.find(c => {
        const text = c.text.toLowerCase();
        return (
          (text.includes('exclusion') || text.includes('carve-out') || text.includes('compelled disclosure') || text.includes('permitted disclosure')) &&
          (!text.includes('court order') && !text.includes('statutory') && !text.includes('regulatory'))
        );
      });

      // If no exclusions clause mentions court orders
      const hasLegalCarveout = clauses.some(c => {
        const text = c.text.toLowerCase();
        return (
          (text.includes('court') || text.includes('law') || text.includes('regulatory') || text.includes('subpoena')) &&
          (text.includes('compel') || text.includes('order') || text.includes('required by'))
        );
      });

      if (hasLegalCarveout) return null;

      const target = match || clauses[0];
      return {
        id: 'flag-nda-carveout',
        ruleId: 'nda-missing-regulatory-carveouts',
        ruleName: 'Missing or Restricted Regulatory & Court Order Carve-Outs',
        severity: 'high',
        category: 'Statutory Compliance',
        matchedClauseId: target ? target.id : 'clause-general',
        matchedClauseNumber: target ? target.clauseNumber : 'General',
        matchedClauseExcerpt: target ? target.text.slice(0, 280) : 'Standard exclusions clause',
        plainEnglishExplanation:
          'The agreement fails to provide an explicit exception allowing disclosure when legally mandated by an Indian court of law, police inquiry, or statutory authority (such as SEBI, RBI, or GST). Section 28 of the Indian Contract Act 1872 renders agreements restraining legal proceedings void.',
        statutoryProvision: 'Indian Contract Act 1872, Section 28',
        recommendationForLawyer:
          'Ensure there is a standard compelled disclosure provision enabling disclosure pursuant to valid legal process, with prompt written notice to the disclosing party.'
      };
    }
  },
  {
    id: 'nda-disguised-non-compete',
    name: 'Disguised Non-Compete or Post-Termination Non-Solicit',
    docType: 'nda',
    statutoryProvision: 'Indian Contract Act 1872, Section 27',
    severity: 'high',
    category: 'Statutory Compliance',
    evaluate: (clauses) => {
      const match = clauses.find(c => {
        const text = c.text.toLowerCase();
        return (
          (text.includes('non-compete') || text.includes('not compete') || text.includes('non-solicit') || text.includes('solicit employees')) &&
          (text.includes('during the term and for a period') || text.includes('directly or indirectly engage'))
        );
      });

      if (!match) return null;

      return {
        id: 'flag-nda-noncompete',
        ruleId: 'nda-disguised-non-compete',
        ruleName: 'Disguised Non-Compete or Post-Termination Non-Solicit',
        severity: 'high',
        category: 'Statutory Compliance',
        matchedClauseId: match.id,
        matchedClauseNumber: match.clauseNumber,
        matchedClauseExcerpt: match.text.slice(0, 280) + (match.text.length > 280 ? '...' : ''),
        plainEnglishExplanation:
          'This NDA contains restrictive covenants barring you from competing or hiring talent post-agreement. Under Section 27 of the Indian Contract Act 1872, all agreements in restraint of trade, business, or lawful profession are void ab initio (Percept D\'Mark v. Zaheer Khan, Supreme Court of India).',
        statutoryProvision: 'Indian Contract Act 1872, Section 27',
        recommendationForLawyer:
          'Ask your lawyer to strike post-termination non-compete clauses completely, as they are legally unenforceable in India and inappropriate inside an NDA.'
      };
    }
  },
  {
    id: 'nda-one-sided-remedies',
    name: 'Unilateral Liquidated Damages & Automatic Injunction Consent',
    docType: 'nda',
    statutoryProvision: 'Indian Contract Act 1872, Section 74',
    severity: 'medium',
    category: 'Statutory Compliance',
    evaluate: (clauses) => {
      const match = clauses.find(c => {
        const text = c.text.toLowerCase();
        return (
          (text.includes('injunction') || text.includes('equitable relief')) &&
          (text.includes('without proof of actual damages') || text.includes('without posting bond') || text.includes('liquidated damages'))
        );
      });

      if (!match) return null;

      return {
        id: 'flag-nda-remedies',
        ruleId: 'nda-one-sided-remedies',
        ruleName: 'Unilateral Liquidated Damages & Automatic Injunction Consent',
        severity: 'medium',
        category: 'Statutory Compliance',
        matchedClauseId: match.id,
        matchedClauseNumber: match.clauseNumber,
        matchedClauseExcerpt: match.text.slice(0, 280) + (match.text.length > 280 ? '...' : ''),
        plainEnglishExplanation:
          'You are asked to stipulate that any breach automatically causes irreparable injury and entitles the other party to an immediate injunction without having to prove actual damages. Under Section 74 of the Indian Contract Act 1872, Indian courts do not grant damages or automatic injunctions without judicial evaluation of genuine loss.',
        statutoryProvision: 'Indian Contract Act 1872, Section 74',
        recommendationForLawyer:
          'Amend to state that the aggrieved party "may seek" injunctive relief, preserving your right to contest the necessity and scope of such orders before an Indian court.'
      };
    }
  }
];

export function applyIndianLegalRules(
  docType: 'lease' | 'nda' | 'other',
  clauses: Clause[],
  summary?: DocumentSummary
): RiskFlag[] {
  const applicableRules = INDIAN_LEGAL_RULES.filter(
    r => r.docType === docType || (docType === 'other' && r.docType === 'lease')
  );

  const flags: RiskFlag[] = [];
  for (const rule of applicableRules) {
    const flag = rule.evaluate(clauses, summary);
    if (flag) {
      flags.push({
        ...flag,
        yourOptions: generateRiskOptions(flag.ruleName, flag.matchedClauseNumber, docType),
      });
    }
  }

  return flags;
}
