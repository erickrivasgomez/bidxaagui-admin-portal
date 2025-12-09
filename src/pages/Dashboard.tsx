import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user, logout } = useAuthStore();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-container">
            {/* Header */}
            <header className="dashboard-header">
                <div className="header-content">
                    <h1>BIDXAAGUI</h1>
                    <div className="header-actions">
                        <span className="user-email">{user?.email}</span>
                        <button onClick={handleLogout} className="btn btn-ghost">
                            Cerrar Sesión
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="dashboard-main">
                <div className="container">
                    <div className="welcome-section fade-in">
                        <h2>¡Bienvenido, {user?.name || 'Administrador'}!</h2>
                        <p className="text-muted">
                            Panel de administración de BIDXAAGUI
                        </p>
                    </div>

                    {/* Dashboard Cards */}
                    <div className="dashboard-grid">
                        <div
                            className="dashboard-card card clickable"
                            onClick={() => navigate('/subscribers')}
                        >
                            <h3>📧 Suscriptores</h3>
                            <p className="card-value">✓ Activo</p>
                            <p className="text-muted">Gestionar suscriptores</p>
                        </div>

                        <div className="dashboard-card card">
                            <h3>📚 Ediciones</h3>
                            <p className="card-value">-</p>
                            <p className="text-muted">Próximamente</p>
                        </div>

                        <div className="dashboard-card card">
                            <h3>✉️ Campañas</h3>
                            <p className="card-value">-</p>
                            <p className="text-muted">Próximamente</p>
                        </div>
                    </div>

                    {/* Info Box */}
                    <div className="info-box card mt-xl">
                        <h3>🎯 Próximos pasos</h3>
                        <ul className="info-list">
                            <li>✅ Autenticación implementada</li>
                            <li>✅ Gestión de suscriptores (completa)</li>
                            <li>⏳ Gestión de ediciones (en desarrollo)</li>
                            <li>⏳ Editor de emails (en desarrollo)</li>
                        </ul>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
