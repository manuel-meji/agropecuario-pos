import jsPDF from 'jspdf';
import { getCompanySettings } from './companySettings';

export const generateTicketPDF = (saleData: any, cart: any[], clientInfo?: any, companyData?: any): jsPDF => {
  const company = companyData || getCompanySettings();
  
  // Calculamos la altura dinámica del rollo (min aprox 140mm)
  const itemsHeight = cart.length * 5;
  const metaHeight = 90;
  const footerHeight = 60;
  let totalHeight = metaHeight + itemsHeight + footerHeight;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [58, totalHeight]
  });

  let y = 6;
  const margin = 2;
  const printWidth = 54; // 58 - 4
  
  const drawTextCenter = (text: string, size: number, bold = false) => {
    doc.setFont("times", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, printWidth);
    lines.forEach((line: string) => {
      const textWidth = doc.getTextWidth(line);
      doc.text(line, (58 - textWidth) / 2, y);
      y += (size * 0.4); 
    });
  };

  const drawTextLeft = (text: string, size: number, bold = false) => {
    doc.setFont("times", bold ? "bold" : "normal");
    doc.setFontSize(size);
    const lines = doc.splitTextToSize(text, printWidth);
    lines.forEach((line: string) => {
      doc.text(line, margin, y);
      y += (size * 0.4);
    });
  };

  const drawLine = () => {
    doc.setLineWidth(0.2);
    doc.line(margin, y - 2, 58 - margin, y - 2);
    y += 1.5;
  }

  // ENCABEZADO
  drawTextCenter(company.businessName || 'Empresa', 10, true);
  y += 1;
  drawTextCenter(`Vendedor: ${company.businessName}`, 8);
  if(company.legalId) drawTextCenter(`Cedula: ${company.legalId}`, 8);
  if(company.email) drawTextCenter(`Correo: ${company.email}`, 8);
  if(company.phone) drawTextCenter(`Telefono: ${company.phone}`, 8);
  if(company.address) drawTextCenter(company.address, 7);
  
  y += 2;
  drawTextLeft(`Tipo Doc: ${saleData?.invoiceNumber ? 'Factura Electronica V4.3' : 'Tiquete POS'}`, 8);
  drawTextLeft(`Fecha: ${new Date().toLocaleString('es-CR')}`, 8);
  
  if (clientInfo && clientInfo.name) {
    drawTextLeft(`Cliente: ${clientInfo.name}`, 8);
    if(clientInfo.identification) drawTextLeft(`Ced. Cliente: ${clientInfo.identification}`, 8);
    if(clientInfo.address) drawTextLeft(`Dirección Cliente: ${clientInfo.address}`, 8);
    if(clientInfo.phone) drawTextLeft(`Telefono Cliente: ${clientInfo.phone}`, 8);
    if(clientInfo.email) drawTextLeft(`Correo Cliente: ${clientInfo.email}`, 8);
  } else {
    drawTextLeft(`Cliente: Contado Genérico`, 8);
  }

  drawTextLeft(`Factura: #${saleData?.invoiceNumber || saleData?.id || '281'}`, 8);
  if (saleData?.consecutive) drawTextLeft(`Consecutivo: ${saleData.consecutive}`, 8);
  if (saleData?.key) drawTextLeft(`Clave:\n${saleData.key}`, 7);
  
  drawTextLeft(`Factura: ${saleData?.paymentMethod || 'Contado'}`, 8);
  drawTextLeft(`Observaciones:`, 8);

  y += 2;
  
  // ITEMS HEADER
  doc.setFont("times", "bold");
  doc.setFontSize(7);
  doc.text("CAN", margin, y);
  doc.text("DESCRIPCION", margin + 8, y);
  doc.text("P.UNIT", margin + 30, y);
  const precText = "PRECIO";
  doc.text(precText, 58 - margin - doc.getTextWidth(precText), y);
  y += 3.5;
  
  doc.setFont("times", "normal");
  cart.forEach((item: any) => {
    const qty = parseFloat(item.qty).toFixed(3);
    doc.text(qty, margin, y);
    
    // Si la descripción es larga, la truncamos
    let desc = item.product.name;
    if (doc.getTextWidth(desc) > 20) {
      desc = desc.substring(0, 16);
    }
    doc.text(desc, margin + 8, y);
    
    const pUnit = Number(item.product.salePrice).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    doc.text(pUnit, margin + 30, y);
    
    const taxLetter = (item.product.taxRate === 0) ? 'E' : `G${item.product.taxRate ?? 13}`;
    const total = (item.qty * item.product.salePrice).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    const priceTxt = `${total} ${taxLetter}`;
    doc.text(priceTxt, 58 - margin - doc.getTextWidth(priceTxt), y);
    
    y += 3.5;
  });

  y += 2;
  
  // Totales
  const subTotal = (saleData?.subtotal || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const descuento = ((saleData?.totalDiscount || saleData?.discountAmount) || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const iva = (saleData?.totalTax || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const grantTotal = (saleData?.finalTotal || saleData?.total || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  
  const drawTotalLine = (label: string, val: string, isBold = false) => {
    doc.setFont("times", isBold ? "bold" : "normal");
    doc.setFontSize(8);
    const txt = `${label}          CRC${val}`;
    doc.text(txt, 58 - margin - doc.getTextWidth(txt), y);
    y += 3.5;
  };
  
  drawTotalLine("Sub-Total", subTotal, true);
  drawTotalLine("Descuento", descuento, true);
  drawTotalLine("IVA", iva, true);
  
  y += 2;
  drawLine();
  
  // Gran Total
  const totalTxt = `Total CRC ${grantTotal}`;
  doc.setFont("times", "bold");
  doc.setFontSize(13);
  doc.text(totalTxt, (58 - doc.getTextWidth(totalTxt)) / 2, y + 2);
  y += 8;
  
  // Vuelto
  let vuelto = "0.00";
  if (saleData?.change !== undefined) {
    vuelto = Number(saleData.change).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }
  drawTextCenter(`Su Vuelto: CRC ${vuelto}`, 8);
  y += 3;
  
  drawLine();
  y += 1;
  
  drawTextCenter(`Total Lineas: ${cart.length}`, 8);
  y += 3;
  drawTextCenter("Gracias Por Preferirnos", 8);
  
  y += 8;
  doc.setFont("times", "normal");
  doc.setFontSize(8);
  doc.text("X_________________________________", 4, y);
  y += 5;
  
  drawTextCenter("MH-DGT-RES-0027-2024", 7);
  drawTextCenter("** Nota: Productos con G1 1%,G2 2%, G13 13%, E Exento **", 6);
  drawTextCenter("Software M&M", 7);
  
  return doc;
};

// Genera y descarga
export const generateAndDownloadTicket = (saleData: any, cart: any[], clientInfo?: any, companyData?: any) => {
  const doc = generateTicketPDF(saleData, cart, clientInfo, companyData);
  doc.save(`Factura_${saleData?.invoiceNumber || saleData?.id || 'POS'}.pdf`);
}

// Genera base64 para correo
export const generateTicketBase64 = (saleData: any, cart: any[], clientInfo?: any, companyData?: any): string => {
  const doc = generateTicketPDF(saleData, cart, clientInfo, companyData);
  return doc.output('datauristring');
}
