import React, { useState, useEffect } from 'react';
import { useProviders } from './hooks/useProviders';
import { ProviderTable } from './components/ProviderTable';
import { ProviderInspector } from './components/ProviderInspector';
import { Supplier } from '../../../../core/modules/laboratorio/domain/supplier.model';

export const ProvidersPage: React.FC = () => {
  const {
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
  } = useProviders();

  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile viewport
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 390); // iPhone 13 Mini breakpoint
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleSelectSupplier = (supplier: Supplier) => {
    selectSupplier(supplier);
    if (!isMobile) {
      openInspector(supplier);
    }
  };

  const handleEditSupplier = (supplier: Supplier) => {
    openInspector(supplier);
  };

  const handleDeleteSupplier = async (supplier: Supplier) => {
    try {
      optimisticDelete(supplier.id);
      await deleteSupplier(supplier.id);
    } catch (error) {
      await loadSuppliers();
      console.error('Error deleting supplier:', error);
    }
  };

  const handleCreateSupplier = async (data: any) => {
    try {
      optimisticCreate(data);
      await createSupplier(data);
    } catch (error) {
      await loadSuppliers();
      console.error('Error creating supplier:', error);
      throw error;
    }
  };

  const handleUpdateSupplier = async (id: string, data: any) => {
    try {
      optimisticUpdate(id, data);
      await updateSupplier(id, data);
    } catch (error) {
      await loadSuppliers();
      console.error('Error updating supplier:', error);
      throw error;
    }
  };

  // Canvas content - renderizado dentro de ManagementLayout
  return (
    <>
      {/* Header del Canvas */}
      <header className="bg-white border-b border-[#DDDDCF] px-8 py-5 flex-shrink-0">
        <div className="flex items-center justify-between max-w-[1400px] mx-auto">
          <div>
            <h1 className="text-[18px] font-semibold text-[#1F1F1A] tracking-[-0.02em]">Proveedores</h1>
            <p className="text-[13px] text-[#8A8A77] mt-1">Gestiona los proveedores del laboratorio</p>
          </div>
          <button
            onClick={() => openInspector()}
            className="px-5 py-2.5 text-[13px] font-medium text-white bg-[#868466] hover:bg-[#767456] rounded-lg transition-colors duration-150 flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Proveedor
          </button>
        </div>
      </header>

      {/* Contenido del Canvas - Centrado max-width 1400px */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-[1400px] mx-auto">
          <ProviderTable
            suppliers={suppliers}
            onSelectSupplier={handleSelectSupplier}
            onEditSupplier={handleEditSupplier}
            onDeleteSupplier={handleDeleteSupplier}
          />
        </div>
      </div>

      {/* Inspector - renderizado en Panel 3 del ManagementLayout */}
      <ProviderInspector
        isOpen={isInspectorOpen}
        isCreating={isCreating}
        selectedSupplier={selectedSupplier}
        onClose={closeInspector}
        onCreate={handleCreateSupplier}
        onUpdate={handleUpdateSupplier}
        onDelete={deleteSupplier}
      />
    </>
  );
};

export default ProvidersPage;
