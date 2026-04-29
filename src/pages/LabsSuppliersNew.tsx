import React, { useState, useEffect } from 'react';
import { UniversalLayout } from '../components/layout/UniversalLayout';
import { Inspector } from '../components/layout/Inspector';
import { ContentCard } from '../components/ui/ContentCard';
import { DataStateWrapper, EmptyState, LoadingState } from '../components/ui/DataStates';
import { useToast } from '../components/ui/Toast';
import { useNavigation } from '../hooks/useNavigation';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../hooks/useData';
import type { Supplier, CreateSupplierRequest } from '../core/modules/laboratorio/domain/supplier.model';
import './LabsSuppliersNew.css';

const LabsSuppliersNew: React.FC = () => {
  const { navigationItems } = useNavigation();
  const { getButtonVariant } = useTheme();
  const toast = useToast();
  
  // Use our new custom hook
  const suppliersData = useData({
    fetcher: {
      findAll: async (filters, pagination, sorting) => {
        // Mock implementation - replace with actual API call
        return [];
      },
      create: async (item) => {
        // Mock implementation
        return { ...item, id: Date.now().toString() };
      },
      update: async (id, updates) => {
        // Mock implementation
        return { id, ...updates };
      },
      delete: async () => {
        // Mock implementation
      },
      count: async () => 0
    },
    initialSorting: { field: 'name', direction: 'asc' },
    initialPageSize: 25
  });

  const {
    data: suppliers,
    loading,
    error,
    empty,
    refresh,
    create,
    update,
    delete: deleteSupplier
  } = suppliersData;

  // Inspector state
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorMode, setInspectorMode] = useState<'create' | 'edit'>('create');
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    phone: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      // Set filters based on search query
      if (searchQuery) {
        // In a real implementation, this would filter by name, city, or phone
        console.log('Searching for:', searchQuery);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const handleCreate = () => {
    setFormData({ name: '', city: '', phone: '' });
    setInspectorMode('create');
    setEditingSupplier(null);
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
      toast.error('Por favor completa el nombre del proveedor.');
      return;
    }

    setIsSubmitting(true);
    try {
      if (inspectorMode === 'edit' && editingSupplier) {
        await update(editingSupplier.id, formData);
        toast.success(`Proveedor "${formData.name}" actualizado correctamente.`);
      } else {
        await create(formData as CreateSupplierRequest);
        toast.success(`Proveedor "${formData.name}" creado correctamente.`);
      }
      
      // Clean form after successful submission
      setIsInspectorOpen(false);
      setEditingSupplier(null);
      setFormData({ name: '', city: '', phone: '' });
      await refresh();
    } catch (err) {
      console.error('Failed to save supplier:', err);
      toast.error('Error al guardar el proveedor.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (supplier: Supplier) => {
    try {
      await deleteSupplier(supplier.id);
      toast.success(`Proveedor "${supplier.name}" eliminado correctamente.`);
    } catch (err) {
      console.error('Failed to delete supplier:', err);
      toast.error('Error al eliminar el proveedor.');
    }
  };

  // Mock stats
  const stats = {
    total: suppliers?.length || 0,
    cities: new Set(suppliers?.map(s => s.city) || []).size,
    withPhone: suppliers?.filter(s => s.phone).length || 0,
    thisMonth: 0
  };

  // Get city distribution
  const getCityDistribution = () => {
    const cities: Record<string, number> = {};
    suppliers?.forEach(supplier => {
      cities[supplier.city] = (cities[supplier.city] || 0) + 1;
    });
    return cities;
  };

  const cityDistribution = getCityDistribution();

  return (
    <UniversalLayout
      navigation={navigationItems}
      user={{
        name: 'Administrador',
        email: 'admin@bidxaagui.com'
      }}
    >
      <div className="labs-suppliers-new">
        {/* Header */}
        <div className="suppliers-header">
          <div className="suppliers-title">
            <h1>Proveedores</h1>
            <p>Gestiona los proveedores del laboratorio</p>
          </div>
          <button className="btn-premium" onClick={handleCreate}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <line x1="22" y1="11" x2="22" y2="13" />
              <line x1="22" y1="17" x2="22" y2="19" />
            </svg>
            Nuevo Proveedor
          </button>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <ContentCard
            title={stats.total}
            subtitle="Total Proveedores"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            }
            density="compact"
          />
          <ContentCard
            title={stats.cities}
            subtitle="Ciudades"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
            }
            density="compact"
          />
          <ContentCard
            title={stats.withPhone}
            subtitle="Con Teléfono"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
            }
            density="compact"
          />
          <ContentCard
            title={stats.thisMonth}
            subtitle="Este Mes"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            }
            density="compact"
          />
        </div>

        {/* Search and Filters */}
        <div className="search-controls">
          <div className="search-input-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por nombre, ciudad o teléfono..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
        </div>

        {/* City Distribution */}
        {Object.keys(cityDistribution).length > 0 && (
          <div className="city-distribution">
            <h3>Distribución por Ciudad</h3>
            <div className="city-cards">
              {Object.entries(cityDistribution).map(([city, count]) => (
                <div key={city} className="city-card">
                  <div className="city-name">{city}</div>
                  <div className="city-count">{count} proveedor{count !== 1 ? 'es' : ''}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suppliers List */}
        <div className="suppliers-content">
          <DataStateWrapper
            state={{
              data: suppliers,
              loading,
              error,
              empty,
              refreshing: false
            }}
            type="card"
            emptyState={{
              title: "No hay proveedores",
              description: "Registra tu primer proveedor para comenzar a gestionar el laboratorio.",
              primaryAction: {
                label: "Registrar Primer Proveedor",
                onClick: () => setIsInspectorOpen(true),
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                )
              }
            }}
          >
            {(supplierList) => (
              <div className="suppliers-grid">
                {supplierList.map((supplier) => (
                  <ContentCard
                    key={supplier.id}
                    title={supplier.name}
                    description={supplier.city}
                    actions={[
                      {
                        id: 'edit',
                        label: 'Editar',
                        onClick: () => handleEdit(supplier)
                      },
                      {
                        id: 'delete',
                        label: 'Eliminar',
                        onClick: () => handleDelete(supplier),
                        variant: 'danger'
                      }
                    ]}
                    density="compact"
                    icon={
                      <div className="supplier-avatar">
                        <span>{supplier.name.charAt(0).toUpperCase()}</span>
                      </div>
                    }
                    badge={supplier.phone ? 'Con Teléfono' : undefined}
                    status={supplier.phone ? 'primary' : 'secondary'}
                  />
                ))}
              </div>
            )}
          </DataStateWrapper>
        </div>

        {/* Inspector Panel */}
        <Inspector
          isOpen={isInspectorOpen}
          onClose={() => {
            setIsInspectorOpen(false);
            setEditingSupplier(null);
          }}
          title={inspectorMode === 'create' ? 'Nuevo Proveedor' : 'Editar Proveedor'}
          mode={inspectorMode}
        >
          <div className="inspector-form">
            <div className="form-group">
              <label>Nombre del Proveedor</label>
              <input
                type="text"
                className="input"
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                placeholder="Nombre del proveedor"
                autoFocus
              />
            </div>
            <div className="form-group">
              <label>Ciudad</label>
              <input
                type="text"
                className="input"
                value={formData.city}
                onChange={e => setFormData({ ...formData, city: e.target.value })}
                placeholder="Ciudad"
              />
            </div>
            <div className="form-group">
              <label>Teléfono (Opcional)</label>
              <input
                type="tel"
                className="input"
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                placeholder="Teléfono de contacto"
              />
            </div>
          </div>

          <div className="inspector-actions">
            <button className="btn-ghost" onClick={() => setIsInspectorOpen(false)}>
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={handleSave}
              disabled={isSubmitting || !formData.name}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar'}
            </button>
          </div>
        </Inspector>
      </div>
    </UniversalLayout>
  );
};

export default LabsSuppliersNew;
