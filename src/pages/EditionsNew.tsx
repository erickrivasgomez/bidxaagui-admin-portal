import React, { useState, useEffect } from 'react';
import { UniversalLayout } from '../components/layout/UniversalLayout';
import { Inspector } from '../components/layout/Inspector';
import { ContentCard } from '../components/ui/ContentCard';
import { DataStateWrapper, EmptyState, LoadingState } from '../components/ui/DataStates';
import { useToast } from '../components/ui/Toast';
import { useNavigation } from '../hooks/useNavigation';
import { useTheme } from '../hooks/useTheme';
import { useData } from '../hooks/useData';
import type { Edition, EditionPage } from '../core/modules/antroponomadas/domain/edition.model';
import './EditionsNew.css';

const EditionsNew: React.FC = () => {
  const { navigationItems } = useNavigation();
  const { getButtonVariant } = useTheme();
  const toast = useToast();
  
  // Use our new custom hook
  const editionsData = useData({
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
    initialSorting: { field: 'fecha', direction: 'desc' },
    initialPageSize: 20
  });

  const {
    data: editions,
    loading,
    error,
    empty,
    refresh,
    delete: deleteEdition
  } = editionsData;

  // Inspector state
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorMode, setInspectorMode] = useState<'view' | 'edit'>('view');
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
  const [pages, setPages] = useState<EditionPage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);

  // Mock stats
  const stats = {
    total: editions?.length || 0,
    published: editions?.filter(e => e.publicada === 1).length || 0,
    withPdf: editions?.filter(e => e.pdf_url).length || 0,
    thisMonth: 0
  };

  // Handle view pages
  const handleViewPages = async (edition: Edition) => {
    try {
      // Mock API call - replace with actual implementation
      const mockPages: EditionPage[] = [
        { id: '1', imagen_url: 'page1.jpg', numero: 1 },
        { id: '2', imagen_url: 'page2.jpg', numero: 2 },
        { id: '3', imagen_url: 'page3.jpg', numero: 3 },
      ];
      
      setPages(mockPages);
      setSelectedEdition(edition);
      setLightboxIndex(0);
      setInspectorMode('view');
      setIsInspectorOpen(true);
    } catch (error) {
      console.error('Error fetching pages:', error);
      toast.error('Error al cargar las páginas');
    }
  };

  // Handle delete
  const handleDelete = async (id: string, title: string) => {
    try {
      await deleteEdition(id);
      toast.success(`Edición "${title}" eliminada correctamente.`);
    } catch (error) {
      console.error('Error deleting edition:', error);
      toast.error('Error al eliminar la edición');
    }
  };

  // Handle manual PDF generation
  const handleManualPDF = async (editionId: string, editionTitle: string) => {
    try {
      setIsProcessing(true);
      
      // Mock PDF generation - replace with actual implementation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success(`PDF generado para "${editionTitle}"`);
      await refresh();
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle preview
  const handlePreview = (editionId: string) => {
    window.open(`/editions/${editionId}/preview`, '_blank');
  };

  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Get status badge
  const getStatusBadge = (edition: Edition) => {
    if (edition.pdf_url) return { text: 'PDF Disponible', variant: 'success' as const };
    if (edition.publicada === 1) return { text: 'Publicada', variant: 'primary' as const };
    return { text: 'Borrador', variant: 'secondary' as const };
  };

  return (
    <UniversalLayout
      navigation={navigationItems}
      user={{
        name: 'Administrador',
        email: 'admin@bidxaagui.com'
      }}
    >
      <div className="editions-new">
        {/* Header */}
        <div className="editions-header">
          <div className="editions-title">
            <h1>Ediciones</h1>
            <p>Gestiona las ediciones de Antroponómadas</p>
          </div>
          <button className="btn-premium" onClick={() => setIsInspectorOpen(true)}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
              <polyline points="14,2 14,8 20,8" />
            </svg>
            Nueva Edición
          </button>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <ContentCard
            title={stats.total}
            subtitle="Total Ediciones"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                <polyline points="14,2 14,8 20,8" />
              </svg>
            }
            density="compact"
          />
          <ContentCard
            title={stats.published}
            subtitle="Publicadas"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
            density="compact"
          />
          <ContentCard
            title={stats.withPdf}
            subtitle="Con PDF"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
                <polyline points="10,9 9,9 8,9" />
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

        {/* Editions Gallery */}
        <div className="editions-content">
          <DataStateWrapper
            state={{
              data: editions,
              loading,
              error,
              empty,
              refreshing: false
            }}
            type="card"
            emptyState={{
              title: "No hay ediciones",
              description: "Crea tu primera edición para comenzar a publicar contenido.",
              primaryAction: {
                label: "Crear Primera Edición",
                onClick: () => setIsInspectorOpen(true),
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                    <polyline points="14,2 14,8 20,8" />
                  </svg>
                )
              }
            }}
          >
            {(editionList) => (
              <div className="editions-grid">
                {editionList.map((edition) => {
                  const status = getStatusBadge(edition);
                  return (
                    <ContentCard
                      key={edition.id}
                      title={edition.titulo}
                      description={edition.descripcion}
                      badge={status.text}
                      status={status.variant}
                      actions={[
                        {
                          id: 'view',
                          label: 'Ver Páginas',
                          onClick: () => handleViewPages(edition)
                        },
                        {
                          id: 'pdf',
                          label: edition.pdf_url ? 'Ver PDF' : 'Generar PDF',
                          onClick: () => edition.pdf_url 
                            ? window.open(edition.pdf_url.startsWith('http') ? edition.pdf_url : `https://bidxaagui.com/assets/documents/${edition.pdf_url.split('/').pop()}`, '_blank')
                            : handleManualPDF(edition.id, edition.titulo),
                          disabled: isProcessing
                        },
                        {
                          id: 'preview',
                          label: 'Vista Previa',
                          onClick: () => handlePreview(edition.id)
                        },
                        {
                          id: 'delete',
                          label: 'Eliminar',
                          onClick: () => handleDelete(edition.id, edition.titulo),
                          variant: 'danger'
                        }
                      ]}
                      density="compact"
                      icon={
                        <div className="edition-cover">
                          {edition.cover_url ? (
                            <img src={edition.cover_url} alt={edition.titulo} />
                          ) : (
                            <div className="cover-placeholder">
                              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
                                <polyline points="14,2 14,8 20,8" />
                              </svg>
                            </div>
                          )}
                        </div>
                      }
                    />
                  );
                })}
              </div>
            )}
          </DataStateWrapper>
        </div>

        {/* Inspector Panel */}
        <Inspector
          isOpen={isInspectorOpen}
          onClose={() => {
            setIsInspectorOpen(false);
            setSelectedEdition(null);
            setPages([]);
          }}
          title={inspectorMode === 'view' ? selectedEdition?.titulo || 'Edición' : 'Nueva Edición'}
          mode={inspectorMode}
        >
          {inspectorMode === 'view' && selectedEdition && pages.length > 0 ? (
            <div className="inspector-lightbox">
              <div className="lightbox-stage">
                <button
                  className="nav-btn prev"
                  onClick={() => setLightboxIndex(i => Math.max(0, i - 1))}
                  disabled={lightboxIndex === 0}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M15 18l-6-6 6-6" />
                  </svg>
                </button>
                <div className="image-wrapper">
                  <img
                    src={`/api/images/${pages[lightboxIndex]?.imagen_url}`}
                    alt={`Página ${pages[lightboxIndex]?.numero}`}
                    className="main-image"
                  />
                </div>
                <button
                  className="nav-btn next"
                  onClick={() => setLightboxIndex(i => Math.min(pages.length - 1, i + 1))}
                  disabled={lightboxIndex === pages.length - 1}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9 18l6-6-6-6" />
                  </svg>
                </button>
              </div>
              <div className="lightbox-info">
                Página {lightboxIndex + 1} de {pages.length}
              </div>
              <div className="thumbnails-strip">
                {pages.map((page, idx) => (
                  <div
                    key={page.id}
                    className={`thumb-item ${idx === lightboxIndex ? 'active' : ''}`}
                    onClick={() => setLightboxIndex(idx)}
                  >
                    <img
                      src={`/api/images/${page.imagen_url}`}
                      loading="lazy"
                      alt={`Página ${page.numero}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="inspector-form">
              <div className="form-group">
                <label>Título de la Edición</label>
                <input
                  type="text"
                  className="input"
                  placeholder="Ej: Antroponómadas - Edición Especial"
                />
              </div>
              <div className="form-group">
                <label>Descripción (Opcional)</label>
                <textarea
                  className="textarea"
                  placeholder="Breve descripción de esta edición..."
                  rows={3}
                />
              </div>
              <div className="form-group">
                <label>Fecha de Publicación</label>
                <input
                  type="date"
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>Portada</label>
                <div className="file-upload">
                  <input
                    type="file"
                    accept="image/*"
                    className="file-input"
                  />
                  <div className="file-upload-label">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <polyline points="17 8 12 3 7 8" />
                      <line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    <span>Arrastra o haz clic para subir imagen</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {inspectorMode === 'create' && (
            <div className="inspector-actions">
              <button className="btn-ghost" onClick={() => setIsInspectorOpen(false)}>
                Cancelar
              </button>
              <button className="btn-primary">
                Crear Edición
              </button>
            </div>
          )}
        </Inspector>
      </div>
    </UniversalLayout>
  );
};

export default EditionsNew;
