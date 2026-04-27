import React, { useState } from 'react';
import { useSuppliers } from '../../core/modules/laboratorio/application/useSuppliers';
import { AppCanvas } from '../../components/AppCanvas';
import { AppInspector } from '../../components/AppInspector';
import type { Supplier, CreateSupplierRequest } from '../../core/modules/laboratorio/domain/supplier.model';
import './LabsSuppliers.css';

export const LabsSuppliers: React.FC = () => {
  const { suppliers, loading, error, fetchSuppliers, createSupplier, updateSupplier, deleteSupplier } = useSuppliers();
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorMode, setInspectorMode] = useState<'create' | 'edit'>('create');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const handleCreate = () => {
    setFormData({ name: '', city: '', phone: '' });
    setInspectorMode('create');
    setIsInspectorOpen(true);
  };

  const handleEdit = (supplier: Supplier) => {
    setFormData({
      name: supplier.name,
      city: supplier.city,
      phone: supplier.phone
    });
    setEditingSupplier(supplier);
    setInspectorMode('edit');
    setIsInspectorOpen(true);
  };

  const handleSave = async () => {
    if (!formData.name) {
      alert('Por favor completa el nombre del proveedor.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (inspectorMode === 'edit' && editingSupplier) {
        await updateSupplier(editingSupplier.id, formData);
      } else {
        await createSupplier(formData as CreateSupplierRequest);
      }
      await fetchSuppliers();
      setIsInspectorOpen(false);
      setEditingSupplier(null);
      setFormData({ name: '', city: '', phone: '' });
    } catch (err) {
      console.error('Failed to save supplier:', err);
      alert('Error al guardar el proveedor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    if (!confirm(`¿Estás seguro de eliminar a ${supplier.name}? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await deleteSupplier(supplier.id);
      await fetchSuppliers();
    } catch (err) {
      console.error('Failed to delete supplier:', err);
      alert('Error al eliminar el proveedor.');
    }
  };

  return (
    <>
      <AppCanvas
        title="Proveedores"
        actions={
          <button className="btn-primary" onClick={handleCreate} style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 600 }}>
            + Nuevo Proveedor
          </button>
        }
      >
        {error && (
          <div className="error-message">
            ❌ {error}
          </div>
        )}

        {loading ? (
          <div className="skeleton-table">
            <div className="skeleton-row" />
            <div className="skeleton-row" />
            <div className="skeleton-row" />
          </div>
        ) : (
          <table className="modern-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Ciudad</th>
                <th>Teléfono</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.length === 0 ? (
                <tr>
                  <td colSpan={4} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                    No hay proveedores registrados.
                  </td>
                </tr>
              ) : (
                suppliers.map(supplier => (
                  <tr key={supplier.id}>
                    <td style={{ fontWeight: 500 }}>{supplier.name}</td>
                    <td>{supplier.city}</td>
                    <td>{supplier.phone}</td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-action-secondary" onClick={() => handleEdit(supplier)} title="Editar">
                          ✏️
                        </button>
                        <button className="btn-action-danger" onClick={() => handleDelete(supplier)} title="Eliminar">
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </AppCanvas>

      <AppInspector
        isOpen={isInspectorOpen}
        onClose={() => setIsInspectorOpen(false)}
        title={inspectorMode === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}
        footer={
          <>
            <button className="btn-secondary" onClick={() => setIsInspectorOpen(false)}>
              Cancelar
            </button>
            <button className="btn-primary" onClick={handleSave} disabled={isSubmitting}>
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </>
        }
      >
        <div className="inspector-form">
          <div className="form-group">
            <label>Nombre</label>
            <input
              type="text"
              className="form-input"
              value={formData.name}
              onChange={e => setFormData({ ...formData, name: e.target.value })}
              placeholder="Nombre del proveedor"
            />
          </div>
          <div className="form-group">
            <label>Ciudad</label>
            <input
              type="text"
              className="form-input"
              value={formData.city}
              onChange={e => setFormData({ ...formData, city: e.target.value })}
              placeholder="Ciudad"
            />
          </div>
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              className="form-input"
              value={formData.phone}
              onChange={e => setFormData({ ...formData, phone: e.target.value })}
              placeholder="Teléfono"
            />
          </div>
        </div>
      </AppInspector>
    </>
  );
};
