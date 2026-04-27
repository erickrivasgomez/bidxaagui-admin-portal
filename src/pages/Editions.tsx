import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { useEditions } from '../core/modules/antroponomadas/application/useEditions';
import { getEditionPagesUseCase, uploadEditionPdfUseCase } from '../core/modules/antroponomadas/infrastructure/antroponomadas.dependencies';
import { AppCanvas } from '../components/AppCanvas';
import { AppInspector } from '../components/AppInspector';
import type { Edition } from '../core/modules/antroponomadas/domain/edition.model';
import './Editions.css';

const Editions: React.FC = () => {
    const { editions, loading, fetchEditions, deleteEdition } = useEditions();

    // Inspector state
    const [isInspectorOpen, setIsInspectorOpen] = useState(false);
    const [inspectorEdition, setInspectorEdition] = useState<Edition | null>(null);
    const [pages, setPages] = useState<Array<{ id: string; imagen_url: string; numero: number }>>([]);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [isProcessing, setIsProcessing] = useState(false);

    React.useEffect(() => {
        fetchEditions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleViewPages = async (edition: Edition) => {
        try {
            const data = await getEditionPagesUseCase.execute(edition.id);
            if (data && data.length > 0) {
                setPages(data);
                setInspectorEdition(edition);
                setLightboxIndex(0);
                setIsInspectorOpen(true);
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
        }
    };

    const handleDelete = async (id: string) => {
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
        <>
            <AppCanvas
                title="Ediciones"
                actions={
                    <button className="btn-primary" style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 600 }}>
                        + Nueva Edición
                    </button>
                }
            >
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
                                <th>Portada</th>
                                <th>Título</th>
                                <th>Fecha</th>
                                <th>PDF</th>
                                <th>Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {editions.length === 0 ? (
                                <tr>
                                    <td colSpan={5} style={{ textAlign: 'center', padding: '3rem', color: '#64748b' }}>
                                        No hay ediciones registradas.
                                    </td>
                                </tr>
                            ) : (
                                editions.map(edition => (
                                    <tr key={edition.id}>
                                        <td>
                                            <div className="cover-thumbnail">
                                                <span>IMG</span>
                                            </div>
                                        </td>
                                        <td>
                                            <button
                                                onClick={() => handleViewPages(edition)}
                                                className="title-link"
                                            >
                                                {edition.titulo}
                                            </button>
                                            <div className="subtitle-text">{edition.descripcion}</div>
                                        </td>
                                        <td>{new Date(edition.fecha || '').toLocaleDateString()}</td>
                                        <td>
                                            {edition.pdf_url ? (
                                                <a
                                                    href={edition.pdf_url.startsWith('http') ? edition.pdf_url : `https://bidxaagui.com/assets/documents/${edition.pdf_url.split('/').pop()}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="pdf-link"
                                                >
                                                    Ver PDF
                                                </a>
                                            ) : (
                                                <span style={{ color: '#94a3b8', fontSize: '13px' }}>Sin PDF</span>
                                            )}
                                        </td>
                                        <td>
                                            <div className="action-buttons">
                                                <button
                                                    onClick={() => handleManualPDF(edition.id, edition.titulo)}
                                                    className="btn-action-secondary"
                                                    disabled={isProcessing}
                                                    title="Generar PDF"
                                                >
                                                    {isProcessing ? '...' : '📄'}
                                                </button>
                                                <button
                                                    onClick={() => window.open(`/editions/${edition.id}/preview`, '_blank')}
                                                    className="btn-action-secondary"
                                                    title="Vista previa"
                                                >
                                                    👁️
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(edition.id)}
                                                    className="btn-action-danger"
                                                    title="Eliminar"
                                                >
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
                title={inspectorEdition?.titulo || 'Edición'}
            >
                {pages.length > 0 && (
                    <div className="inspector-lightbox">
                        <div className="lightbox-stage">
                            <button
                                className="nav-btn prev"
                                onClick={() => setLightboxIndex(i => Math.max(0, i - 1))}
                                disabled={lightboxIndex === 0}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>
                            <div className="image-wrapper">
                                <img
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/images/${pages[lightboxIndex]?.imagen_url}`}
                                    alt={`Página ${pages[lightboxIndex]?.numero}`}
                                    className="main-image"
                                />
                            </div>
                            <button
                                className="nav-btn next"
                                onClick={() => setLightboxIndex(i => Math.min(pages.length - 1, i + 1))}
                                disabled={lightboxIndex === pages.length - 1}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
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
                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/images/${page.imagen_url}`}
                                        loading="lazy"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </AppInspector>
        </>
    );
};

export default Editions;
