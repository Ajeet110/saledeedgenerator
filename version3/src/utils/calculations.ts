import { CalculatedDeedMetrics, SaleDeedData } from '../types/deed';

/**
 * Formats a number in the Indian numbering system (e.g. 2500000 -> "25,00,000")
 */
export function formatIndianNumber(num: number): string {
  if (!Number.isFinite(num)) return '0';
  const rounded = Math.round(num);
  return rounded.toLocaleString('en-IN');
}

/**
 * Formats a decimal number cleanly to 2 decimal places (e.g. 33.44, 133.76, 41.80)
 */
export function formatSqMtr(num: number): string {
  if (!Number.isFinite(num)) return '0.00';
  // Keep 2 decimals just like 33.44 and 133.76 in reference image
  return num.toFixed(2);
}

const ONES = [
  '',
  'One',
  'Two',
  'Three',
  'Four',
  'Five',
  'Six',
  'Seven',
  'Eight',
  'Nine',
  'Ten',
  'Eleven',
  'Twelve',
  'Thirteen',
  'Fourteen',
  'Fifteen',
  'Sixteen',
  'Seventeen',
  'Eighteen',
  'Nineteen',
];

const TENS = [
  '',
  '',
  'Twenty',
  'Thirty',
  'Forty',
  'Fifty',
  'Sixty',
  'Seventy',
  'Eighty',
  'Ninety',
];

function twoDigitToWords(n: number): string {
  if (n === 0) return '';
  if (n < 20) return ONES[n];
  const ten = Math.floor(n / 10);
  const rem = n % 10;
  return `${TENS[ten]}${rem > 0 ? ' ' + ONES[rem] : ''}`;
}

/**
 * Converts a number into Indian Legal Words format
 * e.g. 2500000 -> "Rupees Twenty Five Lakh only"
 */
export function numberToIndianRupeesWords(amount: number): string {
  const n = Math.floor(Math.abs(amount));
  if (n === 0) return 'Rupees Zero only';

  const parts: string[] = [];
  let remaining = n;

  const crore = Math.floor(remaining / 10000000);
  remaining %= 10000000;

  const lakh = Math.floor(remaining / 100000);
  remaining %= 100000;

  const thousand = Math.floor(remaining / 1000);
  remaining %= 1000;

  const hundred = Math.floor(remaining / 100);
  const lastTwo = remaining % 100;

  if (crore > 0) {
    if (crore >= 100) {
      const cHundred = Math.floor(crore / 100);
      const cRem = crore % 100;
      parts.push(
        `${ONES[cHundred]} Hundred${cRem > 0 ? ' ' + twoDigitToWords(cRem) : ''} Crore`
      );
    } else {
      parts.push(`${twoDigitToWords(crore)} Crore`);
    }
  }

  if (lakh > 0) {
    parts.push(`${twoDigitToWords(lakh)} Lakh`);
  }

  if (thousand > 0) {
    parts.push(`${twoDigitToWords(thousand)} Thousand`);
  }

  if (hundred > 0) {
    parts.push(`${ONES[hundred]} Hundred`);
  }

  if (lastTwo > 0) {
    parts.push(twoDigitToWords(lastTwo));
  }

  return `Rupees ${parts.join(' ')} only`;
}

/**
 * Computes all automatic Page 1 & Page 4 metrics from SaleDeedData
 */
export function calculateDeedMetrics(data: SaleDeedData): CalculatedDeedMetrics {
  const plotSqYds = Math.max(0, Number(data.plotAreaSqYds) || 0);
  const factor = Number(data.sqYdsToSqMtrFactor) || 0.836;

  // Round to 2 decimal places so 40 * 0.836 = 33.44 exactly
  const plotAreaSqMtr = Number((plotSqYds * factor).toFixed(2));

  const totalFloorsMult = Number(data.totalFloorsMultiplier) || 4;
  const saleFloorMult = Number(data.saleFloorMultiplier) || 1;
  const constMult = Number(data.constructionMultiplier) || 4;

  const totalPlinthAreaSqMtr = Number((plotAreaSqMtr * totalFloorsMult).toFixed(2));
  const plinthAreaUnderSaleSqMtr = Number((plotAreaSqMtr * saleFloorMult).toFixed(2));

  const landRate = Number(data.govLandRatePerSqMtr) || 0;
  const constRate = Number(data.govConstRatePerSqMtr) || 0;

  // Minimum value of land: e.g. 33.44 * 46200 = 1544928
  const minLandValue = Math.round(plotAreaSqMtr * landRate);

  // Minimum value of Construction: e.g. 33.44 * 4 * 6960 = 930969.6 -> 930970
  const minConstructionValue = Math.round(plotAreaSqMtr * constMult * constRate);

  // Total Value of Property: e.g. 1544928 + 930970 = 2475898
  const totalPropertyValue = minLandValue + minConstructionValue;

  let stampDutyPaidOnAmount = totalPropertyValue;
  if (data.saleAmountMode === 'round_lakh') {
    // Round up to nearest 1,00,000 (so 24,75,898 -> 25,00,000 and 30,94,872 -> 31,00,000)
    stampDutyPaidOnAmount =
      totalPropertyValue > 0 ? Math.ceil(totalPropertyValue / 100000) * 100000 : 0;
  } else if (data.saleAmountMode === 'custom') {
    stampDutyPaidOnAmount = Math.max(0, Number(data.customSaleAmount) || 0);
  } else {
    stampDutyPaidOnAmount = totalPropertyValue;
  }

  const stampDutyAmountInWords = numberToIndianRupeesWords(stampDutyPaidOnAmount);

  const corpDutyPercent = Number(data.corpDutyPercent) || 0;
  const stampDutyPercent = Number(data.stampDutyPercent) || 0;
  const totalDutyPercent = Number((corpDutyPercent + stampDutyPercent).toFixed(2));

  const corpDutyAmount = Math.round((stampDutyPaidOnAmount * corpDutyPercent) / 100);
  const stampDutyAmount = Math.round((stampDutyPaidOnAmount * stampDutyPercent) / 100);
  const totalDutyAmount = corpDutyAmount + stampDutyAmount;

  const effectivePropertySqYds = data.syncPropertySqYdsWithPage1
    ? plotSqYds
    : Number(data.propertySqYdsPage2) || plotSqYds;

  return {
    plotAreaSqMtr,
    totalPlinthAreaSqMtr,
    plinthAreaUnderSaleSqMtr,
    minLandValue,
    minConstructionValue,
    totalPropertyValue,
    stampDutyPaidOnAmount,
    stampDutyAmountInWords,
    corpDutyAmount,
    stampDutyAmount,
    totalDutyPercent,
    totalDutyAmount,
    effectivePropertySqYds,
  };
}

/**
 * Helper to build the full bold property description string used on Page 2 & Page 3
 */
export function buildFullPropertyDescription(
  data: SaleDeedData,
  metrics: CalculatedDeedMetrics
): {
  mainBlock: string;
  cityPin: string;
  combinedPage3: string;
} {
  const parts: string[] = [];
  if (data.propertyTypePrefix.trim()) {
    parts.push(`${data.propertyTypePrefix.trim()} ${data.propertyHouseNo.trim()}`);
  } else if (data.propertyHouseNo.trim()) {
    parts.push(data.propertyHouseNo.trim());
  }

  const galiAndFloor = [data.propertyGaliNo.trim(), data.propertyFloorDescription.trim()]
    .filter(Boolean)
    .join(' ');

  const firstSegment = [parts.join(' '), galiAndFloor].filter(Boolean).join(',');

  const subSegments: string[] = [];
  if (firstSegment) subSegments.push(firstSegment);
  subSegments.push(`LAND AREA MEASURING ${metrics.effectivePropertySqYds} SQ.YDS.`);
  if (data.propertyKhasraNo.trim()) {
    subSegments.push(`OUT OF KHASRA NO. ${data.propertyKhasraNo.trim()}`);
  }
  if (data.propertyVillage.trim()) {
    subSegments.push(
      `SITUATED IN THE AREA OF VILLAGE ${data.propertyVillage.trim()}, ${data.propertyState.trim()}`
    );
  }
  if (data.propertyColony.trim()) {
    subSegments.push(`COLONY KNOWN AS ${data.propertyColony.trim()} `);
  }

  const mainBlock = `${subSegments.join(', ')},`;
  const cityPin = `${data.propertyCityPin.trim()},`;
  const combinedPage3 = `${mainBlock} ${cityPin}`;

  return { mainBlock, cityPin, combinedPage3 };
}
