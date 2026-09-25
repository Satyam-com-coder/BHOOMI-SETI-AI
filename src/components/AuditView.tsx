import React, { useState } from 'react';
import type { AuditBlock, AuditVerificationResult } from '../types/index.ts';
import {
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Download,
  RotateCcw,
  Bug,
  Lock,
  Layers,
  FileSpreadsheet
} from 'lucide-react';
import { verifyAuditChain, tamperAuditBlock, resetLedger } from '../services/api.ts';

interface AuditViewProps {
  auditTrail: AuditBlock[];
  onRefresh: () => void;
  lang: 'en' | 'hi';
}

export const AuditView: React.FC<AuditViewProps> = ({
  auditTrail,
  onRefresh,
  lang
}) => {
  const [verificationResult, setVerificationResult] = useState<AuditVerificationResult | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [tamperMsg, setTamperMsg] = useState('');

  const handleVerify = async () => {
    setVerifying(true);
    try {
      const res = await verifyAuditChain();
      setVerificationResult(res);
      onRefresh();
    } catch (e: any) {
      console.error(e);
    } finally {
      setVerifying(false);
    }
  };

  const handleTamperToggle = async () => {
    try {
      const res = await tamperAuditBlock(1); // Block 2
      setTamperMsg(res.message);
      setVerificationResult(null);
      onRefresh();
      setTimeout(() => setTamperMsg(''), 5000);
    } catch (e: any) {
      console.error(e);
    }
  };

  const handleReset = async () => {
    try {
      await resetLedger();
      setVerificationResult(null);
      setTamperMsg(lang === 'hi' ? 'लेज़र प्रारंभिक स्थिति में रीसेट हो गया।' : 'Ledger reset to authentic clean state.');
      onRefresh();
      setTimeout(() => setTamperMsg(''), 4000);
    } catch (e: any) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-base text-[var(--mute)]">
          {lang === 'hi'
            ? 'प्रत्येक राजस्व प्रविष्टि पिछले ब्लॉक का SHA-256 हैश संजोए रखती है। कोई भी अनधिकृत बदलाव पूरी शृंखला को तोड़ देता है और तुरंत पकड़ा जाता है।'
            : 'Each event stores a SHA-256 hash of the previous entry, forming an immutable hash-chain. Any tampering breaks the chain and is detected instantly.'}
        </p>

        <div className="flex items-center gap-2 shrink-0">
          <a
            href="/api/audit/export?format=json"
            download="bhoomi-setu-audit.json"
            className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surf)] hover:border-[var(--acc)] text-[var(--ink)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[var(--acc)]" />
            <span>JSON</span>
          </a>
          <a
            href="/api/audit/export?format=csv"
            download="bhoomi-setu-audit.csv"
            className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--surf)] hover:border-[var(--acc)] text-[var(--ink)] text-xs font-semibold flex items-center gap-1.5 transition-colors"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>CSV</span>
          </a>
        </div>
      </div>

      {/* Action Banner & Verification Controls */}
      <div className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--acc)]" />
              <span>{lang === 'hi' ? 'ब्लॉकचेन अखंडता सत्यापन' : 'Cryptographic Integrity Verification'}</span>
            </h3>
            <p className="text-xs text-[var(--mute)]">
              Recalculates cryptographic SHA-256 proofs across all {auditTrail.length} blocks from genesis.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleVerify}
              disabled={verifying}
              className="px-4 py-2 rounded-lg bg-[var(--acc)] text-white text-xs font-bold hover:opacity-90 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{verifying ? 'Verifying Hashes...' : lang === 'hi' ? 'शृंखला सत्यापित करें' : 'Verify Chain'}</span>
            </button>

            <button
              onClick={handleTamperToggle}
              className="px-3.5 py-2 rounded-lg border border-amber-300 bg-[var(--warnbg)] text-[#a96200] hover:bg-amber-100 text-xs font-bold transition-colors flex items-center gap-1.5"
              title="Simulate unauthorized alteration of Block #2"
            >
              <Bug className="w-3.5 h-3.5" />
              <span>{lang === 'hi' ? 'ब्लॉक #2 में छेड़छाड़ का परीक्षण' : 'Simulate Tamper (Block #2)'}</span>
            </button>

            <button
              onClick={handleReset}
              className="px-3 py-2 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--acc)] text-[var(--ink)] text-xs font-semibold transition-colors flex items-center gap-1"
              title="Reset ledger to default clean state"
            >
              <RotateCcw className="w-3.5 h-3.5 text-[var(--mute)]" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Verification Message Alert */}
        {verificationResult && (
          <div
            className={`p-3.5 rounded-lg text-xs flex items-start gap-2.5 border transition-all animate-fade-in ${
              verificationResult.intact
                ? 'bg-[var(--okbg)] border-emerald-300 text-emerald-900'
                : 'bg-[var(--badbg)] border-red-300 text-red-900'
            }`}
          >
            {verificationResult.intact ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            ) : (
              <AlertOctagon className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            )}
            <div>
              <b className="font-bold block">
                {verificationResult.intact
                  ? '✓ Cryptographic Proof Valid: Ledger is Intact'
                  : '✗ Cryptographic Breach Detected: Ledger Has Been Altered!'}
              </b>
              <p className="mt-0.5">{verificationResult.details}</p>
            </div>
          </div>
        )}

        {tamperMsg && (
          <div className="p-3 rounded-lg bg-[var(--infobg)] border border-blue-200 text-blue-900 text-xs font-semibold">
            {tamperMsg}
          </div>
        )}
      </div>

      {/* Main Grid: Ledger Explorer + Security Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Ledger Explorer */}
        <div className="lg:col-span-8">
          <section className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
              <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--acc)]" />
                <span>{lang === 'hi' ? 'अपरिवर्तनीय ऑडिट लेज़र' : 'Immutable Audit Ledger'}</span>
              </h3>
              <span className="text-xs font-mono text-[var(--mute)]">
                {auditTrail.length} Blocks
              </span>
            </div>

            <div className="divide-y divide-[var(--line)]">
              {auditTrail.map((block) => (
                <div
                  key={block.index}
                  className={`py-3.5 space-y-1.5 transition-colors ${
                    block.isTampered ? 'bg-red-50/80 -mx-3 px-3 rounded-lg border border-red-300' : ''
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[var(--acc)] bg-[var(--bg)] px-2 py-0.5 rounded border border-[var(--line)]">
                        Block #{block.index}
                      </span>
                      <span className="text-[var(--mute)] font-medium">{block.t}</span>
                      {block.isTampered && (
                        <span className="badge badge-bad animate-pulse">
                          TAMPERED
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-[var(--mute)]">
                      {block.officer.split('(')[0]}
                    </span>
                  </div>

                  <b className={`block text-xs sm:text-sm font-bold ${block.isTampered ? 'text-red-700' : 'text-[var(--ink)]'}`}>
                    {block.msg}
                  </b>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[11px] font-mono pt-1 text-[var(--mute)]">
                    <div className="truncate">
                      <span className="text-[var(--acc)] font-bold">prev: </span>
                      <span title={block.prev}>{block.prev.slice(0, 24)}...</span>
                    </div>
                    <div className="truncate sm:text-right">
                      <span className="text-[var(--acc)] font-bold">hash: </span>
                      <span title={block.h}>{block.h.slice(0, 24)}...</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Security Controls Sidecard */}
        <div className="lg:col-span-4 space-y-4">
          <section className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--acc)]" />
              <span>{lang === 'hi' ? 'सुरक्षा नियंत्रण' : 'Security Controls'}</span>
            </h3>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)]">
                <span className="font-semibold text-[var(--ink)]">
                  {lang === 'hi' ? 'भूमिका आधारित अभिगम (RBAC)' : 'Role-based access'}
                </span>
                <span className="badge badge-ok">Active</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)]">
                <span className="font-semibold text-[var(--ink)]">
                  {lang === 'hi' ? 'क्रिप्टोग्राफिक हैशिंग' : 'SHA-256 Hashing'}
                </span>
                <span className="badge badge-ok">Active</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)]">
                <span className="font-semibold text-[var(--ink)]">
                  {lang === 'hi' ? 'छेड़छाड़ का स्वतः पता लगाना' : 'Tamper Detection'}
                </span>
                <span className="badge badge-ok">Active</span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-[var(--bg)] border border-[var(--line)]">
                <span className="font-semibold text-[var(--ink)]">
                  {lang === 'hi' ? 'कस्टडी शृंखला अनुरेखण' : 'Chain of Custody'}
                </span>
                <span className="badge badge-info">Tracked</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[var(--line)] text-[11px] text-[var(--mute)] leading-relaxed">
              Every action taken by a Revenue Officer or Patwari creates a signed transaction sealed with the previous block's SHA-256 hash. Any tampering with historical records breaks the ledger and fails digital verification in court.
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
