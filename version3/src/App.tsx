import { useMemo, useRef, useState } from 'react';
import {
  Download,
  Eye,
  FileDown,
  FileText,
  Highlighter,
  Printer,
  Scale,
  Sparkles,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { A4DocumentPreview } from './components/A4DocumentPreview';
import { DeedFormSidebar } from './components/DeedFormSidebar';
import { INITIAL_SALE_DEED_DATA, SaleDeedData } from './types/deed';
import {
  calculateDeedMetrics,
  formatIndianNumber,
  formatSqMtr,
} from './utils/calculations';
import { exportToClassicDoc, exportToDocx } from './utils/wordExport';

export function App() {
  const [deedData, setDeedData] = useState<SaleDeedData>(INITIAL_SALE_DEED_DATA);
  const [activeTab, setActiveTab] = useState<number>(1);
  const [selectedPageFilter, setSelectedPageFilter] = useState<number | 'all'>('all');
  const [showHighlights, setShowHighlights] = useState<boolean>(true);
  const [zoom, setZoom] = useState<number>(0.85);
  const [isExportingDocx, setIsExportingDocx] = useState<boolean>(false);
  const [mobileView, setMobileView] = useState<'split' | 'form' | 'preview'>('split');

  const pageRefs = useRef<(HTMLDivElement | null)[]>([]);
  const previewScrollContainerRef = useRef<HTMLDivElement | null>(null);

  const metrics = useMemo(() => calculateDeedMetrics(deedData), [deedData]);

  const handleFieldChange = <K extends keyof SaleDeedData>(
    key: K,
    value: SaleDeedData[K]
  ) => {
    setDeedData((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleBatchUpdate = (updates: Partial<SaleDeedData>) => {
    setDeedData((prev) => ({
      ...prev,
      ...updates,
    }));
  };

  const handleResetDefaults = () => {
    setDeedData(INITIAL_SALE_DEED_DATA);
    setSelectedPageFilter('all');
  };

  const handleScrollToPage = (pageNumber: number) => {
    if (selectedPageFilter !== 'all' && selectedPageFilter !== pageNumber) {
      setSelectedPageFilter(pageNumber);
      return;
    }
    const targetEl = pageRefs.current[pageNumber - 1];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectSectionFromPreview = (tabIndex: number) => {
    setActiveTab(tabIndex);
  };

  const handleDownloadDocx = async () => {
    try {
      setIsExportingDocx(true);
      await exportToDocx(deedData, metrics);
    } finally {
      setIsExportingDocx(false);
    }
  };

  const handleDownloadClassicDoc = () => {
    exportToClassicDoc(deedData, metrics);
  };

  const handlePrintA4 = () => {
    // Ensure all 6 pages are rendered when printing
    if (selectedPageFilter !== 'all') {
      setSelectedPageFilter('all');
      setTimeout(() => {
        window.print();
      }, 150);
    } else {
      window.print();
    }
  };

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#F4F1EA] text-zinc-900 overflow-x-hidden">
      {/* ==================== STICKY TOP HEADER BAR ==================== */}
      <header className="no-print sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-zinc-200 px-3 sm:px-5 py-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Brand Title */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[#1E3A8A] text-white flex items-center justify-center shadow-xs">
              <Scale className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-zinc-900 tracking-tight">
                  6-Page Sale Deed Word Generator
                </h1>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-900 border border-amber-300">
                  A4 Legal Format
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 hidden sm:block">
                Auto-calculates Plot Sq.Yds → Sq.Mtr, Valuation &amp; Stamp Duty +
                Seller, Buyer, Property &amp; Witnesses
              </p>
            </div>
          </div>

          {/* Instant 40 Yds <-> 50 Yds Quick Switcher in Header */}
          <div className="flex items-center gap-1.5 bg-blue-50/90 border border-blue-200 px-2.5 py-1 rounded-xl">
            <Sparkles className="w-3.5 h-3.5 text-[#1E3A8A] shrink-0" />
            <span className="text-[11px] font-semibold text-zinc-700 mr-1">
              Plot Size:
            </span>
            {[40, 50, 52].map((yds) => (
              <button
                key={yds}
                type="button"
                onClick={() => {
                  handleBatchUpdate({
                    plotAreaSqYds: yds,
                    propertySqYdsPage2:
                      yds === 40 && !deedData.syncPropertySqYdsWithPage1 ? 52 : yds,
                  });
                  handleScrollToPage(1);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-bold font-mono-num transition-all cursor-pointer ${
                  Number(deedData.plotAreaSqYds) === yds
                    ? 'bg-[#1E3A8A] text-white shadow-2xs'
                    : 'bg-white text-zinc-700 hover:bg-blue-100 border border-zinc-200'
                }`}
              >
                {yds} Yds
              </button>
            ))}
            <div className="hidden md:flex items-center gap-1.5 pl-2 ml-1 border-l border-blue-200 text-xs">
              <span className="text-zinc-500">=</span>
              <span className="font-mono-num font-bold text-emerald-800">
                {formatSqMtr(metrics.plotAreaSqMtr)} Sq.Mtr
              </span>
              <span className="text-zinc-400">|</span>
              <span className="font-mono-num font-bold text-[#1E3A8A]">
                Rs.{formatIndianNumber(metrics.stampDutyPaidOnAmount)}/-
              </span>
            </div>
          </div>

          {/* Primary Export & Print Buttons */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDownloadDocx}
              disabled={isExportingDocx}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExportingDocx ? 'Generating...' : 'Download .DOCX'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadClassicDoc}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              title="Download Classic Microsoft Word (.doc) file"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Word .DOC</span>
            </button>

            <button
              type="button"
              onClick={handlePrintA4}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-semibold text-xs shadow-xs transition-all cursor-pointer"
              title="Print all 6 A4 sheets or Save as PDF"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print / A4 PDF</span>
            </button>
          </div>
        </div>

        {/* Mobile View Switcher */}
        <div className="flex lg:hidden items-center justify-center gap-2 mt-2 pt-2 border-t border-zinc-100">
          {[
            { id: 'split', label: 'Split View' },
            { id: 'form', label: 'Fill Details Form' },
            { id: 'preview', label: '6-Page A4 Preview' },
          ].map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setMobileView(m.id as 'split' | 'form' | 'preview')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold ${
                mobileView === m.id
                  ? 'bg-[#1E3A8A] text-white'
                  : 'bg-zinc-100 text-zinc-600'
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
      </header>

      {/* ==================== MAIN WORKSPACE SPLIT VIEW ==================== */}
      <div className="flex-1 flex flex-col lg:flex-row lg:overflow-hidden print-container">
        {/* LEFT SIDEBAR: FORM & AUTO-CALCULATOR */}
        <aside
          className={`no-print w-full lg:w-[440px] xl:w-[470px] shrink-0 lg:h-full lg:overflow-hidden ${
            mobileView === 'preview' ? 'hidden lg:block' : 'block'
          }`}
        >
          <DeedFormSidebar
            data={deedData}
            metrics={metrics}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onChange={handleFieldChange}
            onBatchUpdate={handleBatchUpdate}
            onResetDefaults={handleResetDefaults}
            onScrollToPage={handleScrollToPage}
          />
        </aside>

        {/* RIGHT WORKSPACE: 6 A4 PAGES LIVE DOCUMENT PREVIEW */}
        <main
          ref={previewScrollContainerRef}
          className={`flex-1 flex flex-col bg-[#E4E2DD] lg:h-full lg:overflow-y-auto print-container ${
            mobileView === 'form' ? 'hidden lg:flex' : 'flex'
          }`}
        >
          {/* Floating Page Jump & Zoom Toolbar */}
          <div className="no-print sticky top-0 z-20 bg-[#E4E2DD]/95 backdrop-blur-xs border-b border-zinc-300/80 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            {/* Page Filter / Jump Pills */}
            <div className="flex items-center gap-1 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mr-1 flex items-center gap-1">
                <FileText className="w-3.5 h-3.5" />
                A4 Pages:
              </span>
              <button
                type="button"
                onClick={() => setSelectedPageFilter('all')}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                  selectedPageFilter === 'all'
                    ? 'bg-[#1E3A8A] text-white shadow-2xs'
                    : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-300'
                }`}
              >
                All 6 Pages
              </button>
              {[1, 2, 3, 4, 5, 6].map((pageNum) => (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => {
                    if (selectedPageFilter === 'all') {
                      handleScrollToPage(pageNum);
                    } else {
                      setSelectedPageFilter(pageNum);
                    }
                  }}
                  onDoubleClick={() => setSelectedPageFilter(pageNum)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold cursor-pointer transition-all ${
                    selectedPageFilter === pageNum
                      ? 'bg-[#1E3A8A] text-white shadow-2xs'
                      : 'bg-white text-zinc-700 hover:bg-zinc-100 border border-zinc-300'
                  }`}
                  title={`Click to jump to Page ${pageNum}`}
                >
                  Pg {pageNum}
                </button>
              ))}
            </div>

            {/* Highlight Toggle & Zoom Controls */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowHighlights((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border cursor-pointer transition-all ${
                  showHighlights
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-white text-zinc-600 border-zinc-300'
                }`}
                title="Toggle highlight markers on dynamic fields (never shown when printing)"
              >
                {showHighlights ? (
                  <Highlighter className="w-3.5 h-3.5 text-amber-700" />
                ) : (
                  <Eye className="w-3.5 h-3.5" />
                )}
                <span>{showHighlights ? 'Highlights: ON' : 'Clean Paper View'}</span>
              </button>

              <div className="hidden sm:flex items-center bg-white rounded-lg border border-zinc-300 px-1 py-0.5">
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.max(0.6, Number((z - 0.1).toFixed(2))))}
                  className="p-1 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="px-2 text-[11px] font-mono-num font-semibold text-zinc-700">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  onClick={() => setZoom((z) => Math.min(1.15, Number((z + 0.1).toFixed(2))))}
                  className="p-1 text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* A4 Paper Stack Container */}
          <div className="flex-1 py-6 px-2 sm:px-6 overflow-x-auto print-container">
            <div
              className="print-scale-reset origin-top transition-transform duration-150 mx-auto"
              style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top center',
                marginBottom: zoom < 1 ? `-${(1 - zoom) * 1600}px` : '0px',
              }}
            >
              <A4DocumentPreview
                data={deedData}
                metrics={metrics}
                activeTab={activeTab}
                selectedPageFilter={selectedPageFilter}
                showHighlights={showHighlights}
                onSelectSection={handleSelectSectionFromPreview}
                pageRefs={pageRefs}
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

export default App;
