export interface SampleContractData {
  id: string;
  name: string;
  docType: 'lease' | 'nda';
  jurisdiction: string;
  description: string;
  rawText: string;
}

export const SAMPLE_INDIAN_LEASE: SampleContractData = {
  id: 'sample-lease-1',
  name: 'Residential_Rental_Agreement_Bengaluru_Flat_402.pdf',
  docType: 'lease',
  jurisdiction: 'India (Transfer of Property Act 1882)',
  description: 'Standard Bangalore apartment lease with aggressive landlord clauses & risk flags',
  rawText: `RESIDENTIAL LEASE AGREEMENT

This LEASE AGREEMENT is executed on this 1st day of April 2026 at Bengaluru, Karnataka, India.

BETWEEN:
Mr. Rajesh Kumar Verma, aged about 54 years, residing at No. 14, 5th Cross, Indiranagar, Bengaluru, Karnataka - 560038 (hereinafter referred to as the "LESSOR" / "LANDLORD", which expression shall include his heirs, successors and assigns) of the ONE PART;

AND:
Ms. Ananya Deshmukh, aged about 29 years, currently employed with TechCorp India Pvt Ltd, residing at Flat 402, Green Glen Layout, Bellandur, Bengaluru - 560103 (hereinafter referred to as the "LESSEE" / "TENANT", which expression shall include her legal representatives) of the OTHER PART.

WHEREAS the Lessor is the absolute owner of Apartment No. 402, 4th Floor, Palm Meadows Heights, Outer Ring Road, Bellandur, Bengaluru - 560103 comprising 2 Bedrooms, Hall, Kitchen, with one covered car parking (hereinafter referred to as the "DEMISED PREMISES").

NOW THIS AGREEMENT WITNESSETH AS FOLLOWS:

1. TERM OF LEASE AND LOCK-IN PERIOD
The lease shall be for a fixed term of 11 (eleven) months commencing from 1st April 2026 to 28th February 2027. Both parties agree to a strict Lock-in Period of 11 months. If the Lessee vacates the premises prior to the expiry of the lock-in period, the Lessee shall forfeit the entire Security Deposit and remain liable for rent for the remainder of the 11-month term.

2. MONTHLY RENT AND CHARGES
The Lessee shall pay a monthly rent of Rs. 42,000/- (Rupees Forty-Two Thousand only) payable in advance on or before the 5th day of every calendar month through NEFT/RTGS. In addition, the Lessee shall pay monthly apartment association maintenance charges of Rs. 4,500/- directly to the Resident Welfare Association.

3. SECURITY DEPOSIT AND DEDUCTIONS
The Lessee has deposited an interest-free refundable Security Deposit of Rs. 3,50,000/- (Rupees Three Lakhs Fifty Thousand only) with the Lessor. The Lessor shall retain sole and absolute discretion to deduct amounts for repainting, deep cleaning, minor wear and tear, and any perceived damages from this deposit upon vacating the premises. No itemized contractors bill shall be required.

4. AUTOMATIC RENEWAL
Upon the expiry of the initial 11-month term, this Agreement shall be deemed to be automatically renewed for a successive period of 11 months with an automatic 12% escalation in monthly rent, unless the Lessor alone provides prior written notice of termination. The Lessee shall not have the right to unilaterally prevent automatic renewal without Lessor approval.

5. INSPECTION AND RIGHT OF ENTRY
The Lessor or his authorized agents shall have the right to enter and inspect the demised premises at any time without notice to inspect the state of repair, verify occupancy, or show the premises to prospective buyers or future tenants.

6. UNCAPPED TENANT INDEMNITY AND CONSEQUENTIAL LIABILITY
The Lessee agrees to fully indemnify, defend and hold harmless the Lessor from and against any and all claims, demands, losses, costs, expenses, liabilities, and consequential or indirect damages arising out of or in connection with the Lessee's use or occupation of the premises, irrespective of contributory negligence or standard wear and tear.

7. TERMINATION AND NOTICE
The Lessor may terminate this Agreement at any time by giving 7 days written notice to the Lessee without assigning any cause. In contrast, the Lessee cannot terminate this agreement prior to the completion of the 11-month lock-in term, and any attempt to vacate will result in immediate forfeiture of the entire security deposit.

8. UTILITY EXPENSES
The Lessee shall bear and promptly discharge all electricity charges as per BESCOM meter readings, piped gas bills, and internet connection expenses consumed within the demised premises.

9. RESTRICTIONS ON USE AND SUBLETTING
The Demised Premises shall be utilized solely for private residential living. The Lessee shall not sublet, assign, mortgage, or part with possession of the premises or any part thereof to any third party without obtaining the prior written consent of the Lessor.

10. GOVERNING LAW AND DISPUTE RESOLUTION
This Agreement shall be governed and construed in accordance with the laws of India, particularly the Transfer of Property Act, 1882, and the competent courts at Bengaluru shall have exclusive jurisdiction over any disputes arising hereunder.`
};

export const SAMPLE_INDIAN_NDA: SampleContractData = {
  id: 'sample-nda-1',
  name: 'Mutual_Confidentiality_and_NDA_Mumbai_2026.pdf',
  docType: 'nda',
  jurisdiction: 'India (Indian Contract Act 1872)',
  description: 'Commercial mutual NDA containing overbroad terms and disguised non-compete covenants',
  rawText: `MUTUAL NON-DISCLOSURE AGREEMENT

This NON-DISCLOSURE AGREEMENT ("Agreement") is made and entered into on this 15th day of February 2026 at Mumbai, Maharashtra, India.

BY AND BETWEEN:
Aegis FinTech Solutions Pvt Ltd, a company incorporated under the Companies Act 2013, having its registered office at Bandra Kurla Complex, Bandra East, Mumbai - 400051 (hereinafter referred to as "Disclosing Party");

AND:
Nova Analytics Technologies LLP, a limited liability partnership registered under the LLP Act 2008, having its principal office at Powai, Mumbai - 400076 (hereinafter referred to as "Receiving Party").

WHEREAS the parties wish to explore potential business collaboration and software integration opportunities (the "Authorized Purpose").

NOW THEREFORE IT IS MUTUALLY AGREED AS FOLLOWS:

1. DEFINITION OF CONFIDENTIAL INFORMATION
"Confidential Information" shall encompass all information, whether tangible or intangible, visual, technical, or financial, disclosed by either party, whether or not marked as confidential. It includes oral statements, brainstorming conversations, general industry know-how, and business thoughts exchanged, without any requirement that oral disclosures be reduced to writing within any timeframe.

2. OBLIGATIONS OF CONFIDENTIALITY
The Receiving Party shall maintain all Confidential Information in strictest confidence and shall not disclose, copy, publish, or disseminate it to any third party without prior written authorization. Access shall be restricted strictly to directors and employees with a need to know.

3. EXCLUSIONS AND CARVE-OUTS
The obligations herein shall not apply to information that:
(a) is already in the public domain prior to disclosure;
(b) was already lawfully known to the Recipient prior to receipt;
(c) is developed independently without reference to Confidential Information.
(Note: No explicit exception is provided for disclosures mandated by Indian court orders, police warrant, or statutory regulatory directives).

4. PERPETUAL SURVIVAL AND DURATION
The obligations of confidentiality and non-use under this Agreement shall survive indefinitely and continue in perpetuity from the date of disclosure, binding the receiving party forever regardless of whether discussions terminate or commercial relations commence.

5. RESTRICTIVE COVENANTS AND DISGUISED NON-COMPETE
The Receiving Party covenants and agrees that during the term of this Agreement and for a period of 24 (twenty-four) months following the termination of discussions, the Receiving Party shall not directly or indirectly engage in any business competing with the Disclosing Party, nor solicit, induce, or hire any officer, employee, or independent consultant of the Disclosing Party.

6. RETURN OR DESTRUCTION OF MATERIALS
Upon written request or termination of talks, the Receiving Party shall within 5 business days destroy or return all documents, notes, diagrams, and digital copies containing Confidential Information, and provide an officer certification confirming compliance.

7. LIQUIDATED DAMAGES AND AUTOMATIC INJUNCTIVE RELIEF
The Receiving Party acknowledges that any breach of this Agreement causes irreparable injury and hereby consents to the entry of an immediate ex-parte injunction without posting bond or proof of actual damages, and agrees to pay predetermined liquidated damages of Rs. 50,00,000/- (Rupees Fifty Lakhs) as an agreed pre-estimate of loss.

8. GOVERNING LAW AND JURISDICTION
This Agreement shall be governed by and interpreted in accordance with the substantive laws of the Republic of India, specifically the Indian Contract Act, 1872. The Courts at Mumbai shall possess exclusive jurisdiction.`
};

export const SAMPLE_CLEAN_LEASE: SampleContractData = {
  id: 'sample-clean-lease',
  name: 'Balanced_Tenant_Friendly_Lease_Agreement_Model.docx',
  docType: 'lease',
  jurisdiction: 'India (Transfer of Property Act 1882)',
  description: 'Balanced benchmark lease complying with Transfer of Property Act & Model Tenancy framework',
  rawText: `MODEL RESIDENTIAL TENANCY AGREEMENT (BALANCED)

This TENANCY AGREEMENT is made at Bengaluru, Karnataka on 1st May 2026.

BETWEEN:
Mr. S. Venkatraman ("Lessor / Landlord") AND Ms. Deepa Sharma ("Lessee / Tenant").

1. TERM AND TENURE
The tenancy is for a duration of 11 months. Both parties agree to a reasonable 3-month lock-in period, following which either party may terminate this agreement by serving thirty (30) days prior written notice.

2. RENT AND PAYMENT
The monthly rent is Rs. 38,000/- payable on or before the 10th of each calendar month. Any renewal shall be subject to mutual written consent with rent escalation capped at 5%.

3. SECURITY DEPOSIT
The Lessee has deposited a refundable security deposit of Rs. 76,000/- (equivalent to two months rent). The deposit shall be refunded in full within 15 days of vacant possession handover, subject only to deductions for unpaid utilities or mutually inspected physical damage beyond normal wear and tear.

4. INSPECTION AND ENTRY
The Lessor may inspect the premises only after providing at least 24 hours advance written notice, and such inspection shall take place during reasonable daylight hours, preserving the Tenant's quiet and peaceful enjoyment under Section 108(c) of the Transfer of Property Act 1882.

5. RECIPROCAL TERMINATION AND NOTICE
Either party may terminate the tenancy after the 3-month lock-in period by providing 30 days written notice. In the event of default, a 15-day cure notice must be served before any termination or recovery actions commence.

6. CAPPED LIABILITY
Tenant liability is strictly capped to the value of direct documented repair costs, and in no event shall exceed two months of rent. All consequential or remote damages are explicitly excluded in accordance with Section 73 of the Indian Contract Act 1872.`
};

export const SAMPLE_LEASE_ADDENDUM: SampleContractData = {
  id: 'sample-lease-addendum-1',
  name: 'Flat_402_Lease_Addendum_and_Society_Bylaws.pdf',
  docType: 'lease',
  jurisdiction: 'India (Transfer of Property Act 1882)',
  description: 'Supplementary addendum and society regulations for Flat 402 containing conflicting notice and escalation terms',
  rawText: `SUPPLEMENTARY LEASE ADDENDUM AND RESIDENT BYLAWS
Demised Premises: Apartment No. 402, 4th Floor, Palm Meadows Heights, Bellandur, Bengaluru - 560103.

This Addendum is entered on 5th April 2026 supplementary to the Residential Lease Agreement dated 1st April 2026.

1. MANDATORY NOTICE FOR VACATING
Notwithstanding anything contrary in the primary agreement, the Lessee shall serve a mandatory sixty (60) days advance written notice prior to vacating the demised premises. Failure to provide sixty days notice shall result in forfeiture of two months rent.

2. ANNUAL RENT ESCALATION
In the event tenancy continues beyond the initial 11-month term, the revised monthly rent shall escalate by eight percent (8%) annually, subject to mutual agreement on utility metering.

3. SECURITY DEPOSIT REFUND TIMELINE
The Lessor shall process the refund of the interest-free refundable security deposit within sixty (60) days from the date of physical key handover and inspection by building maintenance.

4. QUIET HOURS AND PET POLICY
The Demised Premises shall adhere to Palm Meadows Heights RWA bylaws regarding quiet hours between 10:00 PM and 7:00 AM. Pet owners shall ensure pets are leashed in common lobby corridors.`
};

export const ALL_SAMPLE_CONTRACTS = [
  SAMPLE_INDIAN_LEASE,
  SAMPLE_INDIAN_NDA,
  SAMPLE_CLEAN_LEASE,
  SAMPLE_LEASE_ADDENDUM,
];
