import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor para agregar el token JWT en cada solicitud
api.interceptors.request.use(
  (config) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    if (user && user.token) {
      config.headers.Authorization = `Bearer ${user.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const getProducts = () => api.get('/products').then(res => res.data);
export const createProduct = (product: any) => api.post('/products', product).then(res => res.data);
export const getCategories = () => api.get('/categories').then(res => res.data);
export const createCategory = (category: any) => api.post('/categories', category).then(res => res.data);
export const updateCategory = (id: number, category: any) => api.put(`/categories/${id}`, category).then(res => res.data);
export const deleteCategory = (id: number) => api.delete(`/categories/${id}`).then(res => res.data);
export const updateProduct = (id: number, product: any) => api.put(`/products/${id}`, product).then(res => res.data);
export const deleteProduct = (id: number) => api.delete(`/products/${id}`).then(res => res.data);
export const createSale = (saleData: any) => api.post('/sales', saleData).then(res => res.data);
export const getSales = (startDate?: string, endDate?: string) =>
  api.get('/sales', { params: { startDate, endDate } }).then(res => res.data);
export const getSaleById = (id: number) => api.get(`/sales/${id}`).then(res => res.data);
export const deleteSale = (id: number, deleteData: { password: string }) => api.delete(`/sales/${id}`, { data: deleteData }).then(res => res.data);
export const sendReceiptEmail = (id: number, pdfBase64: string) => api.post(`/sales/${id}/email-receipt`, { pdfBase64 }).then(res => res.data);
export const getClients = () => api.get('/clients').then(res => res.data);
export const createClient = (client: any) => api.post('/clients', client).then(res => res.data);
export const updateClient = (id: number, client: any) => api.put(`/clients/${id}`, client).then(res => res.data);
export const deleteClient = (id: number) => api.delete(`/clients/${id}`).then(res => res.data);
export const getSuppliers = () => api.get('/suppliers').then(res => res.data);
export const createSupplier = (supplier: any) => api.post('/suppliers', supplier).then(res => res.data);
export const updateSupplier = (id: number, supplier: any) => api.put(`/suppliers/${id}`, supplier).then(res => res.data);
export const deleteSupplier = (id: number) => api.delete(`/suppliers/${id}`).then(res => res.data);
export const getReceivables = () => api.get('/accounts-receivable').then(res => res.data);
export const getReceivablesByClient = () => api.get('/accounts-receivable/by-client').then(res => res.data);
export const getClientHistory = (clientName: string) => api.get(`/accounts-receivable/${encodeURIComponent(clientName)}/history`).then(res => res.data);
export const getClientHistoryByClientId = (clientId: number) => api.get(`/clients/${clientId}/history`).then(res => res.data);
export const makePayment = (id: number, amount: number, paymentMethod?: string) => api.post(`/accounts-receivable/${id}/pay`, { amount, paymentMethod }).then(res => res.data);
export const getPaymentRecords = () => api.get('/accounts-receivable/payments').then(res => res.data);
export const makeClientBulkPayment = (clientName: string, amount: number, paymentMethod?: string) => api.post(`/accounts-receivable/client/${encodeURIComponent(clientName)}/pay`, { amount, paymentMethod }).then(res => res.data);

// Purchases
export const getPurchases = () => api.get('/purchases').then(res => res.data);
export const getPurchasesBySupplier = (supplierId: number) => api.get(`/purchases/supplier/${supplierId}`).then(res => res.data);
export const createPurchase = (purchaseData: any) => api.post('/purchases', purchaseData).then(res => res.data);

// Accounts Payable (CxP)
export const getPayables = () => api.get('/accounts-payable').then(res => res.data);
/** Get all payables for a supplier by their immutable ID (survives name changes). */
export const getPayableHistory = (supplierId: number) => api.get(`/accounts-payable/by-supplier/${supplierId}`).then(res => res.data);
export const getSupplierHistory = (supplierId: number) => api.get(`/suppliers/${supplierId}/history`).then(res => res.data);
export const makePayablePayment = (id: number, amount: number, paymentMethod?: string) => api.post(`/accounts-payable/${id}/pay`, { amount, paymentMethod }).then(res => res.data);
// CABYS
export const getCabysSearch = (query: string) => api.get('/cabys/search', { params: { query } }).then(res => res.data);
export const getCabysByCode = (code: string) => api.get(`/cabys/${code}`).then(res => res.data);

export const getPayablePaymentRecords = async () => {
  const response = await api.get('/accounts-payable/payments');
  return response.data;
};

/** Bulk payment for a supplier using their immutable ID (survives name changes). */
export const makeSupplierBulkPayment = async (supplierId: number, amount: number, paymentMethod?: string) => {
  const response = await api.post(`/accounts-payable/by-supplier/${supplierId}/pay`, { amount, paymentMethod });
  return response.data;
};
// Cash Closing
export const getCashClosingPreview = (desde?: string, hasta?: string) => 
  api.get('/cash-closing/preview', { params: { desde, hasta } }).then(res => res.data);

export const createCashClosing = (notes?: string, desde?: string, hasta?: string) => 
  api.post('/cash-closing', null, { params: { notes, desde, hasta } }).then(res => res.data);
export const getCashClosingHistory = () => api.get('/cash-closing').then(res => res.data);

// Reports
export const getTaxReport = (startDate: string, endDate: string) => 
  api.get('/reports/tax', { params: { startDate, endDate } }).then(res => res.data);

// ─── Documentos Recibidos (Art. 7) ─────────────────────────────────────────
export const getReceivedDocuments = (params?: { estado?: string; desde?: string; hasta?: string }) =>
  api.get('/received-documents', { params }).then(res => res.data);

export const getReceivedDocumentDetail = (clave: string) =>
  api.get(`/received-documents/${clave}`).then(res => res.data);

export const syncReceivedDocument = (clave: string) =>
  api.post(`/received-documents/${clave}/sync`).then(res => res.data);

export const syncAllReceivedDocuments = () =>
  api.post('/received-documents/sync-all').then(res => res.data);

export const getReceivedDocumentsPendingCount = () =>
  api.get('/received-documents/pending-count').then(res => res.data);

export const downloadReceivedXml = (clave: string) =>
  api.get(`/received-documents/${clave}/download-xml`, { responseType: 'blob' }).then(res => res.data);

export const exportReceivedDocumentsZip = (desde?: string, hasta?: string) =>
  api.get('/received-documents/export-zip', { params: { desde, hasta }, responseType: 'blob' }).then(res => res.data);

// ─── Importar Factura Recibida (Art. 10) ───────────────────────────────────
/** Importa por clave: 50 dígitos numéricos. Retorna datos del comprobante para preview. */
export const importDocumentByClave = (clave: string) =>
  api.post('/received-documents/import-clave', { clave }).then(res => res.data);

/** Importa desde archivo XML o ZIP subido por el usuario. */
export const importDocumentFromXml = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/received-documents/import-xml', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};

// ─── Confirmación/Rechazo MensajeReceptor (Art. 10) ────────────────────────
export const acceptDocument = (clave: string) =>
  api.post(`/received-documents/${clave}/accept`).then(res => res.data);

export const acceptPartialDocument = (clave: string, montoAceptado: number, detalle: string) =>
  api.post(`/received-documents/${clave}/accept-partial`, { montoAceptado, detalle }).then(res => res.data);

export const rejectDocument = (clave: string, detalle: string) =>
  api.post(`/received-documents/${clave}/reject`, { detalle }).then(res => res.data);

// ─── Consecutivos (Hacienda) ───────────────────────────────────────────────
export const getConsecutive = (tipoDocumento: string) =>
  api.get(`/invoices/consecutives/${tipoDocumento}`).then(res => res.data);

export const updateConsecutive = (tipoDocumento: string, ultimoConsecutivo: number) =>
  api.put(`/invoices/consecutives/${tipoDocumento}`, { ultimoConsecutivo }).then(res => res.data);

export const exportSentInvoicesZip = (desde?: string, hasta?: string) =>
  api.get('/invoices/export-zip', { params: { desde, hasta }, responseType: 'blob' }).then(res => res.data);

export const getRecentInvoices = () => api.get('/invoices/recent').then(res => res.data);

// ─── Notas de Crédito (Anulaciones) ───────────────────────────────────────
export const issueCreditNote = (saleId: number, razon: string) =>
  api.post(`/invoices/sale/${saleId}/credit-note`, { razon }).then(res => res.data);

export const getInvoiceBySale = (saleId: number) =>
  api.get(`/invoices/sale/${saleId}`).then(res => res.data);

// ─── Configuraciones ──────────────────────────────────────────────────────
export const getSettings = () => api.get('/settings').then(res => res.data);
export const updateSettings = (settings: any) => api.put('/settings', settings).then(res => res.data);
export const uploadCertificate = (file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post('/settings/certificate', form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(res => res.data);
};

export default api;



