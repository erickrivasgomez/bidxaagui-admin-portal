import React, { useState, useEffect } from 'react';
import { useProviders } from './hooks/useProviders';
import { ProviderTable } from './components/ProviderTable';
import { ProviderInspector } from './components/ProviderInspector';
import { Supplier } from '../../../../core/modules/laboratorio/domain/supplier.model';

// Panel 1: Sidebar Component - 260px fijo
const Sidebar: React.FC = () => (
  <aside className="w-[260px] bg-[#F8F8F4] border-r border-[#DDDDCF] flex-shrink-0 flex flex-col">
    <div className="p-6 h-full flex flex-col">
      <div className="mb-8">
        <h2 className="text-[16px] font-semibold text-[#1F1F1A] mb-6">Laboratorio</h2>
        <nav className="space-y-1">
          <a 
            href="/management/labs/suppliers"
            className="flex items-center px-3 py-2.5 text-[13px] font-medium text-white bg-[#868466] rounded-lg"
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Proveedores
          </a>
          <a 
            href="#"
            className="flex items-center px-3 py-2.5 text-[13px] font-medium text-[#8A8A77] hover:text-[#1F1F1A] hover:bg-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Inventario
          </a>
          <a 
            href="#"
            className="flex items-center px-3 py-2.5 text-[13px] font-medium text-[#8A8A77] hover:text-[#1F1F1A] hover:bg-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Análisis
          </a>
          <a 
            href="#"
            className="flex items-center px-3 py-2.5 text-[13px] font-medium text-[#8A8A77] hover:text-[#1F1F1A] hover:bg-white rounded-lg transition-colors"
          >
            <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m9-1h-6" />
            </svg>
            Reportes
          </a>
        </nav>
      </div>
      
      <div className="mt-auto pt-6 border-t border-[#E5E5DA]">
        <div className="px-3 py-2.5">
          <p className="text-[11px] text-[#8A8A77] mb-1">Módulo Activo</p>
          <p className="text-[12px] font-medium text-[#868466]">Gestión de Proveedores</p>
        </div>
      </div>
    </div>
  </aside>
);

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

  // Desktop Layout: 3 Panels con estructura nativa
  if (!isMobile) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#F8F8F4] font-system">
        {/* Panel 1: Sidebar - 260px fijo */}
        <Sidebar />

        {/* Panel 2: Canvas - Centrado con max-width 1400px */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
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
        </main>

        {/* Panel 3: Inspector - 450px fijo, borde izquierdo 0.5px */}
        <aside className="w-[450px] bg-white border-l border-[#DDDDCF] flex-shrink-0 overflow-hidden">
          <ProviderInspector
            isOpen={isInspectorOpen}
            isCreating={isCreating}
            selectedSupplier={selectedSupplier}
            onClose={closeInspector}
            onCreate={handleCreateSupplier}
            onUpdate={handleUpdateSupplier}
            onDelete={deleteSupplier}
          />
        </aside>
      </div>
    );
  }

  // Mobile Layout: Full Screen con ergonomía iPhone 13 Mini (<390px)
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#F8F8F4] font-system">
      {/* Mobile Header con Hamburger menu para Sidebar */}
      <header className="bg-white border-b border-[#DDDDCF] px-4 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Hamburger Menu Button - 44x44px touch target */}
            <button 
              className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[#F0F0EC] transition-colors"
              aria-label="Menú"
            >
              <svg className="w-5 h-5 text-[#1F1F1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <div>
              <h1 className="text-[18px] font-semibold text-[#1F1F1A] tracking-[-0.02em]">Proveedores</h1>
              <p className="text-[12px] text-[#8A8A77] mt-0.5">Laboratorio</p>
            </div>
          </div>
          <button
            onClick={() => openInspector()}
            className="px-4 py-2.5 text-[13px] font-medium text-white bg-[#868466] hover:bg-[#767456] rounded-lg transition-colors duration-150 flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Nuevo
          </button>
        </div>
      </header>

      {/* Mobile Content - overscroll-behavior none para sensación nativa */}
      <main className="flex-1 overflow-y-auto px-4 py-4 overscroll-behavior-none">
        <ProviderTable
          suppliers={suppliers}
          onSelectSupplier={handleSelectSupplier}
          onEditSupplier={handleEditSupplier}
          onDeleteSupplier={handleDeleteSupplier}
        />
      </main>

      {/* Mobile Inspector (Full Screen Sheet) - emerge desde abajo */}
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
