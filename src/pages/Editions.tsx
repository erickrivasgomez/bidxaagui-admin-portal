import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
import { jsPDF } from 'jspdf';
import AdminHeader from '../components/AdminHeader';
import { editionsAPI, type Edition } from '../services/api';
import './Editions.css';

const Editions: React.FC = () => {
    const [editions, setEditions] = useState<Edition[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [progress, setProgress] = useState(0);
    const [statusMessage, setStatusMessage] = useState('');

    // New Edition Form State
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [file, setFile] = useState<File | null>(null);

    const [pages, setPages] = useState<Array<{ id: string; imagen_url: string; numero: number }>>([]);
    const [isLightboxOpen, setIsLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [viewingEditionTitle, setViewingEditionTitle] = useState('');
    const [lastProcessedEditionId, setLastProcessedEditionId] = useState<string | null>(null);
    const [finishedProcessing, setFinishedProcessing] = useState(false);
    const [processedBlobs, setProcessedBlobs] = useState<Array<{ blob: Blob; width: number; height: number }>>([]);
    const [generatingPdfId, setGeneratingPdfId] = useState<string | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        fetchEditions();
    }, []);

    const fetchEditions = async () => {
        try {
            setLoading(true);
            const data = await editionsAPI.getAll();
            setEditions(data);
        } catch (error) {
            console.error('Error fetching editions:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleViewPages = async (edition: Edition) => {
        try {
            const data = await editionsAPI.getPages(edition.id);
            if (data && data.length > 0) {
                setPages(data);
                setViewingEditionTitle(edition.titulo);
                setLightboxIndex(0);
                setIsLightboxOpen(true);
            } else {
                alert('Esta edición no tiene páginas subidas aún.');
            }
        } catch (error) {
            console.error('Error fetching pages:', error);
            alert('Error al cargar páginas');
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Estás seguro de eliminar esta edición? Esta acción es irreversible.')) return;
        try {
            await editionsAPI.delete(id);
            fetchEditions();
        } catch (error) {
            console.error('Error deleting edition:', error);
            alert('Error al eliminar');
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
        }
    };

    const processAndUpload = async () => {
        if (!title || !date || !file) {
            alert('Por favor completa todos los campos requeridos (Título, Fecha, Archivo ZIP)');
            return;
        }

        setIsProcessing(true);
        setStatusMessage('Iniciando proceso...');
        setProgress(0);

        try {
            // 1. Create Edition Metadata
            setStatusMessage('Creando edición...');
            const edition = await editionsAPI.create({
                titulo: title,
                descripcion: description,
                fecha: date // Assuming string format is accepted or YYYY-MM-DD
            });

            const editionId = edition.id;

            // 2. Process ZIP
            setStatusMessage('Leyendo archivo ZIP...');
            const zip = new JSZip();
            const contents = await zip.loadAsync(file);

            // Filter images and sort by NATURAL numeric order (1, 2, 10 instead of 1, 10, 2)
            const imageFiles = Object.keys(contents.files)
                .filter(filename => !contents.files[filename].dir && filename.match(/\.(png|jpg|jpeg)$/i))
                .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

            if (imageFiles.length === 0) {
                throw new Error('El ZIP no contiene imágenes válidas (.png, .jpg)');
            }

            // Store blobs for PDF generation
            const blobsCollector: Array<{ blob: Blob; width: number; height: number }> = [];

            // Process each image as a single page
            for (let i = 0; i < imageFiles.length; i++) {
                const filename = imageFiles[i];
                const fileData = await contents.files[filename].async('blob');
                const imgBitmap = await createImageBitmap(fileData);

                const width = imgBitmap.width;
                const height = imgBitmap.height;
                const pageNum = i + 1;
                const isCover = i === 0;

                const canvas = document.createElement('canvas');
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('No se pudo crear contexto de canvas');

                ctx.drawImage(imgBitmap, 0, 0);

                await new Promise<void>((resolve, reject) => {
                    canvas.toBlob(async (blob) => {
                        if (!blob) return reject('Error creating blob');

                        // Store for PDF generation later
                        blobsCollector.push({ blob, width, height });

                        const paddedPageNum = pageNum.toString().padStart(3, '0');
                        const fd = new FormData();
                        fd.append('file', blob, `page_${paddedPageNum}.webp`);
                        fd.append('pageNumber', pageNum.toString());
                        fd.append('isCover', isCover ? 'true' : 'false');

                        try {
                            await editionsAPI.uploadPage(editionId, fd);
                            resolve();
                        } catch (e) {
                            reject(e);
                        }
                    }, 'image/webp', 0.85);
                });

                imgBitmap.close();
                setProgress(Math.round(((i + 1) / imageFiles.length) * 100));
            }

            setProcessedBlobs(blobsCollector);
            setLastProcessedEditionId(editionId);
            setFinishedProcessing(true);
            setStatusMessage('Paso 1: ¡Páginas subidas con éxito! Ahora puedes generar el PDF.');
            fetchEditions();

        } catch (err: any) {
            console.error('Error processing:', err);
            setStatusMessage('Error Subida: ' + (err.message || 'Error desconocido'));
            setIsProcessing(false);
        }
    };

    const generateAndUploadPDF = async (editionId: string, blobs: Array<{ blob: Blob; width: number; height: number }>, editionTitle: string) => {
        setIsProcessing(true);
        setStatusMessage('Preparando pdf...');
        setProgress(0);

        try {
            if (blobs.length === 0) throw new Error('No hay imágenes procesadas.');

            setStatusMessage('Configurando documento PDF...');
            const first = blobs[0];
            const pdf = new jsPDF({
                orientation: first.width > first.height ? 'l' : 'p',
                unit: 'px',
                format: [first.width, first.height]
            });

            for (let i = 0; i < blobs.length; i++) {
                const item = blobs[i];
                setStatusMessage(`Comprimiendo página ${i + 1} de ${blobs.length}...`);

                // Convert WebP/Binary to compressed JPEG with resizing
                const img = await createImageBitmap(item.blob);

                if (i === 0) {
                    pdf.deletePage(1);
                    pdf.addPage([item.width, item.height], item.width > item.height ? 'l' : 'p');
                } else {
                    pdf.addPage([item.width, item.height], item.width > item.height ? 'l' : 'p');
                }

                // Quality 0.85 for PDF images to preserve text sharpness
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

                setProgress(Math.round(((i + 1) / blobs.length) * 100));

                if (i % 2 === 0) await new Promise(r => setTimeout(r, 10));
            }

            setStatusMessage('Enviando PDF Binario a GitHub...');
            const pdfBlob = pdf.output('blob');
            const fileName = `Antroponómadas - ${editionTitle}.pdf`.replace(/\s+/g, ' ');

            const fd = new FormData();
            fd.append('file', pdfBlob, fileName);
            fd.append('fileName', fileName);

            await editionsAPI.uploadPDF(editionId, fd);

            setStatusMessage('¡Todo listo! PDF pusheado a GitHub.');

            setTimeout(() => {
                setIsModalOpen(false);
                setIsProcessing(false);
                setGeneratingPdfId(null);
                resetForm();
                fetchEditions();
            }, 1000);

        } catch (err: any) {
            console.error('Error Generating PDF:', err);
            setStatusMessage('Error PDF: ' + (err.message || 'Error desconocido'));
            setIsProcessing(false);
            setGeneratingPdfId(null);
        }
    };

    const handleManualPDF = async (edition: Edition) => {
        try {
            setGeneratingPdfId(edition.id);
            setIsProcessing(true);
            setStatusMessage('Descargando páginas actuales para generar PDF...');
            const pagesData = await editionsAPI.getPages(edition.id);

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

            await generateAndUploadPDF(edition.id, blobs, edition.titulo);
        } catch (e) {
            console.error(e);
            alert('Error al procesar PDF manual');
            setIsProcessing(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setDate('');
        setFile(null);
        setProgress(0);
        setStatusMessage('');
        setFinishedProcessing(false);
        setProcessedBlobs([]);
        setLastProcessedEditionId(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div className="editions-page">
            <AdminHeader />

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
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary-ios">
                            <span className="icon">+</span> Nueva Edición
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="table-container">
                    {loading ? (
                        <div style={{ padding: '2rem', textAlign: 'center', color: '#888' }}>Cargando...</div>
                    ) : (
                        <table className="editions-table">
                            <thead>
                                <tr>
                                    <th>Portada</th>
                                    <th>Título</th>
                                    <th>Fecha</th>
                                    <th>Descarga PDF</th>
                                    <th>Estatus</th>
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
                                                {/* We need a full URL for the image. If R2 public access is not setup, 
                                                    we might need a worker endpoint to serve it. 
                                                    For now standard img tag assuming relative or public. 
                                                    Ideally: /api/images/KEY 
                                                    But edition.cover_url stores the KEY "editions/ID/..."
                                                    So we need a way to serve it.
                                                    Let's use a placeholder if we can't solve it right now.
                                                */}
                                                <div style={{
                                                    width: '40px', height: '56px', background: '#eee',
                                                    borderRadius: '4px', overflow: 'hidden'
                                                }}>
                                                    {/* TODO: Add image serving endpoint */}
                                                    <span style={{ display: 'block', lineHeight: '56px', textAlign: 'center', fontSize: '10px' }}>IMG</span>
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => handleViewPages(edition)}
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
                                                        onClick={() => handleManualPDF(edition)}
                                                        className="btn-mini"
                                                        title="Generar/Actualizar PDF"
                                                        style={{
                                                            padding: '2px 8px',
                                                            fontSize: '0.75rem',
                                                            background: 'var(--bg-olive)',
                                                            color: 'white',
                                                            border: 'none',
                                                            borderRadius: '4px',
                                                            cursor: 'pointer',
                                                            opacity: (isProcessing && generatingPdfId !== edition.id) ? 0.5 : 1
                                                        }}
                                                        disabled={isProcessing}
                                                    >
                                                        {(isProcessing && generatingPdfId === edition.id) ? '...' : 'Generar'}
                                                    </button>
                                                </div>
                                            </td>
                                            <td>
                                                <button
                                                    onClick={() => window.open(`/editions/${edition.id}/preview`, '_blank')}
                                                    className="btn-action"
                                                    title="Previsualizar Flipbook"
                                                    style={{ marginRight: '8px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem' }}
                                                >
                                                    👁️
                                                </button>
                                                <button onClick={() => handleDelete(edition.id)} className="btn-delete" title="Eliminar">
                                                    🗑️
                                                </button>
                                                <button
                                                    onClick={() => handleManualPDF(edition)}
                                                    className="btn-action"
                                                    title="Regenerar PDF en GitHub"
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', marginLeft: '5px' }}
                                                    disabled={isProcessing}
                                                >
                                                    📄
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

                        {/* Header Controls */}
                        <div className="lightbox-header">
                            <h3 className="lightbox-title">{viewingEditionTitle}</h3>
                            <button onClick={() => setIsLightboxOpen(false)} className="close-btn-light">×</button>
                        </div>

                        {/* Main Stage */}
                        <div className="lightbox-stage">
                            {/* Prev Button */}
                            <button
                                className="nav-btn prev"
                                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => Math.max(0, i - 1)); }}
                                disabled={lightboxIndex === 0}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M15 18l-6-6 6-6" /></svg>
                            </button>

                            {/* Image Container */}
                            <div className="image-wrapper">
                                <img
                                    src={`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/images/${pages[lightboxIndex]?.imagen_url}`}
                                    alt={`Página ${pages[lightboxIndex]?.numero}`}
                                    className="main-image"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/400x600?text=Error+Loading'; }}
                                />
                            </div>

                            {/* Next Button */}
                            <button
                                className="nav-btn next"
                                onClick={(e) => { e.stopPropagation(); setLightboxIndex(i => Math.min(pages.length - 1, i + 1)); }}
                                disabled={lightboxIndex === pages.length - 1}
                            >
                                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 18l6-6-6-6" /></svg>
                            </button>
                        </div>

                        {/* Pagination Info */}
                        <div className="lightbox-info">
                            Página {lightboxIndex + 1} de {pages.length}
                        </div>

                        {/* Thumbnails Strip */}
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

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h3>Nueva Edición</h3>
                            {!isProcessing && (
                                <button onClick={() => setIsModalOpen(false)} className="close-btn">×</button>
                            )}
                        </div>

                        <div className="form-stack">
                            <input
                                type="text"
                                className="input-ios"
                                placeholder="Título de la edición"
                                value={title}
                                onChange={e => setTitle(e.target.value)}
                                disabled={isProcessing}
                            />
                            <textarea
                                className="input-ios"
                                placeholder="Descripción (opcional)"
                                value={description}
                                onChange={e => setDescription(e.target.value)}
                                style={{ height: '80px', resize: 'none' }}
                                disabled={isProcessing}
                            />
                            <input
                                type="date"
                                className="input-ios"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                disabled={isProcessing}
                            />

                            <div
                                className="file-drop-area"
                                onClick={() => !isProcessing && fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                    accept=".zip"
                                    style={{ display: 'none' }}
                                />
                                {file ? (
                                    <div>
                                        <strong>{file.name}</strong>
                                        <p style={{ fontSize: '0.8rem', color: '#666', margin: 0 }}>
                                            {(file.size / 1024 / 1024).toFixed(2)} MB
                                        </p>
                                    </div>
                                ) : (
                                    <p style={{ margin: 0, color: '#888' }}>
                                        Haz clic para seleccionar el archivo ZIP
                                    </p>
                                )}
                            </div>

                            {isProcessing && (
                                <div className="processing-status">
                                    <div className="progress-bar-container">
                                        <div
                                            className="progress-bar-fill"
                                            style={{ width: `${progress}% ` }}
                                        ></div>
                                    </div>
                                    <p className="upload-status">{statusMessage} ({progress}%)</p>
                                </div>
                            )}

                            <div className="modal-footer" style={{ marginTop: '1rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="btn-cancel"
                                    disabled={isProcessing}
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => lastProcessedEditionId && generateAndUploadPDF(lastProcessedEditionId, processedBlobs, title)}
                                    className="btn-confirm"
                                    style={{
                                        backgroundColor: 'var(--bg-olive)',
                                        display: finishedProcessing ? 'block' : 'none'
                                    }}
                                    disabled={isProcessing}
                                >
                                    {isProcessing ? 'Generando PDF...' : 'PASO 2: Generar PDF en GitHub'}
                                </button>
                                <button
                                    onClick={processAndUpload}
                                    className="btn-confirm"
                                    disabled={isProcessing || !file || !title || finishedProcessing}
                                    style={{ display: finishedProcessing ? 'none' : 'block' }}
                                >
                                    {isProcessing ? 'Procesando...' : 'PASO 1: Subir Edición'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Editions;
