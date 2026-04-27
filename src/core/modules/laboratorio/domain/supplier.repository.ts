import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from './supplier.model';

export interface SupplierRepository {
  getAll(): Promise<Supplier[]>;
  create(data: CreateSupplierRequest): Promise<void>;
  update(id: string, data: UpdateSupplierRequest): Promise<void>;
  delete(id: string): Promise<void>;
}
