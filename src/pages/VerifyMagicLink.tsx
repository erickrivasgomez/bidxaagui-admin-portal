import React, { useEffect, useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { verifyMagicLinkUseCase } from '../core/shared/infrastructure/auth.dependencies';
import { DomainError } from '../core/shared/domain/errors';
import { useAuthStore } from '../store/authStore';
import './VerifyMagicLink.css';

const VerifyMagicLink: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { setToken, isAuthenticated } = useAuthStore();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const hasVerified = useRef(false);

    useEffect(() => {
        // If already authenticated, redirect to dashboard
        if (isAuthenticated) {
            navigate('/dashboard', { replace: true });
            return;
        }

        // Prevent multiple verification attempts
        if (hasVerified.current) {
            return;
        }

        const verifyToken = async () => {
            const token = searchParams.get('token');

            if (!token) {
                setStatus('error');
                setErrorMessage('Token inválido o no encontrado en la URL');
                return;
            }

            // Double check auth state before calling API
            if (useAuthStore.getState().isAuthenticated) {
                return;
            }

            // Mark as attempted
            hasVerified.current = true;

            try {
                const result = await verifyMagicLinkUseCase.execute(token);

                // Store token and user in state
                setToken(result.token, result.user);
                setStatus('success');

                // Redirect to dashboard after short delay
                setTimeout(() => {
                    navigate('/dashboard', { replace: true });
                }, 1500);
            } catch (err: any) {
                // If we became authenticated in the meantime (race condition), ignore error
                if (useAuthStore.getState().isAuthenticated) {
                    return;
                }

                setStatus('error');

                if (err instanceof DomainError) {
                    setErrorMessage(err.message);
                } else {
                    setErrorMessage('Error al verificar el enlace. Por favor intenta de nuevo.');
                }
            }
        };

        verifyToken();
    }, [searchParams, navigate, setToken, isAuthenticated]);

    return (
        <div className="verify-page">
            <div className="verify-container-adaptive">
                {/* Decoration glow */}
                <div className="verify-decoration-glow"></div>

                <div className="verify-card-premium fade-in">
                    {/* Header */}
                    <div className="verify-brand-header">
                        <div className="brand-logo-symbol">B</div>
                        <h1 className="brand-title">BIDXAAGUI</h1>
                        <p className="brand-subtitle">Verificación de Credenciales</p>
                    </div>

                    {status === 'loading' && (
                        <div className="verify-status-content loading fade-in">
                            <div className="loader-luxury-wrapper">
                                <div className="spinner-large-luxury"></div>
                            </div>
                            <h2 className="status-heading">Verificando enlace...</h2>
                            <p className="status-description">
                                Por favor espera un momento mientras establecemos tu sesión segura.
                            </p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="verify-status-content success fade-in">
                            <div className="success-icon-badge-large">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>
                            <h2 className="status-heading">¡Acceso concedido!</h2>
                            <p className="status-description">
                                Credenciales verificadas con éxito. Redirigiendo al panel de administración...
                            </p>
                            <div className="progress-bar-luxury">
                                <div className="progress-bar-fill"></div>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="verify-status-content error fade-in">
                            <div className="error-icon-badge-large">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </div>
                            <h2 className="status-heading">Error de verificación</h2>
                            
                            <div className="alert-luxury error">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="alert-icon">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="8" x2="12" y2="12" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" />
                                </svg>
                                <span className="alert-text">{errorMessage}</span>
                            </div>

                            <button
                                type="button"
                                className="btn-luxury-submit mt-lg"
                                onClick={() => navigate('/login')}
                            >
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                <span>Solicitar nuevo enlace</span>
                            </button>
                        </div>
                    )}
                </div>

                <footer className="verify-adaptive-footer">
                    <p>BIDXAAGUI © {new Date().getFullYear()} — Portal de Administración</p>
                </footer>
            </div>
        </div>
    );
};

export default VerifyMagicLink;
