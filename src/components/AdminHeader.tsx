import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import '../pages/Dashboard.css'; // Reuse dashboard styles for header

interface AdminHeaderProps {
    title?: string;
}

const AdminHeader: React.FC<AdminHeaderProps> = ({ title }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isDashboard = location.pathname === '/dashboard';

    return (
        <header className="dashboard-header">
            <div className="header-content">
                <div className="header-brand-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <h1>BIDXAAGUI {title && <span style={{ opacity: 0.7, fontWeight: 'normal' }}>| {title}</span>}</h1>
                    {!isDashboard && (
                        <button
                            onClick={() => navigate('/dashboard')}
                            className="btn btn-ghost"
                            style={{
                                fontSize: '0.9rem',
                                padding: '0.4rem 1rem',
                                color: 'var(--text-light)',
                                borderColor: 'rgba(255,255,255,0.3)'
                            }}
                        >
                            ← Volver al inicio
                        </button>
                    )}
                </div>

                <div className="header-actions">
                    <span className="user-email">{user?.email}</span>
                    <button onClick={handleLogout} className="btn">
                        Cerrar Sesión
                    </button>
                </div>
            </div>
        </header>
    );
};

export default AdminHeader;
