import React, { useState } from 'react';
import { requestMagicLinkUseCase } from '../core/shared/infrastructure/auth.dependencies';
import { DomainError } from '../core/shared/domain/errors';
import { useAuthStore } from '../store/authStore';
import './Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const { isLoading, error, setLoading, setError, clearError } = useAuthStore();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim() || !email.includes('@')) {
            setError('Por favor introduce una dirección de correo válida.');
            return;
        }
        clearError();
        setLoading(true);

        try {
            await requestMagicLinkUseCase.execute(email);
            setEmailSent(true);
            setLoading(false);
        } catch (err: any) {
            if (err instanceof DomainError) {
                setError(err.message);
            } else {
                setError('Error al solicitar el enlace. Por favor intenta de nuevo.');
            }
            setLoading(false);
        }
    };

    const handleTryAgain = () => {
        setEmailSent(false);
        setEmail('');
        clearError();
    };

    return (
        <div className="login-page">
            <div className="login-container-adaptive">
                {/* Luxury Backdrop Details (Desktop Only) */}
                <div className="login-decoration-glow"></div>
                
                <div className="login-card-premium fade-in">
                    {/* Brand Header */}
                    <div className="login-brand-header">
                        <div className="brand-logo-symbol">B</div>
                        <h1 className="brand-title">BIDXAAGUI</h1>
                        <p className="brand-subtitle">Panel de Control & Administración</p>
                    </div>

                    {!emailSent ? (
                        <form onSubmit={handleSubmit} className="login-form-content">
                            <div className="form-group-luxury">
                                <label htmlFor="email" className="form-label-luxury">
                                    Correo Electrónico
                                </label>
                                <div className="input-with-icon-wrapper">
                                    <svg className="input-field-icon" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                        <polyline points="22,6 12,13 2,6" />
                                    </svg>
                                    <input
                                        type="email"
                                        id="email"
                                        className="input-luxury"
                                        placeholder="correo@ejemplo.com"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                        autoComplete="email"
                                        autoFocus
                                        required
                                    />
                                </div>
                            </div>

                            {error && (
                                <div className="alert-luxury error fade-in" role="alert">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="alert-icon">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="12" y1="8" x2="12" y2="12" />
                                        <line x1="12" y1="16" x2="12.01" y2="16" />
                                    </svg>
                                    <span className="alert-text">{error}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn-luxury-submit"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner-luxury"></span>
                                        <span>Enviando enlace...</span>
                                    </>
                                ) : (
                                    <>
                                        <span>Enviar Enlace de Acceso</span>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="btn-arrow-icon">
                                            <line x1="5" y1="12" x2="19" y2="12" />
                                            <polyline points="12 5 19 12 12 19" />
                                        </svg>
                                    </>
                                )}
                            </button>

                            <p className="login-disclaimer">
                                Te enviaremos un enlace de acceso temporal directo a tu bandeja. 
                                Sin contraseñas, seguro y rápido.
                            </p>
                        </form>
                    ) : (
                        <div className="login-success-state fade-in">
                            <div className="success-icon-badge">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <polyline points="20 6 9 17 4 12" />
                                </svg>
                            </div>

                            <h2 className="success-heading">¡Correo enviado!</h2>
                            
                            <p className="success-description">
                                Hemos enviado el enlace mágico de inicio de sesión a: <br />
                                <strong>{email}</strong>
                            </p>

                            <div className="alert-luxury info">
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="alert-icon">
                                    <circle cx="12" cy="12" r="10" />
                                    <line x1="12" y1="16" x2="12" y2="12" />
                                    <line x1="12" y1="8" x2="12.01" y2="8" />
                                </svg>
                                <span className="alert-text">El enlace expira en 15 minutos por seguridad.</span>
                            </div>

                            <button
                                type="button"
                                className="btn-luxury-ghost"
                                onClick={handleTryAgain}
                            >
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M19 12H5M12 19l-7-7 7-7" />
                                </svg>
                                <span>Solicitar otro enlace</span>
                            </button>
                        </div>
                    )}
                </div>

                <footer className="login-adaptive-footer">
                    <p>BIDXAAGUI © {new Date().getFullYear()} — Portal de Administración</p>
                </footer>
            </div>
        </div>
    );
};

export default Login;
