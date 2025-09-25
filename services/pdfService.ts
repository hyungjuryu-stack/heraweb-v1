import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export const generateReportAsPdf = async (element: HTMLElement, filename: string): Promise<void> => {
  try {
    const canvas = await html2canvas(element, {
        scale: 2, // Higher scale for better quality
        useCORS: true,
        backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const canvasRatio = canvasWidth / canvasHeight;
    
    // Calculate the dimensions of the image in the PDF to maintain aspect ratio
    let imgWidth = pdfWidth;
    let imgHeight = pdfWidth / canvasRatio;

    // If the image is taller than the page, scale it down to fit the height
    if (imgHeight > pdfHeight) {
        imgHeight = pdfHeight;
        imgWidth = pdfHeight * canvasRatio;
    }

    // Center the image on the page
    const x = (pdfWidth - imgWidth) / 2;
    const y = 0; // Start from top
    
    pdf.addImage(imgData, 'JPEG', x, y, imgWidth, imgHeight);
    pdf.save(filename);

  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error("PDF 생성에 실패했습니다.");
  }
};