import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

export const getProducts = () => api.get('/products').then(res => res.data);
export const createProduct = (product: any) => api.post('/products', product).then(res => res.data);
export const getCategories = () => api.get('/categories').then(res => res.data);
export const createCategory = (category: any) => api.post('/categories', category).then(res => res.data);
export const updateProduct = (id: number, product: any) => api.put(`/products/${id}`, product).then(res => res.data);
export const createSale = (saleData: any) => api.post('/sales', saleData).then(res => res.data);
export const getSales = () => api.get('/sales').then(res => res.data);
export const getClients = () => api.get('/clients').then(res => res.data);
export const createClient = (client: any) => api.post('/clients', client).then(res => res.data);
export const getSuppliers = () => api.get('/suppliers').then(res => res.data);
export const createSupplier = (supplier: any) => api.post('/suppliers', supplier).then(res => res.data);

export default api;
