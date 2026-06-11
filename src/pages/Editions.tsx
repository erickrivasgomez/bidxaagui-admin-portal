import React, { useState, useEffect } from 'react';
import { jsPDF } from 'jspdf';
import { useEditions } from '../core/modules/antroponomadas/application/useEditions';
import { 
  getEditionPagesUseCase, 
  uploadEditionPdfUseCase, 
  uploadEditionPageUseCase 
} from '../core/modules/antroponomadas/infrastructure/antroponomadas.dependencies';
import { UniversalLayout } from '../components/layout/UniversalLayout';
import { Inspector } from '../components/layout/Inspector';
import { ContentCard } from '../components/ui/ContentCard';
import { DataStateWrapper } from '../components/ui/DataStates';
import { useToast } from '../components/ui/Toast';
import { useNavigation } from '../hooks/useNavigation';
import { useAuthStore } from '../store/authStore';
import type { Edition, EditionPage } from '../core/modules/antroponomadas/domain/edition.model';
import './Editions.css';

const Editions: React.FC = () => {
  const { editions, loading, error, fetchEditions, createEdition, deleteEdition } = useEditions();
  const { navigationItems } = useNavigation();
  const { user } = useAuthStore();
  const toast = useToast();

  // Inspector & Lightbox state
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [inspectorMode, setInspectorMode] = useState<'view' | 'create'>('create');
  const [selectedEdition, setSelectedEdition] = useState<Edition | null>(null);
  const [pages, setPages] = useState<EditionPage[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  
  // Form states (Create Edition)
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formDate, setFormDate] = useState('');

  // Upload/Processing states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isUploadingPage, setIsUploadingPage] = useState(false);
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // Fetch editions on mount
  useEffect(() => {
    fetchEditions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle open inspector for page viewing
  const handleViewPages = async (edition: Edition) => {
    try {
      setSelectedEdition(edition);
      setInspectorMode('view');
      setIsInspectorOpen(true);
      setPages([]);
      setLightboxIndex(0);
      
      const data = await getEditionPagesUseCase.execute(edition.id);
      if (data) {
        setPages(data);
      }
    } catch (err) {
      console.error('Error fetching pages:', err);
      toast.error('Error al cargar las páginas de la edición.');
    }
  };

  // Helper to refresh pages in the inspector
  const refreshPages = async (editionId: string) => {
    try {
      const data = await getEditionPagesUseCase.execute(editionId);
      if (data) {
        setPages(data);
      }
    } catch (err) {
      console.error('Error refreshing pages:', err);
    }
  };

  // Handle delete
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`¿Estás seguro de eliminar la edición "${title}"? Esta acción es irreversible.`)) {
      return;
    }
    try {
      await deleteEdition(id);
      toast.success('Edición eliminada correctamente.');
    } catch (err) {
      console.error('Error deleting edition:', err);
      toast.error('No se pudo eliminar la edición.');
    }
  };

  // Handle create edition submit
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      toast.error('El título es obligatorio.');
      return;
    }
    
    setIsProcessing(true);
    try {
      await createEdition({
        titulo: formTitle,
        descripcion: formDesc,
        fecha: formDate || new Date().toISOString().split('T')[0]
      });
      toast.success('Edición creada con éxito.');
      
      // Reset form
      setFormTitle('');
      setFormDesc('');
      setFormDate('');
      setIsInspectorOpen(false);
    } catch (err) {
      console.error('Error creating edition:', err);
      toast.error('No se pudo crear la edición.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle page uploading
  const handlePageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !selectedEdition) return;

    setIsUploadingPage(true);
    let successCount = 0;
    
    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fd = new FormData();
        fd.append('file', file);
        
        await uploadEditionPageUseCase.execute(selectedEdition.id, fd);
        successCount++;
      }
      
      toast.success(`Se subieron ${successCount} página(s) correctamente.`);
      await refreshPages(selectedEdition.id);
      await fetchEditions(); // update cover or stats
    } catch (err) {
      console.error('Error uploading page:', err);
      toast.error('Ocurrió un error al subir alguna de las páginas.');
    } finally {
      setIsUploadingPage(false);
      // reset input
      e.target.value = '';
    }
  };

  // Handle direct PDF upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !selectedEdition) return;

    setIsUploadingPdf(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('fileName', file.name);

      await uploadEditionPdfUseCase.execute(selectedEdition.id, fd);
      toast.success('PDF subido correctamente.');
      await fetchEditions();
      if (selectedEdition) {
        setSelectedEdition(prev => prev ? { ...prev, pdf_url: file.name } : null);
      }
    } catch (err) {
      console.error('Error uploading PDF:', err);
      toast.error('Error al subir el archivo PDF.');
    } finally {
      setIsUploadingPdf(false);
      e.target.value = '';
    }
  };

  // Handle manual PDF generation using jsPDF
  const handleManualPDF = async (editionId: string, editionTitle: string) => {
    try {
      setIsProcessing(true);
      toast.info('Generando documento PDF...', 'Espere un momento.');
      
      const pagesData = await getEditionPagesUseCase.execute(editionId);

      if (!pagesData || pagesData.length === 0) {
        toast.error('No se puede generar un PDF sin páginas.', 'Por favor sube imágenes primero.');
        setIsProcessing(false);
        return;
      }

      const blobs: Array<{ blob: Blob; width: number; height: number }> = [];
      const API_BASE = import.meta.env.VITE_API_URL ||
        (window.location.hostname.includes('bidxaagui.com') || window.location.hostname.includes('pages.dev')
          ? 'https://api.bidxaagui.com'
          : 'http://localhost:8787');

      for (const page of pagesData) {
        const imageUrl = page.imagen_url.startsWith('http')
          ? page.imagen_url
          : `${API_BASE}/api/images/${page.imagen_url}`;

        const res = await fetch(imageUrl);
        const blob = await res.blob();
        const img = await createImageBitmap(blob);
        blobs.push({ blob, width: img.width, height: img.height });
        img.close();
      }

      if (blobs.length === 0) throw new Error('No hay imágenes procesadas.');

      const first = blobs[0];
      const pdf = new jsPDF({
        orientation: first.width > first.height ? 'l' : 'p',
        unit: 'px',
        format: [first.width, first.height]
      });

      for (let i = 0; i < blobs.length; i++) {
        const item = blobs[i];
        const img = await createImageBitmap(item.blob);

        if (i === 0) {
          pdf.deletePage(1);
          pdf.addPage([item.width, item.height], item.width > item.height ? 'l' : 'p');
        } else {
          pdf.addPage([item.width, item.height], item.width > item.height ? 'l' : 'p');
        }

        const canvas = document.createElement('canvas');
        canvas.width = item.width;
        canvas.height = item.height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0);
          const compressedData = canvas.toDataURL('image/jpeg', 0.85);
          pdf.addImage(compressedData, 'JPEG', 0, 0, item.width, item.height, undefined, 'FAST');
        }
        img.close();

        if (i % 2 === 0) await new Promise(r => setTimeout(r, 10));
      }

      const pdfBlob = pdf.output('blob');
      const fileName = `Antroponómadas - ${editionTitle}.pdf`.replace(/\s+/g, ' ');

      const fd = new FormData();
      fd.append('file', pdfBlob, fileName);
      fd.append('fileName', fileName);

      await uploadEditionPdfUseCase.execute(editionId, fd);
      await fetchEditions();
      toast.success('¡PDF generado e importado correctamente!');
    } catch (e) {
      console.error(e);
      toast.error('Error al generar el PDF de forma automática.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper for status formatting
  const getStatus = (edition: Edition) => {
    if (edition.pdf_url) return { text: 'Con PDF', variant: 'success' as const };
    if (edition.publicada === 1) return { text: 'Publicada', variant: 'primary' as const };
    return { text: 'Borrador', variant: 'secondary' as const };
  };

  // Stats computation
  const stats = {
    total: editions.length,
    published: editions.filter(e => e.publicada === 1).length,
    withPdf: editions.filter(e => e.pdf_url).length,
    drafts: editions.filter(e => e.publicada === 0 && !e.pdf_url).length,
  };

  // Cover image URL resolver
  const getCoverUrl = (edition: Edition) => {
    if (edition.cover_url) return edition.cover_url;
    
    // Otherwise check if first page has image
    if (edition.pages && edition.pages.length > 0) {
      const img = edition.pages[0].imagen_url;
      return img.startsWith('http') ? img : `/api/images/${img}`;
    }
    
    return null;
  };

  return (
    <UniversalLayout
      navigation={navigationItems}
      user={{
        name: user?.name || 'Administrador',
        email: user?.email || 'admin@bidxaagui.com'
      }}
    >
      <div className="editions-page-container">
        {/* Header */}
        <div className="editions-header">
          <div className="editions-title">
            <h1>Ediciones de la Revista</h1>
            <p>Monitorea y gestiona las publicaciones de Antroponómadas</p>
          </div>
          <button 
            className="btn-premium btn-new-edition-touch" 
            onClick={() => {
              setInspectorMode('create');
              setIsInspectorOpen(true);
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Nueva Edición</span>
          </button>
        </div>

        {/* Stats Grid */}
        <div className="stats-dashboard-grid">
          <ContentCard
            title={stats.total}
            subtitle="Total Ediciones"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
            }
            density="compact"
          />
          <ContentCard
            title={stats.published}
            subtitle="Publicadas"
            status="primary"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                <polyline points="22 4 12 14.01 9 11.01" />
              </svg>
            }
            density="compact"
          />
          <ContentCard
            title={stats.withPdf}
            subtitle="Con PDF Completo"
            status="success"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14,2 14,8 20,8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            }
            density="compact"
          />
          <ContentCard
            title={stats.drafts}
            subtitle="Borradores"
            status="secondary"
            icon={
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z" />
              </svg>
            }
            density="compact"
          />
        </div>

        {/* Content Wrapper */}
        <div className="editions-content-wrapper">
          <DataStateWrapper
            state={{
              data: editions,
              loading,
              error: error,
              empty: editions.length === 0,
              refreshing: false
            }}
            type="card"
            emptyState={{
              title: "No hay ediciones registradas",
              description: "Para comenzar, crea una nueva edición de la revista Antroponómadas.",
              primaryAction: {
                label: "Crear Primera Edición",
                onClick: () => {
                  setInspectorMode('create');
                  setIsInspectorOpen(true);
                },
                icon: (
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                )
              }
            }}
          >
            {(editionList) => (
              <>
                {/* 1. Desktop view: Elegant, compact Table */}
                <div className="editions-desktop-view">
                  <div className="table-responsive-luxury">
                    <table className="table-luxury">
                      <thead>
                        <tr>
                          <th style={{ width: '80px' }}>Portada</th>
                          <th>Edición</th>
                          <th>Fecha</th>
                          <th>Estado</th>
                          <th>Documento PDF</th>
                          <th style={{ textAlign: 'right' }}>Acciones</th>
                        </tr>
                      </thead>
                      <tbody>
                        {editionList.map((edition) => {
                          const statusInfo = getStatus(edition);
                          const coverUrl = getCoverUrl(edition);
                          return (
                            <tr key={edition.id}>
                              <td>
                                <div className="edition-table-cover-wrapper">
                                  {coverUrl ? (
                                    <img src={coverUrl} alt={edition.titulo} className="table-cover-img" />
                                  ) : (
                                    <div className="table-cover-placeholder">
                                      <span>{edition.titulo.charAt(0)}</span>
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="edition-table-meta">
                                  <button onClick={() => handleViewPages(edition)} className="edition-title-link">
                                    {edition.titulo}
                                  </button>
                                  {edition.descripcion && <p className="edition-desc-muted">{edition.descripcion}</p>}
                                </div>
                              </td>
                              <td>
                                <span className="date-badge-luxury">
                                  {edition.fecha ? new Date(edition.fecha).toLocaleDateString('es-MX', { year: 'numeric', month: 'short', day: 'numeric' }) : 'Sin fecha'}
                                </span>
                              </td>
                              <td>
                                <span className={`status-pill-luxury ${statusInfo.variant}`}>
                                  {statusInfo.text}
                                </span>
                              </td>
                              <td>
                                {edition.pdf_url ? (
                                  <a
                                    href={edition.pdf_url.startsWith('http') ? edition.pdf_url : `https://bidxaagui.com/assets/documents/${edition.pdf_url.split('/').pop()}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="pdf-download-link-luxury"
                                  >
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px' }}>
                                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                      <polyline points="14,2 14,8 20,8" />
                                    </svg>
                                    Ver PDF
                                  </a>
                                ) : (
                                  <span className="no-pdf-text">No cargado</span>
                                )}
                              </td>
                              <td>
                                <div className="actions-flex-end">
                                  <button 
                                    className="btn-icon-luxury secondary" 
                                    title="Ver Páginas"
                                    onClick={() => handleViewPages(edition)}
                                  >
                                    👁️
                                  </button>
                                  <button 
                                    className="btn-icon-luxury secondary" 
                                    title="Generar PDF"
                                    disabled={isProcessing}
                                    onClick={() => handleManualPDF(edition.id, edition.titulo)}
                                  >
                                    {isProcessing ? '...' : '⚙️'}
                                  </button>
                                  <button 
                                    className="btn-icon-luxury danger" 
                                    title="Eliminar"
                                    onClick={() => handleDelete(edition.id, edition.titulo)}
                                  >
                                    🗑️
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* 2. Mobile view: Touch-optimized Cards (Ionic-style) */}
                <div className="editions-mobile-view">
                  <div className="editions-mobile-grid">
                    {editionList.map((edition) => {
                      const statusInfo = getStatus(edition);
                      const coverUrl = getCoverUrl(edition);
                      return (
                        <div key={edition.id} className="edition-mobile-card-premium">
                          <div className="mobile-card-header">
                            <div className="mobile-card-cover">
                              {coverUrl ? (
                                <img src={coverUrl} alt={edition.titulo} />
                              ) : (
                                <div className="mobile-cover-placeholder">
                                  <span>{edition.titulo.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            <div className="mobile-card-titles">
                              <h3 className="mobile-title" onClick={() => handleViewPages(edition)}>
                                {edition.titulo}
                              </h3>
                              <p className="mobile-date">
                                {edition.fecha ? new Date(edition.fecha).toLocaleDateString('es-MX', { dateStyle: 'medium' }) : 'Sin fecha'}
                              </p>
                              <span className={`status-pill-luxury ${statusInfo.variant} mobile-status`}>
                                {statusInfo.text}
                              </span>
                            </div>
                          </div>
                          
                          {edition.descripcion && (
                            <p className="mobile-card-desc">{edition.descripcion}</p>
                          )}

                          <div className="mobile-card-actions">
                            <button 
                              className="btn-mobile-action primary" 
                              onClick={() => handleViewPages(edition)}
                            >
                              <span>Ver Páginas</span>
                            </button>

                            {edition.pdf_url ? (
                              <a 
                                href={edition.pdf_url.startsWith('http') ? edition.pdf_url : `https://bidxaagui.com/assets/documents/${edition.pdf_url.split('/').pop()}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn-mobile-action secondary"
                              >
                                <span>Ver PDF</span>
                              </a>
                            ) : (
                              <button 
                                className="btn-mobile-action secondary"
                                disabled={isProcessing}
                                onClick={() => handleManualPDF(edition.id, edition.titulo)}
                              >
                                <span>{isProcessing ? 'Procesando...' : 'Generar PDF'}</span>
                              </button>
                            )}

                            <button 
                              className="btn-mobile-action danger"
                              onClick={() => handleDelete(edition.id, edition.titulo)}
                            >
                              <span>Eliminar</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </DataStateWrapper>
        </div>

        {/* Adaptive Inspector Drawer */}
        <Inspector
          isOpen={isInspectorOpen}
          onClose={() => {
            setIsInspectorOpen(false);
            setSelectedEdition(null);
            setPages([]);
          }}
          title={inspectorMode === 'view' ? selectedEdition?.titulo || 'Edición' : 'Crear Nueva Edición'}
          mode={inspectorMode}
        >
          {inspectorMode === 'create' ? (
            /* Creation Form */
            <form onSubmit={handleCreateSubmit} className="inspector-form-luxury">
              <div className="form-group-luxury">
                <label className="form-label-luxury">Título de la Edición</label>
                <input
                  type="text"
                  className="input-luxury"
                  placeholder="Ej. Antroponómadas Vol. 15"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  required
                  disabled={isProcessing}
                />
              </div>

              <div className="form-group-luxury">
                <label className="form-label-luxury">Descripción</label>
                <textarea
                  className="input-luxury"
                  style={{ minHeight: '100px', resize: 'vertical' }}
                  placeholder="Escribe un breve resumen sobre esta publicación..."
                  value={formDesc}
                  onChange={(e) => setFormDesc(e.target.value)}
                  disabled={isProcessing}
                />
              </div>

              <div className="form-group-luxury">
                <label className="form-label-luxury">Fecha de Publicación</label>
                <input
                  type="date"
                  className="input-luxury"
                  value={formDate}
                  onChange={(e) => setFormDate(e.target.value)}
                  disabled={isProcessing}
                />
              </div>

              <div className="inspector-actions-luxury">
                <button 
                  type="button" 
                  className="btn-luxury-ghost" 
                  onClick={() => setIsInspectorOpen(false)}
                  disabled={isProcessing}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-luxury-submit"
                  disabled={isProcessing}
                >
                  {isProcessing ? 'Guardando...' : 'Crear Edición'}
                </button>
              </div>
            </form>
          ) : (
            /* Pages Viewer & Upload Management */
            <div className="inspector-pages-manager">
              
              {/* Image Lightbox View */}
              {pages.length > 0 ? (
                <div className="inspector-lightbox-stage">
                  <div className="lightbox-stage-main">
                    <button
                      type="button"
                      className="nav-btn prev"
                      onClick={() => setLightboxIndex(i => Math.max(0, i - 1))}
                      disabled={lightboxIndex === 0}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6" /></svg>
                    </button>
                    
                    <div className="lightbox-image-container">
                      <img
                        src={
                          pages[lightboxIndex]?.imagen_url.startsWith('http')
                            ? pages[lightboxIndex]?.imagen_url
                            : `/api/images/${pages[lightboxIndex]?.imagen_url}`
                        }
                        alt={`Página ${pages[lightboxIndex]?.numero}`}
                        className="lightbox-main-img"
                      />
                    </div>

                    <button
                      type="button"
                      className="nav-btn next"
                      onClick={() => setLightboxIndex(i => Math.min(pages.length - 1, i + 1))}
                      disabled={lightboxIndex === pages.length - 1}
                    >
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6" /></svg>
                    </button>
                  </div>
                  
                  <div className="lightbox-indicator-text">
                    Página {lightboxIndex + 1} de {pages.length} (Pág. #{pages[lightboxIndex]?.numero})
                  </div>

                  {/* Thumbnail Strip */}
                  <div className="lightbox-thumbnails-container">
                    {pages.map((page, idx) => (
                      <div
                        key={page.id}
                        className={`thumbnail-strip-item ${idx === lightboxIndex ? 'active' : ''}`}
                        onClick={() => setLightboxIndex(idx)}
                      >
                        <img
                          src={
                            page.imagen_url.startsWith('http')
                              ? page.imagen_url
                              : `/api/images/${page.imagen_url}`
                          }
                          alt={`Pág. ${page.numero}`}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="inspector-empty-pages-notice">
                  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect width="18" height="18" x="3" y="3" rx="2" />
                    <circle cx="9" cy="9" r="2" />
                    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                  </svg>
                  <h4>Sin páginas cargadas</h4>
                  <p>Sube imágenes de páginas para esta edición a continuación.</p>
                </div>
              )}

              {/* Upload actions block */}
              <div className="inspector-upload-management-box">
                <h3>Subir y Gestionar Archivos</h3>
                
                {/* 1. Page Upload Input */}
                <div className="upload-luxury-field">
                  <label className="upload-field-label">
                    {isUploadingPage ? (
                      <span className="spinner-luxury" style={{ borderColor: 'var(--primary)', borderTopColor: 'transparent' }} />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                      </svg>
                    )}
                    <span>{isUploadingPage ? 'Subiendo página(s)...' : 'Subir Imágenes de Páginas'}</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      multiple 
                      disabled={isUploadingPage}
                      onChange={handlePageUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  <p className="upload-field-tip">Puedes seleccionar múltiples imágenes (.png, .jpg, .jpeg)</p>
                </div>

                {/* 2. PDF File Upload Input */}
                <div className="upload-luxury-field">
                  <label className="upload-field-label secondary">
                    {isUploadingPdf ? (
                      <span className="spinner-luxury" style={{ borderColor: 'var(--secondary)', borderTopColor: 'transparent' }} />
                    ) : (
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                        <polyline points="17 8 12 3 7 8" />
                        <line x1="12" y1="3" x2="12" y2="15" />
                      </svg>
                    )}
                    <span>{isUploadingPdf ? 'Subiendo PDF...' : 'Subir Archivo PDF Completo'}</span>
                    <input 
                      type="file" 
                      accept="application/pdf" 
                      disabled={isUploadingPdf}
                      onChange={handlePdfUpload}
                      style={{ display: 'none' }}
                    />
                  </label>
                  {selectedEdition?.pdf_url && (
                    <p className="pdf-currently-loaded-tip">
                      Actualmente: <strong>{selectedEdition.pdf_url.split('/').pop()}</strong>
                    </p>
                  )}
                </div>
              </div>

              <div className="inspector-actions-luxury mt-lg">
                <button 
                  type="button" 
                  className="btn-luxury-ghost w-full" 
                  onClick={() => setIsInspectorOpen(false)}
                >
                  Cerrar Panel
                </button>
              </div>
            </div>
          )}
        </Inspector>
      </div>
    </UniversalLayout>
  );
};

export default Editions;
