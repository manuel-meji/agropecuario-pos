import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const generateInvoicePDF = (saleData: any, cart: any[], clientInfo?: any) => {
  const doc = new jsPDF();
  
  // Título principal
  doc.setFontSize(22);
  doc.setTextColor(34, 197, 94); // agro-green
  doc.text('Agropecuario POS', 14, 22);
  
  doc.setFontSize(12);
  doc.setTextColor(40);
  doc.text('Documento Electrónico Alterno', 14, 30);
  doc.text(`Factura N°: ${saleData.invoiceNumber || 'POS-SIST-1'}`, 14, 36);
  doc.text(`Fecha: ${new Date().toLocaleString('es-CR')}`, 14, 42);
  
  if (clientInfo) {
    doc.text(`Cliente: ${clientInfo.name || 'Genérico'}`, 14, 52);
    if (clientInfo.identification) doc.text(`Cédula/ID: ${clientInfo.identification}`, 14, 58);
  } else {
    doc.text(`Cliente: Cliente Genérico (Contado)`, 14, 52);
  }
  
  // Productos a tabla
  const tableData = cart.map(item => [
    item.qty,
    item.product.name,
    `C${item.product.salePrice.toLocaleString('es-CR')}`,
    `C${(item.qty * item.product.salePrice).toLocaleString('es-CR')}`
  ]);
  
  autoTable(doc, {
    startY: 65,
    head: [['Cant.', 'Descripción', 'Precio Unit.', 'Subtotal']],
    body: tableData,
    theme: 'grid',
    headStyles: { fillColor: [34, 197, 94] },
    styles: { font: 'helvetica' }
  });
  
  // Totales al final de la tabla
  const finalY = (doc as any).lastAutoTable.finalY || 65;
  doc.setFontSize(11);
  doc.text(`Subtotal: C${saleData.subtotal?.toLocaleString('es-CR') || '0'}`, 140, finalY + 10);
  doc.text(`IVA (Impuesto): C${saleData.totalTax?.toLocaleString('es-CR') || '0'}`, 140, finalY + 16);
  
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`TOTAL PAGO: C${saleData.finalTotal?.toLocaleString('es-CR') || '0'}`, 140, finalY + 24);
  
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text(`Método de pago: ${saleData.paymentMethod}`, 14, finalY + 24);
  
  // Crear PDF y descargar
  const filename = `Factura_${saleData.invoiceNumber || 'POS'}.pdf`;
  doc.save(filename);
};
