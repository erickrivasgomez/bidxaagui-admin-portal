import { useState, useEffect } from 'react';
import { getSuppliersUseCase, createSupplierUseCase, updateSupplierUseCase, deleteSupplierUseCase } from '../infrastructure/suppliers.dependencies';
import type { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../domain/supplier.model';
import { NetworkError } from '../../../shared/domain/errors';

export interface UseSuppliersReturn {
  suppliers: Supplier[];
  loading: boolean;
  error: string | null;
  fetchSuppliers: () => Promise<void>;
  createSupplier: (data: CreateSupplierRequest) => Promise<void>;
  updateSupplier: (id: string, data: UpdateSupplierRequest) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
}

/**
 * useSuppliers Custom Hook
 * Encapsulates all suppliers logic following Clean Architecture
 */
export const useSuppliers = (): UseSuppliersReturn => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSuppliersUseCase.execute();
      setSuppliers(data || []);
    } catch (err) {
      console.error('Error fetching suppliers:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  const createSupplier = async (data: CreateSupplierRequest) => {
    setLoading(true);
    setError(null);
    try {
      await createSupplierUseCase.execute(data);
      await fetchSuppliers();
    } catch (err) {
      console.error('Error creating supplier:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al crear proveedor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateSupplier = async (id: string, data: UpdateSupplierRequest) => {
    setLoading(true);
    setError(null);
    try {
      await updateSupplierUseCase.execute(id, data);
      await fetchSuppliers();
    } catch (err) {
      console.error('Error updating supplier:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al actualizar proveedor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteSupplier = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteSupplierUseCase.execute(id);
      await fetchSuppliers();
    } catch (err) {
      console.error('Error deleting supplier:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al eliminar proveedor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  return {
    suppliers,
    loading,
    error,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
};
