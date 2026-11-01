import React from 'react';
import { CalculatedDeedMetrics, SaleDeedData } from '../types/deed';
import {
  buildFullPropertyDescription,
  formatIndianNumber,
  formatSqMtr,
} from '../utils/calculations';

interface A4DocumentPreviewProps {
  data: SaleDeedData;
  metrics: CalculatedDeedMetrics;
  activeTab: number; // 1 = Page 1, 2 = Parties, 3 = Property, 4 = Witnesses
  selectedPageFilter: number | 'all';
  showHighlights: boolean;
  onSelectSection: (tabIndex: number, fieldId?: string) => void;
  pageRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

export const A4DocumentPreview: React.FC<A4DocumentPreviewProps> = ({
  data,
  metrics,
  activeTab,
  selectedPageFilter,
  showHighlights,
  onSelectSection,
  pageRefs,
}) => {
  const sqMtrStr = formatSqMtr(metrics.plotAreaSqMtr);
  const totalPlinthStr = formatSqMtr(metrics.totalPlinthAreaSqMtr);
  const salePlinthStr = formatSqMtr(metrics.plinthAreaUnderSaleSqMtr);
  const propDesc = buildFullPropertyDescription(data, metrics);

  const shouldShowPage = (pageNum: number) =>
    selectedPageFilter === 'all' || selectedPageFilter === pageNum;

  const PageHeaderBadge: React.FC<{
    pageNum: number;
    title: string;
    editTab: number;
  }> = ({ pageNum, title, editTab }) => (
    <div className="no-print flex items-center justify-between mb-2.5 px-1">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#1E3A8A] text-white shadow-xs">
          A4 Sheet {pageNum} of 6
        </span>
        <span className="text-xs font-medium text-zinc-600">{title}</span>
      </div>
      <button
        type="button"
        onClick={() => onSelectSection(editTab)}
        className="text-xs font-medium text-[#1E3A8A] hover:text-blue-900 underline cursor-pointer"
      >
        Edit Page {pageNum} Fields →
      </button>
    </div>
  );

  return (
    <div className={showHighlights ? 'show-highlights space-y-8' : 'space-y-8'}>
      {/* ==================== PAGE 1 OF 6 ==================== */}
      {shouldShowPage(1) && (
        <div
          ref={(el) => {
            pageRefs.current[0] = el;
          }}
        >
          <PageHeaderBadge
            pageNum={1}
            title="Valuation Table, Plot Sq.Yds to Sq.Mtr & Stamp Duty"
            editTab={1}
          />
          <div
            className={`a4-page ${activeTab === 1 ? 'a4-page-active' : ''}`}
            onClick={() => onSelectSection(1)}
          >
            {/* Top cursor mark like in reference image 1 */}
            <div className="h-8" />

            {/* Centered Bold Underlined Heading */}
            <div className="text-center mb-3">
              <span
                className={`font-bold underline tracking-wide text-[11.5pt] live-field ${
                  activeTab === 1 ? 'live-field-active' : ''
                }`}
              >
                SALE DEED FOR Rs. {formatIndianNumber(metrics.stampDutyPaidOnAmount)}/-
              </span>
            </div>

            {/* Sub-heading */}
            <div className="text-center mb-3.5">
              <span className="underline text-[10.5pt]">Description of property</span>
            </div>

            {/* 12-Row Bordered Valuation Table */}
            <table className="deed-table">
              <tbody>
                <tr>
                  <td>Name of the Colony/Area</td>
                  <td>
                    :{' '}
                    <span className="live-field">{data.colonyAreaPage1}</span>
                  </td>
                </tr>
                <tr>
                  <td>Category</td>
                  <td>
                    : “<span className="live-field">{data.category}</span>”
                  </td>
                </tr>
                <tr>
                  <td>
                    Total Area of Plot in Sq. Mtr.(
                    <span className="live-field font-semibold">
                      {data.plotAreaSqYds}sq.yds
                    </span>
                    )
                  </td>
                  <td>
                    :{' '}
                    <span className="live-field font-semibold">
                      {sqMtrStr} Sq. Mtr.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Total Plinth area of Property</td>
                  <td>
                    : <span className="live-field">{totalPlinthStr} Sq.Mtrs.</span>
                  </td>
                </tr>
                <tr>
                  <td>Plinth area under sale</td>
                  <td>
                    : <span className="live-field">{salePlinthStr} Sq.Mtrs</span>
                  </td>
                </tr>
                <tr>
                  <td>Land Use</td>
                  <td>
                    : <span className="live-field">{data.landUse}</span>
                  </td>
                </tr>
                <tr>
                  <td>Minimum price of land fixed by the Govt.</td>
                  <td>
                    :{' '}
                    <span className="live-field">
                      Rs.{formatIndianNumber(data.govLandRatePerSqMtr)}/- per Sq. Mtr.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Minimum value of land</td>
                  <td>
                    :{' '}
                    <span className="live-field">
                      {sqMtrStr} X Rs.{formatIndianNumber(data.govLandRatePerSqMtr)}/-
                      =Rs.{formatIndianNumber(metrics.minLandValue)}/-
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Minimum price of Const. Fixed by the Govt.</td>
                  <td>
                    :{' '}
                    <span className="live-field">
                      Rs. {data.govConstRatePerSqMtr}/- per Sq.Mtrs.
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Minimum value of Construction</td>
                  <td>
                    :{' '}
                    <span className="live-field">
                      {sqMtrStr} X{data.constructionMultiplier}X Rs.
                      {data.govConstRatePerSqMtr}/- = Rs.
                      {formatIndianNumber(metrics.minConstructionValue)}/-
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Total Value of Property</td>
                  <td>
                    :{' '}
                    <span className="live-field font-semibold">
                      Rs.{formatIndianNumber(metrics.totalPropertyValue)}/-
                    </span>
                  </td>
                </tr>
                <tr>
                  <td>Total stamp duty paid on</td>
                  <td>
                    :{' '}
                    <span className="live-field font-semibold">
                      Rs.{formatIndianNumber(metrics.stampDutyPaidOnAmount)}/-
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* Bottom Right Duty Summary Block matching Reference Image 1 */}
            <div className="mt-9 pr-2 flex flex-col items-end text-[10.5pt] leading-relaxed">
              <div className="pr-20 mb-0.5">
                <span className="live-field">{data.dutyGenderLabel}</span>
              </div>
              <div className="mb-4">
                Corporation Duty..
                <span className="live-field">{data.corpDutyPercent}</span> %..@..Rs.
                <span className="live-field">
                  {formatIndianNumber(metrics.corpDutyAmount)}
                </span>
                /-
              </div>
              <div className="mb-4">
                Stamp Duty..
                <span className="live-field">{data.stampDutyPercent}</span> %..@..Rs.
                <span className="live-field">
                  {formatIndianNumber(metrics.stampDutyAmount)}
                </span>
                /-
              </div>
              <div>
                Total Duty ..
                <span className="live-field">{metrics.totalDutyPercent}</span>%..@..Rs.
                <span className="live-field font-semibold">
                  {formatIndianNumber(metrics.totalDutyAmount)}
                </span>
                /-
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PAGE 2 OF 6 ==================== */}
      {shouldShowPage(2) && (
        <div
          ref={(el) => {
            pageRefs.current[1] = el;
          }}
        >
          <PageHeaderBadge
            pageNum={2}
            title="Seller (Vendor), Buyer (Vendee), Property Address & Boundaries"
            editTab={2}
          />
          <div
            className={`a4-page ${
              activeTab === 2 || activeTab === 3 ? 'a4-page-active' : ''
            }`}
          >
            {/* Execution Line */}
            <p
              className="mb-5 text-[10.5pt] leading-[1.6]"
              onClick={() => onSelectSection(2)}
            >
              This SALE DEED is made and executed at{' '}
              <span className="live-field">{data.executionPlace}</span> on this{' '}
              <span className="live-field">{data.executionDateText}</span>by and
              between:-
            </p>

            {/* VENDOR (Seller) Block */}
            <p
              className="mb-5 text-justify text-[10.5pt] leading-[1.45] cursor-pointer"
              onClick={() => onSelectSection(2)}
            >
              <strong className="live-field font-bold">
                {data.vendorHonorific} {data.vendorName} {data.vendorRelationType}{' '}
                {data.vendorRelativeHonorific} {data.vendorRelativeName} RESIDENT OF{' '}
                {data.vendorAddress},
              </strong>{' '}
              Hereinafter referred to as &quot;the VENDOR&quot; (which expression,
              herein used, shall mean and include {data.vendorPronoun} legal heirs,
              successors, legal representatives, administrators, executors, nominees
              and assignees) of the one part.
            </p>

            {/* IN FAVOUR OF */}
            <p className="text-center font-bold italic underline mb-4 text-[10.5pt]">
              IN FAVOUR OF
            </p>

            {/* VENDEES (Buyer) Block */}
            <p
              className="mb-6 text-justify text-[10.5pt] leading-[1.85] cursor-pointer"
              onClick={() => onSelectSection(2)}
            >
              <strong className="live-field font-bold">
                {data.vendeeHonorific} {data.vendeeName} {data.vendeeRelationType}{' '}
                {data.vendeeRelativeHonorific} {data.vendeeRelativeName} RESEDENT OF{' '}
                {data.vendeeAddress},
              </strong>{' '}
              Hereinafter called &quot;The VENDEES&quot;, (which expression, herein
              used, shall mean and include their heirs, successors, legal
              representatives, administrators, executors, nominees and assignees of
              the other part.
            </p>

            {/* WHEREAS Property Description Block */}
            <p
              className="mb-4 text-justify text-[10.5pt] leading-[1.9] cursor-pointer"
              onClick={() => onSelectSection(3)}
            >
              WHEREAS the VENDOR is the absolute and exclusive owner and in possession
              of{' '}
              <strong className="live-field font-bold">{propDesc.mainBlock}</strong>
            </p>

            {/* City/Pin & Bounded as under */}
            <p
              className="mb-6 text-justify text-[10.5pt] leading-[1.7] cursor-pointer"
              onClick={() => onSelectSection(3)}
            >
              <strong className="live-field font-bold">{propDesc.cityPin}</strong> and
              the above mentioned property is bounded as under :-
            </p>

            {/* 4-Direction Boundaries Grid */}
            <div
              className="grid grid-cols-2 gap-y-6 gap-x-4 text-[10.5pt] mt-4 cursor-pointer"
              onClick={() => onSelectSection(3)}
            >
              <div className="flex items-start">
                <span className="w-24 shrink-0">EAST</span>
                <span>
                  :- <span className="live-field">{data.boundaryEast}</span>
                </span>
              </div>
              <div className="flex items-start">
                <span className="w-16 shrink-0">WEST</span>
                <span>
                  :- <span className="live-field">{data.boundaryWest}</span>
                </span>
              </div>
              <div className="flex items-start">
                <span className="w-24 shrink-0">. NORTH</span>
                <span>
                  :- <span className="live-field">{data.boundaryNorth}</span>
                </span>
              </div>
              <div className="flex items-start">
                <span className="w-16 shrink-0">SOUTH</span>
                <span>
                  :- <span className="live-field">{data.boundarySouth}</span>
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PAGE 3 OF 6 ==================== */}
      {shouldShowPage(3) && (
        <div
          ref={(el) => {
            pageRefs.current[2] = el;
          }}
        >
          <PageHeaderBadge
            pageNum={3}
            title="Prior GPA/Title Chain & Agreement to Sell Property"
            editTab={3}
          />
          <div
            className={`a4-page ${activeTab === 3 ? 'a4-page-active' : ''}`}
            onClick={() => onSelectSection(3)}
          >
            {/* Paragraph 1: Prior Title / GPA */}
            <p className="mb-7 text-justify text-[10.5pt] leading-[1.85]">
              (hereinafter referred to as the “<strong>Said Property</strong>”){' '}
              <span className="live-field">{data.priorTitleDocText}</span>, having
              purchased from{' '}
              <span className="live-field">
                {data.priorOwnerHonorific}
                {data.priorOwnerName} {data.priorOwnerRelation}{' '}
                {data.priorOwnerRelativeHonorific} {data.priorOwnerRelativeName}
              </span>{' '}
              to do all acts, deeds and things including the power to sell and transfer
              the same in any manner.
            </p>

            {/* Paragraph 2 */}
            <p className="mb-7 text-justify text-[10.5pt] leading-[1.85]">
              AND WHEREAS the VENDOR has full power and absolute authority to sell and
              transfer the aforesaid property unto the VENDEES, and to receive the sale
              consideration in {data.vendorPronoun} own name and neither anyone else has
              any right, title and interest in the aforesaid property nor there is any
              legal impediment which prohibits the VENDOR to sell the same unto the
              VENDEES.
            </p>

            {/* Paragraph 3: Repeated Bold Property Address */}
            <p className="mb-6 text-justify text-[10.5pt] leading-[1.85]">
              AND WHEREAS the VENDOR has agreed to sell, convey, transfer and assign{' '}
              {data.vendorPronoun} all rights, titles and interests in the aforesaid{' '}
              <strong className="live-field font-bold">
                {propDesc.combinedPage3}
              </strong>
            </p>

            {/* Paragraph 4 */}
            <p className="mb-7 text-justify text-[10.5pt] leading-[1.85]">
              hereinafter referred to as ”the said property”, alongwith all benefits,
              facilities, privileges, easements or advantages belonging to or in any
              way appertaining to the said property to the VENDEES.
            </p>

            {/* Paragraph 5 */}
            <p className="text-justify text-[10.5pt] leading-[1.85]">
              AND WHEREAS the VENDEES has agreed to purchase, acquire and possess the
              said property relying on the various assurances, covenants,
              representations, statements and undertaking given by the VENDOR and
              believing the same to be true and acting on the faith thereof and on the
              terms and conditions mentioned hereunder.
            </p>
          </div>
        </div>
      )}

      {/* ==================== PAGE 4 OF 6 ==================== */}
      {shouldShowPage(4) && (
        <div
          ref={(el) => {
            pageRefs.current[3] = el;
          }}
        >
          <PageHeaderBadge
            pageNum={4}
            title="Sale Consideration in Figures & Words (Clauses 1 to 4)"
            editTab={1}
          />
          <div
            className="a4-page"
            onClick={() => onSelectSection(1)}
          >
            <p className="font-bold underline mb-6 text-[10.5pt]">
              NOW THIS SALE DEED WITNESSESTH AS UNDER:-
            </p>

            <div className="space-y-7 text-[10.5pt] leading-[1.85]">
              {/* Clause 1 */}
              <div className="flex items-start gap-3 text-justify pl-4">
                <span className="shrink-0">1.</span>
                <p>
                  That in consideration of the said sum of{' '}
                  <strong className="live-field font-bold">
                    Rs.{formatIndianNumber(metrics.stampDutyPaidOnAmount)}/- (
                    {metrics.stampDutyAmountInWords}).
                  </strong>
                  , the VENDOR hereby sell, convey, alienate and transfer all{' '}
                  {data.vendorPronoun} rights, titles and interests in the said
                  property, along with boundary wall, fittings, fixtures and super
                  structure thereon and all other estate rights whatsoever, including
                  all easements, appurtenances to the said property as also enjoyed or
                  reputed to be enjoyed therewith unto the VENDEES, in perfect and
                  absolute ownership without any hindrance, disturbance, whatsoever, TO
                  HAVE, TO HOLD AND TO ENJOY THE SAME ABSOLUTELY AND FOREVER.
                </p>
              </div>

              {/* Clause 2 */}
              <div className="flex items-start gap-3 text-justify pl-4">
                <span className="shrink-0">2.</span>
                <p>
                  That the VENDOR hereby explicitly admits and declares that having
                  received the aforesaid consideration in full and final payment, now
                  nothing is left due from the VENDEES to the VENDOR against sale
                  consideration for the purchase of the said property, as the aforesaid
                  consideration represents the full and final consideration for the
                  transaction.
                </p>
              </div>

              {/* Clause 3 */}
              <div className="flex items-start gap-3 text-justify pl-4">
                <span className="shrink-0">3.</span>
                <p>
                  That the VENDOR has delivered the peaceful and actual physical vacant
                  possession of the said property unto the VENDEES on the spot.
                </p>
              </div>

              {/* Clause 4 */}
              <div className="flex items-start gap-3 text-justify pl-4">
                <span className="shrink-0">4.</span>
                <p>
                  That the VENDOR hereby sell, grant, convey, transfer and assign, with
                  the ownership rights of the said property together with the super
                  structure thereon, unto the VENDEES, and the VENDOR hereby transfers{' '}
                  {data.vendorPronoun} all rights, titles and interests, along with all
                  the rights, privileges, easements and appurtenances, whatsoever in the
                  said property, belong and usually held herewith including all
                  electric, water and all the estate right, title, and interest in the
                  said property, hereby conveyed, and every part thereof TO HAVE AND TO
                  HOLD THE SAME unto the VENDEES absolutely and forever.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PAGE 5 OF 6 ==================== */}
      {shouldShowPage(5) && (
        <div
          ref={(el) => {
            pageRefs.current[4] = el;
          }}
        >
          <PageHeaderBadge
            pageNum={5}
            title="Indemnity, No Encumbrance & Mutation Rights (Clauses 5 to 8)"
            editTab={2}
          />
          <div className="a4-page">
            <div className="space-y-7 text-[10.5pt] leading-[1.85]">
              {/* Clause 5 */}
              <div className="flex items-start gap-3 text-justify pl-4">
                <span className="shrink-0">5.</span>
                <p>
                  That the VENDOR hereby assure the VENDEES that the said property,
                  hereby conveyed, is free from all sorts of charges, encumbrances,
                  liens, loan, claims, demands, and liabilities, surety, security,
                  legal flaws, disputes, sale, mortgage, gift, liabilities,
                  disabilities, injunction, notifications for acquisitions/requisition,
                  and if ever it is proved to be otherwise and the VENDEES suffers, due
                  to any legal defect in the title of the VENDOR, any loss and/or whole
                  or any part of the said property, hereby conveyed, is taken away from
                  the possession of the VENDEES, then the VENDOR will make good the
                  losses thus suffered by the VENDEES in this regard and shall keep the
                  VENDEES indemnified against all losses, costs, damages and expenses
                  accruing thereby to the VENDEES.
                </p>
              </div>

              {/* Clause 6 */}
              <div className="flex items-start gap-3 text-justify pl-4">
                <span className="shrink-0">6.</span>
                <p>
                  That the VENDOR hereby further assure the VENDEES that{' '}
                  {data.vendorPronoun === 'his' ? 'he' : 'she'} or anyone else claiming
                  from or through the VENDOR has not created any encumbrances or
                  license or restriction thereon nor is there any claim or litigation or
                  legal proceeding injunction or attachment concerning the said
                  property.
                </p>
              </div>

              {/* Clause 7 */}
              <div className="flex items-start gap-3 text-justify pl-4">
                <span className="shrink-0">7.</span>
                <p>
                  That the VENDOR now admits that{' '}
                  {data.vendorPronoun === 'his' ? 'he' : 'she'} has been left with no
                  right, title and interest of any nature, whatsoever may be in the said
                  property, and the VENDEES has become the absolute owner of the same
                  and {data.vendeePronoun === 'his' ? 'he' : 'she'} will use and enjoy
                  the same in any manner, {data.vendeePronoun === 'his' ? 'he' : 'she'}{' '}
                  likes, including right to sell, transfer or alienate the said property
                  to anyone including the right to give the same on rent to anyone and
                  to receive the rent and profit to the tenant(s) evicted through the
                  process of law or by negotiation, to take possession etc.
                </p>
              </div>

              {/* Clause 8 */}
              <div className="flex items-start gap-3 text-justify pl-4">
                <span className="shrink-0">8.</span>
                <p>
                  That the VENDEES can get the mutation of the said property in{' '}
                  {data.vendeePronoun} own name in the absence of the VENDOR on the
                  basis of this sale deed or its certified true copy in the revenue
                  records.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ==================== PAGE 6 OF 6 ==================== */}
      {shouldShowPage(6) && (
        <div
          ref={(el) => {
            pageRefs.current[5] = el;
          }}
        >
          <PageHeaderBadge
            pageNum={6}
            title="Clauses 9 to 12, Execution & Witnesses Details"
            editTab={4}
          />
          <div
            className={`a4-page ${activeTab === 4 ? 'a4-page-active' : ''}`}
            onClick={() => onSelectSection(4)}
          >
            <div className="space-y-6 text-[10.5pt] leading-[1.75]">
              {/* Clause 9 */}
              <div className="flex items-start gap-2.5 text-justify pl-4">
                <span className="shrink-0">9.</span>
                <p>
                  That the VENDOR and all persons claiming under or through the VENDOR
                  shall and will as and when required by the VENDEES and at the
                  VENDEES&apos;s costs to do all act and execute all documents and
                  authorities as be reasonable required by the VENDEES for more fully
                  effectuating the sale being hereby made or for more fully owning and
                  enjoying the said property or defending any action or proceeding
                  concerning the same.
                </p>
              </div>

              {/* Clause 10 */}
              <div className="flex items-start gap-1.5 text-justify pl-4">
                <span className="shrink-0">10.</span>
                <p>
                  That VENDOR will be responsible for the payment of the rates, cesses,
                  taxes, payable in respect of the said property, up to date, and
                  thereafter the VENDEES will be responsible for the payment of the
                  same.
                </p>
              </div>

              {/* Clause 11 */}
              <div className="flex items-start gap-1.5 text-justify pl-4">
                <span className="shrink-0">11.</span>
                <p>
                  That the VENDEES has paid the stamp duty, transfer duty, registration
                  charges and other incidental charges for the execution of this Sale
                  deed.
                </p>
              </div>

              {/* Clause 12 */}
              <div className="flex items-start gap-1.5 text-justify pl-4">
                <span className="shrink-0">12.</span>
                <p>
                  That both the parties, hereto i.e. the VENDOR and the VENDEES are
                  Indian National.
                </p>
              </div>
            </div>

            {/* IN WITNESS WHEREOF */}
            <p className="mt-6 mb-5 text-justify text-[10.5pt] leading-[1.75]">
              IN WITNESS WHEREOF, the VENDOR and the VENDEES have set subscribed their
              hands to this sale deed on the day, month and year, first mentioned
              above, in the presence of the following witnesses.
            </p>

            {/* WITNESSES BLOCK */}
            <div className="text-[10.5pt] leading-[1.35]">
              <div className="mb-0.5">WITNESSES:-</div>

              {/* Witness 1 & VENDOR */}
              <div className="flex justify-between items-start pl-4 mb-5">
                <div className="w-[68%]">
                  <div className="mb-2">1.</div>
                  <div className="live-field font-bold">
                    {data.witness1Honorific} {data.witness1Name}
                  </div>
                  <div className="live-field">
                    {data.witness1RelationType} {data.witness1RelativeName}
                  </div>
                  {data.witness1AddressLine1 && (
                    <div className="live-field">{data.witness1AddressLine1}</div>
                  )}
                  {data.witness1AddressLine2 && (
                    <div className="live-field">{data.witness1AddressLine2}</div>
                  )}
                  {data.witness1AddressLine3 && (
                    <div className="live-field">{data.witness1AddressLine3}</div>
                  )}
                  <div className="live-field font-bold">
                    (AADHAR NO. {data.witness1Aadhar})
                  </div>
                </div>
                <div className="w-[28%] text-center pt-0.5">VENDOR</div>
              </div>

              {/* Witness 2 & VENDEE */}
              <div className="flex justify-between items-start pl-4">
                <div className="w-[68%]">
                  <div>2.</div>
                  <div className="live-field font-bold">
                    {data.witness2Honorific} {data.witness2Name}
                  </div>
                  <div className="live-field">
                    {data.witness2RelationType} {data.witness2RelativeName}{' '}
                    {data.witness2AddressLine1}
                  </div>
                  {data.witness2AddressLine2 && (
                    <div className="live-field">{data.witness2AddressLine2}</div>
                  )}
                  {data.witness2AddressLine3 && (
                    <div className="live-field">{data.witness2AddressLine3}</div>
                  )}
                  <div className="live-field font-bold">
                    (AADHAR NO. {data.witness2Aadhar})
                  </div>
                </div>
                <div className="w-[28%] text-center pt-0.5">VENDEE</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
