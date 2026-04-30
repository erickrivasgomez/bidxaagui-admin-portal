import React from 'react';
import { Supplier } from '../../../../../core/modules/laboratorio/domain/supplier.model';
import { DataState } from '../hooks/useProviders';

interface ProviderTableProps {
  suppliers: DataState<Supplier[]>;
  onSelectSupplier: (supplier: Supplier) => void;
  onEditSupplier: (supplier: Supplier) => void;
  onDeleteSupplier: (supplier: Supplier) => void;
}

interface SkeletonRowProps {
  index: number;
}

const SkeletonRow: React.FC<SkeletonRowProps> = ({ index }) => (
  <div 
    className="flex items-center px-6 py-3 border-b border-[#E5E5DA] animate-pulse"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    <div className="flex-1 grid grid-cols-12 gap-4 items-center">
      <div className="col-span-4">
        <div className="h-4 bg-[#F0F0EC] rounded-md w-3/4"></div>
      </div>
      <div className="col-span-3">
        <div className="h-4 bg-[#F0F0EC] rounded-md w-2/3"></div>
      </div>
      <div className="col-span-3">
        <div className="h-4 bg-[#F0F0EC] rounded-md w-1/2"></div>
      </div>
      <div className="col-span-2">
        <div className="h-4 bg-[#F0F0EC] rounded-md w-1/3"></div>
      </div>
    </div>
  </div>
);

const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 px-6">
    <div className="w-16 h-16 bg-[#F8F8F4] rounded-full flex items-center justify-center mb-4">
      <svg 
        className="w-8 h-8 text-[#8A8A77]" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
        />
      </svg>
    </div>
    <h3 className="text-[14px] font-medium text-[#1F1F1A] mb-2">No hay proveedores</h3>
    <p className="text-[12px] text-[#8A8A77] text-center max-w-sm">
      Comienza agregando tu primer proveedor utilizando el botón "Nuevo Proveedor"
    </p>
  </div>
);

const ErrorState: React.FC<{ error: string; onRetry: () => void }> = ({ error, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6">
    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mb-4">
      <svg 
        className="w-8 h-8 text-red-500" 
        fill="none" 
        stroke="currentColor" 
        viewBox="0 0 24 24"
      >
        <path 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          strokeWidth={1.5} 
          d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </div>
    <h3 className="text-[14px] font-medium text-[#1F1F1A] mb-2">Error al cargar proveedores</h3>
    <p className="text-[12px] text-[#8A8A77] text-center max-w-sm mb-4">{error}</p>
    <button
      onClick={onRetry}
      className="px-4 py-2 text-[12px] font-medium text-[#868466] bg-[#F8F8F4] rounded-lg hover:bg-[#E8E8E4] transition-colors"
    >
      Reintentar
    </button>
  </div>
);

export const ProviderTable: React.FC<ProviderTableProps> = ({
  suppliers,
  onSelectSupplier,
  onEditSupplier,
  onDeleteSupplier,
}) => {
  const handleRowClick = (supplier: Supplier) => {
    onSelectSupplier(supplier);
  };

  const handleEdit = (e: React.MouseEvent, supplier: Supplier) => {
    e.stopPropagation();
    onEditSupplier(supplier);
  };

  const handleDelete = (e: React.MouseEvent, supplier: Supplier) => {
    e.stopPropagation();
    onDeleteSupplier(supplier);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: '2-digit',
    });
  };

  // Loading state
  if (suppliers.status === 'loading') {
    return (
      <div className="bg-white rounded-[12px] border border-[#DDDDCF] overflow-hidden">
        <div className="border-b border-[#E5E5DA]">
          <div className="flex items-center px-6 py-3">
            <div className="flex-1 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <div className="h-4 bg-[#F0F0EC] rounded-md w-1/4 animate-pulse"></div>
              </div>
              <div className="col-span-3">
                <div className="h-4 bg-[#F0F0EC] rounded-md w-1/4 animate-pulse"></div>
              </div>
              <div className="col-span-3">
                <div className="h-4 bg-[#F0F0EC] rounded-md w-1/4 animate-pulse"></div>
              </div>
              <div className="col-span-2">
                <div className="h-4 bg-[#F0F0EC] rounded-md w-1/4 animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
        <div>
          {[...Array(5)].map((_, index) => (
            <SkeletonRow key={index} index={index} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (suppliers.status === 'error') {
    return (
      <div className="bg-white rounded-[12px] border border-[#DDDDCF] overflow-hidden">
        <ErrorState 
          error={suppliers.error || 'Error desconocido'} 
          onRetry={() => window.location.reload()} 
        />
      </div>
    );
  }

  // Empty state
  if (suppliers.status === 'empty' || (suppliers.data && suppliers.data.length === 0)) {
    return (
      <div className="bg-white rounded-[12px] border border-[#DDDDCF] overflow-hidden">
        <EmptyState />
      </div>
    );
  }

  // Success state with data
  return (
    <div className="bg-white rounded-[12px] border border-[#DDDDCF] overflow-hidden">
      {/* Header */}
      <div className="border-b border-[#E5E5DA] bg-[#FAFAFA]">
        <div className="flex items-center px-6 py-3">
          <div className="flex-1 grid grid-cols-12 gap-4 items-center">
            <div className="col-span-4">
              <span className="text-[12px] font-medium text-[#8A8A77]">Nombre</span>
            </div>
            <div className="col-span-3">
              <span className="text-[12px] font-medium text-[#8A8A77]">Teléfono</span>
            </div>
            <div className="col-span-3">
              <span className="text-[12px] font-medium text-[#8A8A77]">Ciudad</span>
            </div>
            <div className="col-span-2">
              <span className="text-[12px] font-medium text-[#8A8A77]">Creado</span>
            </div>
          </div>
        </div>
      </div>

      {/* Table body */}
      <div className="divide-y divide-[#E5E5DA]">
        {suppliers.data?.map((supplier) => (
          <div
            key={supplier.id}
            onClick={() => handleRowClick(supplier)}
            className="flex items-center px-6 py-3 hover:bg-[#FAFAFA] cursor-pointer transition-colors group"
          >
            <div className="flex-1 grid grid-cols-12 gap-4 items-center">
              <div className="col-span-4">
                <span className="text-[14px] text-[#1F1F1A] font-medium">
                  {supplier.name}
                </span>
              </div>
              <div className="col-span-3">
                <span className="text-[14px] text-[#1F1F1A]">
                  {supplier.phone}
                </span>
              </div>
              <div className="col-span-3">
                <span className="text-[14px] text-[#1F1F1A]">
                  {supplier.city}
                </span>
              </div>
              <div className="col-span-2">
                <span className="text-[12px] text-[#8A8A77]">
                  {formatDate(supplier.created_at)}
                </span>
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={(e) => handleEdit(e, supplier)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[#F0F0EC] transition-colors"
                aria-label="Editar proveedor"
              >
                <svg 
                  className="w-4 h-4 text-[#8A8A77]" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
              <button
                onClick={(e) => handleDelete(e, supplier)}
                className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-red-50 transition-colors"
                aria-label="Eliminar proveedor"
              >
                <svg 
                  className="w-4 h-4 text-red-500" 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    strokeWidth={2} 
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
