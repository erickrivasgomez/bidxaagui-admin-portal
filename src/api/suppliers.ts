import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.bidxaagui.com';

export interface Supplier {
  id: string;
  name: string;
  phone: string;
  city: string;
  created_at: string;
  updated_at: string;
}

export interface ListSuppliersQuery {
  page?: number;
  limit?: number;
  search?: string;
  city?: string;
}

export interface ListSuppliersResponse {
  data: Supplier[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateSupplierRequest {
  name: string;
  phone: string;
  city: string;
}

export interface UpdateSupplierRequest {
  name?: string;
  phone?: string;
  city?: string;
}

export interface CitiesResponse {
  cities: string[];
}

export const suppliersApi = {
  list: (params?: ListSuppliersQuery) => 
    axios.get<ListSuppliersResponse>(`${API_URL}/api/admin/suppliers`, { params }),
  
  get: (id: string) => 
    axios.get<{ data: Supplier }>(`${API_URL}/api/admin/suppliers/${id}`),
  
  create: (data: CreateSupplierRequest) => 
    axios.post<{ data: Supplier }>(`${API_URL}/api/admin/suppliers`, data),
  
  update: (id: string, data: UpdateSupplierRequest) => 
    axios.put<{ data: Supplier }>(`${API_URL}/api/admin/suppliers/${id}`, data),
  
  delete: (id: string) => 
    axios.delete(`${API_URL}/api/admin/suppliers/${id}`),
  
  getCities: () => 
    axios.get<CitiesResponse>(`${API_URL}/api/admin/suppliers/cities`),
};
