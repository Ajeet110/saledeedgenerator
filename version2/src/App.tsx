import { useEffect, useMemo, useRef, useState } from "react";
import DeedPages from "./components/DeedPages";
import {
  RELATIONS,
  TITLES,
  blankDeed,
  calculate,
  emptyParty,
  inr,
  sampleDeed,
  wordsIN,
} from "./utils/deed";
import type { Deed, Gender, Party, Witness } from "./utils/deed";
import { deedCss, wordCss } from "./deedStyles";

const STORAGE_KEY = "sale-deed-generator-v1";
const PAGE_PX = 794; // 210mm @ 96dpi

/* ---------------- small UI atoms ---------------- */

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200";

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  hint,
  className = "",
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className={inputCls}
      />
      {hint && <span className="mt-1 block text-[11px] text-slate-400">{hint}</span>}
    </label>
  );
}

function Select({
  label,
  value,
  options,
  onChange,
  className = "",
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (v: string) => void;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-medium text-slate-600">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className={inputCls}>
        {options.map((o) => (
          <option key={o}>{o}</option>
        ))}
      </select>
    </label>
  );
}

function Section({
  step,
  title,
  subtitle,
  children,
}: {
  step: number;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-4 flex items-start gap-3">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-xs font-bold text-white">
          {step}
        </span>
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function PartyEditor({
  label,
  role,
  parties,
  onChange,
}: {
  label: string;
  role: string;
  parties: Party[];
  onChange: (p: Party[]) => void;
}) {
  const set = (i: number, patch: Partial<Party>) =>
    onChange(parties.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));

  const setGender = (i: number, g: Gender) => {
    const p = parties[i];
    const patch: Partial<Party> = { gender: g };
    if (g === "M") {
      if (p.title === "SMT." || p.title === "MS." || p.title === "MRS." || p.title === "KUMARI") patch.title = "SHRI";
      if (p.relation === "WIFE OF" || p.relation === "DAUGHTER OF" || p.relation === "WIDOW OF") patch.relation = "SON OF";
    } else {
      if (p.title === "SHRI" || p.title === "MR.") patch.title = "SMT.";
      if (p.relation === "SON OF") patch.relation = "WIFE OF";
    }
    set(i, patch);
  };

  return (
    <div className="space-y-3">
      {parties.map((p, i) => (
        <div key={i} className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wide text-indigo-700">
              {label} {parties.length > 1 ? i + 1 : ""}
            </span>
            {parties.length > 1 && (
              <button
                onClick={() => onChange(parties.filter((_, idx) => idx !== i))}
                className="text-xs font-medium text-rose-600 hover:underline"
              >
                Remove
              </button>
            )}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div className="col-span-2 flex gap-2">
              {(["M", "F"] as Gender[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGender(i, g)}
                  className={`flex-1 rounded-lg border px-3 py-1.5 text-xs font-medium transition ${
                    p.gender === g
                      ? "border-indigo-600 bg-indigo-600 text-white"
                      : "border-slate-300 bg-white text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {g === "M" ? "Male" : "Female"}
                </button>
              ))}
            </div>
            <Select label="Title" value={p.title} options={TITLES} onChange={(v) => set(i, { title: v })} />
            <Field label="Full name" value={p.name} onChange={(v) => set(i, { name: v })} placeholder="e.g. RAMESH KUMAR" />
            <Select
              label="Relation"
              value={p.relation}
              options={RELATIONS}
              onChange={(v) => set(i, { relation: v })}
            />
            <Field
              label={`${p.relation.toLowerCase().replace(/^./, (c) => c.toUpperCase())} (name)`}
              value={p.relName}
              onChange={(v) => set(i, { relName: v })}
              placeholder="e.g. SHRI MOHAN LAL"
            />
            <label className="col-span-2 block">
              <span className="mb-1 block text-xs font-medium text-slate-600">Full address ({role})</span>
              <textarea
                rows={2}
                value={p.address}
                onChange={(e) => set(i, { address: e.target.value })}
                placeholder="House no., street, colony, city - PIN"
                className={inputCls}
              />
            </label>
          </div>
        </div>
      ))}
      <button
        onClick={() => onChange([...parties, emptyParty("M")])}
        className="w-full rounded-lg border border-dashed border-slate-300 py-2 text-xs font-medium text-slate-600 hover:border-indigo-400 hover:text-indigo-600"
      >
        + Add another {label.toLowerCase()}
      </button>
    </div>
  );
}

function WitnessEditor({
  title,
  w,
  onChange,
}: {
  title: string;
  w: Witness;
  onChange: (w: Witness) => void;
}) {
  const set = (patch: Partial<Witness>) => onChange({ ...w, ...patch });
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-indigo-700">{title}</div>
      <div className="grid grid-cols-2 gap-2">
        <Field label="Name" value={w.name} onChange={(v) => set({ name: v })} placeholder="SHRI ..." />
        <Field label="S/O – D/O – W/O" value={w.parentage} onChange={(v) => set({ parentage: v })} placeholder="S/O SHRI ..." />
        <label className="col-span-2 block">
          <span className="mb-1 block text-xs font-medium text-slate-600">Address</span>
          <textarea rows={2} value={w.address} onChange={(e) => set({ address: e.target.value })} className={inputCls} />
        </label>
        <Field className="col-span-2" label="Aadhar No." value={w.aadhar} onChange={(v) => set({ aadhar: v })} placeholder="0000-0000-0000" />
      </div>
    </div>
  );
}

/* ---------------- Word export ---------------- */

function exportWord(container: HTMLElement, fileName: string) {
  const pages = Array.from(container.querySelectorAll(".deed-page")).map((el) => el.outerHTML);
  const body = pages.join(
    `<br clear="all" style="mso-special-character:line-break;page-break-before:always">`
  );
  const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>Sale Deed</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>${deedCss}${wordCss}</style></head>
<body><div class="Section1">${body}</div></body></html>`;
  const blob = new Blob(["\ufeff", html], { type: "application/msword" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ---------------- App ---------------- */

export default function App() {
  const [deed, setDeed] = useState<Deed>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return { ...blankDeed(), ...JSON.parse(raw) } as Deed;
    } catch {
      /* ignore */
    }
    return sampleDeed();
  });
  const [tab, setTab] = useState<"form" | "preview">("form");
  const [zoom, setZoom] = useState(1);
  const previewRef = useRef<HTMLDivElement>(null);
  const pagesRef = useRef<HTMLDivElement>(null);

  const set = (patch: Partial<Deed>) => setDeed((d) => ({ ...d, ...patch }));
  const c = useMemo(() => calculate(deed), [deed]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(deed));
    } catch {
      /* ignore */
    }
  }, [deed]);

  useEffect(() => {
    const el = previewRef.current;
    if (!el) return;
    const update = () => setZoom(Math.min(1, Math.max(0.3, (el.clientWidth - 32) / PAGE_PX)));
    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [tab]);

  const fileName = `Sale_Deed_${(deed.colony || "Property").trim().replace(/\s+/g, "_")}.doc`;

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 print:block print:h-auto print:bg-white lg:h-screen">
      {/* Header */}
      <header className="z-10 flex flex-wrap items-center gap-3 border-b border-slate-200 bg-white px-4 py-3 print:hidden">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-600 text-white">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <path d="M14 2v6h6M8 13h8M8 17h8M8 9h2" />
            </svg>
          </div>
          <div>
            <h1 className="text-base font-bold leading-tight text-slate-900">Sale Deed Generator</h1>
            <p className="text-xs text-slate-500">6-page A4 document • auto calculation</p>
          </div>
        </div>

        <div className="ml-auto flex flex-wrap items-center gap-2">
          <button
            onClick={() => setDeed(sampleDeed())}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Load sample
          </button>
          <button
            onClick={() => {
              if (confirm("Clear all entered details?")) setDeed(blankDeed());
            }}
            className="rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50"
          >
            Clear form
          </button>
          <button
            onClick={() => pagesRef.current && exportWord(pagesRef.current, fileName)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700"
          >
            ⬇ Download Word (.doc)
          </button>
          <button
            onClick={() => window.print()}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            🖨 Print / Save PDF
          </button>
        </div>

        {/* mobile tabs */}
        <div className="flex w-full rounded-lg bg-slate-100 p-1 lg:hidden">
          {(["form", "preview"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`flex-1 rounded-md py-1.5 text-xs font-semibold capitalize ${
                tab === t ? "bg-white text-indigo-700 shadow-sm" : "text-slate-500"
              }`}
            >
              {t === "form" ? "Fill details" : "Preview (6 pages)"}
            </button>
          ))}
        </div>
      </header>

      <main className="grid min-h-0 flex-1 grid-cols-1 print:block lg:grid-cols-[440px_1fr]">
        {/* ---------- FORM ---------- */}
        <aside
          className={`min-h-0 space-y-4 overflow-y-auto border-r border-slate-200 bg-slate-50 p-4 print:hidden ${
            tab === "form" ? "block" : "hidden lg:block"
          }`}
        >
          <Section step={1} title="Value & area (Page 1)" subtitle="Everything on the description page is calculated automatically.">
            <div className="grid grid-cols-2 gap-2">
              <Field className="col-span-2" label="Sale consideration (Rs.)" type="number" value={deed.consideration} onChange={(v) => set({ consideration: v })} placeholder="2500000" hint={deed.consideration ? `Rupees ${wordsIN(Number(deed.consideration))} only` : undefined} />
              <Field label="Plot area (sq. yards)" type="number" value={deed.plotYds} onChange={(v) => set({ plotYds: v })} placeholder="50" />
              <Field label="1 sq.yd = sq.mtr" type="number" value={deed.sqmFactor} onChange={(v) => set({ sqmFactor: v })} />
              <Field label="No. of floors (plinth × )" type="number" value={deed.floors} onChange={(v) => set({ floors: v })} />
              <Field label="Category" value={deed.category} onChange={(v) => set({ category: v })} placeholder="G" />
              <Field label="Land rate / sq.mtr (Rs.)" type="number" value={deed.landRate} onChange={(v) => set({ landRate: v })} placeholder="46200" />
              <Field label="Construction rate / sq.mtr" type="number" value={deed.consRate} onChange={(v) => set({ consRate: v })} />
              <Field label="Corporation duty %" type="number" value={deed.corpPct} onChange={(v) => set({ corpPct: v })} />
              <Field label="Stamp duty %" type="number" value={deed.stampPct} onChange={(v) => set({ stampPct: v })} />
              <Field className="col-span-2" label="Land use" value={deed.landUse} onChange={(v) => set({ landUse: v })} />
            </div>

            {/* live calc */}
            <div className="rounded-xl bg-indigo-50 p-3 text-xs text-indigo-900">
              <div className="mb-2 font-semibold">Live calculation</div>
              <dl className="grid grid-cols-[1fr_auto] gap-x-3 gap-y-1">
                <dt>{c.yds} sq.yds →</dt>
                <dd className="font-semibold">{inr(c.sqm)} Sq.Mtr.</dd>
                <dt>Total plinth area ({inr(c.floors)} floors)</dt>
                <dd className="font-semibold">{inr(c.plinthTotal)} Sq.Mtr.</dd>
                <dt>Value of land</dt>
                <dd className="font-semibold">Rs.{inr(c.landValue)}</dd>
                <dt>Value of construction</dt>
                <dd className="font-semibold">Rs.{inr(c.consValue)}</dd>
                <dt>Total value of property</dt>
                <dd className="font-semibold">Rs.{inr(c.totalValue)}</dd>
                <dt>Duty charged on (higher of value / price)</dt>
                <dd className="font-semibold">Rs.{inr(c.dutyBase)}</dd>
                <dt className="border-t border-indigo-200 pt-1">Total duty ({c.corpPct + c.stampPct}%)</dt>
                <dd className="border-t border-indigo-200 pt-1 font-bold">Rs.{inr(c.totalDuty)}</dd>
              </dl>
            </div>
          </Section>

          <Section step={2} title="Deed date & place (Page 2)">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Executed at" value={deed.place} onChange={(v) => set({ place: v })} />
              <Field label="Date" type="date" value={deed.date} onChange={(v) => set({ date: v })} hint="Leave empty for a blank date" />
            </div>
          </Section>

          <Section step={3} title="Seller / Vendor details" subtitle="Name, S/o – D/o – W/o – C/o and full address.">
            <PartyEditor label="Seller" role="seller" parties={deed.sellers} onChange={(sellers) => set({ sellers })} />
          </Section>

          <Section step={4} title="Buyer / Vendee details" subtitle="Name, S/o – D/o – W/o – C/o and full address.">
            <PartyEditor label="Buyer" role="buyer" parties={deed.buyers} onChange={(buyers) => set({ buyers })} />
          </Section>

          <Section step={5} title="Property address" subtitle="Used on pages 1, 2 and 3.">
            <div className="grid grid-cols-2 gap-2">
              <Field label="Property no." value={deed.propNo} onChange={(v) => set({ propNo: v })} placeholder="RZ-28/195" />
              <Field label="Gali / street" value={deed.gali} onChange={(v) => set({ gali: v })} placeholder="GALI NO 14" />
              <Field className="col-span-2" label="Floor" value={deed.floor} onChange={(v) => set({ floor: v })} placeholder="ENTIRE THIRD FLOOR WITH ROOF RIGHTS" />
              <Field label="Khasra no." value={deed.khasra} onChange={(v) => set({ khasra: v })} />
              <Field label="Village" value={deed.village} onChange={(v) => set({ village: v })} />
              <Field label="District / State" value={deed.district} onChange={(v) => set({ district: v })} />
              <Field label="Colony / Area" value={deed.colony} onChange={(v) => set({ colony: v })} placeholder="DURGA PARK" />
              <Field label="City" value={deed.city} onChange={(v) => set({ city: v })} />
              <Field label="PIN code" value={deed.pincode} onChange={(v) => set({ pincode: v })} />
              <Field className="col-span-2" label="Previous owner / GPA from (optional)" value={deed.prevOwner} onChange={(v) => set({ prevOwner: v })} placeholder="SMT. VIMLA SHARMA Wife of SH. RAVINDER SHARMA" />
            </div>
            <div className="grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
              <div className="col-span-2 text-xs font-semibold text-slate-700">Boundaries</div>
              <Field label="East" value={deed.east} onChange={(v) => set({ east: v })} />
              <Field label="West" value={deed.west} onChange={(v) => set({ west: v })} />
              <Field label="North" value={deed.north} onChange={(v) => set({ north: v })} />
              <Field label="South" value={deed.south} onChange={(v) => set({ south: v })} />
            </div>
          </Section>

          <Section step={6} title="Witness details (Last page)">
            <WitnessEditor title="Witness 1 (for Vendor)" w={deed.witness1} onChange={(witness1) => set({ witness1 })} />
            <WitnessEditor title="Witness 2 (for Vendee)" w={deed.witness2} onChange={(witness2) => set({ witness2 })} />
          </Section>

          <p className="pb-6 text-center text-[11px] text-slate-400">
            Your data is saved automatically in this browser only.
          </p>
        </aside>

        {/* ---------- PREVIEW ---------- */}
        <div
          ref={previewRef}
          className={`min-h-0 overflow-auto bg-slate-200 p-4 print:overflow-visible print:bg-white print:p-0 ${
            tab === "preview" ? "block" : "hidden lg:block print:!block"
          }`}
        >
          <div className="zoom-wrap mx-auto" style={{ zoom, width: PAGE_PX }}>
            <DeedPages ref={pagesRef} deed={deed} />
          </div>
        </div>
      </main>
    </div>
  );
}
