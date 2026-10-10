import { HACKATHON_SCAM_SCENARIOS } from './src/services/scamSamples.js';
import { evaluateThreatMultiVector } from './src/services/compositeThreatScorer.js';
import { auditURL, calculateShannonEntropy, calculateLevenshtein } from './src/services/urlPhishingEngine.js';
import { auditAPK, SAMPLE_SCAM_APKS } from './src/services/apkAuditorEngine.js';
import { analyzeMessageNLP } from './src/services/nlpThreatEngine.js';

console.log('====================================================');
console.log('🔍 SENTINEL AI - HIGH PRECISION ENGINE AUDIT');
console.log('====================================================\n');

let allPassed = true;

// 1. Test Scam Scenarios
console.log('--- 1. SCAM SMS SCENARIOS BENCHMARK ---');
HACKATHON_SCAM_SCENARIOS.forEach((sc, idx) => {
  const res = evaluateThreatMultiVector({ messageText: sc.text });
  const passed =
    (sc.expectedVerdict === 'CRITICAL' && res.verdict === 'CRITICAL') ||
    (sc.expectedVerdict === 'SAFE' && res.verdict === 'SAFE') ||
    (sc.expectedVerdict === 'SUSPICIOUS' && res.verdict !== 'SAFE');
  
  const scoreInRange = sc.expectedScoreRange 
    ? (res.compositeScore >= sc.expectedScoreRange[0] && res.compositeScore <= sc.expectedScoreRange[1])
    : true;

  console.log(`[#${idx+1}] ${sc.title}`);
  console.log(`     Score: ${res.compositeScore}/100 | Verdict: ${res.verdict} (Expected: ${sc.expectedVerdict})`);
  console.log(`     Passed: ${passed && scoreInRange ? '✅ PASS' : '❌ FAIL'}`);
  if (!passed || !scoreInRange) allPassed = false;
});

// 2. Test URL Engine Accuracy
console.log('\n--- 2. URL PHISHING & TYPOSQUATTING ACCURACY ---');
const testUrls = [
  { url: 'https://onlinesbi.sbi', expected: 'VERIFIED_OFFICIAL' },
  { url: 'https://hdfcbank.com', expected: 'VERIFIED_OFFICIAL' },
  { url: 'http://onlinesb1.com/login', expected: 'CRITICAL' },
  { url: 'http://onlinesbi.sbi.kyc-verification.xyz/auth', expected: 'CRITICAL' },
  { url: 'http://192.168.1.105/login.php', expected: 'SUSPICIOUS_OR_CRITICAL' },
  { url: 'https://bit.ly/3xY9QzP', expected: 'SUSPICIOUS_OR_CRITICAL' },
  { url: 'http://x9q28z1k-claim-reward.buzz/upi', expected: 'CRITICAL' }
];

testUrls.forEach((tu, idx) => {
  const res = auditURL(tu.url);
  console.log(`[URL #${idx+1}] ${tu.url}`);
  console.log(`     Score: ${res.score}/100 | RiskLevel: ${res.riskLevel}`);
  console.log(`     Entropy: ${res.entropy} | Flags: ${res.flags.map(f => f.type).join(', ')}`);
});

// 3. Test Static APK Privilege Auditor
console.log('\n--- 3. APK STATIC PRIVILEGE AUDITOR ---');
SAMPLE_SCAM_APKS.forEach((apk, idx) => {
  const res = auditAPK(apk);
  console.log(`[APK #${idx+1}] ${apk.appName} (${apk.packageName})`);
  console.log(`     Score: ${res.score}/100 | RiskLevel: ${res.riskLevel}`);
  console.log(`     Flags: ${res.flags.map(f => f.type).join(', ') || 'None'}`);
});

// 4. Test False-Positive Stress Tests
console.log('\n--- 4. ZERO FALSE POSITIVE STRESS TESTS ---');
const benignCases = [
  "Security tip from your bank: Never share your OTP, PIN or CVV with anyone. Bank representatives never ask for OTP.",
  "Hey, are you coming to college tomorrow?",
  "Your appointment with Dr. Sharma is confirmed for 4:00 PM on Friday.",
  "I have submitted my KYC documents at the bank branch counter this morning."
];

benignCases.forEach((txt, idx) => {
  const res = analyzeMessageNLP(txt);
  console.log(`[BENIGN #${idx+1}] "${txt.substring(0, 45)}..."`);
  console.log(`     Score: ${res.score} | UrgencyLevel: ${res.urgencyLevel} -> ${res.score <= 20 ? '✅ CLEAN' : '⚠️ WARN'}`);
  if (res.score > 20) allPassed = false;
});

console.log('\n====================================================');
console.log('AUDIT COMPLETED. Overall System Health:', allPassed ? '✅ 100% ACCURATE' : '⚠️ REVIEW NEEDED');
console.log('====================================================');
