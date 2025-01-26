import Tesseract from 'tesseract.js';

export const extractTextFromImage = async (file) => {
  try {
    const result = await Tesseract.recognize(
      file,
      'eng',
      {
        logger: (m) => console.log(m),
      }
    );
    const { data: { text } } = result;
    console.log('OCR Result:', text);
    return text;
  } catch (error) {
    console.error('Error during OCR:', error);
    return null;
  }
};

export const extractReferenceNumber = (text) => {
  // Extract the reference number next to "Ref No." or "Roto" with 6 to 12 digits
  const referenceNumberPattern = /(?:Ref No\.?|Roto\.?)\s*(\d{6,12})/i;
  const match = text.match(referenceNumberPattern);
  const referenceNumber = match ? match[1] : null;
  console.log('Extracted Reference Number:', referenceNumber);
  return referenceNumber;
};