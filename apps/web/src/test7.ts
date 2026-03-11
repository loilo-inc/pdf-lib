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

const createDonorPdf = async () => {
  const { PDFDocument, StandardFonts, degrees } = PDFLib;

  const pdfDoc = await PDFDocument.create();
  const helveticaFont = await pdfDoc.embedFont(StandardFonts.Helvetica);

  const page = pdfDoc.addPage([500, 500]);

  page.moveTo(50, 225);
  page.setFont(helveticaFont);
  page.setFontSize(50);
  page.drawText("I am upside down!");
  page.setRotation(degrees(180));

  return pdfDoc;
};

export async function test() {
  const { PDFDocument } = PDFLib;

  const [
    withMissingEndstreamEolAndPollutedCtmBytes,
    normalBytes,
    withUpdateSectionsBytes,
    linearizedWithObjectStreamsBytes,
    withLargePageCountBytes,
  ] = await Promise.all([
    fetchAsset("pdfs/with_missing_endstream_eol_and_polluted_ctm.pdf"),
    fetchAsset("pdfs/normal.pdf"),
    fetchAsset("pdfs/with_update_sections.pdf"),
    fetchAsset("pdfs/linearized_with_object_streams.pdf"),
    fetchAsset("pdfs/with_large_page_count.pdf"),
  ]);

  const pdfDoc = await PDFDocument.load(
    withMissingEndstreamEolAndPollutedCtmBytes,
  );

  const allDonorPdfBytes = [
    normalBytes,
    withUpdateSectionsBytes,
    linearizedWithObjectStreamsBytes,
    withLargePageCountBytes,
  ];

  for (let idx = 0, len = allDonorPdfBytes.length; idx < len; idx++) {
    const donorBytes = allDonorPdfBytes[idx];
    const donorPdf = await PDFDocument.load(donorBytes);
    const [donorPage] = await pdfDoc.copyPages(donorPdf, [0]);
    pdfDoc.addPage(donorPage);
  }

  const anotherDonorPdf = await createDonorPdf();
  const [anotherDonorPage] = await pdfDoc.copyPages(anotherDonorPdf, [0]);
  pdfDoc.insertPage(1, anotherDonorPage);

  const savedBytes = await pdfDoc.save();
  const sizeOfCreatedPdf = savedBytes.length;

  let sizeOfAllDonorPdfs = (await anotherDonorPdf.save()).length;
  for (let idx = 0, len = allDonorPdfBytes.length; idx < len; idx++) {
    sizeOfAllDonorPdfs += allDonorPdfBytes[idx].length;
  }

  const ratio = (sizeOfCreatedPdf / sizeOfAllDonorPdfs).toFixed(2);
  (document.getElementById("result-stats") as HTMLElement).innerHTML = `
        <p>
          Since pdf-lib only copies the minimum necessary resources from a 
          donor PDF needed to show a copied page, the size of the PDF we create 
          from copied pages should be smaller than the size of all the donor 
          PDFs added together:
          <div>
            <code>sizeOfRecipientPdf / sizeOfAllDonorPdfs = ${ratio}</code>
          </div>
        </p>
      `;

  renderInIframe(savedBytes);
}
