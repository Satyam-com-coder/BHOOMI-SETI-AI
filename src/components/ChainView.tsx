import React from 'react';
import type { Parcel } from '../types/index.ts';
import { GitBranch, CheckCircle, AlertTriangle, ArrowRight, ShieldCheck } from 'lucide-react';

interface ChainViewProps {
  parcels: Parcel[];
  selectedParcelId: string;
  onSelectParcel: (id: string) => void;
  onNavigate: (view: string) => void;
  tolerance: number;
  lang: 'en' | 'hi';
}

export const ChainView: React.FC<ChainViewProps> = ({
  parcels,
  selectedParcelId,
  onSelectParcel,
  onNavigate,
  tolerance,
  lang
}) => {
  const currentParcel = parcels.find(p => p.id === selectedParcelId) || parcels[0];
  const areaGap = Math.abs(currentParcel.rec - currentParcel.gis) / currentParcel.rec * 100;
  const isAreaMismatch = areaGap > tolerance;

  const chainReasons: string[] = [];
  if (isAreaMismatch) {
    chainReasons.push(
      lang === 'hi'
        ? `क्षेत्रफल में जीआईएस से ${areaGap.toFixed(1)}% का अंतर (${currentParcel.rec} एकड़ बनाम ${currentParcel.gis} एकड़)`
        : `Area differs ${areaGap.toFixed(1)}% from GIS (${currentParcel.rec} ac vs ${currentParcel.gis} ac)`
    );
  }
  if (currentParcel.conf < 70) {
    chainReasons.push(
      lang === 'hi'
        ? `ओसीआर विश्वसनीयता मात्र ${currentParcel.conf}% है`
        : `OCR confidence is low (${currentParcel.conf}%)`
    );
  }
  if (currentParcel.chain.length < 3) {
    chainReasons.push(
      lang === 'hi' ? 'स्वामित्व शृंखला अपूर्ण है (< 3 ऐतिहासिक प्रविष्टियां)' : 'Ownership chain is incomplete (< 3 historical entries)'
    );
  }
  if (currentParcel.note) {
    chainReasons.push(currentParcel.note);
  }
  if (!currentParcel.clsOk) {
    chainReasons.push(
      lang === 'hi'
        ? `भूमि वर्गीकरण बेमेल: अभिलेख (${currentParcel.cls}) बनाम जीआईएस (${currentParcel.gcls})`
        : `Land class differs: Record (${currentParcel.cls}) vs GIS (${currentParcel.gcls})`
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-base text-[var(--mute)]">
          {lang === 'hi'
            ? 'किसी भी खसरे के लिए पीढ़ियों पुराने अभिलेखों (बंदोबस्त, खतौनी, नामांतरण, रजिस्ट्री) को एक निर्बाध समय-रेखा में जोड़ना।'
            : 'Every generation of records for a parcel, linked into one chronological timeline.'}
        </p>
      </div>

      {/* Parcel Selector Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-bold text-[var(--mute)] mr-1">
          {lang === 'hi' ? 'खसरा चुनें:' : 'Select Khasra:'}
        </span>
        {parcels.map((p) => {
          const isSelected = p.id === currentParcel.id;
          return (
            <button
              key={p.id}
              onClick={() => onSelectParcel(p.id)}
              className={`px-3 py-1 rounded-full text-xs font-bold border transition-all ${
                isSelected
                  ? 'bg-[var(--acc)] text-white border-[var(--acc)] shadow-sm'
                  : 'bg-[var(--surf)] border-[var(--line)] text-[var(--ink)] hover:border-[var(--acc)]'
              }`}
            >
              Khasra {p.id}
            </button>
          );
        })}
      </div>

      {/* Main Timeline and Chain Checks Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Timeline Column */}
        <div className="lg:col-span-7">
          <section className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between pb-3 mb-5 border-b border-[var(--line)]">
              <div>
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-[var(--acc)]" />
                  <span>Khasra {currentParcel.id} · {currentParcel.village} ({currentParcel.tehsil})</span>
                </h3>
                <span className="text-xs text-[var(--mute)]">
                  {lang === 'hi' ? 'स्वामित्व एवं नामांतरण शृंखला' : 'Ownership & Title Mutation Chain'}
                </span>
              </div>
              <span className="badge badge-info">
                {currentParcel.chain.length} {lang === 'hi' ? 'दस्तावेज़' : 'records linked'}
              </span>
            </div>

            {/* Vertical timeline */}
            <div className="relative pl-6 border-l-2 border-[var(--line)] ml-3 space-y-6">
              {currentParcel.chain.map((c, idx) => (
                <div key={idx} className="relative group">
                  {/* Timeline node */}
                  <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[var(--acc)] border-2 border-[var(--surf)] ring-2 ring-[var(--acc)]/30 group-hover:scale-125 transition-transform" />
                  <div className="space-y-0.5">
                    <span className="text-xs font-mono font-bold text-[var(--acc)]">
                      {c[0]}
                    </span>
                    <b className="block text-sm font-bold text-[var(--ink)]">
                      {c[1]}
                    </b>
                    <p className="text-xs text-[var(--mute)] leading-relaxed">
                      {c[2]}
                    </p>
                  </div>
                </div>
              ))}

              {/* Current Cadastral Check node */}
              <div className="relative">
                <span className="absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full bg-[var(--sun)] border-2 border-[var(--surf)] ring-2 ring-[var(--sun)]/40" />
                <div className="space-y-0.5">
                  <span className="text-xs font-mono font-bold text-[var(--sun)]">
                    {lang === 'hi' ? 'वर्तमान (2026)' : 'Present Day Check'}
                  </span>
                  <b className="block text-sm font-bold text-[var(--ink)]">
                    {lang === 'hi' ? 'जीआईएस भू-नक्शा मिलान' : 'Cadastral GIS Cross-Check'}
                  </b>
                  <p className="text-xs text-[var(--mute)]">
                    {isAreaMismatch
                      ? `Cadastral boundary area (${currentParcel.gis} ac) diverges ${areaGap.toFixed(1)}% from record area (${currentParcel.rec} ac).`
                      : `Cadastral boundary area (${currentParcel.gis} ac) perfectly matches textual land record.`}
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Chain Checks Column */}
        <div className="lg:col-span-5 space-y-4">
          <section className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-5 shadow-sm space-y-4">
            <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[var(--acc)]" />
              <span>{lang === 'hi' ? 'शृंखला अखंडता जांच' : 'Chain Integrity Checks'}</span>
            </h3>

            {currentParcel.ownerH === currentParcel.owner && (
              <div className="p-3 rounded-lg bg-[var(--okbg)] text-[var(--ok)] text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>
                  {lang === 'hi'
                    ? 'भूमिस्वामी की पहचान सभी ऐतिहासिक अभिलेखों में सुसंगत है।'
                    : 'Owner identity linked consistently across records.'}
                </span>
              </div>
            )}

            {chainReasons.length > 0 ? (
              chainReasons.map((reason, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg bg-[var(--warnbg)] text-[#a96200] text-xs flex items-start gap-2 border border-amber-200"
                >
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{reason}</span>
                </div>
              ))
            ) : (
              <div className="p-3 rounded-lg bg-[var(--okbg)] text-[var(--ok)] text-xs flex items-center gap-2 border border-emerald-200">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>
                  {lang === 'hi'
                    ? 'कोई विसंगति नहीं पाई गई। शृंखला पूर्ण व सत्यापित है।'
                    : 'No issues found. Chain is intact and fully reconciled.'}
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-[var(--line)] space-y-2">
              {chainReasons.length > 0 ? (
                <button
                  onClick={() => onNavigate('review')}
                  className="w-full py-2.5 px-4 rounded-lg bg-[var(--acc)] text-white text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
                >
                  <span>{lang === 'hi' ? 'अधिकारी सत्यापन हेतु भेजें' : 'Send to Human Verification'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('gis')}
                  className="w-full py-2.5 px-4 rounded-lg border border-[var(--line)] bg-[var(--bg)] hover:border-[var(--acc)] text-[var(--ink)] text-xs font-bold transition-colors flex items-center justify-center gap-2"
                >
                  <span>{lang === 'hi' ? 'जीआईएस भू-नक्शा देखें' : 'View on Cadastral Map'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
