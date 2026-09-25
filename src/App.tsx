import React, { useEffect, useState, useCallback } from 'react';
import type { Parcel, AuditBlock, SystemStats } from './types/index.ts';
import { fetchParcels, fetchAuditTrail, fetchStats } from './services/api.ts';
import { Sidebar } from './components/Sidebar.tsx';
import { Header } from './components/Header.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { DigitizeView } from './components/DigitizeView.tsx';
import { ChainView } from './components/ChainView.tsx';
import { ValidateView } from './components/ValidateView.tsx';
import { GisView } from './components/GisView.tsx';
import { ReviewView } from './components/ReviewView.tsx';
import { AuditView } from './components/AuditView.tsx';
import { Menu, X } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<string>('dashboard');
  const [selectedParcelId, setSelectedParcelId] = useState<string>('88/1');
  const [tolerance, setTolerance] = useState<number>(5);
  const [lang, setLang] = useState<'en' | 'hi'>('en');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  // Data states
  const [parcels, setParcels] = useState<any[]>([]);
  const [auditTrail, setAuditTrail] = useState<AuditBlock[]>([]);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Initialize theme and lang from localStorage
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('bs-theme') as 'light' | 'dark' | null;
      if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.dataset.theme = savedTheme;
      } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setTheme('dark');
        document.documentElement.dataset.theme = 'dark';
      }

      const savedLang = localStorage.getItem('bs-lang') as 'en' | 'hi' | null;
      if (savedLang) {
        setLang(savedLang);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  const handleToggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    try {
      localStorage.setItem('bs-theme', nextTheme);
    } catch (e) {}
  };

  const handleToggleLang = () => {
    const nextLang = lang === 'en' ? 'hi' : 'en';
    setLang(nextLang);
    try {
      localStorage.setItem('bs-lang', nextLang);
    } catch (e) {}
  };

  // Fetch full dataset from backend REST API
  const loadData = useCallback(async () => {
    try {
      const [fetchedParcels, fetchedAudit, fetchedStats] = await Promise.all([
        fetchParcels(tolerance),
        fetchAuditTrail(),
        fetchStats(tolerance),
      ]);
      setParcels(fetchedParcels);
      setAuditTrail(fetchedAudit);
      setStats(fetchedStats);
      setIsBackendConnected(true);
    } catch (err) {
      console.warn('Backend fetch failed, retrying in 3s:', err);
      setIsBackendConnected(false);
    } finally {
      setLoading(false);
    }
  }, [tolerance]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 10000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Number of parcels awaiting officer review
  const pendingCount = parcels.filter(
    (p) => !p.status && p.reasons?.length > 0
  ).length;

  const viewTitles: Record<string, { en: string; hi: string; subEn: string; subHi: string }> = {
    dashboard: {
      en: 'Dashboard',
      hi: 'डैशबोर्ड',
      subEn: 'Revenue Administration · Tehsil Office Kharsia · Dist: Raigarh',
      subHi: 'राजस्व प्रशासन · तहसील कार्यालय खरसिया · जिला: रायगढ़',
    },
    digitize: {
      en: 'Digitize & OCR',
      hi: 'डिजिटाइज और ओसीआर',
      subEn: 'Multilingual Indian Land Record Document Extraction',
      subHi: 'बहुभाषी भारतीय भू-अभिलेख दस्तावेज़ निष्कर्षण',
    },
    chain: {
      en: 'Ownership Chain',
      hi: 'स्वामित्व शृंखला',
      subEn: 'Historical Title & Mutation Chronology',
      subHi: 'ऐतिहासिक हक एवं नामांतरण कालक्रम',
    },
    validate: {
      en: 'Cross Validation',
      hi: 'क्रॉस सत्यापन',
      subEn: 'Historical Records vs Computerized Register vs Cadastral GIS',
      subHi: 'ऐतिहासिक अभिलेख बनाम कम्प्यूटरीकृत पंजी बनाम जीआईएस नक्शा',
    },
    gis: {
      en: 'GIS Cadastral Intelligence',
      hi: 'जीआईएस भू-नक्शा आसूचना',
      subEn: 'Geo-referenced Cadastral Boundary Analysis',
      subHi: 'भू-संदर्भित भूकर सीमा विश्लेषण',
    },
    review: {
      en: 'Human Verification Queue',
      hi: 'मानव सत्यापन कतार',
      subEn: 'Revenue Officer Adjudication & Decision Desk',
      subHi: 'सक्षम राजस्व अधिकारी निर्णय एवं अनुमोदन पटल',
    },
    audit: {
      en: 'Audit & Cryptographic Security',
      hi: 'ऑडिट व क्रिप्टोग्राफिक सुरक्षा',
      subEn: 'Tamper-Evident SHA-256 Revenue Ledger',
      subHi: 'अपरिवर्तनीय SHA-256 डिजिटल राजस्व लेज़र',
    },
  };

  const currentInfo = viewTitles[view] || viewTitles.dashboard;

  return (
    <div className="flex min-h-screen bg-[var(--bg)] text-[var(--ink)]">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar
          currentView={view}
          onViewChange={setView}
          pendingCount={pendingCount}
          lang={lang}
        />
      </div>

      {/* Mobile Sidebar overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="relative z-10 w-72 bg-[#12332f] h-full shadow-2xl">
            <div className="p-4 flex justify-between items-center border-b border-[#2c5a51]">
              <span className="text-white font-bold text-sm">Bhoomi-Setu AI</span>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <Sidebar
              currentView={view}
              onViewChange={(v) => {
                setView(v);
                setMobileMenuOpen(false);
              }}
              pendingCount={pendingCount}
              lang={lang}
            />
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile top strip for toggling sidebar */}
        <div className="md:hidden bg-[#12332f] text-white px-4 py-2.5 flex items-center justify-between">
          <button
            onClick={() => setMobileMenuOpen(true)}
            className="p-1 rounded-md bg-[#1d4a43] text-white flex items-center gap-1.5 text-xs font-semibold"
          >
            <Menu className="w-4 h-4" />
            <span>Menu</span>
          </button>
          <span className="font-extrabold text-sm text-[#e0951f]">भू Bhoomi-Setu</span>
        </div>

        <Header
          title={lang === 'hi' ? currentInfo.hi : currentInfo.en}
          subtitle={lang === 'hi' ? currentInfo.subHi : currentInfo.subEn}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          lang={lang}
          onToggleLang={handleToggleLang}
          isBackendConnected={isBackendConnected}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {loading && parcels.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center gap-3 text-[var(--mute)]">
              <div className="w-8 h-8 rounded-full border-2 border-[var(--acc)] border-t-transparent animate-spin" />
              <p className="text-xs font-semibold">
                Initializing Bhoomi-Setu Cadastral Database & Ledger...
              </p>
            </div>
          ) : (
            <>
              {view === 'dashboard' && (
                <DashboardView
                  stats={stats}
                  auditTrail={auditTrail}
                  onNavigate={setView}
                  lang={lang}
                />
              )}

              {view === 'digitize' && (
                <DigitizeView
                  parcels={parcels}
                  selectedParcelId={selectedParcelId}
                  onFieldUpdated={loadData}
                  lang={lang}
                />
              )}

              {view === 'chain' && (
                <ChainView
                  parcels={parcels}
                  selectedParcelId={selectedParcelId}
                  onSelectParcel={setSelectedParcelId}
                  onNavigate={setView}
                  tolerance={tolerance}
                  lang={lang}
                />
              )}

              {view === 'validate' && (
                <ValidateView
                  parcels={parcels}
                  selectedParcelId={selectedParcelId}
                  onSelectParcel={setSelectedParcelId}
                  tolerance={tolerance}
                  onToleranceChange={setTolerance}
                  onNavigate={setView}
                  lang={lang}
                />
              )}

              {view === 'gis' && (
                <GisView
                  parcels={parcels}
                  selectedParcelId={selectedParcelId}
                  onSelectParcel={setSelectedParcelId}
                  tolerance={tolerance}
                  onToleranceChange={setTolerance}
                  onNavigate={setView}
                  lang={lang}
                />
              )}

              {view === 'review' && (
                <ReviewView
                  parcels={parcels}
                  onDecisionComplete={loadData}
                  lang={lang}
                />
              )}

              {view === 'audit' && (
                <AuditView
                  auditTrail={auditTrail}
                  onRefresh={loadData}
                  lang={lang}
                />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
