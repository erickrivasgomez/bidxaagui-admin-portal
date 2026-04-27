import { httpClient } from '../../../shared/infrastructure/api.factory';
import { ApiSupplierRepository } from './api.supplier.repository';
import { GetSuppliersUseCase, CreateSupplierUseCase, UpdateSupplierUseCase, DeleteSupplierUseCase } from '../application/suppliers.use-cases';

const supplierRepository = new ApiSupplierRepository(httpClient);

export const getSuppliersUseCase = new GetSuppliersUseCase(supplierRepository);
export const createSupplierUseCase = new CreateSupplierUseCase(supplierRepository);
export const updateSupplierUseCase = new UpdateSupplierUseCase(supplierRepository);
export const deleteSupplierUseCase = new DeleteSupplierUseCase(supplierRepository);
