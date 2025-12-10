
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import { editionsAPI, type Edition } from '../services/api';
import './EditionPreview.css';

const EditionPreview: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();

    // Data State
    const [edition, setEdition] = useState<Edition | null>(null);
    const [pages, setPages] = useState<Array<{ id: string; imagen_url: string; numero: number }>>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Flipbook State
    const bookRef = useRef<any>(null);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Responsive State
    // We default to true because most admin work is desktop, but useLayoutEffect could refine
    const [isMobile, setIsMobile] = useState(false);

    // Initial Fetch
    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                // We need edition metadata and pages. 
                // Currently API doesn't have "getOne" public efficient endpoint, 
                // but we can list all and find (not efficient but works for now) 
                // OR ideally add getEdition(id) to API.
                // Re-using getAll for simplicity as per previous patterns.
                const allEditions = await editionsAPI.getAll();
                const found = allEditions.find(e => e.id === id);

                if (!found) {
                    setError('Edición no encontrada');
                    return;
                }
                setEdition(found);

                const pagesData = await editionsAPI.getPages(id);
                setPages(pagesData);
                setTotalPages(pagesData.length);

            } catch (err) {
                console.error(err);
                setError('Error al cargar la edición');
            } finally {
                setLoading(false);
            }
        };
        loadData();

        // Responsive Handler
        const handleResize = () => {
            setIsMobile(window.innerHeight > window.innerWidth || window.innerWidth < 768);
        };

        handleResize(); // Init
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [id]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowLeft') {
                bookRef.current?.pageFlip()?.flipPrev();
            } else if (e.key === 'ArrowRight') {
                bookRef.current?.pageFlip()?.flipNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const onFlip = useCallback((e: any) => {
        setCurrentPage(e.data);
    }, []);

    const handleDownload = () => {
        alert('La descarga de PDF estará disponible próximamente.');
    };

    if (loading) return <div className="preview-loading">Cargando revista...</div>;
    if (error || !edition) return <div className="preview-error">{error}</div>;

    // Dimensions calculation
    // Landscape: Double page
    // Portrait: Single page
    // We want to maximize space.
    // Fixed aspect ratio usually A4 (210x297) -> 0.707
    // Container height is roughly window height - header (60px) - padding.
    const containerH = window.innerHeight - 80;
    const containerW = window.innerWidth - 40;

    // Ideal page dimensions
    // Mobile: W = H * 0.7
    // Desktop: W = (H * 0.7) but we show 2, so total W = H * 1.4

    let pageHeight = containerH;
    let pageWidth = pageHeight * 0.70;

    // Adjust if width is constraint
    if (!isMobile) {
        // Double page check
        if ((pageWidth * 2) > containerW) {
            // Width is limiter
            pageWidth = (containerW / 2);
            pageHeight = pageWidth / 0.70;
        }
    } else {
        // Single page check
        if (pageWidth > containerW) {
            pageWidth = containerW;
            pageHeight = pageWidth / 0.70;
        }
    }

    return (
        <div className="preview-container">
            {/* Header */}
            <div className="preview-header">
                <div className="header-left">
                    <button onClick={() => navigate('/editions')} className="btn-back">
                        ← Volver a Ediciones
                    </button>
                    <span className="edition-title-preview">{edition.titulo}</span>
                </div>
                <div className="header-right">
                    <button onClick={handleDownload} className="btn-download">
                        Descargar PDF
                    </button>
                </div>
            </div>

            {/* Stage */}
            <div className="preview-stage">
                {/* Book Wrapper */}
                <div className="book-wrapper" style={{
                    width: isMobile ? pageWidth : pageWidth * 2,
                    height: pageHeight
                }}>
                    <HTMLFlipBook
                        key={isMobile ? 'mobile' : 'desktop'}
                        width={Math.floor(pageWidth)}
                        height={Math.floor(pageHeight)}
                        size={isMobile ? "fixed" : "stretch"}
                        minWidth={300}
                        maxWidth={1000}
                        minHeight={400}
                        maxHeight={1414}
                        maxShadowOpacity={isMobile ? 0.2 : 0.5}
                        showCover={true}
                        mobileScrollSupport={true}
                        onFlip={onFlip}
                        ref={bookRef}
                        className="flipbook-instance"
                        style={{ margin: '0 auto' }}
                        startPage={0}
                        drawShadow={true}
                        flippingTime={1000}
                        usePortrait={isMobile}
                        startZIndex={0}
                        autoSize={true}
                        clickEventForward={true}
                        useMouseEvents={true}
                        swipeDistance={30}
                        showPageCorners={true}
                        disableFlipByClick={false}
                    >
                        {/* Cover (Page 0) */}
                        <div className="page page-cover" data-density="hard">
                            <div className="page-content">
                                {pages[0] && (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/images/${pages[0].imagen_url}`}
                                        alt="Portada"
                                        className="page-image"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Content Pages */}
                        {pages.slice(1).map((page) => (
                            <div key={page.id} className="page">
                                <div className="page-content">
                                    <img
                                        src={`${import.meta.env.VITE_API_URL || 'http://localhost:8787'}/api/images/${page.imagen_url}`}
                                        alt={`Página ${page.numero}`}
                                        className="page-image"
                                    />
                                    <div className="page-number">{page.numero}</div>
                                </div>
                            </div>
                        ))}

                        {/* Back Cover (Last Page) - Optional, adds stability */}
                        <div className="page page-cover" data-density="hard">
                            <div className="page-content back-cover">
                                <div className="brand-mark">BIDXAAGUI</div>
                            </div>
                        </div>
                    </HTMLFlipBook>
                </div>

                {/* Nav Controls (Floating) */}
                <button
                    className="preview-nav prev"
                    onClick={() => bookRef.current?.pageFlip()?.flipPrev()}
                >
                    ‹
                </button>
                <button
                    className="preview-nav next"
                    onClick={() => bookRef.current?.pageFlip()?.flipNext()}
                >
                    ›
                </button>
            </div>

            <div className="preview-footer">
                Página {currentPage + 1} de {totalPages + 2 /* + cover/back */}
            </div>
        </div>
    );
};

export default EditionPreview;
