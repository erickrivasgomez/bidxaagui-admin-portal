import React, { useState, useEffect, useRef } from 'react';
import JSZip from 'jszip';
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

            // Filter images and sort by name
            const imageFiles = Object.keys(contents.files)
                .filter(filename => !contents.files[filename].dir && filename.match(/\.(png|jpg|jpeg)$/i))
                .sort(); // Alphabetic sort: 01.png, 02.png...

            if (imageFiles.length === 0) {
                throw new Error('El ZIP no contiene imágenes válidas (.png, .jpg)');
            }

            setStatusMessage(`Procesando ${imageFiles.length} imágenes dobles...`);

            // Initialize PDF - Using first image to set base dimensions
            const firstImgFile = await contents.files[imageFiles[0]].async('blob');
            const firstImgBitmap = await createImageBitmap(firstImgFile);
            const { jsPDF } = await import('jspdf');

            // Si la primera es spread, el PDF base será la mitad de ancho
            const baseW = firstImgBitmap.width > (firstImgBitmap.height * 1.2)
                ? Math.floor(firstImgBitmap.width / 2)
                : firstImgBitmap.width;
            const baseH = firstImgBitmap.height;

            const pdf = new jsPDF({
                orientation: baseW > baseH ? 'l' : 'p',
                unit: 'px',
                format: [baseW, baseH]
            });

            let globalPageCount = 1;
            const totalSteps = imageFiles.length * 2;
            let currentStep = 0;

            for (let i = 0; i < imageFiles.length; i++) {
                const filename = imageFiles[i];
                const fileData = await contents.files[filename].async('blob');

                const imgBitmap = await createImageBitmap(fileData);
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                if (!ctx) throw new Error('No se pudo crear contexto de canvas');

                const width = imgBitmap.width;
                const height = imgBitmap.height;

                const processCrop = async (x: number, w: number, pageNum: number, isCover: boolean) => {
                    canvas.width = w;
                    canvas.height = height;
                    ctx.clearRect(0, 0, w, height);
                    ctx.drawImage(imgBitmap, x, 0, w, height, 0, 0, w, height);

                    // Add to PDF
                    if (pageNum > 1) {
                        pdf.addPage([w, height], w > height ? 'l' : 'p');
                    }
                    const imgData = canvas.toDataURL('image/jpeg', 0.9);
                    pdf.addImage(imgData, 'JPEG', 0, 0, w, height);

                    return new Promise<void>((resolve, reject) => {
                        canvas.toBlob(async (blob) => {
                            if (!blob) return reject('Error creating blob');

                            const fd = new FormData();
                            fd.append('file', blob, `page_${pageNum}.webp`);
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
                };

                const isSpread = width > (height * 1.2);
                if (isSpread) {
                    const halfWidth = Math.floor(width / 2);
                    await processCrop(0, halfWidth, globalPageCount++, i === 0);
                    if (i > 0) {
                        await processCrop(halfWidth, width - halfWidth, globalPageCount++, false);
                    }
                } else {
                    await processCrop(0, width, globalPageCount++, i === 0);
                }

                currentStep += 2;
                setProgress(Math.min(90, Math.round((currentStep / totalSteps) * 100)));
            }

            // 3. Finalize and Upload PDF
            setStatusMessage('Generando y subiendo PDF consolidado...');
            const pdfBlob = pdf.output('blob');
            const pdfFileName = `Antroponomadas - ${title}.pdf`.replace(/\s+/g, ' ');

            const pdfFormData = new FormData();
            pdfFormData.append('file', pdfBlob, pdfFileName);

            // Llamada al nuevo endpoint del worker (lo crearemos a continuación)
            try {
                await editionsAPI.uploadPDF(editionId, pdfFormData);
            } catch (e) {
                console.warn('Error subiendo PDF (posiblemente endpoint no creado aún):', e);
            }

            setProgress(100);
            setStatusMessage('¡Completado!');

            // Cleanup
            setTimeout(() => {
                setIsModalOpen(false);
                setIsProcessing(false);
                resetForm();
                fetchEditions();
            }, 1000);

        } catch (err: any) {
            console.error('Error processing:', err);
            setStatusMessage('Error: ' + (err.message || 'Error desconocido'));
            // Don't close modal so user sees error
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
                                    <th>Publicada</th>
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
                                                <span className={`status-badge ${edition.publicada ? 'published' : 'draft'}`}>
                                                    {edition.publicada ? 'Publicada' : 'Borrador'}
                                                </span>
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
                                    onClick={processAndUpload}
                                    className="btn-confirm"
                                    disabled={isProcessing || !file || !title}
                                >
                                    {isProcessing ? 'Procesando...' : 'Crear Edición'}
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
