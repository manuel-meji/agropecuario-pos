import { getCompanySettings } from './companySettings';

export const generateEscPosReceipt = (sale: any, cart: any[], client?: any, taxExempt?: boolean) => {
  const company = getCompanySettings();
  
  let text = '';
  // Centrar titulo
  text += '\x1B\x61\x01'; // Centrado
  text += `${company.businessName || 'Empresa'}\n`;
  if (company.legalId) text += `Cedula: ${company.legalId}\n`;
  if (company.phone) text += `Tel: ${company.phone}\n`;
  if (taxExempt) text += `REGIMEN EXENTO - SIN IVA\n`;
  
  text += '\x1B\x61\x00'; // Izquierda
  text += '--------------------------------\n';
  text += `Tipo Doc: ${sale.invoiceNumber ? 'Factura Electronica' : 'Tiquete POS'}\n`;
  text += `Factura: ${sale.invoiceNumber || sale.id || 'N/A'}\n`;
  text += `Fecha: ${new Date().toLocaleString('es-CR')}\n`;
  
  if (client) {
    text += `Cliente: ${client.name}\n`;
    if (client.identification) text += `Cedula: ${client.identification}\n`;
  } else {
    text += `Cliente: Contado Generico\n`;
  }
  
  text += '--------------------------------\n';
  // Productos (32 chars line: CAN(4) DESC(12) P.UNIT(6) PREC(8))
  text += 'CAN DESCRIPCION P.UNIT PRECIO\n';
  cart.forEach(item => {
    let qtyStr = parseFloat(item.qty).toFixed(3).substring(0, 5);
    let nameStr = item.product.name.padEnd(25, ' ').substring(0, 25);
    
    // First line: QTY and Name
    text += `${qtyStr.padEnd(6, ' ')}${nameStr}\n`;
    
    // Line 2: Prices
    let pUnit = Number(item.product.salePrice).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    let total = (item.qty * item.product.salePrice).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    // When taxExempt, show everything as Exento regardless of product taxRate
    let taxLetter = (taxExempt || item.product.taxRate === 0) ? 'E' : `G${item.product.taxRate ?? 13}`;
    const priceText = `${total} ${taxLetter}`;
    
    // Right align pUnit and priceText
    // We have 32 columns.
    text += `${''.padEnd(12, ' ')}${pUnit.padStart(8, ' ')}${priceText.padStart(12, ' ')}\n`;
  });
  
  text += '--------------------------------\n';
  text += '\x1B\x61\x02'; // Derecha
  
  const subTotal = (sale.subtotal || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const discount = (sale.totalDiscount || sale.discountAmount || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  // IVA is forced to 0 when taxExempt
  const iva = taxExempt ? '0.00' : (sale.totalTax || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  const grantTotal = (sale.finalTotal || sale.total || 0).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  
  text += `Sub-Total       CRC${subTotal}\n`;
  text += `Descuento       CRC${discount}\n`;
  if (taxExempt) {
    text += `IVA (Exento)    CRC${iva}\n`;
  } else {
    text += `IVA             CRC${iva}\n`;
  }
  
  text += '\n\x1B\x61\x01'; // Centrado
  text += `TOTAL CRC ${grantTotal}\n`;
  
  let vuelto = "0.00";
  if (sale.change !== undefined) {
    vuelto = Number(sale.change).toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
  }
  text += `Su Vuelto: CRC ${vuelto}\n`;
  
  text += '--------------------------------\n';
  text += `Total Lineas: ${cart.length}\n`;
  text += 'Gracias por preferirnos!\n\n';
  text += 'X__________________________\n\n';
  text += 'MH-DGT-RES-0027-2024\n';
  text += taxExempt
    ? '** REGIMEN EXENTO DE IVA **\n'
    : '** Nota: G1 1%,G2 2%, G13 13%, E **\n';
  text += 'Software M&M\n';
  text += '\n\n\n\n'; // Margen para el corte
  
  return text;
};

export const printToEscPos = async (text: string, printerName: string) => {
  const response = await fetch('http://localhost:8080/api/printer/print', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ printerName, text })
  });
  if (!response.ok) throw new Error('Error al imprimir');
  return response.text();
};
