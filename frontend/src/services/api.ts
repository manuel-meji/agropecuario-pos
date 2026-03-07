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
export const createSale = (saleData: any) => api.post('/sales', saleData).then(res => res.data);
export const getSales = () => api.get('/sales').then(res => res.data);
export const getSaleById = (id: number) => api.get(`/sales/${id}`).then(res => res.data);
export const deleteSale = (id: number, deleteData: { password: string }) => api.delete(`/sales/${id}`, { data: deleteData }).then(res => res.data);
export const getClients = () => api.get('/clients').then(res => res.data);
export const createClient = (client: any) => api.post('/clients', client).then(res => res.data);
export const getSuppliers = () => api.get('/suppliers').then(res => res.data);
export const createSupplier = (supplier: any) => api.post('/suppliers', supplier).then(res => res.data);
export const getReceivables = () => api.get('/accounts-receivable').then(res => res.data);
export const getReceivablesByClient = () => api.get('/accounts-receivable/by-client').then(res => res.data);
export const getClientHistory = (clientName: string) => api.get(`/accounts-receivable/${encodeURIComponent(clientName)}/history`).then(res => res.data);
export const getClientHistoryByClientId = (clientId: number) => api.get(`/clients/${clientId}/history`).then(res => res.data);
export const makePayment = (id: number, amount: number) => api.post(`/accounts-receivable/${id}/pay`, { amount }).then(res => res.data);
export const getPaymentRecords = () => api.get('/accounts-receivable/payments').then(res => res.data);

export default api;

