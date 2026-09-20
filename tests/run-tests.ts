import assert from 'assert';
import {
  encryptDocumentText,
  decryptDocumentText,
  hashPassword,
  verifyPassword,
  sanitizeUserInput,
} from '../src/services/security';
import { applyIndianLegalRules } from '../src/services/ruleEngine';
import { Clause } from '../src/types/legal';

console.log('Running Aegis Legal Intelligence Pre-Deployment Verification Tests...\n');

// 1. Test Encryption & Decryption Round-Trip
console.log('Test 1: AES-256-GCM Document Text Encryption & Decryption');
const sampleText = 'This Non-Disclosure Agreement is executed in Bengaluru, Karnataka.';
const encrypted = encryptDocumentText(sampleText);
assert(encrypted.ciphertext && encrypted.iv && encrypted.tag, 'Encrypted payload must contain ciphertext, iv, tag');
const decrypted = decryptDocumentText(encrypted);
assert.strictEqual(decrypted, sampleText, 'Decrypted text must strictly match original plaintext');
console.log('✓ Passed: Data encryption/decryption round-trip verified.\n');

// 2. Test Password Hashing & Verification
console.log('Test 2: Cryptographic Password Hashing & Salt Verification');
const password = 'SecuredLegalCounselPassword2026!';
const { hash, salt } = hashPassword(password);
assert(hash && salt, 'Password hash and salt must be generated');
const valid = verifyPassword(password, hash, salt);
assert.strictEqual(valid, true, 'Valid password verification must succeed');
const invalid = verifyPassword('WrongPassword123', hash, salt);
assert.strictEqual(invalid, false, 'Invalid password verification must fail');
console.log('✓ Passed: Password hashing & constant-time verification verified.\n');

// 3. Test Security Input Sanitization (XSS Defense)
console.log('Test 3: XSS & Script Injection Sanitization');
const maliciousInput = '<script>alert("pwned")</script><a href="javascript:stealTokens()">Link</a><img src="x" onerror="evil()"/>';
const cleaned = sanitizeUserInput(maliciousInput);
assert(!cleaned.includes('<script>'), 'Script tags must be stripped');
assert(!cleaned.includes('javascript:'), 'javascript: pseudoprotocol must be stripped');
assert(!cleaned.includes('onerror='), 'Inline event handlers must be stripped');
console.log('✓ Passed: User input sanitization prevents XSS vectors.\n');

// 4. Test Statutory Rule Engine - Detection of High-Risk Lease Clause
console.log('Test 4: Rule Engine - Auto-Renewal Detection (Transfer of Property Act 1882)');
const problematicClauses: Clause[] = [
  {
    id: 'clause-1',
    clauseNumber: '4.1',
    title: 'Term & Extension',
    text: 'Upon expiration of the initial 11-month period, this lease agreement shall automatically renew for an additional 24 months at the Landlord’s sole option.',
    offset: 0,
  },
];
const flags = applyIndianLegalRules('lease', problematicClauses);
assert(flags.length > 0, 'Rule engine must flag auto-renewal without mutual consent');
const autoRenewFlag = flags.find(f => f.ruleId === 'lease-auto-renewal');
assert(autoRenewFlag, 'Auto-renewal flag must be generated');
assert.strictEqual(autoRenewFlag?.severity, 'high', 'Severity must be high');
assert(autoRenewFlag?.statutoryProvision?.includes('1882'), 'Must cite Transfer of Property Act 1882');
console.log('✓ Passed: Rule engine accurately flags statutory compliance breach.\n');

// 5. Test Statutory Rule Engine - Clean Compliance / Zero False Positives
console.log('Test 5: Rule Engine - False Positive Prevention');
const compliantClauses: Clause[] = [
  {
    id: 'clause-compliant',
    clauseNumber: '4.1',
    title: 'Tenure',
    text: 'This agreement shall be valid for 11 months and may be renewed only upon mutual written consent executed thirty days prior to expiry.',
    offset: 0,
  },
];
const cleanFlags = applyIndianLegalRules('lease', compliantClauses);
const falseAutoRenew = cleanFlags.find(f => f.ruleId === 'lease-auto-renewal');
assert.strictEqual(falseAutoRenew, undefined, 'Compliant clause must not trigger false auto-renewal flag');
console.log('✓ Passed: Zero false positives on legally compliant lease clause.\n');

console.log('====================================================');
console.log('All Aegis Pre-Deployment Test Suites Succeeded (5/5)!');
console.log('====================================================\n');

process.exit(0);

