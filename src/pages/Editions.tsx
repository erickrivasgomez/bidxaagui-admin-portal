import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useEditions } from '../core/modules/antroponomadas/application/useEditions';
import { getEditionPagesUseCase, uploadEditionPdfUseCase } from '../core/modules/antroponomadas/infrastructure/antroponomadas.dependencies';
import { useReactRouterNavigation } from '../core/shared/infrastructure/react-router.adapter';
import './Editions.css';

const Editions: React.FC = () => {
    const navigation = useReactRouterNavigation();
    const { editions, loading, fetchEditions, deleteEdition } = useEditions();

    // Lightbox state
    const [pages, setPages] = useState<Array<{ id: string; imagen_url: string; numero: number }>>([]);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [viewingEditionTitle, setViewingEditionTitle] = useState('');

    // Processing state for PDF generation
    const [isProcessing, setIsProcessing] = useState(false);

    const handleViewPages = async (editionId: string, editionTitle: string) => {
        try {
            const data = await getEditionPagesUseCase.execute(editionId);
            if (data && data.length > 0) {
                setPages(data);
                setViewingEditionTitle(editionTitle);
                setLightboxIndex(0);
                setIsLightboxOpen(true);
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
        }
    };

    const handleDelete = async (id: string) => {
        // TODO: Replace with full-screen confirmation screen per iOS guidelines
        if (!window.confirm('¿Estás seguro de eliminar esta edición? Esta acción es irreversible.')) return;
        try {
            await deleteEdition(id);
        } catch (error) {
            console.error('Error deleting edition:', error);
        }
    };

    const handleManualPDF = async (editionId: string, editionTitle: string) => {
        try {
            setIsProcessing(true);
            const pagesData = await getEditionPagesUseCase.execute(editionId);

            if (!pagesData || pagesData.length === 0) {
                alert('No se puede generar PDF sin páginas.');
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

            // Generate PDF
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
            setIsProcessing(false);
        } catch (e) {
            console.error(e);
            alert('Error al procesar PDF manual');
            setIsProcessing(false);
        }
    };

    return (
        <div className="editions-page">
            <div className="editions-container">
                {/* Header */}
                <div className="page-header">
                    <div className="header-left-group">
                        <div className="title-group">
                            <h2>Ediciones</h2>
                            <p className="subtitle">Gestión de ediciones y archivos PDF</p>
                        </div>
                    </div>
                    <div className="header-buttons">
                        <button onClick={() => navigation.navigate('/antroponomadas/editions/create')} className="btn-primary-ios">
                            <span className="icon">+</span> Nueva Edición
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container">
                    {loading ? (
                        <div className="skeleton-loader">Cargando...</div>
                    ) : (
                        <table className="editions-table">
                            <thead>
                                <tr>
                                    <th>Portada</th>
                                    <th>Título</th>
                                    <th>Fecha</th>
                                    <th>Descarga PDF</th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {editions.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem' }}>
                                            No hay ediciones registradas.
                                        </td>
                                    </tr>
                                ) : (
                                    editions.map(edition => (
                                        <tr key={edition.id}>
                                            <td style={{ width: '60px' }}>
                                                <div style={{
                                                    width: '40px', height: '56px', background: '#eee',
                                                    borderRadius: '4px', overflow: 'hidden'
                                                }}>
                                                    <span style={{ display: 'block', lineHeight: '56px', textAlign: 'center', fontSize: '10px' }}>IMG</span>
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleViewPages(edition.id, edition.titulo)}
                                                    className="edition-title-btn"
                                                    style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', textAlign: 'left' }}
                                                >
                                                    <span className="edition-title" style={{ color: 'var(--accent-rust)', textDecoration: 'underline' }}>{edition.titulo}</span>
                                                </button>
                                                <span className="edition-desc">{edition.descripcion}</span>
                                            </td>
                                            <td>{new Date(edition.fecha || '').toLocaleDateString()}</td>
                                            <td>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    {edition.pdf_url ? (
                                                        <a
                                                            href={edition.pdf_url.startsWith('http') ? edition.pdf_url : `https://bidxaagui.com/assets/documents/${edition.pdf_url.split('/').pop()}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            style={{ color: 'var(--accent-rust)', fontSize: '0.9rem', fontWeight: 600 }}
                                                        >
                                                            Ver PDF
                                                        </a>
                                                    ) : (
                                                        <span style={{ color: '#888', fontSize: '0.85rem' }}>Default</span>
                                                    )}
                                                    <button
                                                        onClick={() => handleManualPDF(edition.id, edition.titulo)}
                                                        className="btn-mini"
                                                        disabled={isProcessing}
                                                    >
                                                        {isProcessing ? '...' : 'Generar'}
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => window.open(`/editions/${edition.id}/preview`, '_blank')}
                                                    className="btn-action"
                                                    style={{ marginRight: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                                >
                                                    👁️
                                                </button>
                                                <button onClick={() => handleDelete(edition.id)} className="btn-delete" title="Eliminar">
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>

            {/* Lightbox Modal */}
            {isLightboxOpen && (
                <div className="lightbox-overlay" onClick={() => setIsLightboxOpen(false)}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <div className="lightbox-header">
                            <h3 className="lightbox-title">{viewingEditionTitle}</h3>
                            <button onClick={() => setIsLightboxOpen(false)} className="close-btn-light">×</button>
                        </div>
                        <div className="lightbox-stage">
                            <button
                                className="nav-btn prev"
                                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => Math.max(0, i - 1)); }}
                                disabled={lightboxIndex === 0}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <div className="image-wrapper">
                                <img
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/images/${pages[lightboxIndex]?.imagen_url}`}
                                    alt={`Página ${pages[lightboxIndex]?.numero}`}
                                    className="main-image"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x600?text=Error+Loading'; }}
                                />
                            </div>
                            <button
                                className="nav-btn next"
                                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => Math.min(pages.length - 1, i + 1)); }}
                                disabled={lightboxIndex === pages.length - 1}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                        </div>
                        <div className="lightbox-info">
                            Página {lightboxIndex + 1} de {pages.length}
                        </div>
                        <div className="thumbnails-strip">
                            <div className="thumbnails-track">
                                {pages.map((page, idx) => (
                                    <div
                                        key={page.id}
                                        className={`thumb-item ${idx === lightboxIndex ? 'active' : ''}`}
                                        onClick={(e) => { e.stopPropagation(); setLightboxIndex(idx); }}
                                    >
                                        <img
                                            src={`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/images/${page.imagen_url}`}
                                            loading="lazy"
                                        />
                                        <div className="thumb-num">{idx + 1}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Editions;
