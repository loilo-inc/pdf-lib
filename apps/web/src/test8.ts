import * as PDFLib from "../../../src/index";
import { startFpsTracker } from "./utils";

startFpsTracker("animation-target");

const fetchAsset = (asset: string) =>
  fetch(`/assets/${asset}`)
    .then((res) => res.arrayBuffer())
    .then((res) => new Uint8Array(res));

const renderInIframe = (pdfBytes: Uint8Array) => {
  const normalizedBytes = new Uint8Array(pdfBytes);
  const blob = new Blob([normalizedBytes], { type: "application/pdf" });
  const blobUrl = URL.createObjectURL(blob);
  (document.getElementById("iframe") as HTMLIFrameElement).src = blobUrl;
};

export async function test() {
  const { PDFDocument, rgb, StandardFonts } = PDFLib;

  const [inputPdfBytes] = await Promise.all([
    fetchAsset("pdfs/with_newline_whitespace_in_indirect_object_numbers.pdf"),
  ]);

  const pdfDoc = await PDFDocument.load(inputPdfBytes);

  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const pages = pdfDoc.getPages();

  const [firstPage] = pages;

  const { width, height } = firstPage.getSize();
  const text = "pdf-lib is awesome!";
  const textWidth = helveticaFont.widthOfTextAtSize(text, 75);
  firstPage.moveTo(width / 2 - textWidth / 2, height - 100);
  firstPage.setFont(helveticaFont);
  firstPage.setFontSize(75);
  firstPage.setFontColor(rgb(1, 0, 0));
  firstPage.drawText(text);

  pages.forEach((page, idx) => {
    page.moveTo(10, 10);
    page.setFont(helveticaFont);
    page.setFontSize(17);
    page.setFontColor(rgb(1, 0, 0));
    page.drawText(`${idx + 1} / ${pages.length}`);
  });

  const pdfBytes = await pdfDoc.save();

  renderInIframe(pdfBytes);
}
