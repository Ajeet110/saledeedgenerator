import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  UnderlineType,
  WidthType,
} from 'docx';
import { CalculatedDeedMetrics, SaleDeedData } from '../types/deed';
import {
  buildFullPropertyDescription,
  formatIndianNumber,
  formatSqMtr,
} from './calculations';

const FONT_FAMILY = 'Verdana';
const FONT_SIZE = 22; // 11pt in half-points

function createText(
  text: string,
  options?: {
    bold?: boolean;
    italics?: boolean;
    underline?: boolean;
    size?: number;
  }
): TextRun {
  return new TextRun({
    text,
    font: FONT_FAMILY,
    size: options?.size ?? FONT_SIZE,
    bold: options?.bold ?? false,
    italics: options?.italics ?? false,
    underline: options?.underline ? { type: UnderlineType.SINGLE } : undefined,
  });
}

function makeTableRow(leftText: string, rightText: string): TableRow {
  const cellBorders = {
    top: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
    bottom: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
    left: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
    right: { style: BorderStyle.SINGLE, size: 6, color: '000000' },
  };

  return new TableRow({
    children: [
      new TableCell({
        width: { size: 52, type: WidthType.PERCENTAGE },
        borders: cellBorders,
        margins: { top: 100, bottom: 100, left: 140, right: 120 },
        children: [
          new Paragraph({
            children: [createText(leftText, { size: 21 })],
          }),
        ],
      }),
      new TableCell({
        width: { size: 48, type: WidthType.PERCENTAGE },
        borders: cellBorders,
        margins: { top: 100, bottom: 100, left: 140, right: 120 },
        children: [
          new Paragraph({
            children: [createText(rightText, { size: 21 })],
          }),
        ],
      }),
    ],
  });
}

export async function exportToDocx(
  data: SaleDeedData,
  metrics: CalculatedDeedMetrics
): Promise<void> {
  const propDesc = buildFullPropertyDescription(data, metrics);
  const sqMtrStr = formatSqMtr(metrics.plotAreaSqMtr);
  const totalPlinthStr = formatSqMtr(metrics.totalPlinthAreaSqMtr);
  const salePlinthStr = formatSqMtr(metrics.plinthAreaUnderSaleSqMtr);

  // Page 1 Table
  const page1Table = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      makeTableRow('Name of the Colony/Area', `: ${data.colonyAreaPage1}`),
      makeTableRow('Category', `: “${data.category}”`),
      makeTableRow(
        `Total Area of Plot in Sq. Mtr.(${data.plotAreaSqYds}sq.yds)`,
        `: ${sqMtrStr} Sq. Mtr.`
      ),
      makeTableRow('Total Plinth area of Property', `: ${totalPlinthStr} Sq.Mtrs.`),
      makeTableRow('Plinth area under sale', `: ${salePlinthStr} Sq.Mtrs`),
      makeTableRow('Land Use', `: ${data.landUse}`),
      makeTableRow(
        'Minimum price of land fixed by the Govt.',
        `: Rs.${formatIndianNumber(data.govLandRatePerSqMtr)}/- per Sq. Mtr.`
      ),
      makeTableRow(
        'Minimum value of land',
        `: ${sqMtrStr} X Rs.${formatIndianNumber(data.govLandRatePerSqMtr)}/- =Rs.${formatIndianNumber(metrics.minLandValue)}/-`
      ),
      makeTableRow(
        'Minimum price of Const. Fixed by the Govt.',
        `: Rs. ${ data.govConstRatePerSqMtr }/- per Sq.Mtrs.`
      ),
      makeTableRow(
        'Minimum value of Construction',
        `: ${sqMtrStr} X${data.constructionMultiplier}X Rs.${data.govConstRatePerSqMtr}/- = Rs.${formatIndianNumber(metrics.minConstructionValue)}/-`
      ),
      makeTableRow(
        'Total Value of Property',
        `: Rs.${formatIndianNumber(metrics.totalPropertyValue)}/-`
      ),
      makeTableRow(
        'Total stamp duty paid on',
        `: Rs.${formatIndianNumber(metrics.stampDutyPaidOnAmount)}/-`
      ),
    ],
  });

  // Borderless table for Boundaries on Page 2
  const noBorders = {
    top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    left: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
    right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
  };

  const boundariesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 52, type: WidthType.PERCENTAGE },
            borders: noBorders,
            margins: { top: 80, bottom: 140, left: 0, right: 80 },
            children: [
              new Paragraph({
                children: [createText(`EAST        :- ${data.boundaryEast}`)],
              }),
            ],
          }),
          new TableCell({
            width: { size: 48, type: WidthType.PERCENTAGE },
            borders: noBorders,
            margins: { top: 80, bottom: 140, left: 40, right: 0 },
            children: [
              new Paragraph({
                children: [createText(`WEST   :- ${data.boundaryWest}`)],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 52, type: WidthType.PERCENTAGE },
            borders: noBorders,
            margins: { top: 80, bottom: 80, left: 0, right: 80 },
            children: [
              new Paragraph({
                children: [createText(`. NORTH    :- ${data.boundaryNorth}`)],
              }),
            ],
          }),
          new TableCell({
            width: { size: 48, type: WidthType.PERCENTAGE },
            borders: noBorders,
            margins: { top: 80, bottom: 80, left: 40, right: 0 },
            children: [
              new Paragraph({
                children: [createText(`SOUTH    :- ${data.boundarySouth}`)],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  // Borderless table for Witnesses & Vendor/Vendee on Page 6
  const witnessesTable = new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [
      new TableRow({
        children: [
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            borders: noBorders,
            margins: { top: 60, bottom: 180, left: 200, right: 80 },
            children: [
              new Paragraph({
                spacing: { after: 120 },
                children: [createText('1.')],
              }),
              new Paragraph({
                children: [
                  createText(`${data.witness1Honorific} ${data.witness1Name}`, {
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  createText(`${data.witness1RelationType} ${data.witness1RelativeName}`),
                ],
              }),
              ...(data.witness1AddressLine1
                ? [new Paragraph({ children: [createText(data.witness1AddressLine1)] })]
                : []),
              ...(data.witness1AddressLine2
                ? [new Paragraph({ children: [createText(data.witness1AddressLine2)] })]
                : []),
              ...(data.witness1AddressLine3
                ? [new Paragraph({ children: [createText(data.witness1AddressLine3)] })]
                : []),
              new Paragraph({
                children: [
                  createText(`(AADHAR NO. ${data.witness1Aadhar})`, { bold: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            borders: noBorders,
            margins: { top: 60, bottom: 180, left: 80, right: 0 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [createText('VENDOR')],
              }),
            ],
          }),
        ],
      }),
      new TableRow({
        children: [
          new TableCell({
            width: { size: 65, type: WidthType.PERCENTAGE },
            borders: noBorders,
            margins: { top: 100, bottom: 60, left: 200, right: 80 },
            children: [
              new Paragraph({
                children: [createText('2.')],
              }),
              new Paragraph({
                children: [
                  createText(`${data.witness2Honorific} ${data.witness2Name}`, {
                    bold: true,
                  }),
                ],
              }),
              new Paragraph({
                children: [
                  createText(
                    `${data.witness2RelationType} ${data.witness2RelativeName} ${data.witness2AddressLine1}`
                  ),
                ],
              }),
              ...(data.witness2AddressLine2
                ? [new Paragraph({ children: [createText(data.witness2AddressLine2)] })]
                : []),
              ...(data.witness2AddressLine3
                ? [new Paragraph({ children: [createText(data.witness2AddressLine3)] })]
                : []),
              new Paragraph({
                children: [
                  createText(`(AADHAR NO. ${data.witness2Aadhar})`, { bold: true }),
                ],
              }),
            ],
          }),
          new TableCell({
            width: { size: 35, type: WidthType.PERCENTAGE },
            borders: noBorders,
            margins: { top: 100, bottom: 60, left: 80, right: 0 },
            children: [
              new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [createText('VENDEE')],
              }),
            ],
          }),
        ],
      }),
    ],
  });

  const doc = new Document({
    sections: [
      {
        properties: {
          page: {
            size: {
              width: 11906, // A4 width in twips (210mm)
              height: 16838, // A4 height in twips (297mm)
            },
            margin: {
              top: 1440,
              right: 1260,
              bottom: 1260,
              left: 1440,
            },
          },
        },
        children: [
          // ==================== PAGE 1 ====================
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { before: 400, after: 240 },
            children: [
              createText(
                `SALE DEED FOR Rs. ${formatIndianNumber(metrics.stampDutyPaidOnAmount)}/-`,
                { bold: true, underline: true, size: 22 }
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 280 },
            children: [
              createText('Description of property', { underline: true, size: 21 }),
            ],
          }),
          page1Table,
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { before: 480, after: 80 },
            indent: { right: 900 },
            children: [createText(data.dutyGenderLabel)],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 240 },
            children: [
              createText(
                `Corporation Duty..${data.corpDutyPercent} %..@..Rs.${formatIndianNumber(metrics.corpDutyAmount)}/-`
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 240 },
            children: [
              createText(
                `Stamp Duty..${data.stampDutyPercent} %..@..Rs.${formatIndianNumber(metrics.stampDutyAmount)}/-`
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.RIGHT,
            spacing: { after: 200 },
            children: [
              createText(
                `Total Duty ..${metrics.totalDutyPercent}%..@..Rs.${formatIndianNumber(metrics.totalDutyAmount)}/-`
              ),
            ],
          }),
          new Paragraph({ children: [new PageBreak()] }),

          // ==================== PAGE 2 ====================
          new Paragraph({
            spacing: { before: 200, after: 320, line: 340 },
            children: [
              createText(
                `This SALE DEED is made and executed at ${data.executionPlace} on this ${data.executionDateText}by and between:-`
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            spacing: { after: 360, line: 320 },
            children: [
              createText(
                `${data.vendorHonorific} ${data.vendorName} ${data.vendorRelationType} ${data.vendorRelativeHonorific} ${data.vendorRelativeName} RESIDENT OF ${data.vendorAddress}, `,
                { bold: true }
              ),
              createText(
                `Hereinafter referred to as "the VENDOR" (which expression, herein used, shall mean and include ${data.vendorPronoun} legal heirs, successors, legal representatives, administrators, executors, nominees and assignees) of the one part.`
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 280 },
            children: [
              createText('IN FAVOUR OF', {
                bold: true,
                italics: true,
                underline: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            spacing: { after: 400, line: 380 },
            children: [
              createText(
                `${data.vendeeHonorific} ${data.vendeeName} ${data.vendeeRelationType} ${data.vendeeRelativeHonorific} ${data.vendeeRelativeName} RESEDENT OF ${data.vendeeAddress}, `,
                { bold: true }
              ),
              createText(
                `Hereinafter called "The VENDEES", (which expression, herein used, shall mean and include their heirs, successors, legal representatives, administrators, executors, nominees and assignees of the other part.`
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            spacing: { after: 320, line: 400 },
            children: [
              createText(
                'WHEREAS the VENDOR is the absolute and exclusive owner and in possession of '
              ),
              createText(propDesc.mainBlock, { bold: true }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            spacing: { after: 360, line: 360 },
            children: [
              createText(`${propDesc.cityPin} `, { bold: true }),
              createText('and the above mentioned property is bounded as under :-'),
            ],
          }),
          boundariesTable,
          new Paragraph({ children: [new PageBreak()] }),

          // ==================== PAGE 3 ====================
          new Paragraph({
            alignment: AlignmentType.BOTH,
            spacing: { before: 200, after: 420, line: 380 },
            children: [
              createText('(hereinafter referred to as the “'),
              createText('Said Property', { bold: true }),
              createText(
                `”) ${data.priorTitleDocText}, having purchased from ${data.priorOwnerHonorific}${data.priorOwnerName} ${data.priorOwnerRelation} ${data.priorOwnerRelativeHonorific} ${data.priorOwnerRelativeName} to do all acts, deeds and things including the power to sell and transfer the same in any manner.`
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            spacing: { after: 420, line: 380 },
            children: [
              createText(
                `AND WHEREAS the VENDOR has full power and absolute authority to sell and transfer the aforesaid property unto the VENDEES, and to receive the sale consideration in ${data.vendorPronoun} own name and neither anyone else has any right, title and interest in the aforesaid property nor there is any legal impediment which prohibits the VENDOR to sell the same unto the VENDEES.`
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            spacing: { after: 360, line: 380 },
            children: [
              createText(
                `AND WHEREAS the VENDOR has agreed to sell, convey, transfer and assign ${data.vendorPronoun} all rights, titles and interests in the aforesaid `
              ),
              createText(propDesc.combinedPage3, { bold: true }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            spacing: { after: 420, line: 380 },
            children: [
              createText(
                'hereinafter referred to as ”the said property”, alongwith all benefits, facilities, privileges, easements or advantages belonging to or in any way appertaining to the said property to the VENDEES.'
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            spacing: { after: 240, line: 380 },
            children: [
              createText(
                'AND WHEREAS the VENDEES has agreed to purchase, acquire and possess the said property relying on the various assurances, covenants, representations, statements and undertaking given by the VENDOR and believing the same to be true and acting on the faith thereof and on the terms and conditions mentioned hereunder.'
              ),
            ],
          }),
          new Paragraph({ children: [new PageBreak()] }),

          // ==================== PAGE 4 ====================
          new Paragraph({
            spacing: { before: 200, after: 360 },
            children: [
              createText('NOW THIS SALE DEED WITNESSESTH AS UNDER:-', {
                bold: true,
                underline: true,
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            indent: { left: 480, hanging: 360 },
            spacing: { after: 400, line: 380 },
            children: [
              createText('1.  That in consideration of the said sum of '),
              createText(
                `Rs.${formatIndianNumber(metrics.stampDutyPaidOnAmount)}/- (${metrics.stampDutyAmountInWords}).`,
                { bold: true }
              ),
              createText(
                `, the VENDOR hereby sell, convey, alienate and transfer all ${data.vendorPronoun} rights, titles and interests in the said property, along with boundary wall, fittings, fixtures and super structure thereon and all other estate rights whatsoever, including all easements, appurtenances to the said property as also enjoyed or reputed to be enjoyed therewith unto the VENDEES, in perfect and absolute ownership without any hindrance, disturbance, whatsoever, TO HAVE, TO HOLD AND TO ENJOY THE SAME ABSOLUTELY AND FOREVER.`
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            indent: { left: 480, hanging: 360 },
            spacing: { after: 400, line: 380 },
            children: [
              createText(
                '2.  That the VENDOR hereby explicitly admits and declares that having received the aforesaid consideration in full and final payment, now nothing is left due from the VENDEES to the VENDOR against sale consideration for the purchase of the said property, as the aforesaid consideration represents the full and final consideration for the transaction.'
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            indent: { left: 480, hanging: 360 },
            spacing: { after: 400, line: 380 },
            children: [
              createText(
                '3.  That the VENDOR has delivered the peaceful and actual physical vacant possession of the said property unto the VENDEES on the spot.'
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            indent: { left: 480, hanging: 360 },
            spacing: { after: 200, line: 380 },
            children: [
              createText(
                `4.  That the VENDOR hereby sell, grant, convey, transfer and assign, with the ownership rights of the said property together with the super structure thereon, unto the VENDEES, and the VENDOR hereby transfers ${data.vendorPronoun} all rights, titles and interests, along with all the rights, privileges, easements and appurtenances, whatsoever in the said property, belong and usually held herewith including all electric, water and all the estate right, title, and interest in the said property, hereby conveyed, and every part thereof TO HAVE AND TO HOLD THE SAME unto the VENDEES absolutely and forever.`
              ),
            ],
          }),
          new Paragraph({ children: [new PageBreak()] }),

          // ==================== PAGE 5 ====================
          new Paragraph({
            alignment: AlignmentType.BOTH,
            indent: { left: 480, hanging: 360 },
            spacing: { before: 200, after: 420, line: 380 },
            children: [
              createText(
                '5.  That the VENDOR hereby assure the VENDEES that the said property, hereby conveyed, is free from all sorts of charges, encumbrances, liens, loan, claims, demands, and liabilities, surety, security, legal flaws, disputes, sale, mortgage, gift, liabilities, disabilities, injunction, notifications for acquisitions/requisition, and if ever it is proved to be otherwise and the VENDEES suffers, due to any legal defect in the title of the VENDOR, any loss and/or whole or any part of the said property, hereby conveyed, is taken away from the possession of the VENDEES, then the VENDOR will make good the losses thus suffered by the VENDEES in this regard and shall keep the VENDEES indemnified against all losses, costs, damages and expenses accruing thereby to the VENDEES.'
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            indent: { left: 480, hanging: 360 },
            spacing: { after: 420, line: 380 },
            children: [
              createText(
                `6.  That the VENDOR hereby further assure the VENDEES that ${data.vendorPronoun === 'his' ? 'he' : 'she'} or anyone else claiming from or through the VENDOR has not created any encumbrances or license or restriction thereon nor is there any claim or litigation or legal proceeding injunction or attachment concerning the said property.`
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            indent: { left: 480, hanging: 360 },
            spacing: { after: 420, line: 380 },
            children: [
              createText(
                `7.  That the VENDOR now admits that ${data.vendorPronoun === 'his' ? 'he' : 'she'} has been left with no right, title and interest of any nature, whatsoever may be in the said property, and the VENDEES has become the absolute owner of the same and ${data.vendeePronoun === 'his' ? 'he' : 'she'} will use and enjoy the same in any manner, ${data.vendeePronoun === 'his' ? 'he' : 'she'} likes, including right to sell, transfer or alienate the said property to anyone including the right to give the same on rent to anyone and to receive the rent and profit to the tenant(s) evicted through the process of law or by negotiation, to take possession etc.`
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            indent: { left: 480, hanging: 360 },
            spacing: { after: 200, line: 380 },
            children: [
              createText(
                `8.  That the VENDEES can get the mutation of the said property in ${data.vendeePronoun} own name in the absence of the VENDOR on the basis of this sale deed or its certified true copy in the revenue records.`
              ),
            ],
          }),
          new Paragraph({ children: [new PageBreak()] }),

          // ==================== PAGE 6 ====================
          new Paragraph({
            alignment: AlignmentType.BOTH,
            indent: { left: 480, hanging: 360 },
            spacing: { before: 120, after: 340, line: 360 },
            children: [
              createText(
                "9.  That the VENDOR and all persons claiming under or through the VENDOR shall and will as and when required by the VENDEES and at the VENDEES's costs to do all act and execute all documents and authorities as be reasonable required by the VENDEES for more fully effectuating the sale being hereby made or for more fully owning and enjoying the said property or defending any action or proceeding concerning the same."
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            indent: { left: 480, hanging: 360 },
            spacing: { after: 340, line: 360 },
            children: [
              createText(
                '10. That VENDOR will be responsible for the payment of the rates, cesses, taxes, payable in respect of the said property, up to date, and thereafter the VENDEES will be responsible for the payment of the same.'
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            indent: { left: 480, hanging: 360 },
            spacing: { after: 340, line: 360 },
            children: [
              createText(
                '11. That the VENDEES has paid the stamp duty, transfer duty, registration charges and other incidental charges for the execution of this Sale deed.'
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            indent: { left: 480, hanging: 360 },
            spacing: { after: 360, line: 360 },
            children: [
              createText(
                '12. That both the parties, hereto i.e. the VENDOR and the VENDEES are Indian National.'
              ),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.BOTH,
            spacing: { after: 320, line: 360 },
            children: [
              createText(
                'IN WITNESS WHEREOF, the VENDOR and the VENDEES have set subscribed their hands to this sale deed on the day, month and year, first mentioned above, in the presence of the following witnesses.'
              ),
            ],
          }),
          new Paragraph({
            spacing: { after: 120 },
            children: [createText('WITNESSES:-')],
          }),
          witnessesTable,
        ],
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const cleanColony = data.colonyAreaPage1.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.href = url;
  a.download = `Sale_Deed_${cleanColony}_${data.plotAreaSqYds}SqYds.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Also supports downloading a classic .doc Word document from the rendered 6-page HTML
 */
export function exportToClassicDoc(
  data: SaleDeedData,
  metrics: CalculatedDeedMetrics
): void {
  const propDesc = buildFullPropertyDescription(data, metrics);
  const sqMtrStr = formatSqMtr(metrics.plotAreaSqMtr);
  const totalPlinthStr = formatSqMtr(metrics.totalPlinthAreaSqMtr);
  const salePlinthStr = formatSqMtr(metrics.plinthAreaUnderSaleSqMtr);

  const htmlContent = `
  <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
  <head>
    <meta charset="utf-8">
    <title>Sale Deed</title>
    <style>
      @page WordSection1 {
        size: 210mm 297mm;
        margin: 25mm 22mm 20mm 24mm;
      }
      div.WordSection1 { page: WordSection1; }
      body {
        font-family: Verdana, Geneva, sans-serif;
        font-size: 11pt;
        line-height: 1.65;
        color: #000000;
      }
      table.deed-table {
        width: 100%;
        border-collapse: collapse;
        border: 1px solid #000000;
        font-size: 10.5pt;
      }
      table.deed-table td {
        border-top: 1px solid #000000;
        border-bottom: 1px solid #000000;
        padding: 6px 10px;
      }
      .page-break {
        page-break-before: always;
        mso-break-type: section-break;
      }
      p { margin: 0 0 14pt 0; text-align: justify; }
    </style>
  </head>
  <body>
    <div class="WordSection1">
      <!-- PAGE 1 -->
      <p style="text-align:center; font-weight:bold; text-decoration:underline; margin-top:24pt; margin-bottom:12pt;">
        SALE DEED FOR Rs. ${formatIndianNumber(metrics.stampDutyPaidOnAmount)}/-
      </p>
      <p style="text-align:center; text-decoration:underline; margin-bottom:14pt; font-size:10.5pt;">
        Description of property
      </p>
      <table class="deed-table">
        <tr><td width="52%">Name of the Colony/Area</td><td width="48%">: ${data.colonyAreaPage1}</td></tr>
        <tr><td>Category</td><td>: “${data.category}”</td></tr>
        <tr><td>Total Area of Plot in Sq. Mtr.(${data.plotAreaSqYds}sq.yds)</td><td>: ${sqMtrStr} Sq. Mtr.</td></tr>
        <tr><td>Total Plinth area of Property</td><td>: ${totalPlinthStr} Sq.Mtrs.</td></tr>
        <tr><td>Plinth area under sale</td><td>: ${salePlinthStr} Sq.Mtrs</td></tr>
        <tr><td>Land Use</td><td>: ${data.landUse}</td></tr>
        <tr><td>Minimum price of land fixed by the Govt.</td><td>: Rs.${formatIndianNumber(data.govLandRatePerSqMtr)}/- per Sq. Mtr.</td></tr>
        <tr><td>Minimum value of land</td><td>: ${sqMtrStr} X Rs.${formatIndianNumber(data.govLandRatePerSqMtr)}/- =Rs.${formatIndianNumber(metrics.minLandValue)}/-</td></tr>
        <tr><td>Minimum price of Const. Fixed by the Govt.</td><td>: Rs. ${data.govConstRatePerSqMtr}/- per Sq.Mtrs.</td></tr>
        <tr><td>Minimum value of Construction</td><td>: ${sqMtrStr} X${data.constructionMultiplier}X Rs.${data.govConstRatePerSqMtr}/- = Rs.${formatIndianNumber(metrics.minConstructionValue)}/-</td></tr>
        <tr><td>Total Value of Property</td><td>: Rs.${formatIndianNumber(metrics.totalPropertyValue)}/-</td></tr>
        <tr><td>Total stamp duty paid on</td><td>: Rs.${formatIndianNumber(metrics.stampDutyPaidOnAmount)}/-</td></tr>
      </table>
      <div style="margin-top:24pt; text-align:right; padding-right:10pt;">
        <p style="text-align:right; margin-bottom:4pt; padding-right:55pt;">${data.dutyGenderLabel}</p>
        <p style="text-align:right; margin-bottom:12pt;">Corporation Duty..${data.corpDutyPercent} %..@..Rs.${formatIndianNumber(metrics.corpDutyAmount)}/-</p>
        <p style="text-align:right; margin-bottom:12pt;">Stamp Duty..${data.stampDutyPercent} %..@..Rs.${formatIndianNumber(metrics.stampDutyAmount)}/-</p>
        <p style="text-align:right; margin-bottom:12pt;">Total Duty ..${metrics.totalDutyPercent}%..@..Rs.${formatIndianNumber(metrics.totalDutyAmount)}/-</p>
      </div>

      <br clear="all" style="page-break-before:always" />

      <!-- PAGE 2 -->
      <p style="margin-top:16pt;">This SALE DEED is made and executed at ${data.executionPlace} on this ${data.executionDateText}by and between:-</p>
      <p><b>${data.vendorHonorific} ${data.vendorName} ${data.vendorRelationType} ${data.vendorRelativeHonorific} ${data.vendorRelativeName} RESIDENT OF ${data.vendorAddress},</b> Hereinafter referred to as "the VENDOR" (which expression, herein used, shall mean and include ${data.vendorPronoun} legal heirs, successors, legal representatives, administrators, executors, nominees and assignees) of the one part.</p>
      <p style="text-align:center; font-weight:bold; font-style:italic; text-decoration:underline;">IN FAVOUR OF</p>
      <p><b>${data.vendeeHonorific} ${data.vendeeName} ${data.vendeeRelationType} ${data.vendeeRelativeHonorific} ${data.vendeeRelativeName} RESEDENT OF ${data.vendeeAddress},</b> Hereinafter called "The VENDEES", (which expression, herein used, shall mean and include their heirs, successors, legal representatives, administrators, executors, nominees and assignees of the other part.</p>
      <p>WHEREAS the VENDOR is the absolute and exclusive owner and in possession of <b>${propDesc.mainBlock}</b></p>
      <p><b>${propDesc.cityPin}</b> and the above mentioned property is bounded as under :-</p>
      <table width="100%" style="border:none; margin-top:14pt;">
        <tr>
          <td width="52%" style="padding-bottom:14pt;">EAST &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; :- ${data.boundaryEast}</td>
          <td width="48%" style="padding-bottom:14pt;">WEST &nbsp; :- ${data.boundaryWest}</td>
        </tr>
        <tr>
          <td>. NORTH &nbsp;&nbsp; :- ${data.boundaryNorth}</td>
          <td>SOUTH &nbsp;&nbsp; :- ${data.boundarySouth}</td>
        </tr>
      </table>

      <br clear="all" style="page-break-before:always" />

      <!-- PAGE 3 -->
      <p style="margin-top:16pt;">(hereinafter referred to as the “<b>Said Property</b>”) ${data.priorTitleDocText}, having purchased from ${data.priorOwnerHonorific}${data.priorOwnerName} ${data.priorOwnerRelation} ${data.priorOwnerRelativeHonorific} ${data.priorOwnerRelativeName} to do all acts, deeds and things including the power to sell and transfer the same in any manner.</p>
      <p>AND WHEREAS the VENDOR has full power and absolute authority to sell and transfer the aforesaid property unto the VENDEES, and to receive the sale consideration in ${data.vendorPronoun} own name and neither anyone else has any right, title and interest in the aforesaid property nor there is any legal impediment which prohibits the VENDOR to sell the same unto the VENDEES.</p>
      <p>AND WHEREAS the VENDOR has agreed to sell, convey, transfer and assign ${data.vendorPronoun} all rights, titles and interests in the aforesaid <b>${propDesc.combinedPage3}</b></p>
      <p>hereinafter referred to as ”the said property”, alongwith all benefits, facilities, privileges, easements or advantages belonging to or in any way appertaining to the said property to the VENDEES.</p>
      <p>AND WHEREAS the VENDEES has agreed to purchase, acquire and possess the said property relying on the various assurances, covenants, representations, statements and undertaking given by the VENDOR and believing the same to be true and acting on the faith thereof and on the terms and conditions mentioned hereunder.</p>

      <br clear="all" style="page-break-before:always" />

      <!-- PAGE 4 -->
      <p style="margin-top:16pt; font-weight:bold; text-decoration:underline;">NOW THIS SALE DEED WITNESSESTH AS UNDER:-</p>
      <p style="margin-left:24pt; text-indent:-18pt;">1. &nbsp; That in consideration of the said sum of <b>Rs.${formatIndianNumber(metrics.stampDutyPaidOnAmount)}/- (${metrics.stampDutyAmountInWords}).</b>, the VENDOR hereby sell, convey, alienate and transfer all ${data.vendorPronoun} rights, titles and interests in the said property, along with boundary wall, fittings, fixtures and super structure thereon and all other estate rights whatsoever, including all easements, appurtenances to the said property as also enjoyed or reputed to be enjoyed therewith unto the VENDEES, in perfect and absolute ownership without any hindrance, disturbance, whatsoever, TO HAVE, TO HOLD AND TO ENJOY THE SAME ABSOLUTELY AND FOREVER.</p>
      <p style="margin-left:24pt; text-indent:-18pt;">2. &nbsp; That the VENDOR hereby explicitly admits and declares that having received the aforesaid consideration in full and final payment, now nothing is left due from the VENDEES to the VENDOR against sale consideration for the purchase of the said property, as the aforesaid consideration represents the full and final consideration for the transaction.</p>
      <p style="margin-left:24pt; text-indent:-18pt;">3. &nbsp; That the VENDOR has delivered the peaceful and actual physical vacant possession of the said property unto the VENDEES on the spot.</p>
      <p style="margin-left:24pt; text-indent:-18pt;">4. &nbsp; That the VENDOR hereby sell, grant, convey, transfer and assign, with the ownership rights of the said property together with the super structure thereon, unto the VENDEES, and the VENDOR hereby transfers ${data.vendorPronoun} all rights, titles and interests, along with all the rights, privileges, easements and appurtenances, whatsoever in the said property, belong and usually held herewith including all electric, water and all the estate right, title, and interest in the said property, hereby conveyed, and every part thereof TO HAVE AND TO HOLD THE SAME unto the VENDEES absolutely and forever.</p>

      <br clear="all" style="page-break-before:always" />

      <!-- PAGE 5 -->
      <p style="margin-top:16pt; margin-left:24pt; text-indent:-18pt;">5. &nbsp; That the VENDOR hereby assure the VENDEES that the said property, hereby conveyed, is free from all sorts of charges, encumbrances, liens, loan, claims, demands, and liabilities, surety, security, legal flaws, disputes, sale, mortgage, gift, liabilities, disabilities, injunction, notifications for acquisitions/requisition, and if ever it is proved to be otherwise and the VENDEES suffers, due to any legal defect in the title of the VENDOR, any loss and/or whole or any part of the said property, hereby conveyed, is taken away from the possession of the VENDEES, then the VENDOR will make good the losses thus suffered by the VENDEES in this regard and shall keep the VENDEES indemnified against all losses, costs, damages and expenses accruing thereby to the VENDEES.</p>
      <p style="margin-left:24pt; text-indent:-18pt;">6. &nbsp; That the VENDOR hereby further assure the VENDEES that ${data.vendorPronoun === 'his' ? 'he' : 'she'} or anyone else claiming from or through the VENDOR has not created any encumbrances or license or restriction thereon nor is there any claim or litigation or legal proceeding injunction or attachment concerning the said property.</p>
      <p style="margin-left:24pt; text-indent:-18pt;">7. &nbsp; That the VENDOR now admits that ${data.vendorPronoun === 'his' ? 'he' : 'she'} has been left with no right, title and interest of any nature, whatsoever may be in the said property, and the VENDEES has become the absolute owner of the same and ${data.vendeePronoun === 'his' ? 'he' : 'she'} will use and enjoy the same in any manner, ${data.vendeePronoun === 'his' ? 'he' : 'she'} likes, including right to sell, transfer or alienate the said property to anyone including the right to give the same on rent to anyone and to receive the rent and profit to the tenant(s) evicted through the process of law or by negotiation, to take possession etc.</p>
      <p style="margin-left:24pt; text-indent:-18pt;">8. &nbsp; That the VENDEES can get the mutation of the said property in ${data.vendeePronoun} own name in the absence of the VENDOR on the basis of this sale deed or its certified true copy in the revenue records.</p>

      <br clear="all" style="page-break-before:always" />

      <!-- PAGE 6 -->
      <p style="margin-top:12pt; margin-left:24pt; text-indent:-18pt;">9. &nbsp; That the VENDOR and all persons claiming under or through the VENDOR shall and will as and when required by the VENDEES and at the VENDEES's costs to do all act and execute all documents and authorities as be reasonable required by the VENDEES for more fully effectuating the sale being hereby made or for more fully owning and enjoying the said property or defending any action or proceeding concerning the same.</p>
      <p style="margin-left:24pt; text-indent:-18pt;">10. That VENDOR will be responsible for the payment of the rates, cesses, taxes, payable in respect of the said property, up to date, and thereafter the VENDEES will be responsible for the payment of the same.</p>
      <p style="margin-left:24pt; text-indent:-18pt;">11. That the VENDEES has paid the stamp duty, transfer duty, registration charges and other incidental charges for the execution of this Sale deed.</p>
      <p style="margin-left:24pt; text-indent:-18pt;">12. That both the parties, hereto i.e. the VENDOR and the VENDEES are Indian National.</p>
      <p>IN WITNESS WHEREOF, the VENDOR and the VENDEES have set subscribed their hands to this sale deed on the day, month and year, first mentioned above, in the presence of the following witnesses.</p>
      <p style="margin-bottom:4pt;">WITNESSES:-</p>
      <table width="100%" style="border:none;">
        <tr>
          <td width="68%" valign="top" style="padding-left:18pt; padding-bottom:16pt;">
            <div>1.</div>
            <div style="margin-top:8pt;"><b>${data.witness1Honorific} ${data.witness1Name}</b></div>
            <div>${data.witness1RelationType} ${data.witness1RelativeName}</div>
            ${data.witness1AddressLine1 ? `<div>${data.witness1AddressLine1}</div>` : ''}
            ${data.witness1AddressLine2 ? `<div>${data.witness1AddressLine2}</div>` : ''}
            ${data.witness1AddressLine3 ? `<div>${data.witness1AddressLine3}</div>` : ''}
            <div><b>(AADHAR NO. ${data.witness1Aadhar})</b></div>
          </td>
          <td width="32%" valign="top" align="center">VENDOR</td>
        </tr>
        <tr>
          <td width="68%" valign="top" style="padding-left:18pt;">
            <div>2.</div>
            <div><b>${data.witness2Honorific} ${data.witness2Name}</b></div>
            <div>${data.witness2RelationType} ${data.witness2RelativeName} ${data.witness2AddressLine1}</div>
            ${data.witness2AddressLine2 ? `<div>${data.witness2AddressLine2}</div>` : ''}
            ${data.witness2AddressLine3 ? `<div>${data.witness2AddressLine3}</div>` : ''}
            <div><b>(AADHAR NO. ${data.witness2Aadhar})</b></div>
          </td>
          <td width="32%" valign="top" align="center">VENDEE</td>
        </tr>
      </table>
    </div>
  </body>
  </html>`;

  const blob = new Blob(['\ufeff', htmlContent], {
    type: 'application/msword;charset=utf-8',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const cleanColony = data.colonyAreaPage1.replace(/[^a-zA-Z0-9_-]/g, '_');
  a.href = url;
  a.download = `Sale_Deed_${cleanColony}_${data.plotAreaSqYds}SqYds.doc`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
