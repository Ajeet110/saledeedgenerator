export type RelationType = 'SON OF' | 'DAUGHTER OF' | 'WIFE OF' | 'CARE OF';
export type ShortRelationType = 'S/O' | 'D/O' | 'W/O' | 'C/O';
export type HonorificType = 'SHRI' | 'SMT.' | 'KUMARI' | 'MR.' | 'MS.' | 'M/S';
export type DutyGenderLabel = 'For Male' | 'For Female' | 'For Joint (Male & Female)';
export type SaleAmountMode = 'round_lakh' | 'exact_valuation' | 'custom';

export interface SaleDeedData {
  // Page 1: Valuation & Stamp Duty Calculation
  colonyAreaPage1: string;
  category: string;
  plotAreaSqYds: number;
  sqYdsToSqMtrFactor: number; // default 0.836 so 40 sq.yds = 33.44 Sq. Mtr.
  totalFloorsMultiplier: number; // default 4 so 33.44 * 4 = 133.76 Sq.Mtrs.
  saleFloorMultiplier: number; // default 1 so Plinth area under sale = 33.44 Sq.Mtrs
  constructionMultiplier: number; // default 4 so 33.44 X 4 X 6960 = 9,30,970
  landUse: string;
  govLandRatePerSqMtr: number; // default 46200
  govConstRatePerSqMtr: number; // default 6960
  saleAmountMode: SaleAmountMode;
  customSaleAmount: number; // default 2500000
  dutyGenderLabel: DutyGenderLabel;
  corpDutyPercent: number; // default 3
  stampDutyPercent: number; // default 3

  // Page 2: Execution Date, Seller (Vendor), Buyer (Vendee), Property & Boundaries
  executionPlace: string; // default "New Delhi"
  executionDateText: string; // default "--------" (or date string)

  // Vendor (Seller)
  vendorHonorific: HonorificType;
  vendorName: string;
  vendorRelationType: RelationType;
  vendorRelativeHonorific: HonorificType;
  vendorRelativeName: string;
  vendorAddress: string;
  vendorPronoun: 'her' | 'his' | 'their';

  // Vendee (Buyer)
  vendeeHonorific: HonorificType;
  vendeeName: string;
  vendeeRelationType: RelationType;
  vendeeRelativeHonorific: HonorificType;
  vendeeRelativeName: string;
  vendeeAddress: string;
  vendeePronoun: 'her' | 'his' | 'their';

  // Property Details (Used on Page 2 & Page 3)
  syncPropertySqYdsWithPage1: boolean;
  propertySqYdsPage2: number; // In reference image 2 & 3 it says 52 SQ.YDS., or synced with Page 1
  propertyTypePrefix: string; // "BUILT-UP PROPERTY NO."
  propertyHouseNo: string; // "RZ-28/195"
  propertyGaliNo: string; // "IN GALI NO 14"
  propertyFloorDescription: string; // "(ENTIRE THIRD FLOOR WITH ROOF RIGHTS)"
  propertyKhasraNo: string; // "195"
  propertyVillage: string; // "NASIRPUR"
  propertyState: string; // "DELHI STATE DELHI"
  propertyColony: string; // "DURGA PARK"
  propertyCityPin: string; // "NEW DELHI-110045"

  // Boundaries (Page 2 bottom)
  boundaryEast: string;
  boundaryWest: string;
  boundaryNorth: string;
  boundarySouth: string;

  // Page 3: Previous Title / GPA Details
  priorTitleDocText: string; // "vide GPA duly Notarized by the Notary Public Delhi"
  priorOwnerHonorific: string; // "SMT."
  priorOwnerName: string; // "VIMLA SHARMA"
  priorOwnerRelation: string; // "Wife of"
  priorOwnerRelativeHonorific: string; // "SH."
  priorOwnerRelativeName: string; // "RAVINDER SHARMA"

  // Page 6: Witnesses
  witness1Honorific: HonorificType;
  witness1Name: string;
  witness1RelationType: ShortRelationType;
  witness1RelativeName: string;
  witness1AddressLine1: string;
  witness1AddressLine2: string;
  witness1AddressLine3: string;
  witness1Aadhar: string;

  witness2Honorific: HonorificType;
  witness2Name: string;
  witness2RelationType: ShortRelationType;
  witness2RelativeName: string;
  witness2AddressLine1: string;
  witness2AddressLine2: string;
  witness2AddressLine3: string;
  witness2Aadhar: string;
}

export interface CalculatedDeedMetrics {
  plotAreaSqMtr: number; // e.g., 33.44
  totalPlinthAreaSqMtr: number; // e.g., 133.76
  plinthAreaUnderSaleSqMtr: number; // e.g., 33.44
  minLandValue: number; // e.g., 1544928
  minConstructionValue: number; // e.g., 930970
  totalPropertyValue: number; // e.g., 2475898
  stampDutyPaidOnAmount: number; // e.g., 2500000
  stampDutyAmountInWords: string; // e.g., "Rupees Twenty Five Lakh only"
  corpDutyAmount: number; // e.g., 75000
  stampDutyAmount: number; // e.g., 75000
  totalDutyPercent: number; // e.g., 6
  totalDutyAmount: number; // e.g., 150000
  effectivePropertySqYds: number;
}

// Delhi Government Circle Rate Presets by Category (Land Rate per Sq.Mtr & Construction Rate per Sq.Mtr)
export const DELHI_CATEGORY_RATES: Record<string, { landRate: number; constRate: number }> = {
  A: { landRate: 774000, constRate: 21960 },
  B: { landRate: 245520, constRate: 17400 },
  C: { landRate: 159840, constRate: 13920 },
  D: { landRate: 127680, constRate: 11160 },
  E: { landRate: 70080, constRate: 9360 },
  F: { landRate: 56640, constRate: 8220 },
  G: { landRate: 46200, constRate: 6960 },
  H: { landRate: 23280, constRate: 3480 },
};

export const INITIAL_SALE_DEED_DATA: SaleDeedData = {
  // Page 1 defaults matching Reference Image 1
  colonyAreaPage1: 'DASHRATH PURI',
  category: 'G',
  plotAreaSqYds: 40,
  sqYdsToSqMtrFactor: 0.836,
  totalFloorsMultiplier: 4,
  saleFloorMultiplier: 1,
  constructionMultiplier: 4,
  landUse: 'Residential',
  govLandRatePerSqMtr: 46200,
  govConstRatePerSqMtr: 6960,
  saleAmountMode: 'round_lakh',
  customSaleAmount: 2500000,
  dutyGenderLabel: 'For Male',
  corpDutyPercent: 3,
  stampDutyPercent: 3,

  // Page 2 defaults matching Reference Image 2
  executionPlace: 'New Delhi',
  executionDateText: '--------',

  vendorHonorific: 'SHRI',
  vendorName: 'NAVEN CHANDRA JOSHI',
  vendorRelationType: 'SON OF',
  vendorRelativeHonorific: 'SHRI',
  vendorRelativeName: 'REWA DHAR JOSHI',
  vendorAddress: 'RZ-49A/216 J-BLOCK,WEST SAGARPUR ,DELHI-110046',
  vendorPronoun: 'her',

  vendeeHonorific: 'SHRI',
  vendeeName: 'MADHU VARMA',
  vendeeRelationType: 'WIFE OF',
  vendeeRelativeHonorific: 'SHRI',
  vendeeRelativeName: 'KISHAN',
  vendeeAddress: 'HN RZ C-77 NEAR JINDAL PUBLIC SCHOOL DWARIKAPURI VIJAY ENCLAVE,DELHI-110045',
  vendeePronoun: 'her',

  syncPropertySqYdsWithPage1: false,
  propertySqYdsPage2: 52,
  propertyTypePrefix: 'BUILT-UP PROPERTY NO.',
  propertyHouseNo: 'RZ-28/195',
  propertyGaliNo: 'IN GALI NO 14',
  propertyFloorDescription: '(ENTIRE THIRD FLOOR WITH ROOF RIGHTS)',
  propertyKhasraNo: '195',
  propertyVillage: 'NASIRPUR',
  propertyState: 'DELHI STATE DELHI',
  propertyColony: 'DURGA PARK',
  propertyCityPin: 'NEW DELHI-110045',

  boundaryEast: 'PORTION OF PROPERTY.',
  boundaryWest: 'ROAD 20 FT',
  boundaryNorth: 'PORTION OF PROPERTY.',
  boundarySouth: 'OTHERS PROPERTY.',

  // Page 3 defaults matching Reference Image 3
  priorTitleDocText: 'vide GPA duly Notarized by the Notary Public Delhi',
  priorOwnerHonorific: 'SMT.',
  priorOwnerName: 'VIMLA SHARMA',
  priorOwnerRelation: 'Wife of',
  priorOwnerRelativeHonorific: 'SH.',
  priorOwnerRelativeName: 'RAVINDER SHARMA',

  // Page 6 defaults matching Reference Image 6
  witness1Honorific: 'SHRI',
  witness1Name: 'NAME SINGH',
  witness1RelationType: 'S/O',
  witness1RelativeName: 'SHRI PAL SINGH',
  witness1AddressLine1: 'RZ-C-56,DWARKAPURI,',
  witness1AddressLine2: 'VIJAY ENCLAVE,DABRI,',
  witness1AddressLine3: 'SOUTH WEST DELHI-110045',
  witness1Aadhar: '9666-3937-0106',

  witness2Honorific: 'SHRI',
  witness2Name: 'SATENDRA KUMAR SHARMA',
  witness2RelationType: 'S/O',
  witness2RelativeName: 'THAKUR PRASAD SHARMA',
  witness2AddressLine1: 'RZ-A-2/47,GALI NO-2A,DURGA PARK,NASIR',
  witness2AddressLine2: 'PUR,SOUTH WEST DELHI-110045',
  witness2AddressLine3: '',
  witness2Aadhar: '6561-4057-9528',
};
