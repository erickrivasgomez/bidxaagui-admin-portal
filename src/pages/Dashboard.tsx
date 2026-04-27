import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import AdminHeader from '../components/AdminHeader';
import { ModuleHub, ModuleCard } from '../components/ModuleHub';
import './Dashboard.css';

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();

    const mainModules: ModuleCard[] = [
        {
            id: 'antroponomadas',
            title: 'Antroponómadas',
            icon: '📚',
            description: 'Gestión editorial: Ediciones, Campañas, Suscriptores',
            status: 'active',
            onClick: () => navigate('/antroponomadas'),
        },
        {
            id: 'lab',
            title: 'Laboratorio',
            icon: '🧪',
            description: 'Gestión de operaciones: Proveedores, Compras, Ventas',
            status: 'active',
            onClick: () => navigate('/lab'),
        },
    ];

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

                    {/* Main Modules */}
                    <ModuleHub
                        title="Módulos Principales"
                        description="Selecciona un módulo para comenzar"
                        modules={mainModules}
                    />
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
