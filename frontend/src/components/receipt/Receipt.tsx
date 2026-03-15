import React from 'react';

// Interfaces necesarias para los datos del tiquete
interface ReceiptItem {
  quantity: number;
  description: string;
  unitPrice: number;
  total: number;
  taxCode: string; // E, G13, etc
}

interface ReceiptData {
  businessName: string;
  sellerName: string;
  businessId: string;
  businessEmail?: string;
  businessPhone?: string;
  businessAddress?: string;
  docType: string;
  date: string;
  clientName: string;
  clientId: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  invoiceNumber: string;
  consecutive: string;
  key: string;
  sellerId: string;
  invoiceCondition: string; // Contado, Credito
  observations?: string;
  items: ReceiptItem[];
  subTotal: number;
  discount: number;
  iva: number;
  total: number;
  totalUsd?: number;
  change: number;
  resolutionText: string;
}

export const Receipt = React.forwardRef<HTMLDivElement, { data: ReceiptData }>(({ data }, ref) => {
  return (
    <div
      ref={ref}
      style={{
        width: '100%',
        maxWidth: '58mm', // Limita visualmente en pantallas pero expande
        margin: '0 auto', // Centrar el recibo en la hoja/vista
        padding: '0 2mm',
        backgroundColor: 'white',
        color: 'black',
        fontFamily: "'Times New Roman', Times, serif", // Cambiado para parecerse al PDF nativo
        fontSize: '11px',
        lineHeight: '1.2',
        boxSizing: 'border-box'
      }}
    >
      <style>
        {`
          @media print {
            @page {
              margin: 0;
            }
            body {
              margin: 0;
              display: flex;
              justify-content: center; /* Alinea al centro en impresiones */
            }
          }
        `}
      </style>

      {/* Cabecera Empresa */}
      <div style={{ textAlign: 'center', marginBottom: '8px' }}>
        <h3 style={{ margin: '0 0 4px 0', fontSize: '13px', fontWeight: 'bold' }}>{data.businessName}</h3>
        {data.sellerName && <div style={{ fontSize: '11px', fontWeight: 'bold' }}>{data.sellerName}</div>}
        <div>Cedula: {data.businessId}</div>
        {data.businessEmail && <div>Correo: {data.businessEmail}</div>}
        {data.businessPhone && <div>Telefono: {data.businessPhone}</div>}
        {data.businessAddress && <div>{data.businessAddress}</div>}
      </div>

      <div style={{ borderBottom: '1px dashed black', margin: '4px 0' }} />

      {/* Datos del Documento */}
      <div>
        <div>Tipo Doc: {data.docType}</div>
        <div>Fecha: {data.date}</div>
      </div>
      
      <div style={{ borderBottom: '1px dashed black', margin: '4px 0' }} />

      {/* Datos del Cliente */}
      <div>
        <div>Cliente: {data.clientName}</div>
        <div>Ced. Cliente: {data.clientId}</div>
        {data.clientAddress && <div>Dirección Cliente: {data.clientAddress}</div>}
        {data.clientPhone && <div>Telefono Cliente: {data.clientPhone}</div>}
        {data.clientEmail && <div>Correo Cliente: {data.clientEmail}</div>}
      </div>

      <div style={{ borderBottom: '1px dashed black', margin: '4px 0' }} />

      {/* Datos Factura */}
      <div>
        <div>Factura: #{data.invoiceNumber}</div>
        <div>Consecutivo: #{data.consecutive}</div>
        <div style={{ wordBreak: 'break-all' }}>Clave: {data.key}</div>
        <div>Vendedor: {data.sellerId}</div>
        <div>Factura: {data.invoiceCondition}</div>
        {data.observations && <div>Observaciones: {data.observations}</div>}
      </div>

      <div style={{ borderBottom: '1px dashed black', margin: '4px 0' }} />

      {/* Tabla de Productos */}
      <table style={{ width: '100%', fontSize: '10px', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
        <colgroup>
           <col style={{ width: '15%' }} />
           <col style={{ width: '45%' }} />
           <col style={{ width: '20%' }} />
           <col style={{ width: '20%' }} />
        </colgroup>
        <thead>
          <tr style={{ textAlign: 'left', fontWeight: 'bold' }}>
            <th style={{ padding: '2px 0' }}>CAN</th>
            <th>DESCRIPCION</th>
            <th style={{ textAlign: 'right' }}>P.UNIT</th>
            <th style={{ textAlign: 'right' }}>PRECIO</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <React.Fragment key={index}>
              <tr>
                <td style={{ verticalAlign: 'top', paddingTop: '4px' }}>{item.quantity.toFixed(3)}</td>
                <td style={{ verticalAlign: 'top', paddingTop: '4px', wordBreak: 'break-word', paddingRight: '4px' }}>{item.description}</td>
                <td style={{ verticalAlign: 'top', paddingTop: '4px', textAlign: 'right' }}>{item.unitPrice.toFixed(2)}</td>
                <td style={{ verticalAlign: 'top', textAlign: 'right', paddingTop: '4px' }}>
                  {item.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </td>
              </tr>
              <tr>
                <td colSpan={4} style={{ textAlign: 'right', paddingBottom: '2px', fontWeight: 'bold' }}>
                  {item.taxCode}
                </td>
              </tr>
            </React.Fragment>
          ))}
        </tbody>
      </table>

      <div style={{ borderBottom: '1px solid black', margin: '4px 0' }} />

      {/* Totales */}
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Sub-Total</span>
        <span>CRC {data.subTotal.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>Descuento</span>
        <span>CRC {data.discount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span>IVA</span>
        <span>CRC {data.iva.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>

      <div style={{ borderBottom: '1px solid black', margin: '6px 0' }} />

      <div style={{ display: 'flex', justifyContent: 'center', fontWeight: 'bold', fontSize: '14px', margin: '8px 0' }}>
        <span>Total CRC {data.total.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>
      {data.totalUsd !== undefined && (
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span>Total USD</span>
          <span>{data.totalUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
        </div>
      )}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: '4px' }}>
        <span>Su Vuelto: CRC {data.change.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
      </div>

      <div style={{ borderBottom: '1px solid black', margin: '6px 0' }} />

      {/* Pie de Pagina */}
      <div>Total Lineas: {data.items.length}</div>
      <div style={{ textAlign: 'center', margin: '12px 0 6px 0', fontSize: '12px', fontWeight: 'bold' }}>
        Gracias Por Preferirnos
      </div>
      <div style={{ textAlign: 'center', marginBottom: '12px' }}>
        X_________________________________________
      </div>
      
      <div style={{ textAlign: 'center', fontSize: '9px' }}>
        {data.resolutionText}
        <br />
        <br />
        ** Nota: Productos con G1 1%,G2 2%, G13 13%, E Exento **
        <br />
        Software M&M
      </div>
    </div>
  );
});

Receipt.displayName = 'Receipt';
