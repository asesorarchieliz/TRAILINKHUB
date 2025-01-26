import { PDFDocument } from 'pdf-lib';
import * as pdfjsLib from 'pdfjs-dist';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.entry';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

export const analyzePdf = async (file) => {
  const arrayBuffer = await file.arrayBuffer();
  const pdfDoc = await PDFDocument.load(arrayBuffer);
  const totalPages = pdfDoc.getPageCount();

  let textOnlyPages = 0;
  let pagesWithImages = 0;

  const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  for (let i = 0; i < totalPages; i++) {
    const page = await pdf.getPage(i + 1);

    // Extract text content
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ').trim();

    // Analyze resources for images
    const operatorList = await page.getOperatorList();
    const hasImages = operatorList.fnArray.some(fn => {
      // Check for image-related operators
      return [
        pdfjsLib.OPS.paintJpegXObject,
        pdfjsLib.OPS.paintImageXObject,
        pdfjsLib.OPS.paintInlineImageXObject,
      ].includes(fn);
    });

    // Categorize the page
    if (text && !hasImages) {
      textOnlyPages += 1;
    } else if (text && hasImages) {
      pagesWithImages += 1;
    }
  }

  return {
    totalPages,
    textOnlyPages,
    pagesWithImages,
  };
};
