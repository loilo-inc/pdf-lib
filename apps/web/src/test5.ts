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

  const [inputPdfBytes, minionsBananaAlphaBytes] = await Promise.all([
    fetchAsset("pdfs/with_large_page_count.pdf"),
    fetchAsset("images/minions_banana_alpha.png"),
  ]);

  const pdfDoc = await PDFDocument.load(inputPdfBytes);

  const timesRomanFont = await pdfDoc.embedFont(
    StandardFonts.TimesRomanBoldItalic,
  );
  const minionsBananaImage = await pdfDoc.embedPng(minionsBananaAlphaBytes);
  const minionsBananaDims = minionsBananaImage.scale(0.5);

  const pages = pdfDoc.getPages();

  pages.forEach((page) => {
    const { width, height } = page.getSize();
    page.drawImage(minionsBananaImage, {
      ...minionsBananaDims,
      x: width / 2 - minionsBananaDims.width / 2,
      y: height / 2 - minionsBananaDims.height / 2,
    });
  });

  // Interleave new pages between all existing ones
  pages.forEach((_, idx) => {
    const newPage = pdfDoc.insertPage(2 * idx + 1, [500, 150]);

    const fontSize = 24;
    const { width, height } = newPage.getSize();

    newPage.setFont(timesRomanFont);
    newPage.setFontSize(fontSize);

    const text = "This page was interleaved by pdf-lib!";
    const textWidth = timesRomanFont.widthOfTextAtSize(text, fontSize);
    const textHeight = timesRomanFont.heightAtSize(fontSize);

    newPage.drawText(text, {
      x: width / 2 - textWidth / 2,
      y: height / 2 - textHeight / 2,
      color: rgb(0.7, 0.4, 0.9),
    });
  });

  const pdfBytes = await pdfDoc.save();

  renderInIframe(pdfBytes);
}
