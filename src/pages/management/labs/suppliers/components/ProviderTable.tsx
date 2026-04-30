import React from 'react';
import { Supplier } from '../../../../../core/modules/laboratorio/domain/supplier.model';

interface ProviderTableProps {
  suppliers: any;
  onSelectSupplier: (supplier: Supplier) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplier: Supplier) => void;
}

export const ProviderTable: React.FC<ProviderTableProps> = ({
  suppliers,
  onSelectSupplier,
  onEditSupplier,
  onDeleteSupplier,
}) => {
  const handleRowClick = (supplier: Supplier, e: React.MouseEvent) => {
    // Don't trigger if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      return;
    }
    onSelectSupplier(supplier);
  };

  const renderSkeleton = () => (
    <div className="space-y-0">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="h-[40px] bg-[#F0F0EC] rounded-lg animate-pulse" />
      ))}
    </div>
  );

  const renderEmpty = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 bg-[#F0F0EC] rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-[#8A8A77]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
      </div>
      <p className="text-[14px] text-[#8A8A77]">No hay proveedores registrados</p>
      <p className="text-[12px] text-[#8A8A77] mt-1">Crea tu primer proveedor para comenzar</p>
    </div>
  );

  const renderError = () => (
    <div className="flex flex-col items-center justify-center py-16">
      <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
        <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      </div>
      <p className="text-[14px] text-red-600">Error al cargar proveedores</p>
      <p className="text-[12px] text-[#8A8A77] mt-1">Intenta recargar la página</p>
    </div>
  );

  if (suppliers.status === 'loading') {
    return renderSkeleton();
  }

  if (suppliers.status === 'error') {
    return renderError();
  }

  if (suppliers.status === 'empty' || !suppliers.data || suppliers.data.length === 0) {
    return renderEmpty();
  }

  return (
    <div className="bg-white rounded-xl border border-[#DDDDCF] overflow-hidden">
      {/* Table Header */}
      <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-[#F8F8F4] border-b border-[#DDDDCF]">
        <div className="col-span-4 text-[12px] font-semibold text-[#8A8A77] uppercase tracking-wider">
          Nombre
        </div>
        <div className="col-span-3 text-[12px] font-semibold text-[#8A8A77] uppercase tracking-wider">
          Ciudad
        </div>
        <div className="col-span-3 text-[12px] font-semibold text-[#8A8A77] uppercase tracking-wider">
          Teléfono
        </div>
        <div className="col-span-2 text-[12px] font-semibold text-[#8A8A77] uppercase tracking-wider text-right">
          Acciones
        </div>
      </div>

      {/* Table Body */}
      <div className="divide-y divide-[#E5E5DA]">
        {suppliers.data.map((supplier: Supplier, index: number) => (
          <div
            key={supplier.id}
            onClick={(e) => handleRowClick(supplier, e)}
            className="grid grid-cols-12 gap-4 px-6 py-0 h-[40px] lg:h-[40px] items-center hover:bg-[#F8F8F4] cursor-pointer transition-colors duration-150 group"
            style={{ animationDelay: `${index * 50}ms` }}
          >
            {/* Name */}
            <div className="col-span-4 flex items-center min-w-0">
              <div className="w-8 h-8 rounded-lg bg-[#868466]/10 flex items-center justify-center mr-3 flex-shrink-0 group-hover:bg-[#868466]/20 transition-colors">
                <span className="text-[13px] font-semibold text-[#868466]">
                  {supplier.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-[13px] font-medium text-[#1F1F1A] truncate">
                {supplier.name}
              </span>
            </div>

            {/* City */}
            <div className="col-span-3 flex items-center min-w-0">
              <span className="text-[13px] text-[#8A8A77] truncate">
                {supplier.city}
              </span>
            </div>

            {/* Phone */}
            <div className="col-span-3 flex items-center min-w-0">
              <span className="text-[13px] text-[#8A8A77] font-mono">
                {supplier.phone}
              </span>
            </div>

            {/* Actions */}
            <div className="col-span-2 flex items-center justify-end gap-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEditSupplier(supplier);
                }}
                className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[#868466]/10 text-[#8A8A77] hover:text-[#868466] transition-colors"
                title="Editar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDeleteSupplier(supplier);
                }}
                className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-red-50 text-[#8A8A77] hover:text-red-600 transition-colors"
                title="Eliminar"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Footer with count */}
      <div className="px-6 py-3 bg-[#F8F8F4] border-t border-[#DDDDCF]">
        <p className="text-[12px] text-[#8A8A77]">
          {suppliers.data.length} {suppliers.data.length === 1 ? 'proveedor' : 'proveedores'}
        </p>
      </div>
    </div>
  );
};
