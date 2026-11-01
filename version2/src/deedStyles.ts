/** Styles shared by the on-screen preview, print and the Word export */
export const deedCss = `
.deed-page{font-family:Verdana,Tahoma,Arial,sans-serif;font-size:10pt;line-height:1.85;color:#000;text-align:justify;background:#fff;width:210mm;min-height:297mm;box-sizing:border-box;padding:22mm 20mm 18mm 22mm;}
.deed-page p{margin:0 0 11pt 0;}
.deed-page .center{text-align:center;}
.deed-page .right{text-align:right;}
.deed-page table.desc{width:100%;border-collapse:collapse;margin-top:14pt;}
.deed-page table.desc td{border:1px solid #000;padding:3pt 6pt;font-size:8.5pt;line-height:1.5;text-align:left;vertical-align:middle;}
.deed-page table.bounds{width:100%;border-collapse:collapse;margin-top:6pt;}
.deed-page table.bounds td{padding:4pt 0;font-size:9pt;text-align:left;vertical-align:top;border:none;}
.deed-page table.wit{width:100%;border-collapse:collapse;}
.deed-page table.wit td{padding:0;border:none;text-align:left;vertical-align:top;font-size:9.5pt;}
.deed-page .cl{margin-left:9mm;text-indent:-9mm;margin-bottom:14pt;}
.deed-page .cl2{margin-left:9mm;text-indent:-9mm;margin-bottom:11pt;}
.deed-page .wblock{margin:0 0 6pt 9mm;font-size:9.5pt;line-height:1.45;text-align:left;}
`;

export const screenCss = `
.deed-page{box-shadow:0 1px 3px rgba(0,0,0,.2),0 8px 24px rgba(0,0,0,.12);margin:0 auto;}
.page-cap{width:210mm;margin:0 auto 6px auto;font:600 12px/1 system-ui,sans-serif;color:#64748b;letter-spacing:.04em;text-transform:uppercase;}
.page-wrap{margin-bottom:28px;}
`;

export const printCss = `
@page{size:A4;margin:0;}
@media print{
  html,body{background:#fff !important;}
  .zoom-wrap{zoom:1 !important;}
  .page-cap{display:none !important;}
  .page-wrap{margin:0 !important;}
  .deed-page{box-shadow:none !important;margin:0 !important;min-height:0 !important;break-after:page;page-break-after:always;}
  .page-wrap:last-child .deed-page{break-after:auto;page-break-after:auto;}
}
`;

/** Extra CSS for the exported .doc file (Word flows the content itself) */
export const wordCss = `
@page Section1{size:595.3pt 841.9pt;margin:56.7pt 56.7pt 56.7pt 62pt;}
div.Section1{page:Section1;}
.deed-page{width:auto !important;min-height:0 !important;padding:0 !important;box-shadow:none !important;margin:0 !important;}
`;
