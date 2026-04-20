import PDFDocument from "pdfkit";
import QRCode from "qrcode";

export const buildQrDataUrl = async (payload) =>
  QRCode.toDataURL(JSON.stringify(payload), { margin: 1, width: 280 });

export const buildBadgePdfBuffer = async ({ passCode, visitorName, hostName, visitDate }) =>
  new Promise((resolve) => {
    const doc = new PDFDocument({ size: "A6", margin: 24 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));

    doc.fontSize(18).text("Visitor Pass", { align: "center" });
    doc.moveDown(0.5);
    doc.fontSize(12).text(`Pass Code: ${passCode}`);
    doc.text(`Visitor: ${visitorName}`);
    doc.text(`Host: ${hostName}`);
    doc.text(`Visit Date: ${new Date(visitDate).toLocaleString()}`);
    doc.moveDown();
    doc.fontSize(10).fillColor("#555").text("Please show this badge at the front desk.");
    doc.end();
  });
