import React, { useState } from 'react';
import './LabsLayout.css';
import { useSuppliers } from '../../core/modules/laboratorio/application/useSuppliers';
import type { Supplier, CreateSupplierRequest, UpdateSupplierRequest } from '../../core/modules/laboratorio/domain/supplier.model';
import { SupplierModal } from '../../components/SupplierModal';
import { ConfirmDialog } from '../../components/ConfirmDialog';

// SVG Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

const RefreshIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
);

export const LabsSuppliers: React.FC<{ view?: string }> = ({ view }) => {
  const { suppliers, loading, error, fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingSupplier, setDeletingSupplier] = useState<Supplier | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  React.useEffect(() => {
    if (view === 'suppliers') {
      fetchSuppliers();
    }
  }, [view, fetchSuppliers]);

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  const handleCreate = () => {
    setEditingSupplier(null);
    setModalOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setEditingSupplier(supplier);
    setModalOpen(true);
  };

  const handleSave = async (data: CreateSupplierRequest | UpdateSupplierRequest) => {
    setModalLoading(true);
    try {
      if (editingSupplier) {
        await updateSupplier(editingSupplier.id, data);
      } else {
        await createSupplier(data as CreateSupplierRequest);
      }
      await fetchSuppliers();
      // Clean form after successful submission
      setModalOpen(false);
      setEditingSupplier(null);
    } catch (err) {
      console.error('Failed to save supplier:', err);
      throw err;
    } finally {
      setModalLoading(false);
    }
  };

  const handleDeleteClick = (supplier: Supplier) => {
    setDeletingSupplier(supplier);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingSupplier) return;
    setDeleteLoading(true);
    try {
      await deleteSupplier(deletingSupplier.id);
      await fetchSuppliers();
      setDeleteDialogOpen(false);
      setDeletingSupplier(null);
    } catch (err) {
      console.error('Failed to delete supplier:', err);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (view !== 'suppliers') return null;

  return (
    <>
      <header className="labs-header">
        <div>
          <h1>Proveedores</h1>
        </div>
        <div className="labs-header-actions">
          <div className="labs-icon-btn" onClick={fetchSuppliers} title="Recargar">
            <RefreshIcon />
          </div>
          <div className="labs-icon-btn"><SearchIcon /></div>
          <div className="labs-icon-btn"><FilterIcon /></div>
          <button 
            onClick={handleCreate}
            style={{ 
              background: 'var(--green)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '12px',
              padding: '0 16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <PlusIcon /> Nuevo Proveedor
          </button>
        </div>
      </header>

      <div className="labs-content">
        {error && (
          <div style={{ 
            padding: 'var(--space-md)', 
            background: 'rgba(200, 92, 74, 0.1)', 
            border: '1px solid var(--error)', 
            borderRadius: 'var(--radius-md)', 
            color: 'var(--error)', 
            marginBottom: 'var(--space-lg)',
            fontSize: '0.875rem'
          }}>
            {error}
          </div>
        )}

        <section className="labs-section">
          <div className="labs-section-header">
            <h3>Directorio de Socios</h3>
          </div>
          {loading ? (
            <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
              Cargando...
            </div>
          ) : (
            <div className="labs-list">
              {suppliers.map(supplier => (
                <React.Fragment key={supplier.id}>
                  <div 
                    className={`labs-row labs-row-expandable ${expandedRows.has(supplier.id) ? 'expanded' : ''}`} 
                    style={{ gridTemplateColumns: '40px 1fr 60px' }}
                    onClick={() => toggleRow(supplier.id)}
                  >
                    <div className="labs-row-icon">
                      <TruckIcon />
                    </div>
                    <div className="labs-row-main">
                      <div className="labs-row-title">{supplier.name}</div>
                      <div className="labs-row-subtitle">ID: {supplier.id}</div>
                    </div>
                    <div className="labs-row-main labs-row-actions">
                      <div className="labs-row-chevron"><ChevronDownIcon /></div>
                    </div>
                  </div>
                  <div className="labs-row-expanded-content">
                    <div className="labs-expanded-detail">
                      <div>
                        <div className="labs-expanded-detail-label">Ciudad</div>
                        <div className="labs-expanded-detail-value">{supplier.city}</div>
                      </div>
                      <div>
                        <div className="labs-expanded-detail-label">Teléfono</div>
                        <div className="labs-expanded-detail-value">{supplier.phone}</div>
                      </div>
                    </div>
                    <div className="labs-row-main labs-row-actions" style={{ marginTop: 'var(--space-md)' }}>
                      <div onClick={(e) => { e.stopPropagation(); handleEdit(supplier); }} style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}><EditIcon /></div>
                      <div onClick={(e) => { e.stopPropagation(); handleDeleteClick(supplier); }} style={{ cursor: 'pointer', color: 'var(--error)' }}><TrashIcon /></div>
                    </div>
                  </div>
                </React.Fragment>
              ))}
            </div>
          )}
        </section>
      </div>

      <SupplierModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        supplier={editingSupplier || undefined}
        loading={modalLoading}
      />

      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Eliminar Proveedor"
        message={`¿Estás seguro de eliminar a ${deletingSupplier?.name}? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        loading={deleteLoading}
      />
    </>
  );
};
