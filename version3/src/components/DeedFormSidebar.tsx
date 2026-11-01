import React from 'react';
import {
  Building2,
  Calculator,
  CheckCircle2,
  Sparkles,
  Users,
  UserCheck,
  ArrowRight,
  RotateCcw,
} from 'lucide-react';
import {
  CalculatedDeedMetrics,
  DELHI_CATEGORY_RATES,
  DutyGenderLabel,
  HonorificType,
  RelationType,
  SaleAmountMode,
  SaleDeedData,
  ShortRelationType,
} from '../types/deed';
import { formatIndianNumber, formatSqMtr } from '../utils/calculations';

interface DeedFormSidebarProps {
  data: SaleDeedData;
  metrics: CalculatedDeedMetrics;
  activeTab: number;
  setActiveTab: (tab: number) => void;
  onChange: <K extends keyof SaleDeedData>(key: K, value: SaleDeedData[K]) => void;
  onBatchUpdate: (updates: Partial<SaleDeedData>) => void;
  onResetDefaults: () => void;
  onScrollToPage: (pageNumber: number) => void;
}

const HONORIFICS: HonorificType[] = ['SHRI', 'SMT.', 'KUMARI', 'MR.', 'MS.', 'M/S'];
const RELATIONS: RelationType[] = ['SON OF', 'DAUGHTER OF', 'WIFE OF', 'CARE OF'];
const SHORT_RELATIONS: { label: string; value: ShortRelationType }[] = [
  { label: 'S/O (Son of)', value: 'S/O' },
  { label: 'D/O (Daughter of)', value: 'D/O' },
  { label: 'W/O (Wife of)', value: 'W/O' },
  { label: 'C/O (Care of)', value: 'C/O' },
];

const FLOOR_PRESETS = [
  '(ENTIRE THIRD FLOOR WITH ROOF RIGHTS)',
  '(ENTIRE GROUND FLOOR WITHOUT ROOF RIGHTS)',
  '(ENTIRE FIRST FLOOR WITHOUT ROOF RIGHTS)',
  '(ENTIRE SECOND FLOOR WITHOUT ROOF RIGHTS)',
  '(ENTIRE UPPER GROUND FLOOR WITHOUT ROOF RIGHTS)',
  '(ENTIRE BUILT-UP PROPERTY WITH ROOF RIGHTS)',
];

function formatAadharInput(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(0, 12);
  const parts: string[] = [];
  for (let i = 0; i < digits.length; i += 4) {
    parts.push(digits.slice(i, i + 4));
  }
  return parts.length > 0 ? parts.join('-') : raw;
}

export const DeedFormSidebar: React.FC<DeedFormSidebarProps> = ({
  data,
  metrics,
  activeTab,
  setActiveTab,
  onChange,
  onBatchUpdate,
  onResetDefaults,
  onScrollToPage,
}) => {
  const tabs = [
    {
      id: 1,
      title: '1. Valuation',
      subtitle: 'Page 1 & 4 Calc',
      icon: Calculator,
      targetPage: 1,
    },
    {
      id: 2,
      title: '2. Buyer & Seller',
      subtitle: 'Page 2 Parties',
      icon: Users,
      targetPage: 2,
    },
    {
      id: 3,
      title: '3. Property & Floor',
      subtitle: 'Page 2 & 3 Address',
      icon: Building2,
      targetPage: 2,
    },
    {
      id: 4,
      title: '4. Witnesses',
      subtitle: 'Page 6 Details',
      icon: UserCheck,
      targetPage: 6,
    },
  ];

  const handleSelectPlotSqYds = (sqYds: number, syncPage2 = true) => {
    const updates: Partial<SaleDeedData> = {
      plotAreaSqYds: sqYds,
    };
    if (syncPage2 || data.syncPropertySqYdsWithPage1) {
      updates.propertySqYdsPage2 = sqYds;
    }
    onBatchUpdate(updates);
    onScrollToPage(1);
  };

  const handleCategoryChange = (cat: string) => {
    const preset = DELHI_CATEGORY_RATES[cat];
    if (preset) {
      onBatchUpdate({
        category: cat,
        govLandRatePerSqMtr: preset.landRate,
        govConstRatePerSqMtr: preset.constRate,
      });
    } else {
      onChange('category', cat);
    }
  };

  const handleDutyGenderPreset = (gender: DutyGenderLabel) => {
    if (gender === 'For Male') {
      onBatchUpdate({
        dutyGenderLabel: 'For Male',
        corpDutyPercent: 3,
        stampDutyPercent: 3,
      });
    } else if (gender === 'For Female') {
      onBatchUpdate({
        dutyGenderLabel: 'For Female',
        corpDutyPercent: 2,
        stampDutyPercent: 2,
      });
    } else {
      onBatchUpdate({
        dutyGenderLabel: 'For Joint (Male & Female)',
        corpDutyPercent: 2.5,
        stampDutyPercent: 2.5,
      });
    }
  };

  return (
    <div className="flex flex-col h-full bg-white border-r border-zinc-200 select-none">
      {/* Step Navigation Tabs */}
      <div className="grid grid-cols-4 border-b border-zinc-200 bg-zinc-50/80 p-1.5 gap-1">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                onScrollToPage(tab.targetPage);
              }}
              className={`flex flex-col items-center justify-center py-2 px-1.5 rounded-lg text-center transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#1E3A8A] text-white shadow-xs'
                  : 'text-zinc-600 hover:bg-zinc-200/60 hover:text-zinc-900'
              }`}
            >
              <Icon className="w-4 h-4 mb-1" />
              <span className="text-[11px] font-semibold leading-tight">
                {tab.title}
              </span>
              <span
                className={`text-[9.5px] leading-tight mt-0.5 ${
                  isActive ? 'text-blue-100' : 'text-zinc-400'
                }`}
              >
                {tab.subtitle}
              </span>
            </button>
          );
        })}
      </div>

      {/* Scrollable Form Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        {/* ==================== TAB 1: PAGE 1 AUTO CALCULATOR ==================== */}
        {activeTab === 1 && (
          <div className="space-y-4">
            {/* Highlight Banner for 40 yds -> 50 yds automatic calculation */}
            <div className="rounded-xl bg-gradient-to-br from-blue-50 via-indigo-50/60 to-amber-50/40 border border-blue-200 p-3.5">
              <div className="flex items-center justify-between mb-2">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  Page 1 Automatic Yard Calculator
                </span>
                <button
                  type="button"
                  onClick={onResetDefaults}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-zinc-600 hover:text-zinc-900 cursor-pointer"
                  title="Reset to Reference Image Defaults"
                >
                  <RotateCcw className="w-3 h-3" />
                  Reset 40 Yds
                </button>
              </div>
              <p className="text-xs text-zinc-600 mb-3 leading-relaxed">
                Change Plot Area (e.g. <strong>40 sq.yds to 50 sq.yds</strong>) and
                Page 1 &amp; Page 4 automatically calculate Sq.Mtr, Plinth Area, Land
                Value, Construction Value, Total Value &amp; Stamp Duty.
              </p>

              {/* Quick Yardage Switcher Pills */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  { label: '40 Sq.Yds (Ref)', value: 40 },
                  { label: '50 Sq.Yds', value: 50 },
                  { label: '52 Sq.Yds', value: 52 },
                  { label: '60 Sq.Yds', value: 60 },
                  { label: '75 Sq.Yds', value: 75 },
                  { label: '100 Sq.Yds', value: 100 },
                ].map((preset) => (
                  <button
                    key={preset.value}
                    type="button"
                    onClick={() => handleSelectPlotSqYds(preset.value, preset.value !== 40)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border ${
                      Number(data.plotAreaSqYds) === preset.value
                        ? 'bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-xs'
                        : 'bg-white text-zinc-700 border-zinc-300 hover:border-blue-500 hover:text-blue-900'
                    }`}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>

              {/* Main Plot Area Input & Live Sq.Mtr Readout */}
              <div className="grid grid-cols-2 gap-3 bg-white/90 p-2.5 rounded-lg border border-blue-200/80">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Plot Area (in Sq. Yards)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="any"
                      min="1"
                      value={data.plotAreaSqYds}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value) || 0;
                        onChange('plotAreaSqYds', val);
                      }}
                      className="w-full h-9 px-3 pr-14 rounded-md border border-blue-400 bg-white text-sm font-bold text-zinc-900 font-mono-num focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    />
                    <span className="absolute right-2.5 top-2 text-xs font-medium text-zinc-400">
                      sq.yds
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Auto Area in Sq. Mtr.
                  </label>
                  <div className="h-9 px-3 rounded-md bg-emerald-50 border border-emerald-200 flex items-center justify-between">
                    <span className="text-sm font-bold text-emerald-800 font-mono-num">
                      {formatSqMtr(metrics.plotAreaSqMtr)}
                    </span>
                    <span className="text-[11px] font-medium text-emerald-600">
                      Sq. Mtr.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Colony & Category Section */}
            <div className="space-y-3 bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Colony, Category &amp; Plinth Multipliers
              </h3>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Name of Colony / Area (Page 1)
                  </label>
                  <input
                    type="text"
                    value={data.colonyAreaPage1}
                    onChange={(e) => onChange('colonyAreaPage1', e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="DASHRATH PURI"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Category
                  </label>
                  <select
                    value={data.category}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="w-full h-9 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  >
                    {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'].map((cat) => (
                      <option key={cat} value={cat}>
                        Category “{cat}”
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Land Use
                  </label>
                  <input
                    type="text"
                    value={data.landUse}
                    onChange={(e) => onChange('landUse', e.target.value)}
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Construction Multiplier (X{data.constructionMultiplier}X)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    step="1"
                    value={data.constructionMultiplier}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value) || 1;
                      onBatchUpdate({
                        constructionMultiplier: val,
                        totalFloorsMultiplier: val,
                      });
                    }}
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-mono-num font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>

              {/* Government Rates */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Govt. Land Rate (Rs./Sq.Mtr)
                  </label>
                  <input
                    type="number"
                    value={data.govLandRatePerSqMtr}
                    onChange={(e) =>
                      onChange('govLandRatePerSqMtr', parseFloat(e.target.value) || 0)
                    }
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-mono-num font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Govt. Const. Rate (Rs./Sq.Mtr)
                  </label>
                  <input
                    type="number"
                    value={data.govConstRatePerSqMtr}
                    onChange={(e) =>
                      onChange('govConstRatePerSqMtr', parseFloat(e.target.value) || 0)
                    }
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-mono-num font-semibold focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              </div>
            </div>

            {/* Live Computed Valuation Breakdown Card */}
            <div className="rounded-xl bg-zinc-900 text-white p-3.5 space-y-2 shadow-sm">
              <div className="flex items-center justify-between text-xs text-zinc-400 border-b border-zinc-800 pb-1.5">
                <span>Auto-Calculated Valuation Summary</span>
                <span className="font-mono-num text-amber-400">
                  {data.plotAreaSqYds} sq.yds = {formatSqMtr(metrics.plotAreaSqMtr)}{' '}
                  Sq.Mtr
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">
                  Total Plinth Area (×{data.totalFloorsMultiplier}):
                </span>
                <span className="font-mono-num font-semibold">
                  {formatSqMtr(metrics.totalPlinthAreaSqMtr)} Sq.Mtrs.
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Minimum Value of Land:</span>
                <span className="font-mono-num font-semibold text-emerald-300">
                  Rs.{formatIndianNumber(metrics.minLandValue)}/-
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-zinc-300">Minimum Value of Construction:</span>
                <span className="font-mono-num font-semibold text-emerald-300">
                  Rs.{formatIndianNumber(metrics.minConstructionValue)}/-
                </span>
              </div>
              <div className="flex justify-between text-xs pt-1.5 border-t border-zinc-800">
                <span className="font-semibold text-white">
                  Total Value of Property:
                </span>
                <span className="font-mono-num font-bold text-amber-300 text-sm">
                  Rs.{formatIndianNumber(metrics.totalPropertyValue)}/-
                </span>
              </div>
            </div>

            {/* Sale Consideration & Stamp Duty Paid On */}
            <div className="space-y-3 bg-zinc-50/70 p-3.5 rounded-xl border border-zinc-200">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Sale Deed Amount &amp; Stamp Duty Calculation
              </h3>

              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  How to set &quot;Total stamp duty paid on&quot; / Sale Deed Amount:
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    {
                      id: 'round_lakh' as SaleAmountMode,
                      label: 'Auto Next Lakh',
                      desc: '24.75L → 25L',
                    },
                    {
                      id: 'exact_valuation' as SaleAmountMode,
                      label: 'Exact Value',
                      desc: `Rs.${formatIndianNumber(metrics.totalPropertyValue)}`,
                    },
                    {
                      id: 'custom' as SaleAmountMode,
                      label: 'Custom Amount',
                      desc: 'Enter manually',
                    },
                  ].map((mode) => (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => onChange('saleAmountMode', mode.id)}
                      className={`p-2 rounded-lg border text-left transition-all cursor-pointer ${
                        data.saleAmountMode === mode.id
                          ? 'bg-blue-50 border-[#1E3A8A] text-[#1E3A8A]'
                          : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                      }`}
                    >
                      <div className="text-[11px] font-bold">{mode.label}</div>
                      <div className="text-[10px] opacity-80 truncate">{mode.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {data.saleAmountMode === 'custom' && (
                <div>
                  <label className="block text-xs font-medium text-zinc-700 mb-1">
                    Custom Sale Consideration / Stamp Duty Paid On (Rs.)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={data.customSaleAmount}
                    onChange={(e) =>
                      onChange('customSaleAmount', parseFloat(e.target.value) || 0)
                    }
                    className="w-full h-9 px-3 rounded-md border border-blue-400 bg-white text-sm font-mono-num font-bold focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  />
                </div>
              )}

              <div className="p-2.5 rounded-lg bg-amber-50/90 border border-amber-200 text-xs">
                <div className="flex justify-between font-bold text-amber-950">
                  <span>Sale Deed &amp; Stamp Duty Amount:</span>
                  <span className="font-mono-num">
                    Rs. {formatIndianNumber(metrics.stampDutyPaidOnAmount)}/-
                  </span>
                </div>
                <div className="text-[11px] text-amber-800 mt-0.5 italic">
                  Page 4 Words: &quot;{metrics.stampDutyAmountInWords}&quot;
                </div>
              </div>

              {/* Duty Gender & Percentages */}
              <div>
                <label className="block text-xs font-medium text-zinc-700 mb-1.5">
                  Stamp Duty Category (Bottom of Page 1)
                </label>
                <div className="grid grid-cols-3 gap-1.5 mb-2.5">
                  {(
                    [
                      'For Male',
                      'For Female',
                      'For Joint (Male & Female)',
                    ] as DutyGenderLabel[]
                  ).map((label) => (
                    <button
                      key={label}
                      type="button"
                      onClick={() => handleDutyGenderPreset(label)}
                      className={`py-1.5 px-2 rounded-md text-[11px] font-semibold border cursor-pointer ${
                        data.dutyGenderLabel === label
                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                          : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                      }`}
                    >
                      {label === 'For Joint (Male & Female)' ? 'For Joint' : label}
                    </button>
                  ))}
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Corporation Duty (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={data.corpDutyPercent}
                      onChange={(e) =>
                        onChange('corpDutyPercent', parseFloat(e.target.value) || 0)
                      }
                      className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-mono-num font-semibold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                      Stamp Duty (%)
                    </label>
                    <input
                      type="number"
                      step="0.5"
                      value={data.stampDutyPercent}
                      onChange={(e) =>
                        onChange('stampDutyPercent', parseFloat(e.target.value) || 0)
                      }
                      className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-mono-num font-semibold"
                    />
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-zinc-200 flex justify-between items-center text-xs font-semibold text-zinc-800">
                  <span>
                    Total Duty ({metrics.totalDutyPercent}% = Rs.
                    {formatIndianNumber(metrics.corpDutyAmount)} + Rs.
                    {formatIndianNumber(metrics.stampDutyAmount)}):
                  </span>
                  <span className="font-mono-num text-emerald-700 font-bold">
                    Rs.{formatIndianNumber(metrics.totalDutyAmount)}/-
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab(2);
                onScrollToPage(2);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              Next: Fill Buyer &amp; Seller Details (Page 2)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==================== TAB 2: SELLER & BUYER DETAILS (PAGE 2) ==================== */}
        {activeTab === 2 && (
          <div className="space-y-4">
            {/* Execution Place & Date */}
            <div className="bg-zinc-50/80 p-3.5 rounded-xl border border-zinc-200 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Execution Place &amp; Date (Page 2 Top)
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Place of Execution
                  </label>
                  <input
                    type="text"
                    value={data.executionPlace}
                    onChange={(e) => onChange('executionPlace', e.target.value)}
                    className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Execution Date (or --------)
                  </label>
                  <input
                    type="text"
                    value={data.executionDateText}
                    onChange={(e) => onChange('executionDateText', e.target.value)}
                    placeholder="-------- or 15/05/2025 "
                    className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* VENDOR / SELLER CARD */}
            <div className="bg-blue-50/40 p-3.5 rounded-xl border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                  Seller Details (&quot;THE VENDOR&quot; — Page 2)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  1st Party
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Title
                  </label>
                  <select
                    value={data.vendorHonorific}
                    onChange={(e) =>
                      onChange('vendorHonorific', e.target.value as HonorificType)
                    }
                    className="w-full h-9 px-2 rounded-md border border-zinc-300 bg-white text-xs font-bold"
                  >
                    {HONORIFICS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Seller (Vendor) Full Name
                  </label>
                  <input
                    type="text"
                    value={data.vendorName}
                    onChange={(e) => onChange('vendorName', e.target.value.toUpperCase())}
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="NAVEN CHANDRA JOSHI"
                  />
                </div>
              </div>

              {/* Son of / Daughter of / Wife of / Care of Pills */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Relation Type (Son of / Daughter of / Wife of / Care of)
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {RELATIONS.map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => onChange('vendorRelationType', rel)}
                      className={`py-1.5 px-1 rounded text-[10.5px] font-bold border transition-colors cursor-pointer ${
                        data.vendorRelationType === rel
                          ? 'bg-[#1E3A8A] text-white border-[#1E3A8A]'
                          : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Rel. Title
                  </label>
                  <select
                    value={data.vendorRelativeHonorific}
                    onChange={(e) =>
                      onChange(
                        'vendorRelativeHonorific',
                        e.target.value as HonorificType
                      )
                    }
                    className="w-full h-9 px-2 rounded-md border border-zinc-300 bg-white text-xs font-bold"
                  >
                    {HONORIFICS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Father / Husband / Guardian Name
                  </label>
                  <input
                    type="text"
                    value={data.vendorRelativeName}
                    onChange={(e) =>
                      onChange('vendorRelativeName', e.target.value.toUpperCase())
                    }
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                    placeholder="REWA DHAR JOSHI"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Seller Full Residential Address (RESIDENT OF)
                </label>
                <textarea
                  rows={2}
                  value={data.vendorAddress}
                  onChange={(e) =>
                    onChange('vendorAddress', e.target.value.toUpperCase())
                  }
                  className="w-full p-2.5 rounded-md border border-zinc-300 bg-white text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-[#1E3A8A]"
                  placeholder="RZ-49A/216 J-BLOCK,WEST SAGARPUR ,DELHI-110046"
                />
              </div>
            </div>

            {/* VENDEE / BUYER CARD */}
            <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Buyer Details (&quot;THE VENDEES&quot; — Page 2)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  In Favour Of
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Title
                  </label>
                  <select
                    value={data.vendeeHonorific}
                    onChange={(e) =>
                      onChange('vendeeHonorific', e.target.value as HonorificType)
                    }
                    className="w-full h-9 px-2 rounded-md border border-zinc-300 bg-white text-xs font-bold"
                  >
                    {HONORIFICS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Buyer (Vendee) Full Name
                  </label>
                  <input
                    type="text"
                    value={data.vendeeName}
                    onChange={(e) => onChange('vendeeName', e.target.value.toUpperCase())}
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    placeholder="MADHU VARMA"
                  />
                </div>
              </div>

              {/* Son of / Daughter of / Wife of / Care of Pills */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Relation Type (Son of / Daughter of / Wife of / Care of)
                </label>
                <div className="grid grid-cols-4 gap-1">
                  {RELATIONS.map((rel) => (
                    <button
                      key={rel}
                      type="button"
                      onClick={() => onChange('vendeeRelationType', rel)}
                      className={`py-1.5 px-1 rounded text-[10.5px] font-bold border transition-colors cursor-pointer ${
                        data.vendeeRelationType === rel
                          ? 'bg-emerald-800 text-white border-emerald-800'
                          : 'bg-white text-zinc-700 border-zinc-300 hover:bg-zinc-100'
                      }`}
                    >
                      {rel}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Rel. Title
                  </label>
                  <select
                    value={data.vendeeRelativeHonorific}
                    onChange={(e) =>
                      onChange(
                        'vendeeRelativeHonorific',
                        e.target.value as HonorificType
                      )
                    }
                    className="w-full h-9 px-2 rounded-md border border-zinc-300 bg-white text-xs font-bold"
                  >
                    {HONORIFICS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Father / Husband / Guardian Name
                  </label>
                  <input
                    type="text"
                    value={data.vendeeRelativeName}
                    onChange={(e) =>
                      onChange('vendeeRelativeName', e.target.value.toUpperCase())
                    }
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-700"
                    placeholder="KISHAN"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Buyer Full Residential Address (RESEDENT OF)
                </label>
                <textarea
                  rows={2}
                  value={data.vendeeAddress}
                  onChange={(e) =>
                    onChange('vendeeAddress', e.target.value.toUpperCase())
                  }
                  className="w-full p-2.5 rounded-md border border-zinc-300 bg-white text-xs font-semibold uppercase focus:outline-none focus:ring-2 focus:ring-emerald-700"
                  placeholder="HN RZ C-77 NEAR JINDAL PUBLIC SCHOOL DWARIKAPURI VIJAY ENCLAVE,DELHI-110045"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab(3);
                onScrollToPage(2);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              Next: Property Address, Floor &amp; House No. (Page 2 &amp; 3)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==================== TAB 3: PROPERTY DETAILS & BOUNDARIES (PAGE 2 & 3) ==================== */}
        {activeTab === 3 && (
          <div className="space-y-4">
            <div className="bg-amber-50/50 p-3.5 rounded-xl border border-amber-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-950">
                  Property Full Address, House No. &amp; Floor (Page 2 &amp; 3)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                  Auto-Syncs Pg 2 &amp; 3
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Property House / Plot No.
                  </label>
                  <input
                    type="text"
                    value={data.propertyHouseNo}
                    onChange={(e) =>
                      onChange('propertyHouseNo', e.target.value.toUpperCase())
                    }
                    placeholder="RZ-28/195"
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Street / Gali No.
                  </label>
                  <input
                    type="text"
                    value={data.propertyGaliNo}
                    onChange={(e) =>
                      onChange('propertyGaliNo', e.target.value.toUpperCase())
                    }
                    placeholder="IN GALI NO 14"
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase"
                  />
                </div>
              </div>

              {/* Floor Description with Quick Presets */}
              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Floor &amp; Roof Rights Mentioned on Page 2 &amp; 3
                </label>
                <input
                  type="text"
                  value={data.propertyFloorDescription}
                  onChange={(e) =>
                    onChange('propertyFloorDescription', e.target.value.toUpperCase())
                  }
                  placeholder="(ENTIRE THIRD FLOOR WITH ROOF RIGHTS)"
                  className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase mb-1.5"
                />
                <div className="flex flex-wrap gap-1">
                  {FLOOR_PRESETS.map((floor) => (
                    <button
                      key={floor}
                      type="button"
                      onClick={() => onChange('propertyFloorDescription', floor)}
                      className={`px-2 py-1 rounded text-[10px] font-medium border cursor-pointer ${
                        data.propertyFloorDescription === floor
                          ? 'bg-amber-800 text-white border-amber-800'
                          : 'bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                      }`}
                    >
                      {floor.replace(/[()]/g, '')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Land Area Measuring Sq.Yds & Khasra No */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-medium text-zinc-700">
                      Land Area (SQ.YDS.)
                    </label>
                    <label className="inline-flex items-center gap-1 text-[10px] text-blue-800 font-semibold cursor-pointer">
                      <input
                        type="checkbox"
                        checked={data.syncPropertySqYdsWithPage1}
                        onChange={(e) =>
                          onChange('syncPropertySqYdsWithPage1', e.target.checked)
                        }
                        className="rounded"
                      />
                      Sync Pg 1 ({data.plotAreaSqYds})
                    </label>
                  </div>
                  <input
                    type="number"
                    disabled={data.syncPropertySqYdsWithPage1}
                    value={
                      data.syncPropertySqYdsWithPage1
                        ? data.plotAreaSqYds
                        : data.propertySqYdsPage2
                    }
                    onChange={(e) =>
                      onChange('propertySqYdsPage2', parseFloat(e.target.value) || 0)
                    }
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white disabled:bg-zinc-100 text-xs font-mono-num font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Out of Khasra No.
                  </label>
                  <input
                    type="text"
                    value={data.propertyKhasraNo}
                    onChange={(e) =>
                      onChange('propertyKhasraNo', e.target.value.toUpperCase())
                    }
                    placeholder="195"
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Area of Village
                  </label>
                  <input
                    type="text"
                    value={data.propertyVillage}
                    onChange={(e) =>
                      onChange('propertyVillage', e.target.value.toUpperCase())
                    }
                    placeholder="NASIRPUR"
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Colony Known As
                  </label>
                  <input
                    type="text"
                    value={data.propertyColony}
                    onChange={(e) =>
                      onChange('propertyColony', e.target.value.toUpperCase())
                    }
                    placeholder="DURGA PARK"
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    State Description
                  </label>
                  <input
                    type="text"
                    value={data.propertyState}
                    onChange={(e) =>
                      onChange('propertyState', e.target.value.toUpperCase())
                    }
                    placeholder="DELHI STATE DELHI"
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    City &amp; PIN Code
                  </label>
                  <input
                    type="text"
                    value={data.propertyCityPin}
                    onChange={(e) =>
                      onChange('propertyCityPin', e.target.value.toUpperCase())
                    }
                    placeholder="NEW DELHI-110045"
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase"
                  />
                </div>
              </div>
            </div>

            {/* 4 Directions Property Boundaries (Page 2 Bottom) */}
            <div className="bg-zinc-50/80 p-3.5 rounded-xl border border-zinc-200 space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                Property Boundaries (Bounded as under — Page 2)
              </h3>
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    EAST :-
                  </label>
                  <input
                    type="text"
                    value={data.boundaryEast}
                    onChange={(e) =>
                      onChange('boundaryEast', e.target.value.toUpperCase())
                    }
                    className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-semibold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    WEST :-
                  </label>
                  <input
                    type="text"
                    value={data.boundaryWest}
                    onChange={(e) =>
                      onChange('boundaryWest', e.target.value.toUpperCase())
                    }
                    className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-semibold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    NORTH :-
                  </label>
                  <input
                    type="text"
                    value={data.boundaryNorth}
                    onChange={(e) =>
                      onChange('boundaryNorth', e.target.value.toUpperCase())
                    }
                    className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-semibold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    SOUTH :-
                  </label>
                  <input
                    type="text"
                    value={data.boundarySouth}
                    onChange={(e) =>
                      onChange('boundarySouth', e.target.value.toUpperCase())
                    }
                    className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-semibold uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Page 3 Prior GPA / Chain of Title */}
            <div className="bg-zinc-50/80 p-3.5 rounded-xl border border-zinc-200 space-y-2.5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-700">
                  Prior Title / GPA Details (Page 3 Top)
                </h3>
                <button
                  type="button"
                  onClick={() => onScrollToPage(3)}
                  className="text-[11px] text-[#1E3A8A] underline cursor-pointer"
                >
                  View Page 3
                </button>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                  Prior Document Type
                </label>
                <input
                  type="text"
                  value={data.priorTitleDocText}
                  onChange={(e) => onChange('priorTitleDocText', e.target.value)}
                  className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs"
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Purchased From (Previous Owner)
                  </label>
                  <input
                    type="text"
                    value={data.priorOwnerName}
                    onChange={(e) =>
                      onChange('priorOwnerName', e.target.value.toUpperCase())
                    }
                    className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-semibold uppercase"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-zinc-600 mb-1">
                    Relative Name ({data.priorOwnerRelation})
                  </label>
                  <input
                    type="text"
                    value={data.priorOwnerRelativeName}
                    onChange={(e) =>
                      onChange('priorOwnerRelativeName', e.target.value.toUpperCase())
                    }
                    className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-semibold uppercase"
                  />
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab(4);
                onScrollToPage(6);
              }}
              className="w-full py-2.5 px-4 rounded-xl bg-[#1E3A8A] hover:bg-blue-900 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-xs cursor-pointer transition-colors"
            >
              Next: Fill Witness 1 &amp; Witness 2 Details (Page 6)
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ==================== TAB 4: WITNESSES 1 & 2 (PAGE 6) ==================== */}
        {activeTab === 4 && (
          <div className="space-y-4">
            {/* Witness 1 Card */}
            <div className="bg-blue-50/40 p-3.5 rounded-xl border border-blue-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#1E3A8A]">
                  Witness No. 1 Details (Last Page 6)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  Witness 1
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Title
                  </label>
                  <select
                    value={data.witness1Honorific}
                    onChange={(e) =>
                      onChange('witness1Honorific', e.target.value as HonorificType)
                    }
                    className="w-full h-9 px-2 rounded-md border border-zinc-300 bg-white text-xs font-bold"
                  >
                    {HONORIFICS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Witness 1 Full Name
                  </label>
                  <input
                    type="text"
                    value={data.witness1Name}
                    onChange={(e) =>
                      onChange('witness1Name', e.target.value.toUpperCase())
                    }
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase"
                    placeholder="NAME SINGH"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Relation
                  </label>
                  <select
                    value={data.witness1RelationType}
                    onChange={(e) =>
                      onChange(
                        'witness1RelationType',
                        e.target.value as ShortRelationType
                      )
                    }
                    className="w-full h-9 px-2 rounded-md border border-zinc-300 bg-white text-xs font-bold"
                  >
                    {SHORT_RELATIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Father / Husband Name
                  </label>
                  <input
                    type="text"
                    value={data.witness1RelativeName}
                    onChange={(e) =>
                      onChange('witness1RelativeName', e.target.value.toUpperCase())
                    }
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase"
                    placeholder="SHRI PAL SINGH"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-zinc-700">
                  Witness 1 Address Lines
                </label>
                <input
                  type="text"
                  value={data.witness1AddressLine1}
                  onChange={(e) =>
                    onChange('witness1AddressLine1', e.target.value.toUpperCase())
                  }
                  placeholder="Address Line 1 (e.g. RZ-C-56,DWARKAPURI,)"
                  className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-medium uppercase"
                />
                <input
                  type="text"
                  value={data.witness1AddressLine2}
                  onChange={(e) =>
                    onChange('witness1AddressLine2', e.target.value.toUpperCase())
                  }
                  placeholder="Address Line 2 (e.g. VIJAY ENCLAVE,DABRI,)"
                  className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-medium uppercase"
                />
                <input
                  type="text"
                  value={data.witness1AddressLine3}
                  onChange={(e) =>
                    onChange('witness1AddressLine3', e.target.value.toUpperCase())
                  }
                  placeholder="Address Line 3 (e.g. SOUTH WEST DELHI-110045)"
                  className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-medium uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Witness 1 Aadhar Number
                </label>
                <input
                  type="text"
                  value={data.witness1Aadhar}
                  onChange={(e) =>
                    onChange('witness1Aadhar', formatAadharInput(e.target.value))
                  }
                  placeholder="9666-3937-0106"
                  className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-mono-num font-bold"
                />
              </div>
            </div>

            {/* Witness 2 Card */}
            <div className="bg-emerald-50/40 p-3.5 rounded-xl border border-emerald-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-900">
                  Witness No. 2 Details (Last Page 6)
                </span>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  Witness 2
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Title
                  </label>
                  <select
                    value={data.witness2Honorific}
                    onChange={(e) =>
                      onChange('witness2Honorific', e.target.value as HonorificType)
                    }
                    className="w-full h-9 px-2 rounded-md border border-zinc-300 bg-white text-xs font-bold"
                  >
                    {HONORIFICS.map((h) => (
                      <option key={h} value={h}>
                        {h}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Witness 2 Full Name
                  </label>
                  <input
                    type="text"
                    value={data.witness2Name}
                    onChange={(e) =>
                      onChange('witness2Name', e.target.value.toUpperCase())
                    }
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase"
                    placeholder="SATENDRA KUMAR SHARMA"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Relation
                  </label>
                  <select
                    value={data.witness2RelationType}
                    onChange={(e) =>
                      onChange(
                        'witness2RelationType',
                        e.target.value as ShortRelationType
                      )
                    }
                    className="w-full h-9 px-2 rounded-md border border-zinc-300 bg-white text-xs font-bold"
                  >
                    {SHORT_RELATIONS.map((r) => (
                      <option key={r.value} value={r.value}>
                        {r.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                    Father / Husband Name
                  </label>
                  <input
                    type="text"
                    value={data.witness2RelativeName}
                    onChange={(e) =>
                      onChange('witness2RelativeName', e.target.value.toUpperCase())
                    }
                    className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-bold uppercase"
                    placeholder="THAKUR PRASAD SHARMA"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-[11px] font-medium text-zinc-700">
                  Witness 2 Address Lines
                </label>
                <input
                  type="text"
                  value={data.witness2AddressLine1}
                  onChange={(e) =>
                    onChange('witness2AddressLine1', e.target.value.toUpperCase())
                  }
                  placeholder="Address Line 1 (e.g. RZ-A-2/47,GALI NO-2A,DURGA PARK,NASIR)"
                  className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-medium uppercase"
                />
                <input
                  type="text"
                  value={data.witness2AddressLine2}
                  onChange={(e) =>
                    onChange('witness2AddressLine2', e.target.value.toUpperCase())
                  }
                  placeholder="Address Line 2 (e.g. PUR,SOUTH WEST DELHI-110045)"
                  className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-medium uppercase"
                />
                <input
                  type="text"
                  value={data.witness2AddressLine3}
                  onChange={(e) =>
                    onChange('witness2AddressLine3', e.target.value.toUpperCase())
                  }
                  placeholder="Address Line 3 (optional)"
                  className="w-full h-8 px-2.5 rounded-md border border-zinc-300 bg-white text-xs font-medium uppercase"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-zinc-700 mb-1">
                  Witness 2 Aadhar Number
                </label>
                <input
                  type="text"
                  value={data.witness2Aadhar}
                  onChange={(e) =>
                    onChange('witness2Aadhar', formatAadharInput(e.target.value))
                  }
                  placeholder="6561-4057-9528"
                  className="w-full h-9 px-3 rounded-md border border-zinc-300 bg-white text-xs font-mono-num font-bold"
                />
              </div>
            </div>

            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-xs text-emerald-900">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <div>
                <div className="font-bold">All 6 Pages Ready!</div>
                <div className="text-[11px] text-emerald-700">
                  Use the top bar to download Word (.docx / .doc) or Print / Save as 6-Page A4 PDF.
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
