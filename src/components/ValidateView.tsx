import React, { useState } from 'react';
import type { Parcel } from '../types/index.ts';
import {
  CheckCircle,
  AlertTriangle,
  Sparkles,
  Sliders,
  Scale,
  Loader2,
  FileCheck2,
  ArrowRight
} from 'lucide-react';
import { fetchDiscrepancyAdvisory } from '../services/api.ts';

interface ValidateViewProps {
  parcels: (Parcel & {
    areaDiffPercent: number;
    reasons: string[];
    riskLevel: 'Low' | 'Medium' | 'High';
    effectiveStatus: 'Clean' | 'Review' | 'Verified' | 'Rejected';
  })[];
  selectedParcelId: string;
  onSelectParcel: (id: string) => void;
  tolerance: number;
  onToleranceChange: (val: number) => void;
  onNavigate: (view: string) => void;
  lang: 'en' | 'hi';
}

export const ValidateView: React.FC<ValidateViewProps> = ({
  parcels,
  selectedParcelId,
  onSelectParcel,
  tolerance,
  onToleranceChange,
  onNavigate,
  lang
}) => {
  const currentParcel = parcels.find(p => p.id === selectedParcelId) || parcels[0];
  const [loadingAdvisory, setLoadingAdvisory] = useState(false);
  const [advisory, setAdvisory] = useState<any | null>(null);

  const d = currentParcel.areaDiffPercent;
  const isAreaExceeded = d > tolerance;

  // Generate AI Discrepancy Legal Assessment
  const handleGenerateAdvisory = async () => {
    setLoadingAdvisory(true);
    try {
      const result = await fetchDiscrepancyAdvisory(currentParcel);
      setAdvisory(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingAdvisory(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-base text-[var(--mute)]">
          {lang === 'hi'
            ? 'ऐतिहासिक अभिलेख, वर्तमान कम्प्यूटरीकृत खतौनी और उपग्रह जीआईएस का एक-साथ तुलनात्मक विश्लेषण।'
            : 'Historical records, current computerized land records and GIS, side by side. Differences are flagged for an officer, never auto-rejected.'}
        </p>
      </div>

      {/* Parcel Selector & Tolerance Slider */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-[var(--surf)] border border-[var(--line)] rounded-xl p-4 shadow-sm">
        {/* Chips */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-[var(--mute)] mr-1">
            {lang === 'hi' ? 'खसरा चुनें:' : 'Khasra:'}
          </span>
          {parcels.map((p) => {
            const isSelected = p.id === currentParcel.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  onSelectParcel(p.id);
                  setAdvisory(null);
                }}
                className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                  isSelected
                    ? 'bg-[var(--acc)] text-white border-[var(--acc)] shadow-sm'
                    : 'bg-[var(--bg)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--acc)]'
                }`}
              >
                {p.id}
              </button>
            );
          })}
        </div>

        {/* Tolerance Range */}
        <div className="flex items-center gap-3">
          <Sliders className="w-4 h-4 text-[var(--acc)] shrink-0" />
          <label className="text-xs font-bold text-[var(--ink)] whitespace-nowrap">
            {lang === 'hi' ? 'क्षेत्रफल सहनशीलता (Tolerance):' : 'Area Tolerance:'}
          </label>
          <input
            type="range"
            min="1"
            max="30"
            value={tolerance}
            onChange={(e) => onToleranceChange(Number(e.target.value))}
            className="w-28 sm:w-36 accent-[var(--acc)] cursor-pointer"
          />
          <b className="text-xs font-mono font-extrabold text-[var(--acc)] w-10">
            {tolerance}%
          </b>
        </div>
      </div>

      {/* Comparison Table Card */}
      <section className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-5 shadow-sm">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--line)]">
          <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
            <span>Khasra {currentParcel.id} · {currentParcel.village}</span>
            {currentParcel.reasons.length > 0 ? (
              <span className="badge badge-warn">
                <AlertTriangle className="w-3 h-3" />
                <span>{lang === 'hi' ? 'समीक्षा आवश्यक' : 'Review Required'}</span>
              </span>
            ) : (
              <span className="badge badge-ok">
                <CheckCircle className="w-3 h-3" />
                <span>{lang === 'hi' ? 'सत्यापित' : 'Clean Match'}</span>
              </span>
            )}
          </h3>
          <span className="text-xs text-[var(--mute)]">
            Tehsil Kharsia · Dist Raigarh
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse min-w-[560px]">
            <thead>
              <tr className="border-b border-[var(--line)] text-[var(--mute)] font-semibold text-xs">
                <th className="py-2.5 px-3">Parameter (पैरामीटर)</th>
                <th className="py-2.5 px-3">Historical (ऐतिहासिक)</th>
                <th className="py-2.5 px-3">Current (वर्तमान)</th>
                <th className="py-2.5 px-3">GIS Cadastral (जीआईएस)</th>
                <th className="py-2.5 px-3">Result (परिणाम)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--line)]">
              {/* Owner */}
              <tr className="hover:bg-[var(--bg)]/50">
                <td className="py-2.5 px-3 font-semibold text-[var(--ink)]">Owner (भूमिस्वामी)</td>
                <td className="py-2.5 px-3 text-[var(--mute)]">{currentParcel.ownerH}</td>
                <td className="py-2.5 px-3 font-medium text-[var(--ink)]">{currentParcel.owner}</td>
                <td className="py-2.5 px-3 text-[var(--mute)]">Matched Parcel Boundary</td>
                <td className="py-2.5 px-3">
                  {currentParcel.ownerH === currentParcel.owner ? (
                    <span className="badge badge-ok">Match</span>
                  ) : (
                    <span className="badge badge-warn">Spelling Review</span>
                  )}
                </td>
              </tr>

              {/* Khasra */}
              <tr className="hover:bg-[var(--bg)]/50">
                <td className="py-2.5 px-3 font-semibold text-[var(--ink)]">Khasra No. (खसरा नं.)</td>
                <td className="py-2.5 px-3 text-[var(--mute)]">{currentParcel.id}</td>
                <td className="py-2.5 px-3 font-medium text-[var(--ink)]">{currentParcel.id}</td>
                <td className="py-2.5 px-3 text-[var(--mute)]">{currentParcel.id}</td>
                <td className="py-2.5 px-3">
                  <span className="badge badge-ok">Match</span>
                </td>
              </tr>

              {/* Area */}
              <tr className="hover:bg-[var(--bg)]/50">
                <td className="py-2.5 px-3 font-semibold text-[var(--ink)]">Area (रकबा)</td>
                <td className="py-2.5 px-3 text-[var(--mute)]">
                  {currentParcel.chain[0]?.[2]?.split('·')[1]?.trim() || `${currentParcel.rec.toFixed(2)} acre`}
                </td>
                <td className="py-2.5 px-3 font-medium text-[var(--ink)]">
                  {currentParcel.rec.toFixed(2)} acre
                </td>
                <td className="py-2.5 px-3 text-[var(--mute)]">
                  {currentParcel.gis.toFixed(2)} acre ({d.toFixed(1)}% diff)
                </td>
                <td className="py-2.5 px-3">
                  {isAreaExceeded ? (
                    <span className="badge badge-bad">
                      Mismatch ({d.toFixed(1)}% &gt; {tolerance}%)
                    </span>
                  ) : (
                    <span className="badge badge-ok">Within Tolerance</span>
                  )}
                </td>
              </tr>

              {/* Classification */}
              <tr className="hover:bg-[var(--bg)]/50">
                <td className="py-2.5 px-3 font-semibold text-[var(--ink)]">Classification (श्रेणी)</td>
                <td className="py-2.5 px-3 text-[var(--mute)]">{currentParcel.cls}</td>
                <td className="py-2.5 px-3 font-medium text-[var(--ink)]">{currentParcel.cls}</td>
                <td className="py-2.5 px-3 text-[var(--mute)]">{currentParcel.gcls}</td>
                <td className="py-2.5 px-3">
                  {currentParcel.clsOk ? (
                    <span className="badge badge-ok">Match</span>
                  ) : (
                    <span className="badge badge-warn">Class Review</span>
                  )}
                </td>
              </tr>

              {/* Ownership Chain */}
              <tr className="hover:bg-[var(--bg)]/50">
                <td className="py-2.5 px-3 font-semibold text-[var(--ink)]">Chain (स्वामित्व शृंखला)</td>
                <td className="py-2.5 px-3 text-[var(--mute)]">{currentParcel.chain.length} historical records</td>
                <td className="py-2.5 px-3 font-medium text-[var(--ink)]">Digitally Linked</td>
                <td className="py-2.5 px-3 text-[var(--mute)]">—</td>
                <td className="py-2.5 px-3">
                  {currentParcel.chain.length >= 3 ? (
                    <span className="badge badge-ok">Consistent</span>
                  ) : (
                    <span className="badge badge-warn">Incomplete Chain</span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* Two columns: Explanation + Risk level & AI Advisory */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* System Explanation */}
        <div className="lg:col-span-8 space-y-4">
          <section className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-5 shadow-sm space-y-3">
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center justify-between">
              <span>{lang === 'hi' ? 'प्रणाली का निष्कर्ष' : 'System Explanation'}</span>
              <button
                onClick={handleGenerateAdvisory}
                disabled={loadingAdvisory}
                className="px-3 py-1.5 rounded-lg bg-[var(--acc)] text-white text-xs font-bold hover:opacity-90 flex items-center gap-1.5 shadow-sm transition-all"
              >
                {loadingAdvisory ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Sparkles className="w-3.5 h-3.5" />
                )}
                <span>
                  {loadingAdvisory
                    ? 'Generating Legal Advisory...'
                    : lang === 'hi'
                    ? 'एआई विधिक सलाह तैयार करें'
                    : 'Generate Legal Advisory'}
                </span>
              </button>
            </h3>

            <p className="text-xs sm:text-sm text-[var(--ink)] leading-relaxed">
              {currentParcel.reasons.length > 0
                ? `${lang === 'hi' ? 'सिस्टम को निम्नलिखित अंतर प्राप्त हुए:' : 'The system detected:'} ${currentParcel.reasons.join(
                    '; '
                  )}. ${
                    lang === 'hi'
                      ? 'सिस्टम इसे स्वतः धोखाधड़ी नहीं मानता; बल्कि राजस्व संहिता के तहत सक्षम अधिकारी को निर्णय हेतु अग्रेषित करता है।'
                      : 'It does not label this as fraud; it flags the record for an authorized Revenue Officer to inspect and adjudicate.'
                  }`
                : lang === 'hi'
                ? 'वर्तमान सहनशीलता के भीतर सभी जांच पूरी तरह उत्तीर्ण हैं। किसी अधिकारी कार्रवाई की आवश्यकता नहीं है।'
                : 'All checks pass within the current tolerance threshold. No officer action needed.'}
            </p>

            {/* AI Generated Legal Advisory */}
            {advisory && (
              <div className="mt-4 p-4 rounded-xl bg-[var(--okbg)]/60 border border-emerald-200 text-xs space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-emerald-900 text-sm">
                  <Scale className="w-4 h-4 text-emerald-700" />
                  <span>{advisory.title}</span>
                </div>
                <p className="text-[var(--ink)] leading-relaxed">{advisory.legalContext}</p>
                <div>
                  <b className="font-bold text-[var(--ink)] block mb-1">
                    {lang === 'hi' ? 'अनुशंसित राजस्व प्रक्रिया:' : 'Recommended Revenue Actions:'}
                  </b>
                  <ul className="list-disc pl-5 space-y-1 text-[var(--mute)]">
                    {advisory.recommendedActions?.map((act: string, i: number) => (
                      <li key={i}>{act}</li>
                    ))}
                  </ul>
                </div>
                {advisory.statutoryReference && (
                  <div className="pt-2 border-t border-emerald-200/80 font-mono text-[11px] text-emerald-800">
                    Statutory basis: {advisory.statutoryReference}
                  </div>
                )}
              </div>
            )}
          </section>
        </div>

        {/* Risk Card & Navigation */}
        <div className="lg:col-span-4 space-y-4">
          <section className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-5 shadow-sm text-center">
            <small className="text-xs font-bold text-[var(--mute)] uppercase tracking-wider block mb-1">
              {lang === 'hi' ? 'जोखिम मूल्यांकन' : 'Calculated Risk'}
            </small>
            <div className="text-3xl font-black text-[var(--ink)] mb-2">
              {currentParcel.riskLevel}
            </div>
            <div className="mb-4">
              <span
                className={`badge ${
                  currentParcel.riskLevel === 'High'
                    ? 'badge-bad'
                    : currentParcel.riskLevel === 'Medium'
                    ? 'badge-warn'
                    : 'badge-ok'
                }`}
              >
                {currentParcel.reasons.length > 0
                  ? lang === 'hi'
                    ? 'अधिकारी सत्यापन आवश्यक'
                    : 'Human Verification Required'
                  : lang === 'hi'
                  ? 'अभिलेख पूर्णतः मान्य'
                  : 'No Officer Action'}
              </span>
            </div>

            <button
              onClick={() => onNavigate('review')}
              className="w-full py-2.5 px-3 rounded-lg bg-[var(--acc)] text-white text-xs font-bold hover:opacity-90 flex items-center justify-center gap-1.5 transition-all shadow-sm"
            >
              <span>{lang === 'hi' ? 'समीक्षा कतार में खोलें' : 'Open in Review Queue'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </section>
        </div>
      </div>
    </div>
  );
};
