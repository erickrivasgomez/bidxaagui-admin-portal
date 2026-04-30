import React, { useState, useEffect } from 'react';
import { useProviders } from './hooks/useProviders';
import { ProviderTable } from './components/ProviderTable';
import { ProviderInspector } from './components/ProviderInspector';
import { Supplier } from '../../../../core/modules/laboratorio/domain/supplier.model';

// Simple Sidebar Component (can be replaced with existing one)
const SimpleSidebar: React.FC = () => {
  return (
    <div className="w-[260px] bg-[#F8F8F4] border-r border-[#DDDDCF] p-4">
      <div className="space-y-2">
        <h3 className="text-[14px] font-semibold text-[#1F1F1A] mb-4">Laboratorio</h3>
        <nav className="space-y-1">
          <a 
            href="/management/labs/suppliers"
            className="block px-3 py-2 text-[14px] text-[#868466] bg-[#FFFFFF] rounded-lg border border-[#868466] font-medium"
          >
            Proveedores
          </a>
          <a 
            href="#"
            className="block px-3 py-2 text-[14px] text-[#8A8A77] hover:text-[#1F1F1A] hover:bg-[#FFFFFF] rounded-lg transition-colors"
          >
            Inventario
          </a>
          <a 
            href="#"
            className="block px-3 py-2 text-[14px] text-[#8A8A77] hover:text-[#1F1F1A] hover:bg-[#FFFFFF] rounded-lg transition-colors"
          >
            Análisis
          </a>
          <a 
            href="#"
            className="block px-3 py-2 text-[14px] text-[#8A8A77] hover:text-[#1F1F1A] hover:bg-[#FFFFFF] rounded-lg transition-colors"
          >
            Reportes
          </a>
        </nav>
      </div>
    </div>
  );
};

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
      setIsMobile(window.innerWidth < 1024); // lg breakpoint
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
      // Apply optimistic delete
      optimisticDelete(supplier.id);
      
      // Actually delete
      await deleteSupplier(supplier.id);
    } catch (error) {
      // If delete fails, reload data to restore
      await loadSuppliers();
      console.error('Error deleting supplier:', error);
    }
  };

  const handleCreateSupplier = async (data: any) => {
    try {
      // Apply optimistic create
      optimisticCreate(data);
      
      // Actually create
      await createSupplier(data);
    } catch (error) {
      // If create fails, reload data to restore
      await loadSuppliers();
      console.error('Error creating supplier:', error);
      throw error; // Re-throw to show error in inspector
    }
  };

  const handleUpdateSupplier = async (id: string, data: any) => {
    try {
      // Apply optimistic update
      optimisticUpdate(id, data);
      
      // Actually update
      await updateSupplier(id, data);
    } catch (error) {
      // If update fails, reload data to restore
      await loadSuppliers();
      console.error('Error updating supplier:', error);
      throw error; // Re-throw to show error in inspector
    }
  };

  // Desktop Layout: 3 Panels
  if (!isMobile) {
    return (
      <div className="h-screen bg-[#F8F8F4] flex">
        {/* Panel 1: Sidebar */}
        <SimpleSidebar />

        {/* Panel 2: Canvas */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-white border-b border-[#DDDDCF] px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-[18px] font-semibold text-[#1F1F1A]">Proveedores</h1>
                <p className="text-[12px] text-[#8A8A77] mt-1">
                  Gestiona los proveedores del laboratorio
                </p>
              </div>
              <button
                onClick={() => openInspector()}
                className="px-4 py-2 text-[14px] font-medium text-white bg-[#868466] hover:bg-[#767456] rounded-lg transition-colors flex items-center gap-2"
              >
                <svg 
                  className="w-4 h-4" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Nuevo Proveedor
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="flex-1 p-6 overflow-auto">
            <div className="max-w-[1400px] mx-auto">
              <ProviderTable
                suppliers={suppliers}
                onSelectSupplier={handleSelectSupplier}
                onEditSupplier={handleEditSupplier}
                onDeleteSupplier={handleDeleteSupplier}
              />
            </div>
          </div>
        </div>

        {/* Panel 3: Inspector */}
        <ProviderInspector
          isOpen={isInspectorOpen}
          isCreating={isCreating}
          selectedSupplier={selectedSupplier}
          onClose={closeInspector}
          onCreate={handleCreateSupplier}
          onUpdate={handleUpdateSupplier}
          onDelete={deleteSupplier}
        />
      </div>
    );
  }

  // Mobile Layout: Single Panel with Full-Screen Inspector
  return (
    <div className="h-screen bg-[#F8F8F4] flex flex-col">
      {/* Mobile Header */}
      <div className="bg-white border-b border-[#DDDDCF] px-4 py-3">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-[16px] font-semibold text-[#1F1F1A]">Proveedores</h1>
            <p className="text-[11px] text-[#8A8A77] mt-0.5">
              Laboratorio
            </p>
          </div>
          <button
            onClick={() => openInspector()}
            className="px-3 py-1.5 text-[13px] font-medium text-white bg-[#868466] hover:bg-[#767456] rounded-lg transition-colors flex items-center gap-1"
          >
            <svg 
              className="w-3.5 h-3.5" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M12 4v16m8-8H4"
              />
            </svg>
            Nuevo
          </button>
        </div>
      </div>

      {/* Mobile Table */}
      <div className="flex-1 p-4 overflow-auto">
        <ProviderTable
          suppliers={suppliers}
          onSelectSupplier={handleSelectSupplier}
          onEditSupplier={handleEditSupplier}
          onDeleteSupplier={handleDeleteSupplier}
        />
      </div>

      {/* Mobile Inspector (Full Screen) */}
      <ProviderInspector
        isOpen={isInspectorOpen}
        isCreating={isCreating}
        selectedSupplier={selectedSupplier}
        onClose={closeInspector}
        onCreate={handleCreateSupplier}
        onUpdate={handleUpdateSupplier}
        onDelete={deleteSupplier}
      />
    </div>
  );
};

export default ProvidersPage;
