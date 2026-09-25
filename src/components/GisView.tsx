import React from 'react';
import type { Parcel } from '../types/index.ts';
import { MapPin, Sliders, ArrowRight, Layers, Eye } from 'lucide-react';

interface GisViewProps {
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

export const GisView: React.FC<GisViewProps> = ({
  parcels,
  selectedParcelId,
  onSelectParcel,
  tolerance,
  onToleranceChange,
  onNavigate,
  lang
}) => {
  const currentParcel = parcels.find(p => p.id === selectedParcelId) || parcels[0];

  const getParcelColorClass = (p: typeof parcels[0]) => {
    if (p.effectiveStatus === 'Rejected') return 'map-bad';
    if (p.effectiveStatus === 'Verified') return 'map-ok';
    if (p.riskLevel === 'High') return 'map-bad';
    if (p.reasons.length > 0) return 'map-warn';
    return 'map-ok';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <p className="text-base text-[var(--mute)]">
          {lang === 'hi'
            ? 'भू-नक्शे पर किसी भी खसरे पर क्लिक करें। रंग वर्तमान सहनशीलता पर स्थिति दर्शाता है: हरा (सत्यापित/क्लीन), पीला (समीक्षा), लाल (उच्च जोखिम/अस्वीकृत)।'
            : 'Click any parcel on the cadastral map. Colors show live status at current tolerance: green clean or verified, amber review, red high risk or rejected.'}
        </p>

        {/* Tolerance control */}
        <div className="flex items-center gap-2 bg-[var(--surf)] border border-[var(--line)] px-3 py-1.5 rounded-lg shadow-sm shrink-0">
          <Sliders className="w-3.5 h-3.5 text-[var(--acc)]" />
          <span className="text-xs font-bold text-[var(--ink)]">
            {lang === 'hi' ? 'सहनशीलता:' : 'Tolerance:'}
          </span>
          <input
            type="range"
            min="1"
            max="30"
            value={tolerance}
            onChange={(e) => onToleranceChange(Number(e.target.value))}
            className="w-24 accent-[var(--acc)] cursor-pointer"
          />
          <b className="text-xs font-mono font-bold text-[var(--acc)]">
            {tolerance}%
          </b>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SVG Cadastral Map */}
        <div className="lg:col-span-8">
          <section className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[var(--acc)]" />
                <span>{lang === 'hi' ? 'कैडेस्ट्रल भू-नक्शा (खसरा शजरा)' : 'Cadastral Map (Khasra Shajra)'}</span>
              </h3>
              <div className="flex items-center gap-2 text-xs font-mono text-[var(--mute)]">
                <span>Scale 1:4000</span>
                <span>·</span>
                <span>Bhatapara & Raigarh Halqa</span>
              </div>
            </div>

            {/* SVG Interactive Canvas */}
            <div className="relative border border-[var(--line)] rounded-lg bg-[var(--bg)] p-2 overflow-hidden">
              <svg
                viewBox="0 0 600 380"
                className="w-full h-auto select-none"
                role="img"
                aria-label="Cadastral Map"
              >
                {/* Background grid */}
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" className="text-[var(--line)] opacity-40" />
                  </pattern>
                </defs>
                <rect width="600" height="380" fill="url(#grid)" />

                {/* Parcels */}
                {parcels.map((p) => {
                  const isSelected = p.id === currentParcel.id;
                  const colorClass = getParcelColorClass(p);
                  return (
                    <g key={p.id}>
                      <polygon
                        points={p.polygon}
                        className={`map-parcel ${colorClass} ${isSelected ? 'selected' : ''}`}
                        onClick={() => onSelectParcel(p.id)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') onSelectParcel(p.id);
                        }}
                      >
                        <title>Khasra {p.id} ({p.owner})</title>
                      </polygon>
                      <text
                        x={p.labelPos[0]}
                        y={p.labelPos[1]}
                        textAnchor="middle"
                        className="text-xs font-black fill-[var(--ink)] pointer-events-none select-none drop-shadow"
                      >
                        {p.id}
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Map Legend */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs border-t border-[var(--line)]">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 font-medium text-[var(--ink)]">
                  <span className="w-3 h-3 rounded-sm bg-emerald-600 inline-block" />
                  <span>{lang === 'hi' ? 'सत्यापित / क्लीन' : 'Clean / Verified'}</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[var(--ink)]">
                  <span className="w-3 h-3 rounded-sm bg-amber-500 inline-block" />
                  <span>{lang === 'hi' ? 'समीक्षा कतार' : 'Needs Review'}</span>
                </span>
                <span className="flex items-center gap-1.5 font-medium text-[var(--ink)]">
                  <span className="w-3 h-3 rounded-sm bg-red-600 inline-block" />
                  <span>{lang === 'hi' ? 'उच्च जोखिम / अस्वीकृत' : 'High Risk / Rejected'}</span>
                </span>
              </div>
              <span className="text-[11px] text-[var(--mute)]">
                Click any plot to inspect attributes
              </span>
            </div>
          </section>
        </div>

        {/* Selected Parcel Details Card */}
        <div className="lg:col-span-4 space-y-4">
          <section className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-5 shadow-sm space-y-4">
            <div className="border-b border-[var(--line)] pb-3">
              <span className="text-xs font-mono text-[var(--acc)] font-bold">
                Cadastral Survey Parcel
              </span>
              <h3 className="text-xl font-extrabold text-[var(--ink)] flex items-center justify-between">
                <span>Khasra {currentParcel.id}</span>
                <span
                  className={`badge ${
                    currentParcel.effectiveStatus === 'Verified' || currentParcel.effectiveStatus === 'Clean'
                      ? 'badge-ok'
                      : currentParcel.effectiveStatus === 'Rejected'
                      ? 'badge-bad'
                      : 'badge-warn'
                  }`}
                >
                  {currentParcel.effectiveStatus}
                </span>
              </h3>
            </div>

            <dl className="grid grid-cols-2 gap-y-2.5 text-xs sm:text-sm">
              <dt className="text-[var(--mute)] font-medium">Owner (भूमिस्वामी):</dt>
              <dd className="font-bold text-[var(--ink)] text-right truncate">
                {currentParcel.owner}
              </dd>

              <dt className="text-[var(--mute)] font-medium">Village (ग्राम):</dt>
              <dd className="font-bold text-[var(--ink)] text-right">
                {currentParcel.village}
              </dd>

              <dt className="text-[var(--mute)] font-medium">Record Area (रकबा):</dt>
              <dd className="font-bold text-[var(--ink)] text-right font-mono">
                {currentParcel.rec.toFixed(2)} acre
              </dd>

              <dt className="text-[var(--mute)] font-medium">GIS Area (जीआईएस):</dt>
              <dd className="font-bold text-[var(--ink)] text-right font-mono">
                {currentParcel.gis.toFixed(2)} acre
              </dd>

              <dt className="text-[var(--mute)] font-medium">Area Gap (अंतर):</dt>
              <dd
                className={`font-bold text-right font-mono ${
                  currentParcel.areaDiffPercent > tolerance ? 'text-red-600' : 'text-emerald-600'
                }`}
              >
                {currentParcel.areaDiffPercent.toFixed(1)}%
              </dd>

              <dt className="text-[var(--mute)] font-medium">Risk Level:</dt>
              <dd className="font-bold text-right">
                <span
                  className={`badge ${
                    currentParcel.riskLevel === 'High'
                      ? 'badge-bad'
                      : currentParcel.riskLevel === 'Medium'
                      ? 'badge-warn'
                      : 'badge-ok'
                  }`}
                >
                  {currentParcel.riskLevel}
                </span>
              </dd>
            </dl>

            <div className="pt-3 border-t border-[var(--line)] space-y-2">
              <button
                onClick={() => onNavigate('validate')}
                className="w-full py-2.5 px-4 rounded-lg bg-[var(--acc)] text-white text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Eye className="w-3.5 h-3.5" />
                <span>{lang === 'hi' ? 'विस्तृत सत्यापन खोलें' : 'Open Cross Validation'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
