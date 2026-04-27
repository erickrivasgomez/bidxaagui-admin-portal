import { SupplierRepository } from '../domain/supplier.repository';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../domain/supplier.model';
import { ValidationError } from '../../../shared/domain/errors';

export class GetSuppliersUseCase {
  constructor(private supplierRepository: SupplierRepository) {}
  execute(): Promise<Supplier[]> {
    return this.supplierRepository.getAll();
  }
}

export class CreateSupplierUseCase {
  constructor(private supplierRepository: SupplierRepository) {}
  execute(data: CreateSupplierRequest): Promise<void> {
    if (!data.name || !data.phone || !data.city) {
      throw new ValidationError('Todos los campos son obligatorios');
    }
    return this.supplierRepository.create(data);
  }
}

export class UpdateSupplierUseCase {
  constructor(private supplierRepository: SupplierRepository) {}
  execute(id: string, data: UpdateSupplierRequest): Promise<void> {
    return this.supplierRepository.update(id, data);
  }
}

export class DeleteSupplierUseCase {
  constructor(private supplierRepository: SupplierRepository) {}
  execute(id: string): Promise<void> {
    return this.supplierRepository.delete(id);
  }
}
