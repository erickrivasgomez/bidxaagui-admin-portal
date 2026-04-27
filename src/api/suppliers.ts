import api from '../services/api';

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
    api.get<{ success: boolean; message: string; data: ListSuppliersResponse }>('/api/admin/suppliers', { params }),
  
  get: (id: string) => 
    api.get<{ success: boolean; message: string; data: { data: Supplier } }>(`/api/admin/suppliers/${id}`),
  
  create: (data: CreateSupplierRequest) => 
    api.post<{ success: boolean; message: string; data: { data: Supplier } }>('/api/admin/suppliers', data),
  
  update: (id: string, data: UpdateSupplierRequest) => 
    api.put<{ success: boolean; message: string; data: { data: Supplier } }>(`/api/admin/suppliers/${id}`, data),
  
  delete: (id: string) => 
    api.delete<{ success: boolean; message: string }>(`/api/admin/suppliers/${id}`),
  
  getCities: () => 
    api.get<{ success: boolean; message: string; data: CitiesResponse }>('/api/admin/suppliers/cities'),
};
