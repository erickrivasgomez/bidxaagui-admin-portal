import React, { useState } from 'react';
import { authAPI } from '../services/api';
import { useAuthStore } from '../store/authStore';
import './Login.css';

const Login: React.FC = () => {
    const [email, setEmail] = useState('');
    const [emailSent, setEmailSent] = useState(false);
    const { isLoading, error, setLoading, setError, clearError } = useAuthStore();

    const validateEmail = (email: string): boolean => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        clearError();

        // Validation
        if (!email.trim()) {
            setError('Por favor ingresa tu correo electrónico');
            return;
        }

        if (!validateEmail(email)) {
            setError('Por favor ingresa un correo electrónico válido');
            return;
        }

        setLoading(true);

        try {
            const response = await authAPI.requestMagicLink(email);

            if (response.success) {
                setEmailSent(true);
                setLoading(false);
            }
        } catch (err: any) {
            const errorMessage = err.response?.data?.message ||
                err.response?.status === 404
                ? 'Correo no encontrado. Por favor contacta al administrador.'
                : 'Error al solicitar el enlace. Por favor intenta de nuevo.';

            setError(errorMessage);
        }
    };

    const handleTryAgain = () => {
        setEmailSent(false);
        setEmail('');
        clearError();
    };

    return (
        <div className="login-container">
            <div className="login-card card fade-in">
                {/* Logo/Brand */}
                <div className="login-brand">
                    <h1>BIDXAAGUI</h1>
                    <p className="text-muted">Panel de Administración</p>
                </div>

                {!emailSent ? (
                    <>
                        {/* Login Form */}
                        <form onSubmit={handleSubmit} className="login-form">
                            <div className="form-group">
                                <label htmlFor="email" className="form-label">
                                    Correo Electrónico
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="input"
                                    placeholder="tu@email.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                    autoFocus
                                />
                            </div>

                            {error && (
                                <div className="alert alert-error" role="alert">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="btn btn-primary login-submit-btn"
                                disabled={isLoading}
                            >
                                {isLoading ? (
                                    <>
                                        <span className="spinner"></span>
                                        Enviando...
                                    </>
                                ) : (
                                    'Enviar Enlace Mágico'
                                )}
                            </button>
                        </form>

                        {/* Info */}
                        <div className="login-info">
                            <p className="text-muted text-center">
                                Te enviaremos un enlace de acceso temporal a tu correo electrónico.
                                No se requiere contraseña.
                            </p>
                        </div>
                    </>
                ) : (
                    <>
                        {/* Success State */}
                        <div className="login-success">
                            <div className="success-icon">
                                <svg
                                    width="64"
                                    height="64"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                >
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                                    <polyline points="22 4 12 14.01 9 11.01" />
                                </svg>
                            </div>

                            <h2>¡Revisa tu correo!</h2>

                            <p className="success-message">
                                Hemos enviado un enlace de acceso a <strong>{email}</strong>
                            </p>

                            <div className="alert alert-info">
                                El enlace expirará en 15 minutos por seguridad.
                            </div>

                            <button
                                type="button"
                                className="btn btn-ghost"
                                onClick={handleTryAgain}
                            >
                                Solicitar nuevo enlace
                            </button>
                        </div>
                    </>
                )}
            </div>

            {/* Footer */}
            <p className="login-footer text-muted text-center">
                BIDXAAGUI © {new Date().getFullYear()}
            </p>
        </div>
    );
};

export default Login;
