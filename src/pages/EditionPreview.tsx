import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import HTMLFlipBook from 'react-pageflip';
import { editionsAPI, type Edition } from '../services/api';
import './EditionPreview.css';

interface EditionPreviewProps {
    isPublic?: boolean;
}

const EditionPreview: React.FC<EditionPreviewProps> = ({ isPublic = false }) => {
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
    const [isMobile, setIsMobile] = useState(false);
    const [isReady, setIsReady] = useState(false);
    const [isFlippingBackward, setIsFlippingBackward] = useState(false);
    const prevPageRef = useRef(0);

    // Handle close for public preview
    const handleClose = useCallback(() => {
        if (window.opener) {
            window.close();
        } else {
            window.history.back();
        }
    }, []);

    // Add fullscreen class to body when in public mode
    useEffect(() => {
        if (isPublic) {
            document.body.classList.add('public-preview');
            return () => {
                document.body.classList.remove('public-preview');
            };
        }
    }, [isPublic]);

    // Initial Fetch
    useEffect(() => {
        const loadData = async () => {
            if (!id) return;
            try {
                setLoading(true);
                const allEditions = await editionsAPI.getAll();
                const found = allEditions.find(e => e.id === id);

                if (!found) {
                    setError('Edición no encontrada');
                    return;
                }
                setEdition(found);

                const pagesData = await editionsAPI.getPages(id);
                setPages(pagesData);

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

    // Wait for DOM to be ready before rendering flipbook
    useEffect(() => {
        if (!loading && pages.length > 0) {
            // Delay to ensure iframe/container dimensions are stable
            const timer = setTimeout(() => {
                setIsReady(true);
            }, 500);
            return () => clearTimeout(timer);
        } else {
            setIsReady(false);
        }
    }, [loading, pages.length]);

    // Keyboard Navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isPublic) {
                handleClose();
                return;
            }
            if (e.key === 'ArrowLeft') {
                bookRef.current?.pageFlip()?.flipPrev();
            } else if (e.key === 'ArrowRight') {
                bookRef.current?.pageFlip()?.flipNext();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isPublic, handleClose]);

    const onFlip = useCallback((e: any) => {
        const newPage = e.data;
        const isGoingBackward = newPage < prevPageRef.current;
        setIsFlippingBackward(isGoingBackward);
        setCurrentPage(newPage);
        prevPageRef.current = newPage;
    }, []);

    const handleDownload = () => {
        alert('La descarga de PDF estará disponible próximamente.');
    };

    if (loading) return <div className="preview-loading">Cargando revista...</div>;
    if (error || !edition) return <div className="preview-error">{error}</div>;

    // Calculate dimensions with better landscape support
    const containerH = window.innerHeight - (isPublic ? 0 : 80);
    const containerW = window.innerWidth - (isPublic ? 0 : 40);

    // Determine if we're in landscape mode (width > height)
    const isLandscape = window.innerWidth > window.innerHeight;

    let pageHeight, pageWidth;

    if (isMobile) {
        if (isLandscape) {
            // Landscape mobile: height is the constraint
            pageHeight = containerH * 0.85; // Usar 85% del alto disponible
            pageWidth = pageHeight * 0.7; // Mantener ratio 7:10

            // Si el ancho calculado es muy grande, ajustar por ancho
            if (pageWidth > containerW * 0.45) {
                pageWidth = containerW * 0.45;
                pageHeight = pageWidth / 0.7;
            }
        } else {
            // Portrait mobile: width is the constraint
            pageWidth = containerW * 0.9;
            pageHeight = pageWidth / 0.7;

            // Si la altura calculada es muy grande, ajustar por altura
            if (pageHeight > containerH * 0.9) {
                pageHeight = containerH * 0.9;
                pageWidth = pageHeight * 0.7;
            }
        }
    } else {
        // Desktop: usar el algoritmo original
        pageHeight = containerH * (isPublic ? 0.9 : 0.8);
        pageWidth = pageHeight * 0.7;

        // Adjust if width is constraint (dos páginas lado a lado)
        if ((pageWidth * 2) > containerW) {
            pageWidth = (containerW / 2);
            pageHeight = pageWidth / 0.7;
        }
    }

    // Validate dimensions before rendering flipbook
    const hasValidDimensions = pageWidth > 0 && pageHeight > 0 && !isNaN(pageWidth) && !isNaN(pageHeight);

    // Set minimum dimensions if needed
    if (hasValidDimensions) {
        pageWidth = Math.max(pageWidth, 300);
        pageHeight = Math.max(pageHeight, 400);
    }

    if (!hasValidDimensions || !isReady) {
        return <div className="preview-loading">Inicializando lector...</div>;
    }

    return (
        <div className={`preview-container ${isPublic ? 'public' : ''}`}>
            {isPublic && (
                <button
                    className="close-preview"
                    onClick={handleClose}
                    aria-label="Cerrar vista previa"
                >
                    &times;
                </button>
            )}

            {!isPublic && (
                <div className="preview-header">
                    <button onClick={() => navigate('/editions')} className="btn-back">
                        ← Volver a Ediciones
                    </button>
                    <span className="edition-title">{edition.titulo}</span>
                    <button onClick={handleDownload} className="btn-download">
                        Descargar PDF
                    </button>
                </div>
            )}

            <div className="preview-stage">
                <div className="book-wrapper">
                    <HTMLFlipBook
                        width={pageWidth}
                        height={pageHeight}
                        size={isMobile ? "fixed" : "stretch"}
                        minWidth={300}
                        maxWidth={1000}
                        minHeight={400}
                        maxHeight={1414}
                        maxShadowOpacity={0.5}
                        showCover={true}
                        mobileScrollSupport={true}
                        onFlip={onFlip}
                        ref={bookRef}
                        className={`flipbook ${isMobile && isFlippingBackward ? 'flipping-backward-portrait' : ''}`}
                        style={{}}
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
                        {/* Cover */}
                        <div className="page page-cover" data-density="hard">
                            <div className="page-content">
                                {pages[0] && (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL || (window.location.hostname.includes('bidxaagui.com') ? 'https://api.bidxaagui.com' : 'http://localhost:8787')}/api/images/${pages[0].imagen_url}`}
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
                                        src={`${import.meta.env.VITE_API_URL || (window.location.hostname.includes('bidxaagui.com') ? 'https://api.bidxaagui.com' : 'http://localhost:8787')}/api/images/${page.imagen_url}`}
                                        alt={`Página ${page.numero}`}
                                        className="page-image"
                                    />
                                    <div className="page-number">{page.numero}</div>
                                </div>
                            </div>
                        ))}

                        {/* Back Cover */}
                        <div className="page page-cover" data-density="hard">
                            <div className="page-content back-cover">
                                <div className="brand-mark">BIDXAAGUI</div>
                            </div>
                        </div>
                    </HTMLFlipBook>
                </div>

                {/* Navigation Arrows */}
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

            {!isPublic && (
                <div className="preview-footer">
                    Página {currentPage + 1} de {pages.length + 1} {/* +1 for cover */}
                </div>
            )}
        </div>
    );
};

export default EditionPreview;
