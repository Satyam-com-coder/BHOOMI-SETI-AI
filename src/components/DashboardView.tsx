import React from 'react';
import type { SystemStats, AuditBlock } from '../types/index.ts';
import {
  FileText,
  CheckCircle,
  AlertCircle,
  Clock,
  ArrowRight,
  Shield,
  Layers,
  Sparkles
} from 'lucide-react';

interface DashboardViewProps {
  stats: SystemStats | null;
  auditTrail: AuditBlock[];
  onNavigate: (view: string) => void;
  lang: 'en' | 'hi';
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  stats,
  auditTrail,
  onNavigate,
  lang
}) => {
  const pipeline = [
    {
      label: lang === 'hi' ? 'ओसीआर दस्तावेज़' : 'OCR records',
      count: stats?.pipelineStages.ocrRecords || 18420,
      pct: 100
    },
    {
      label: lang === 'hi' ? 'विश्वसनीयता जांच' : 'Confidence check',
      count: stats?.pipelineStages.confidenceCheck || 17105,
      pct: 93
    },
    {
      label: lang === 'hi' ? 'जीआईएस मिलान' : 'GIS matching',
      count: stats?.pipelineStages.gisMatching || 16540,
      pct: 90
    },
    {
      label: lang === 'hi' ? 'अभिलेख सत्यापन' : 'Record validation',
      count: stats?.pipelineStages.recordValidation || 15930,
      pct: 86
    }
  ];

  const steps = [
    {
      num: 1,
      title: lang === 'hi' ? 'पढ़ना (Read)' : 'Read',
      desc: lang === 'hi' ? 'ओसीआर + हस्तलिखित' : 'OCR + handwriting'
    },
    {
      num: 2,
      title: lang === 'hi' ? 'समझना (Understand)' : 'Understand',
      desc: lang === 'hi' ? 'फील्ड निष्कर्षण' : 'Field extraction'
    },
    {
      num: 3,
      title: lang === 'hi' ? 'जोड़ना (Connect)' : 'Connect',
      desc: lang === 'hi' ? 'स्वामित्व शृंखला' : 'Ownership chain'
    },
    {
      num: 4,
      title: lang === 'hi' ? 'सत्यापित करना (Validate)' : 'Validate',
      desc: lang === 'hi' ? 'रजिस्ट्री + जीआईएस' : 'Registry + GIS'
    },
    {
      num: 5,
      title: lang === 'hi' ? 'निर्णय (Verify)' : 'Verify',
      desc: lang === 'hi' ? 'अधिकारी अनुमोदन' : 'Officer decision'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <p className="text-base text-[var(--mute)]">
            {lang === 'hi'
              ? 'स्कैन किए गए खसरा पन्नों से लेकर अधिकारी द्वारा अनुमोदित अभिलेखों तक — एक एकीकृत मंच।'
              : 'From scanned khasra pages to officer-approved records, in one unified view.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigate('digitize')}
            className="px-3.5 py-2 rounded-lg bg-[var(--acc)] text-white text-xs font-bold hover:opacity-95 shadow-sm flex items-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{lang === 'hi' ? 'नया दस्तावेज़ स्कैन करें' : 'Scan New Document'}</span>
          </button>
        </div>
      </div>

      {/* Metrics Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 bg-[var(--surf)] border border-[var(--line)] rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs text-[var(--mute)] mb-1">
            <span>{lang === 'hi' ? 'डिजिटाइज्ड अभिलेख' : 'Records digitized'}</span>
            <FileText className="w-4 h-4 text-[var(--mute)]" />
          </div>
          <strong className="text-2xl sm:text-3xl font-black text-[var(--ink)] tracking-tight">
            {stats ? stats.recordsDigitized.toLocaleString('en-IN') : '18,420'}
          </strong>
          <span className="text-xs font-semibold text-[var(--acc)] mt-1">
            {stats?.coveragePercent || 84.5}% {lang === 'hi' ? 'कवरेज' : 'coverage'}
          </span>
        </div>

        <div className="p-4 sm:p-5 flex flex-col justify-between border-l border-[var(--line)]">
          <div className="flex items-center justify-between text-xs text-[var(--mute)] mb-1">
            <span>{lang === 'hi' ? 'क्रॉस-सत्यापित' : 'Cross-verified'}</span>
            <CheckCircle className="w-4 h-4 text-emerald-600" />
          </div>
          <strong className="text-2xl sm:text-3xl font-black text-[var(--ink)] tracking-tight">
            {stats ? stats.crossVerified.toLocaleString('en-IN') : '15,932'}
          </strong>
          <span className="text-xs font-semibold text-emerald-600 mt-1">
            {stats?.cleanPercent || 86.8}% {lang === 'hi' ? 'त्रुटिरहित' : 'clean'}
          </span>
        </div>

        <div className="p-4 sm:p-5 flex flex-col justify-between border-t md:border-t-0 md:border-l border-[var(--line)]">
          <div className="flex items-center justify-between text-xs text-[var(--mute)] mb-1">
            <span>{lang === 'hi' ? 'विसंगतियां (Discrepancies)' : 'Discrepancies'}</span>
            <AlertCircle className="w-4 h-4 text-amber-500" />
          </div>
          <strong className="text-2xl sm:text-3xl font-black text-[var(--ink)] tracking-tight">
            {stats ? stats.discrepancies.toLocaleString('en-IN') : '1,145'}
          </strong>
          <span className="text-xs font-semibold text-amber-600 mt-1">
            {lang === 'hi' ? 'समीक्षा आवश्यक' : 'Need review'}
          </span>
        </div>

        <div className="p-4 sm:p-5 flex flex-col justify-between border-t md:border-t-0 border-l border-[var(--line)] bg-[var(--warnbg)]/30">
          <div className="flex items-center justify-between text-xs text-[var(--mute)] mb-1">
            <span>{lang === 'hi' ? 'अधिकारी कतार' : 'Awaiting officer'}</span>
            <Clock className="w-4 h-4 text-[#a96200]" />
          </div>
          <strong className="text-2xl sm:text-3xl font-black text-[#a96200] tracking-tight">
            {stats?.awaitingOfficer ?? 2}
          </strong>
          <span className="text-xs font-bold text-[#a96200] mt-1">
            {lang === 'hi' ? 'सक्रिय कतार' : 'Live queue'}
          </span>
        </div>
      </div>

      {/* Main Grid: Pipeline + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Pipeline & Flow */}
        <div className="lg:col-span-7 space-y-6">
          {/* Validation Pipeline */}
          <section className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                <Layers className="w-4 h-4 text-[var(--acc)]" />
                <span>{lang === 'hi' ? 'सत्यापन पाइपलाइन' : 'Validation pipeline'}</span>
              </h3>
              <span className="text-xs text-[var(--mute)] font-medium">Tehsil Kharsia</span>
            </div>

            <div className="space-y-3.5">
              {pipeline.map((item, idx) => (
                <div key={idx} className="grid grid-cols-12 items-center gap-3 text-xs sm:text-sm">
                  <span className="col-span-4 font-medium text-[var(--ink)] truncate">
                    {item.label}
                  </span>
                  <div className="col-span-6 h-5 bg-[var(--line)] rounded-md overflow-hidden p-0.5">
                    <div
                      className="h-full bg-[var(--acc)] rounded-sm transition-all duration-500"
                      style={{ width: `${item.pct}%` }}
                    />
                  </div>
                  <b className="col-span-2 text-right font-bold text-[var(--ink)]">
                    {item.count.toLocaleString('en-IN')}
                  </b>
                </div>
              ))}
            </div>
          </section>

          {/* Record Movement Steps */}
          <section className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-[var(--ink)] mb-4">
              {lang === 'hi' ? 'अभिलेख का प्रवाह' : 'How a record moves'}
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              {steps.map((s) => (
                <div key={s.num} className="border-l-3 border-[var(--acc)] pl-2.5 py-1">
                  <b className="block text-xs sm:text-sm font-bold text-[var(--ink)]">
                    {s.num}. {s.title}
                  </b>
                  <small className="text-[var(--mute)] text-[11px] block mt-0.5 leading-tight">
                    {s.desc}
                  </small>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Right Column: Recent Activity Feed from Audit Blockchain */}
        <div className="lg:col-span-5">
          <section className="bg-[var(--surf)] border border-[var(--line)] rounded-xl p-5 shadow-sm flex flex-col h-full justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-bold text-[var(--ink)] flex items-center gap-2">
                  <Shield className="w-4 h-4 text-[var(--acc)]" />
                  <span>{lang === 'hi' ? 'हाल की गतिविधि (ऑडिट)' : 'Recent activity'}</span>
                </h3>
                <span className="badge badge-ok">SHA-256</span>
              </div>

              <div className="divide-y divide-[var(--line)]">
                {auditTrail.slice(-5).reverse().map((entry, idx) => (
                  <div key={idx} className="py-2.5 flex items-start justify-between gap-3 text-xs">
                    <div className="space-y-0.5">
                      <b className="text-[var(--ink)] font-semibold block leading-snug">
                        {entry.msg}
                      </b>
                      <p className="text-[var(--mute)] text-[11px]">
                        {entry.t} · {entry.officer.split('(')[0]}
                      </p>
                    </div>
                    <code className="text-[10px] text-[var(--acc)] font-mono shrink-0 bg-[var(--bg)] px-1.5 py-0.5 rounded border border-[var(--line)]">
                      #{entry.h.slice(0, 6)}
                    </code>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[var(--line)] flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => onNavigate('review')}
                className="w-full py-2.5 px-3 rounded-lg bg-[var(--acc)] text-white text-xs font-bold hover:opacity-90 transition-all flex items-center justify-center gap-1.5 shadow-sm"
              >
                <span>
                  {lang === 'hi'
                    ? `समीक्षा कतार खोलें (${stats?.awaitingOfficer ?? 2})`
                    : `Open review queue (${stats?.awaitingOfficer ?? 2})`}
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => onNavigate('audit')}
                className="w-full sm:w-auto py-2.5 px-3 rounded-lg border border-[var(--line)] bg-[var(--surf)] hover:bg-[var(--bg)] text-xs font-bold text-[var(--ink)] transition-colors"
              >
                {lang === 'hi' ? 'पूरा लेज़र' : 'Full Ledger'}
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
