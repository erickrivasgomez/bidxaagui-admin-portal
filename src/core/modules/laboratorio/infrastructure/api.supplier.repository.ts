import { SupplierRepository } from '../domain/supplier.repository';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../domain/supplier.model';
import { HttpClient } from '../../../shared/domain/http.client.interface';
import { NetworkError } from '../../../shared/domain/errors';

export class ApiSupplierRepository implements SupplierRepository {
  constructor(private httpClient: HttpClient) {}

  async getAll(): Promise<Supplier[]> {
    try {
      const response = await this.httpClient.get<any>('/api/admin/suppliers');
      return response.data.data.data || response.data.data;
    } catch (e) {
      throw new NetworkError('Error al cargar proveedores.');
    }
  }

  async create(data: CreateSupplierRequest): Promise<void> {
    await this.httpClient.post('/api/admin/suppliers', data);
  }

  async update(id: string, data: UpdateSupplierRequest): Promise<void> {
    await this.httpClient.put(`/api/admin/suppliers/${id}`, data);
  }

  async delete(id: string): Promise<void> {
    await this.httpClient.delete(`/api/admin/suppliers/${id}`);
  }
}
