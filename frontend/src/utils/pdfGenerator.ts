import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getCompanySettings } from './companySettings';


const GREEN  = [5, 150, 105]  as [number, number, number];
const DKGRAY = [30, 30, 30]   as [number, number, number];
const GRAY   = [100, 100, 100] as [number, number, number];
const LGRAY  = [245, 245, 245] as [number, number, number];
const WHITE  = [255, 255, 255] as [number, number, number];

const fmtMoney = (n: number) =>
  (n || 0).toLocaleString('es-CR', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' CRC';

export const generateInvoicePDF = (saleData: any, cart: any[], clientInfo?: any) => {
  const c = getCompanySettings();
  const companyName    = c.businessName || 'Mi Empresa';
  const companyId      = c.legalId      || '';
  const companyPhone   = c.phone        || '';
  const companyEmail   = c.email        || '';
  const companyAddress = [c.address, c.province].filter(Boolean).join(', ');

  const doc = new jsPDF({ unit: 'mm', format: 'a4' });
  const W = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();

  // ── HEADER DESIGN: Premium Band ──────────────────────────────────────────
  doc.setFillColor(...GREEN);
  doc.rect(0, 0, W, 45, 'F');

  // Decorative element (Circle)
  doc.setGState(new (doc as any).GState({ opacity: 0.1 }));
  doc.setFillColor(255, 255, 255);
  doc.circle(W, 0, 60, 'F');
  doc.setGState(new (doc as any).GState({ opacity: 1.0 }));

  // Logo / Name / Company Info
  doc.setTextColor(...WHITE);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text(companyName, 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  if (companyAddress) doc.text(companyAddress, 14, 25);
  const contactLine = [companyPhone, companyEmail].filter(Boolean).join('  |  ');
  if (contactLine) doc.text(contactLine, 14, 31);
  if (companyId) doc.text(`Cédula Jurídica: ${companyId}`, 14, 37);

  // Invoice Number & Date Badge
  const badgeW = 68;
  const badgeH = 28;
  const badgeX = W - 14 - badgeW;
  const badgeY = 10;
  
  doc.setFillColor(255, 255, 255, 0.15);
  doc.roundedRect(badgeX, badgeY, badgeW, badgeH, 4, 4, 'F');
  
  doc.setFontSize(7.5);
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURA ELECTRÓNICA', badgeX + 5, badgeY + 8);
  
  doc.setFontSize(11);
  doc.text(saleData?.invoiceNumber || 'POS-0001', badgeX + 5, badgeY + 16);
  
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleString('es-CR', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' }), badgeX + 5, badgeY + 23);

  // ── EMISOR / RECEPTOR BOXES ────────────────────────────────────────────────
  const boxY = 55;
  const boxH = 35;
  const colW = (W - 28 - 6) / 2;

  // Emisor
  doc.setFillColor(...LGRAY);
  doc.roundedRect(14, boxY, colW, boxH, 3, 3, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY);
  doc.text('DATOS DEL EMISOR', 19, boxY + 7);
  
  doc.setFontSize(10);
  doc.setTextColor(...DKGRAY);
  doc.text(companyName, 19, boxY + 13);
  
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  if (companyId) doc.text(`Cédula: ${companyId}`, 19, boxY + 19);
  doc.text(companyAddress || 'Costa Rica', 19, boxY + 25, { maxWidth: colW - 10 });

  // Receptor
  const rxX = 14 + colW + 6;
  doc.setFillColor(...LGRAY);
  doc.roundedRect(rxX, boxY, colW, boxH, 3, 3, 'F');
  doc.setFontSize(7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...GRAY);
  doc.text('DATOS DEL RECEPTOR', rxX + 5, boxY + 7);
  
  doc.setFontSize(10);
  doc.setTextColor(...DKGRAY);
  const clientName = clientInfo?.name || 'Cliente Genérico (Contado)';
  doc.text(clientName, rxX + 5, boxY + 13);
  
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...GRAY);
  if (clientInfo?.identification) doc.text(`ID: ${clientInfo.identification}`, rxX + 5, boxY + 19);
  if (clientInfo?.phone) doc.text(`Tel: ${clientInfo.phone}`, rxX + 5, boxY + 25);
  if (clientInfo?.email) doc.text(clientInfo.email, rxX + 5, boxY + 31, { maxWidth: colW - 8 });
  if (!clientInfo) doc.text('Venta de Contado', rxX + 5, boxY + 19);

  // ── PRODUCTS TABLE ─────────────────────────────────────────────────────────
  const tableRows = cart.map(item => {
    const rate = (item.product.taxRate ?? 13) / 100;
    const lineSubtotal = item.product.salePrice * item.qty;
    const lineTax = lineSubtotal * rate;
    const lineTotal = lineSubtotal + lineTax;
    return [
      item.product.internalCode || '—',
      item.product.name,
      item.qty.toString(),
      fmtMoney(item.product.salePrice),
      `${(rate * 100).toFixed(0)}%`,
      fmtMoney(lineSubtotal),
      fmtMoney(lineTotal)
    ];
  });

  autoTable(doc, {
    startY: boxY + boxH + 10,
    head: [['Cód.', 'Descripción del Producto', 'Cant.', 'Precio Unit.', 'IVA', 'Subtotal', 'Neto']],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: GREEN,
      textColor: WHITE,
      fontSize: 8,
      fontStyle: 'bold',
      halign: 'center',
      valign: 'middle'
    },
    bodyStyles: { fontSize: 8, textColor: DKGRAY, valign: 'middle' },
    columnStyles: {
      0: { halign: 'center', cellWidth: 15 },
      1: { cellWidth: 'auto' },
      2: { halign: 'center', cellWidth: 12 },
      3: { halign: 'right', cellWidth: 28 },
      4: { halign: 'center', cellWidth: 12 },
      5: { halign: 'right', cellWidth: 28 },
      6: { halign: 'right', cellWidth: 28 },
    },
    margin: { left: 14, right: 14 },
    alternateRowStyles: { fillColor: [252, 254, 253] }
  });

  const finalY = (doc as any).lastAutoTable.finalY + 8;

  // ── TOTALS BOX ─────────────────────────────────────────────────────────────
  const totalsW = 85;
  const totalsX = W - 14 - totalsW;
  
  const subtotalVal = cart.reduce((a, i) => a + (i.product.salePrice * i.qty), 0);
  const taxVal = cart.reduce((a, i) => {
    const rate = (i.product.taxRate ?? 13) / 100;
    return a + (i.product.salePrice * i.qty * rate);
  }, 0);
  const discountVal = saleData?.totalDiscount ?? 0;
  const grandTotal = saleData?.finalTotal ?? (subtotalVal + taxVal - discountVal);

  // Background Panel for Totals
  doc.setFillColor(...LGRAY);
  doc.roundedRect(totalsX - 5, finalY - 5, totalsW + 5, 45, 3, 3, 'F');

  const drawLabelValue = (label: string, value: string, y: number, isTotal = false, color = DKGRAY) => {
    doc.setFont('helvetica', isTotal ? 'bold' : 'normal');
    doc.setTextColor(...GRAY);
    doc.setFontSize(isTotal ? 9.5 : 8.5);
    doc.text(label, totalsX, y);
    
    doc.setTextColor(...color);
    doc.setFontSize(isTotal ? 11 : 9);
    doc.text(value, W - 14, y, { align: 'right' });
  };

  let rowY = finalY + 4;
  drawLabelValue('Suma de Partidas:', fmtMoney(subtotalVal), rowY);
  rowY += 8;
  if (discountVal > 0) {
    drawLabelValue('Descuentos Aplicados:', `- ${fmtMoney(discountVal)}`, rowY, false, [180, 83, 9]);
    rowY += 8;
  }
  drawLabelValue('Impuesto de Ventas (IVA):', fmtMoney(taxVal), rowY);
  rowY += 6;
  
  doc.setDrawColor(...GREEN);
  doc.setLineWidth(0.3);
  doc.line(totalsX, rowY, W - 14, rowY);
  rowY += 10;
  
  drawLabelValue('MONTO TOTAL FINAL:', fmtMoney(grandTotal), rowY, true, GREEN);

  // Payment Method
  const pmLabels: Record<string, string> = {
    CASH: 'Efectivo', CARD: 'Tarjeta', SINPE_MOVIL: 'SINPE Móvil',
    SIMPE_MOVIL: 'SINPE Móvil', CREDIT: 'Crédito', TRANSFER: 'Transferencia',
  };
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...GRAY);
  doc.text('MÉTODO DE PAGO:', 14, finalY + 4);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DKGRAY);
  doc.text(pmLabels[saleData?.paymentMethod] || 'Efectivo', 14, finalY + 10);

  // ── FOOTER ─────────────────────────────────────────────────────────────────
  const footerY = pageH - 25;
  doc.setFillColor(...GREEN);
  doc.rect(0, footerY, W, 25, 'F');
  
  doc.setTextColor(...WHITE);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.text('Este documento es un comprobante electrónico para uso interno y respaldo de transacciones.', W / 2, footerY + 8, { align: 'center' });
  doc.text(`${companyName}  |  Costa Rica  |  ${companyEmail}`, W / 2, footerY + 14, { align: 'center' });

  // ── SAVE ───────────────────────────────────────────────────────────────────
  doc.save(`Factura_${saleData?.invoiceNumber || 'POS'}.pdf`);
};
