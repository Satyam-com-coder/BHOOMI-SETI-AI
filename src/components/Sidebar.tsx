import React from 'react';
import {
  LayoutDashboard,
  UploadCloud,
  GitBranch,
  CheckCircle2,
  MapPin,
  AlertTriangle,
  ShieldCheck,
  Building2
} from 'lucide-react';

interface SidebarProps {
  currentView: string;
  onViewChange: (view: string) => void;
  pendingCount: number;
  lang: 'en' | 'hi';
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentView,
  onViewChange,
  pendingCount,
  lang
}) => {
  const navItems = [
    {
      id: 'dashboard',
      labelEn: 'Dashboard',
      labelHi: 'डैशबोर्ड',
      icon: LayoutDashboard
    },
    {
      id: 'digitize',
      labelEn: 'Digitize & OCR',
      labelHi: 'डिजिटाइज और ओसीआर',
      icon: UploadCloud
    },
    {
      id: 'chain',
      labelEn: 'Ownership Chain',
      labelHi: 'स्वामित्व श्रृंखला',
      icon: GitBranch
    },
    {
      id: 'validate',
      labelEn: 'Cross Validation',
      labelHi: 'क्रॉस सत्यापन',
      icon: CheckCircle2
    },
    {
      id: 'gis',
      labelEn: 'GIS Intelligence',
      labelHi: 'जीआईएस भू-नक्शा',
      icon: MapPin
    },
    {
      id: 'review',
      labelEn: 'Human Verification',
      labelHi: 'अधिकारी सत्यापन',
      icon: AlertTriangle,
      badge: pendingCount
    },
    {
      id: 'audit',
      labelEn: 'Audit & Security',
      labelHi: 'ऑडिट व ब्लॉकचेन',
      icon: ShieldCheck
    }
  ];

  return (
    <aside className="w-64 bg-[#12332f] text-[#dcebe5] p-5 flex flex-col justify-between shrink-0 h-screen sticky top-0 overflow-y-auto">
      <div>
        {/* Brand */}
        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#2c5a51]">
          <div className="w-10 h-10 rounded-lg rounded-bl-sm bg-[#e0951f] text-[#2a1a00] font-black text-xl flex items-center justify-center shadow-md">
            भू
          </div>
          <div>
            <b className="block text-base tracking-wide text-white leading-tight">
              Bhoomi-Setu AI
            </b>
            <small className="text-[#9fc0b3] text-xs font-medium">
              {lang === 'hi' ? 'भू-अभिलेख आसूचना' : 'Land Record Intelligence'}
            </small>
          </div>
        </div>

        {/* Navigation list */}
        <nav className="flex flex-col gap-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onViewChange(item.id)}
                className={`flex items-center gap-3 w-full text-left px-3.5 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[#f3f7f5] text-[#12332f] font-bold shadow-sm'
                    : 'text-[#cfe2da] hover:bg-[#1d4a43] hover:text-white font-medium'
                }`}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-[#1f6f5c]' : 'text-[#9fc0b3]'}`} />
                <span className="truncate">{lang === 'hi' ? item.labelHi : item.labelEn}</span>
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="ml-auto bg-[#e0951f] text-[#2a1a00] font-black text-xs px-2 py-0.5 rounded-full shadow-sm">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tehsil Office Badge & Info */}
      <div className="pt-4 border-t border-[#2c5a51] text-xs text-[#9fc0b3] space-y-1">
        <div className="flex items-center gap-1.5 text-white font-semibold">
          <Building2 className="w-3.5 h-3.5 text-[#e0951f]" />
          <span>Tehsil Kharsia · Raigarh</span>
        </div>
        <div className="flex justify-between items-center text-[11px]">
          <span>SIH26018 Smart Automation</span>
          <span className="text-[#4fc3a1] font-mono">v2.4 API</span>
        </div>
      </div>
    </aside>
  );
};
