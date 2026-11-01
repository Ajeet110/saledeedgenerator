import { forwardRef } from "react";
import type { Deed, Party, Witness } from "../utils/deed";
import { calculate, dateText, inr, pronouns, rs, wordsIN } from "../utils/deed";
import { deedCss, printCss, screenCss } from "../deedStyles";

const BLANK = "______________";
const U = (s: string, ph = BLANK) => (s && s.trim() ? s.trim().toUpperCase() : ph);

const partyText = (p: Party) =>
  `${p.title} ${U(p.name)} ${p.relation} ${U(p.relName)} RESIDENT OF ${U(p.address)}`;
const partiesText = (ps: Party[]) => ps.map(partyText).join(" AND ");

function propertyText(d: Deed) {
  const yds = d.plotYds.trim() || BLANK;
  const gali = d.gali.trim() ? `,IN ${U(d.gali)}` : "";
  const floor = d.floor.trim() ? ` (${U(d.floor)})` : "";
  return (
    `BUILT-UP PROPERTY NO. ${U(d.propNo)}${gali}${floor}, LAND AREA MEASURING ${yds} SQ.YDS., ` +
    `OUT OF KHASRA NO. ${U(d.khasra)}, SITUATED IN THE AREA OF VILLAGE ${U(d.village)}, ` +
    `${U(d.district, "DELHI STATE DELHI")}, COLONY KNOWN AS ${U(d.colony)}`
  );
}
const cityPin = (d: Deed) =>
  `${U(d.city, "NEW DELHI")}${d.pincode.trim() ? "-" + d.pincode.trim() : ""}`;

function Page({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="page-wrap">
      <div className="page-cap">Page {n} of 6</div>
      <section className="deed-page">{children}</section>
    </div>
  );
}

function WitnessBlock({ w, idx, role }: { w: Witness; idx: number; role: string }) {
  return (
    <>
      <table className="wit">
        <tbody>
          <tr>
            <td style={{ width: "72%" }}>{idx}.</td>
            <td>{role}</td>
          </tr>
        </tbody>
      </table>
      <div className="wblock">
        <b>{U(w.name)}</b>
        <br />
        {U(w.parentage, "S/O ______________")}
        <br />
        {U(w.address)}
        <br />
        <b>(AADHAR NO. {w.aadhar.trim() || "____-____-____"})</b>
      </div>
    </>
  );
}

const DeedPages = forwardRef<HTMLDivElement, { deed: Deed }>(({ deed: d }, ref) => {
  const c = calculate(d);
  const sellerP = pronouns(d.sellers);
  const buyerP = pronouns(d.buyers);
  const prop = propertyText(d);
  const cityRaw = d.city.trim();
  const notaryCity = !cityRaw || /delhi/i.test(cityRaw)
    ? "Delhi"
    : cityRaw.charAt(0).toUpperCase() + cityRaw.slice(1).toLowerCase();
  const saleStr = c.consideration ? `Rs.${inr(c.consideration)}/-` : "Rs. ______________/-";
  const words = c.consideration ? `(Rupees ${wordsIN(c.consideration)} only)` : "(Rupees ______________ only)";
  const category =
    d.buyers.length > 1
      ? "For Joint"
      : d.buyers[0]?.gender === "F"
        ? "For Female"
        : "For Male";
  const pctTotal = c.corpPct + c.stampPct;
  const V = "VENDOR";
  const VE = "VENDEES";

  return (
    <>
      <style>{deedCss + screenCss + printCss}</style>
      <div ref={ref} id="deed-pages">
        {/* ---------------- PAGE 1 ---------------- */}
        <Page n={1}>
          <div style={{ height: "22mm" }} />
          <p className="center" style={{ marginBottom: 8 }}>
            <b>
              <u>SALE DEED FOR {c.consideration ? `Rs. ${inr(c.consideration)}/-` : "Rs. ____________/-"}</u>
            </b>
          </p>
          <p className="center" style={{ marginBottom: 0, fontSize: "9pt" }}>
            <u>Description of property</u>
          </p>
          <table className="desc" border={1} cellSpacing={0} cellPadding={5}>
            <tbody>
              {(
                [
                  ["Name of the Colony/Area", U(d.colony)],
                  ["Category", d.category.trim() ? `“${d.category.trim().toUpperCase()}”` : BLANK],
                  [`Total Area of Plot in Sq. Mtr.(${d.plotYds || "__"}sq.yds)`, `${inr(c.sqm)} Sq. Mtr.`],
                  ["Total Plinth area of Property", `${inr(c.plinthTotal)} Sq.Mtrs.`],
                  ["Plinth area under sale", `${inr(c.plinthSale)} Sq.Mtrs`],
                  ["Land Use", d.landUse || "Residential"],
                  ["Minimum price of land fixed by the Govt.", `${rs(c.landRate)} per Sq. Mtr.`],
                  [
                    "Minimum value of land",
                    `${inr(c.sqm)} X Rs.${inr(c.landRate)}/- =Rs.${inr(c.landValue)}/-`,
                  ],
                  ["Minimum price of Const. Fixed by the Govt.", `Rs. ${inr(c.consRate)}/- per Sq.Mtrs.`],
                  [
                    "Minimum value of Construction",
                    `${inr(c.sqm)} X${inr(c.floors)}X Rs.${inr(c.consRate)}/- = Rs.${inr(c.consValue)}/-`,
                  ],
                  ["Total Value of Property", `Rs.${inr(c.totalValue)}/-`],
                  ["Total stamp duty paid on", `Rs.${inr(c.dutyBase)}/-`],
                ] as [string, string][]
              ).map(([k, v]) => (
                <tr key={k}>
                  <td style={{ width: "50%" }}>{k}</td>
                  <td>: &nbsp;{v}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ marginTop: 30 }} className="right">
            <p style={{ marginBottom: 4, fontSize: "9pt" }}>{category}</p>
            <p style={{ marginBottom: 10, fontSize: "9pt" }}>
              Corporation Duty..{c.corpPct} %..@..{rs(c.corp)}
            </p>
            <p style={{ marginBottom: 10, fontSize: "9pt" }}>
              Stamp Duty..{c.stampPct} %..@..{rs(c.stamp)}
            </p>
            <p style={{ marginBottom: 0, fontSize: "9pt" }}>
              Total Duty ..{pctTotal}%..@..{rs(c.totalDuty)}
            </p>
          </div>
        </Page>

        {/* ---------------- PAGE 2 ---------------- */}
        <Page n={2}>
          <p>
            This SALE DEED is made and executed at {d.place || "New Delhi"} on this {dateText(d.date)} by and
            between:-
          </p>
          <p>
            <b>{partiesText(d.sellers)}</b>, Hereinafter referred to as “the {V}” (which expression, herein
            used, shall mean and include {sellerP.poss} legal heirs, successors, legal representatives,
            administrators, executors, nominees and assignees) of the one part.
          </p>
          <p className="center">
            <b>
              <i>
                <u>IN FAVOUR OF</u>
              </i>
            </b>
          </p>
          <p>
            <b>{partiesText(d.buyers)}</b>, Hereinafter called “The {VE}”, (which expression, herein used,
            shall mean and include {buyerP.poss} heirs, successors, legal representatives, administrators,
            executors, nominees and assignees of the other part.
          </p>
          <p>
            WHEREAS the {V} is the absolute and exclusive owner and in possession of <b>{prop},</b>
          </p>
          <p>
            <b>{cityPin(d)}</b>, and the above mentioned property is bounded as under :-
          </p>
          <table className="bounds">
            <tbody>
              <tr>
                <td style={{ width: "50%" }}>EAST &nbsp;&nbsp;:- {U(d.east, "__________")}</td>
                <td>WEST &nbsp;&nbsp;:- {U(d.west, "__________")}</td>
              </tr>
              <tr>
                <td>NORTH &nbsp;:- {U(d.north, "__________")}</td>
                <td>SOUTH &nbsp;&nbsp;:- {U(d.south, "__________")}</td>
              </tr>
            </tbody>
          </table>
        </Page>

        {/* ---------------- PAGE 3 ---------------- */}
        <Page n={3}>
          <p style={{ marginBottom: 22 }}>
            (hereinafter referred to as the “<b>Said Property</b>”)
            {d.prevOwner.trim() ? (
              <>
                {" "}
                vide GPA duly Notarized by the Notary Public {notaryCity}, having purchased from{" "}
                {d.prevOwner.trim()} to do all acts, deeds and things including the power to sell and transfer
                the same in any manner.
              </>
            ) : (
              "."
            )}
          </p>
          <p style={{ marginBottom: 22 }}>
            AND WHEREAS the {V} has full power and absolute authority to sell and transfer the aforesaid
            property unto the {VE}, and to receive the sale consideration in {sellerP.poss} own name and
            neither anyone else has any right, title and interest in the aforesaid property nor there is any
            legal impediment which prohibits the {V} to sell the same unto the {VE}.
          </p>
          <p style={{ marginBottom: 22 }}>
            AND WHEREAS the {V} has agreed to sell, convey, transfer and assign {sellerP.poss} all rights,
            titles and interests in the aforesaid <b>{prop}, {cityPin(d)},</b>
          </p>
          <p style={{ marginBottom: 22 }}>
            hereinafter referred to as “the said property”, alongwith all benefits, facilities, privileges,
            easements or advantages belonging to or in any way appertaining to the said property to the{" "}
            {VE}.
          </p>
          <p style={{ marginBottom: 22 }}>
            AND WHEREAS the {VE} has agreed to purchase, acquire and possess the said property relying on the
            various assurances, covenants, representations, statements and undertaking given by the {V} and
            believing the same to be true and acting on the faith thereof and on the terms and conditions
            mentioned hereunder.
          </p>
        </Page>

        {/* ---------------- PAGE 4 ---------------- */}
        <Page n={4}>
          <p style={{ marginBottom: 14 }}>
            <b>
              <u>NOW THIS SALE DEED WITNESSESTH AS UNDER:-</u>
            </b>
          </p>
          <p className="cl">
            1.&nbsp;&nbsp;&nbsp;That in consideration of the said sum of{" "}
            <b>
              {saleStr} {words}
            </b>
            ., the {V} hereby sell, convey, alienate and transfer all {sellerP.poss} rights, titles and
            interests in the said property, along with boundary wall, fittings, fixtures and super structure
            thereon and all other estate rights whatsoever, including all easements, appurtenances to the said
            property as also enjoyed or reputed to be enjoyed therewith unto the {VE}, in perfect and absolute
            ownership without any hindrance, disturbance, whatsoever, TO HAVE, TO HOLD AND TO ENJOY THE SAME
            ABSOLUTELY AND FOREVER.
          </p>
          <p className="cl">
            2.&nbsp;&nbsp;&nbsp;That the {V} hereby explicitly admits and declares that having received the
            aforesaid consideration in full and final payment, now nothing is left due from the {VE} to the{" "}
            {V} against sale consideration for the purchase of the said property, as the aforesaid
            consideration represents the full and final consideration for the transaction.
          </p>
          <p className="cl">
            3.&nbsp;&nbsp;&nbsp;That the {V} has delivered the peaceful and actual physical vacant possession of
            the said property unto the {VE} on the spot.
          </p>
          <p className="cl">
            4.&nbsp;&nbsp;&nbsp;That the {V} hereby sell, grant, convey, transfer and assign, with the ownership
            rights of the said property together with the super structure thereon, unto the {VE}, and the {V}{" "}
            hereby transfers {sellerP.poss} all rights, titles and interests, along with all the rights,
            privileges, easements and appurtenances, whatsoever in the said property, belong and usually held
            herewith including all electric, water and all the estate right, title, and interest in the said
            property, hereby conveyed, and every part thereof TO HAVE AND TO HOLD THE SAME unto the {VE}{" "}
            absolutely and forever.
          </p>
        </Page>

        {/* ---------------- PAGE 5 ---------------- */}
        <Page n={5}>
          <p className="cl">
            5.&nbsp;&nbsp;&nbsp;That the {V} hereby assure the {VE} that the said property, hereby conveyed, is
            free from all sorts of charges, encumbrances, liens, loan, claims, demands, and liabilities,
            surety, security, legal flaws, disputes, sale, mortgage, gift, liabilities, disabilities,
            injunction, notifications for acquisitions/requisition, and if ever it is proved to be otherwise
            and the {VE} suffers, due to any legal defect in the title of the {V}, any loss and/or whole or any
            part of the said property, hereby conveyed, is taken away from the possession of the {VE}, then the{" "}
            {V} will make good the losses thus suffered by the {VE} in this regard and shall keep the {VE}{" "}
            indemnified against all losses, costs, damages and expenses accruing thereby to the {VE}.
          </p>
          <p className="cl">
            6.&nbsp;&nbsp;&nbsp;That the {V} hereby further assure the {VE} that {sellerP.subj} or anyone else
            claiming from or through the {V} has not created any encumbrances or license or restriction thereon
            nor is there any claim or litigation or legal proceeding injunction or attachment concerning the
            said property.
          </p>
          <p className="cl">
            7.&nbsp;&nbsp;&nbsp;That the {V} now admits that {sellerP.subj} has been left with no right, title
            and interest of any nature, whatsoever may be in the said property, and the {VE} has become the
            absolute owner of the same and {buyerP.subj} will use and enjoy the same in any manner,{" "}
            {buyerP.subj} likes, including right to sell, transfer or alienate the said property to anyone
            including the right to give the same on rent to anyone and to receive the rent and profit to the
            tenant(s) evicted through the process of law or by negotiation, to take possession etc.
          </p>
          <p className="cl">
            8.&nbsp;&nbsp;&nbsp;That the {VE} can get the mutation of the said property in {buyerP.poss} own
            name in the absence of the {V} on the basis of this sale deed or its certified true copy in the
            revenue records.
          </p>
        </Page>

        {/* ---------------- PAGE 6 ---------------- */}
        <Page n={6}>
          <p className="cl2">
            9.&nbsp;&nbsp;&nbsp;That the {V} and all persons claiming under or through the {V} shall and will as
            and when required by the {VE} and at the {VE}'s costs to do all act and execute all documents and
            authorities as be reasonable required by the {VE} for more fully effectuating the sale being hereby
            made or for more fully owning and enjoying the said property or defending any action or proceeding
            concerning the same.
          </p>
          <p className="cl2">
            10.&nbsp;That {V} will be responsible for the payment of the rates, cesses, taxes, payable in
            respect of the said property, up to date, and thereafter the {VE} will be responsible for the
            payment of the same.
          </p>
          <p className="cl2">
            11.&nbsp;That the {VE} has paid the stamp duty, transfer duty, registration charges and other
            incidental charges for the execution of this Sale deed.
          </p>
          <p className="cl2">
            12.&nbsp;That both the parties, hereto i.e. the {V} and the {VE} are Indian National.
          </p>
          <p style={{ marginBottom: 8 }}>
            IN WITNESS WHEREOF, the {V} and the {VE} have set subscribed their hands to this sale deed on the
            day, month and year, first mentioned above, in the presence of the following witnesses.
          </p>
          <p style={{ marginBottom: 2, fontSize: "9.5pt" }}>WITNESSES:-</p>
          <WitnessBlock w={d.witness1} idx={1} role="VENDOR" />
          <WitnessBlock w={d.witness2} idx={2} role="VENDEE" />
        </Page>
      </div>
    </>
  );
});

export default DeedPages;
