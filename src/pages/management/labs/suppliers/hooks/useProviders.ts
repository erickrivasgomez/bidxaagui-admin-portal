import { useState, useEffect, useCallback } from 'react';
import { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../../../../../core/modules/laboratorio/domain/supplier.model';
import { 
  getSuppliersUseCase, 
  createSupplierUseCase, 
  updateSupplierUseCase, 
  deleteSupplierUseCase 
} from '../../../../../core/modules/laboratorio/infrastructure/suppliers.dependencies';
import { NetworkError, ValidationError } from '../../../../../core/shared/domain/errors';

export interface DataState<T> {
  data: T | null;
  status: 'idle' | 'loading' | 'error' | 'success' | 'empty';
  error: string | null;
}

export interface UseProvidersReturn {
  suppliers: DataState<Supplier[]>;
  selectedSupplier: Supplier | null;
  isInspectorOpen: boolean;
  isCreating: boolean;
  
  // Actions
  loadSuppliers: () => Promise<void>;
  selectSupplier: (supplier: Supplier | null) => void;
  openInspector: (supplier?: Supplier) => void;
  closeInspector: () => void;
  createSupplier: (data: CreateSupplierRequest) => Promise<void>;
  updateSupplier: (id: string, data: UpdateSupplierRequest) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  
  // Optimistic UI helpers
  optimisticCreate: (data: CreateSupplierRequest) => void;
  optimisticUpdate: (id: string, data: UpdateSupplierRequest) => void;
  optimisticDelete: (id: string) => void;
}

export function useProviders(): UseProvidersReturn {
  const [suppliers, setSuppliers] = useState<DataState<Supplier[]>>({
    data: null,
    status: 'idle',
    error: null,
  });
  
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // Load suppliers
  const loadSuppliers = useCallback(async () => {
    setSuppliers(prev => ({ ...prev, status: 'loading', error: null }));
    
    try {
      const data = await getSuppliersUseCase.execute();
      
      if (data.length === 0) {
        setSuppliers({ data: [], status: 'empty', error: null });
      } else {
        setSuppliers({ data, status: 'success', error: null });
      }
    } catch (error) {
      let errorMessage = 'Error desconocido';
      
      if (error instanceof NetworkError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      setSuppliers({ data: null, status: 'error', error: errorMessage });
    }
  }, []);

  // Select supplier
  const selectSupplier = useCallback((supplier: Supplier | null) => {
    setSelectedSupplier(supplier);
  }, []);

  // Inspector controls
  const openInspector = useCallback((supplier?: Supplier) => {
    if (supplier) {
      setSelectedSupplier(supplier);
      setIsCreating(false);
    } else {
      setSelectedSupplier(null);
      setIsCreating(true);
    }
    setIsInspectorOpen(true);
  }, []);

  const closeInspector = useCallback(() => {
    setIsInspectorOpen(false);
    setSelectedSupplier(null);
    setIsCreating(false);
  }, []);

  // Create supplier
  const createSupplier = useCallback(async (data: CreateSupplierRequest) => {
    try {
      await createSupplierUseCase.execute(data);
      await loadSuppliers(); // Refresh data
      closeInspector();
    } catch (error) {
      let errorMessage = 'Error al crear proveedor';
      
      if (error instanceof ValidationError) {
        errorMessage = error.message;
      } else if (error instanceof NetworkError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }, [loadSuppliers, closeInspector]);

  // Update supplier
  const updateSupplier = useCallback(async (id: string, data: UpdateSupplierRequest) => {
    try {
      await updateSupplierUseCase.execute(id, data);
      await loadSuppliers(); // Refresh data
      closeInspector();
    } catch (error) {
      let errorMessage = 'Error al actualizar proveedor';
      
      if (error instanceof ValidationError) {
        errorMessage = error.message;
      } else if (error instanceof NetworkError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }, [loadSuppliers, closeInspector]);

  // Delete supplier
  const deleteSupplier = useCallback(async (id: string) => {
    try {
      await deleteSupplierUseCase.execute(id);
      await loadSuppliers(); // Refresh data
      closeInspector();
    } catch (error) {
      let errorMessage = 'Error al eliminar proveedor';
      
      if (error instanceof NetworkError) {
        errorMessage = error.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      
      throw new Error(errorMessage);
    }
  }, [loadSuppliers, closeInspector]);

  // Optimistic UI operations
  const optimisticCreate = useCallback((data: CreateSupplierRequest) => {
    const tempSupplier: Supplier = {
      id: `temp-${Date.now()}`,
      ...data,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    setSuppliers(prev => {
      if (prev.data) {
        return {
          ...prev,
          data: [...prev.data, tempSupplier],
          status: 'success' as const,
        };
      }
      return {
        data: [tempSupplier],
        status: 'success' as const,
        error: null,
      };
    });
  }, []);

  const optimisticUpdate = useCallback((id: string, data: UpdateSupplierRequest) => {
    setSuppliers(prev => {
      if (!prev.data) return prev;
      
      return {
        ...prev,
        data: prev.data.map(supplier => 
          supplier.id === id 
            ? { ...supplier, ...data, updated_at: new Date().toISOString() }
            : supplier
        ),
        status: 'success' as const,
      };
    });
  }, []);

  const optimisticDelete = useCallback((id: string) => {
    setSuppliers(prev => {
      if (!prev.data) return prev;
      
      const newData = prev.data.filter(supplier => supplier.id !== id);
      
      return {
        ...prev,
        data: newData,
        status: newData.length === 0 ? 'empty' as const : 'success' as const,
      };
    });
  }, []);

  // Initial load
  useEffect(() => {
    loadSuppliers();
  }, [loadSuppliers]);

  return {
    suppliers,
    selectedSupplier,
    isInspectorOpen,
    isCreating,
    
    loadSuppliers,
    selectSupplier,
    openInspector,
    closeInspector,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
  };
}
