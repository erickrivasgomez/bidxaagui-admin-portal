import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AdminHeader from '../components/AdminHeader';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    return (
        <div className="dashboard-container">
            <AdminHeader />

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

                        <div
                            className="dashboard-card card clickable"
                            onClick={() => navigate('/editions')}
                        >
                            <h3>📚 Ediciones</h3>
                            <p className="card-value">-</p>
                            <p className="text-muted">Próximamente</p>
                        </div>

                        <div
                            className="dashboard-card card clickable"
                            onClick={() => navigate('/campaigns')}
                        >
                            <h3>✉️ Campañas</h3>
                            <p className="card-value">-</p>
                            <p className="text-muted">Próximamente</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
