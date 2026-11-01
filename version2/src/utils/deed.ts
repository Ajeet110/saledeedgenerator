export type Gender = "M" | "F";

export interface Party {
  title: string;
  name: string;
  relation: string;
  relName: string;
  address: string;
  gender: Gender;
}

export interface Witness {
  name: string;
  parentage: string;
  address: string;
  aadhar: string;
}

export interface Deed {
  // value & area (page 1)
  consideration: string;
  plotYds: string;
  sqmFactor: string;
  floors: string;
  landRate: string;
  consRate: string;
  corpPct: string;
  stampPct: string;
  category: string;
  landUse: string;
  // deed
  place: string;
  date: string;
  sellers: Party[];
  buyers: Party[];
  // property
  colony: string;
  propNo: string;
  gali: string;
  floor: string;
  khasra: string;
  village: string;
  district: string;
  city: string;
  pincode: string;
  prevOwner: string;
  east: string;
  west: string;
  north: string;
  south: string;
  // witnesses
  witness1: Witness;
  witness2: Witness;
}

export const RELATIONS = ["SON OF", "DAUGHTER OF", "WIFE OF", "CARE OF", "WIDOW OF"];
export const TITLES = ["SHRI", "SMT.", "KUMARI", "MS.", "MR.", "MRS."];

export const emptyParty = (gender: Gender = "M"): Party => ({
  title: gender === "M" ? "SHRI" : "SMT.",
  name: "",
  relation: gender === "M" ? "SON OF" : "WIFE OF",
  relName: "",
  address: "",
  gender,
});

const emptyWitness: Witness = { name: "", parentage: "", address: "", aadhar: "" };

export const blankDeed = (): Deed => ({
  consideration: "",
  plotYds: "50",
  sqmFactor: "0.836",
  floors: "4",
  landRate: "",
  consRate: "6960",
  corpPct: "3",
  stampPct: "3",
  category: "",
  landUse: "Residential",
  place: "New Delhi",
  date: "",
  sellers: [emptyParty("M")],
  buyers: [emptyParty("F")],
  colony: "",
  propNo: "",
  gali: "",
  floor: "",
  khasra: "",
  village: "",
  district: "DELHI STATE DELHI",
  city: "NEW DELHI",
  pincode: "",
  prevOwner: "",
  east: "",
  west: "",
  north: "",
  south: "",
  witness1: { ...emptyWitness },
  witness2: { ...emptyWitness },
});

export const sampleDeed = (): Deed => ({
  consideration: "2500000",
  plotYds: "50",
  sqmFactor: "0.836",
  floors: "4",
  landRate: "46200",
  consRate: "6960",
  corpPct: "3",
  stampPct: "3",
  category: "G",
  landUse: "Residential",
  place: "New Delhi",
  date: "",
  sellers: [
    {
      title: "SHRI",
      name: "NAVEN CHANDRA JOSHI",
      relation: "SON OF",
      relName: "SHRI REWA DHAR JOSHI",
      address: "RZ-49A/216 J-BLOCK, WEST SAGARPUR, DELHI-110046",
      gender: "M",
    },
  ],
  buyers: [
    {
      title: "SMT.",
      name: "MADHU VARMA",
      relation: "WIFE OF",
      relName: "SHRI KISHAN",
      address:
        "HN RZ C-77 NEAR JINDAL PUBLIC SCHOOL DWARIKAPURI VIJAY ENCLAVE, DELHI-110045",
      gender: "F",
    },
  ],
  colony: "DURGA PARK",
  propNo: "RZ-28/195",
  gali: "GALI NO 14",
  floor: "ENTIRE THIRD FLOOR WITH ROOF RIGHTS",
  khasra: "195",
  village: "NASIRPUR",
  district: "DELHI STATE DELHI",
  city: "NEW DELHI",
  pincode: "110045",
  prevOwner: "SMT. VIMLA SHARMA Wife of SH. RAVINDER SHARMA",
  east: "PORTION OF PROPERTY.",
  west: "ROAD 20 FT",
  north: "PORTION OF PROPERTY.",
  south: "OTHERS PROPERTY.",
  witness1: {
    name: "SHRI NAME SINGH",
    parentage: "S/O SHRI PAL SINGH",
    address: "RZ-C-56, DWARKAPURI, VIJAY ENCLAVE, DABRI, SOUTH WEST DELHI-110045",
    aadhar: "9666-3937-0106",
  },
  witness2: {
    name: "SHRI SATENDRA KUMAR SHARMA",
    parentage: "S/O THAKUR PRASAD SHARMA",
    address: "RZ-A-2/47, GALI NO-2A, DURGA PARK, NASIRPUR, SOUTH WEST DELHI-110045",
    aadhar: "6561-4057-9528",
  },
});

/* ---------- number helpers ---------- */

export const num = (s: string | number): number => {
  const n = typeof s === "number" ? s : parseFloat(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};

const round2 = (n: number) => Math.round((n + Number.EPSILON) * 100) / 100;

/** Indian digit grouping: 2500000 -> 25,00,000 */
export const inr = (n: number, maxDecimals = 2): string => {
  const fixed = n.toFixed(maxDecimals);
  let [int, dec = ""] = fixed.split(".");
  dec = dec.replace(/0+$/, "");
  const neg = int.startsWith("-");
  if (neg) int = int.slice(1);
  let last3 = int.slice(-3);
  const rest = int.slice(0, -3);
  if (rest) last3 = "," + last3;
  const grouped = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ",") + last3;
  return (neg ? "-" : "") + grouped + (dec ? "." + dec : "");
};

export const rs = (n: number) => `Rs.${inr(n)}/-`;

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten",
  "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen",
  "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

const two = (n: number) =>
  n < 20 ? ONES[n] : TENS[Math.floor(n / 10)] + (n % 10 ? " " + ONES[n % 10] : "");

const three = (n: number) => {
  const h = Math.floor(n / 100);
  const r = n % 100;
  return [h ? ONES[h] + " Hundred" : "", r ? two(r) : ""].filter(Boolean).join(" ");
};

export const wordsIN = (value: number): string => {
  const n = Math.floor(value);
  if (n <= 0) return "Zero";
  const crore = Math.floor(n / 1e7);
  const lakh = Math.floor((n % 1e7) / 1e5);
  const thousand = Math.floor((n % 1e5) / 1e3);
  const rest = n % 1000;
  return [
    crore ? wordsIN(crore) + " Crore" : "",
    lakh ? two(lakh) + " Lakh" : "",
    thousand ? two(thousand) + " Thousand" : "",
    rest ? three(rest) : "",
  ]
    .filter(Boolean)
    .join(" ");
};

const ordinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

export const MONTHS = [
  "January", "February", "March", "April", "May", "June", "July", "August",
  "September", "October", "November", "December",
];

export const dateText = (iso: string): string => {
  if (!iso) return "--------";
  const [y, m, d] = iso.split("-").map(Number);
  if (!y || !m || !d) return "--------";
  return `${ordinal(d)} day of ${MONTHS[m - 1]}, ${y}`;
};

/* ---------- calculations (page 1) ---------- */

export interface Calc {
  yds: number;
  sqm: number;
  floors: number;
  plinthTotal: number;
  plinthSale: number;
  landRate: number;
  consRate: number;
  landValue: number;
  consValue: number;
  totalValue: number;
  consideration: number;
  dutyBase: number;
  corpPct: number;
  stampPct: number;
  corp: number;
  stamp: number;
  totalDuty: number;
}

export const calculate = (d: Deed): Calc => {
  const yds = num(d.plotYds);
  const sqm = round2(yds * (num(d.sqmFactor) || 0.836));
  const floors = num(d.floors);
  const plinthTotal = round2(sqm * floors);
  const landRate = num(d.landRate);
  const consRate = num(d.consRate);
  const landValue = Math.round(sqm * landRate);
  const consValue = Math.round(sqm * floors * consRate);
  const totalValue = landValue + consValue;
  const consideration = num(d.consideration);
  const dutyBase = Math.max(consideration, totalValue);
  const corpPct = num(d.corpPct);
  const stampPct = num(d.stampPct);
  const corp = Math.round((dutyBase * corpPct) / 100);
  const stamp = Math.round((dutyBase * stampPct) / 100);
  return {
    yds, sqm, floors, plinthTotal, plinthSale: sqm, landRate, consRate,
    landValue, consValue, totalValue, consideration, dutyBase,
    corpPct, stampPct, corp, stamp, totalDuty: corp + stamp,
  };
};

/* ---------- pronouns ---------- */

export const pronouns = (parties: Party[]) => {
  if (parties.length > 1) return { poss: "their", subj: "they" };
  if (parties[0]?.gender === "M") return { poss: "his", subj: "he" };
  return { poss: "her", subj: "she" };
};
