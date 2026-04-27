export interface Supplier {
  id: string;
  name: string;
  phone: string;
  city: string;
  created_at?: string;
  updated_at?: string;
}

export type CreateSupplierRequest = Omit<Supplier, 'id' | 'created_at' | 'updated_at'>;
export type UpdateSupplierRequest = Partial<CreateSupplierRequest>;
