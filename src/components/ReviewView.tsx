import React, { useState } from 'react';
import type { Parcel } from '../types/index.ts';
import {
  CheckCircle2,
  XCircle,
  RotateCcw,
  AlertTriangle,
  FileCheck,
  ShieldAlert,
  Loader2
} from 'lucide-react';
import { submitDecision } from '../services/api.ts';

interface ReviewViewProps {
  parcels: (Parcel & {
    areaDiffPercent: number;
    reasons: string[];
    riskLevel: 'Low' | 'Medium' | 'High';
    effectiveStatus: 'Clean' | 'Review' | 'Verified' | 'Rejected';
  })[];
  onDecisionComplete: () => void;
  lang: 'en' | 'hi';
}

export const ReviewView: React.FC<ReviewViewProps> = ({
  parcels,
  onDecisionComplete,
  lang
}) => {
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [remarksModal, setRemarksModal] = useState<{
    id: string;
    action: 'Verified' | 'Rejected';
    remarks: string;
  } | null>(null);

  // Filter pending and decided parcels
  const pendingParcels = parcels.filter(
    (p) => !p.status && p.reasons.length > 0
  );
  const decidedParcels = parcels.filter((p) => !!p.status);

  const handleOpenDecisionModal = (id: string, action: 'Verified' | 'Rejected') => {
    const defaultRemarks =
      action === 'Verified'
        ? 'Verified after examining historical Khatauni (B-1) & field panchnama'
        : 'Discrepancy exceeds tolerance; directed for Section 129 physical demarcation';
    setRemarksModal({ id, action, remarks: defaultRemarks });
  };

  const handleConfirmDecision = async () => {
    if (!remarksModal) return;
    setSubmittingId(remarksModal.id);

    try {
      await submitDecision(
        remarksModal.id,
        remarksModal.action,
        remarksModal.remarks,
        'Revenue Officer (RO-Raigarh-412)'
      );
      setRemarksModal(null);
      onDecisionComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingId(null);
    }
  };

  const handleReopen = async (id: string) => {
    setSubmittingId(id);
    try {
      await submitDecision(id, 'Pending', 'Reopened for re-evaluation', 'Revenue Officer');
      onDecisionComplete();
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-base text-[var(--mute)]">
          {lang === 'hi'
            ? 'कम विश्वसनीयता, क्षेत्रफल विसंगति अथवा नाम भिन्नता वाले भू-अभिलेख सक्षम राजस्व अधिकारी के अनुमोदन हेतु यहां प्रतीक्षारत हैं।'
            : 'Records with low confidence or cadastral mismatches wait here for an authorized Revenue Officer to inspect and adjudicate.'}
        </p>
      </div>

      {/* Pending Queue Section */}
      <section className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
          <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>
              {lang === 'hi' ? 'लंबित सत्यापन कतार' : 'Pending Verification Queue'}
            </span>
            <span className="badge badge-warn ml-2">{pendingParcels.length}</span>
          </h3>
          <span className="text-xs text-[var(--mute)]">
            Authorized Officer: Tehsil Office Kharsia
          </span>
        </div>

        {pendingParcels.length === 0 ? (
          <div className="p-8 text-center text-[var(--mute)] space-y-2">
            <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
            <b className="block text-sm font-bold text-[var(--ink)]">
              {lang === 'hi' ? 'कतार पूरी तरह स्वच्छ है!' : 'Queue is completely clear!'}
            </b>
            <p className="text-xs">
              {lang === 'hi'
                ? 'वर्तमान में कोई भी अभिलेख अधिकारी अनुमोदन हेतु प्रतीक्षारत नहीं है।'
                : 'No records are currently awaiting officer adjudication.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--line)]">
            {pendingParcels.map((p) => {
              const isSubmitting = submittingId === p.id;
              return (
                <div
                  key={p.id}
                  className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <b className="text-sm font-bold text-[var(--ink)]">
                        Khasra {p.id} · {p.village}
                      </b>
                      <span className="text-xs text-[var(--mute)]">({p.owner})</span>
                      <span
                        className={`badge ${
                          p.riskLevel === 'High'
                            ? 'badge-bad'
                            : p.riskLevel === 'Medium'
                            ? 'badge-warn'
                            : 'badge-ok'
                        }`}
                      >
                        {p.riskLevel} Risk
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1.5 text-xs text-[var(--mute)]">
                      {p.reasons.map((r, i) => (
                        <span
                          key={i}
                          className="bg-[var(--bg)] px-2 py-0.5 rounded border border-[var(--line)] text-[11px] font-medium"
                        >
                          ⚠ {r}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleOpenDecisionModal(p.id, 'Verified')}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 rounded-lg bg-[var(--acc)] text-white text-xs font-bold hover:opacity-95 shadow-sm transition-all flex items-center gap-1.5"
                    >
                      {isSubmitting ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      )}
                      <span>{lang === 'hi' ? 'अनुमोदित करें' : 'Verify'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenDecisionModal(p.id, 'Rejected')}
                      disabled={isSubmitting}
                      className="px-3.5 py-2 rounded-lg border border-[var(--bad)] text-[var(--bad)] hover:bg-[var(--badbg)] text-xs font-bold transition-colors flex items-center gap-1.5"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{lang === 'hi' ? 'अस्वीकृत करें' : 'Reject'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Decided Section */}
      {decidedParcels.length > 0 && (
        <section className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--line)]">
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-600" />
              <span>{lang === 'hi' ? 'निर्णित अभिलेख' : 'Decided Records'}</span>
              <span className="badge badge-info ml-2">{decidedParcels.length}</span>
            </h3>
          </div>

          <div className="divide-y divide-[var(--line)]">
            {decidedParcels.map((p) => (
              <div
                key={p.id}
                className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <b className="font-bold text-[var(--ink)]">Khasra {p.id}</b>
                    <span className="text-xs text-[var(--mute)]">({p.village})</span>
                    <span
                      className={`badge ${
                        p.status === 'Verified' ? 'badge-ok' : 'badge-bad'
                      }`}
                    >
                      {p.status}
                    </span>
                  </div>
                  {p.decisionRemarks && (
                    <p className="text-xs text-[var(--mute)] mt-0.5">
                      Remarks: {p.decisionRemarks}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => handleReopen(p.id)}
                  disabled={submittingId === p.id}
                  className="px-3 py-1.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--acc)] text-[var(--ink)] text-xs font-semibold flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <RotateCcw className="w-3 h-3 text-[var(--mute)]" />
                  <span>{lang === 'hi' ? 'पुनः खोलें' : 'Reopen'}</span>
                </button>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Decision Remarks Modal */}
      {remarksModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-[var(--surf)] border border-[var(--line)] rounded-xl max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[var(--line)]">
              <b className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                {remarksModal.action === 'Verified' ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-red-600" />
                )}
                <span>
                  {remarksModal.action} Khasra {remarksModal.id}
                </span>
              </b>
              <button
                onClick={() => setRemarksModal(null)}
                className="text-[var(--mute)] hover:text-[var(--ink)] font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-[var(--ink)] mb-1">
                {lang === 'hi' ? 'राजस्व अधिकारी की टिप्पणी (Remarks):' : 'Officer Remarks for Audit Ledger:'}
              </label>
              <textarea
                value={remarksModal.remarks}
                onChange={(e) =>
                  setRemarksModal({ ...remarksModal, remarks: e.target.value })
                }
                rows={3}
                className="w-full p-2.5 rounded-lg border border-[var(--line)] bg-[var(--bg)] text-xs text-[var(--ink)] focus:border-[var(--acc)] focus:outline-none"
                placeholder="Enter remarks..."
              />
              <span className="text-[11px] text-[var(--mute)] block mt-1">
                This entry will be hashed with SHA-256 and appended to the immutable blockchain ledger.
              </span>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                onClick={() => setRemarksModal(null)}
                className="px-3.5 py-2 rounded-lg border border-[var(--line)] text-xs font-semibold hover:bg-[var(--bg)]"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDecision}
                disabled={submittingId !== null}
                className={`px-4 py-2 rounded-lg text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5 ${
                  remarksModal.action === 'Verified'
                    ? 'bg-emerald-700 hover:bg-emerald-800'
                    : 'bg-red-700 hover:bg-red-800'
                }`}
              >
                {submittingId ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : null}
                <span>Confirm {remarksModal.action}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
