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
        <div className="verify-container">
            <div className="verify-card card fade-in">
                {status === 'loading' && (
                    <div className="verify-loading">
                        <div className="loader">
                            <div className="spinner-large"></div>
                        </div>
                        <h2>Verificando enlace...</h2>
                        <p className="text-muted">Por favor espera un momento</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="verify-success">
                        <div className="success-icon-large">
                            <svg
                                width="80"
                                height="80"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                <polyline points="22 4 12 14.01 9 11.01" />
                            </svg>
                        </div>

                        <h2>¡Acceso concedido!</h2>
                        <p className="text-muted">Redirigiendo al panel de administración...</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="verify-error">
                        <div className="error-icon-large">
                            <svg
                                width="80"
                                height="80"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                            >
                                <circle cx="12" cy="12" r="10" />
                                <line x1="15" y1="9" x2="9" y2="15" />
                                <line x1="9" y1="9" x2="15" y2="15" />
                            </svg>
                        </div>

                        <h2>Error de verificación</h2>
                        <div className="alert alert-error">
                            {errorMessage}
                        </div>

                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={() => navigate('/login')}
                        >
                            Solicitar nuevo enlace
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default VerifyMagicLink;
