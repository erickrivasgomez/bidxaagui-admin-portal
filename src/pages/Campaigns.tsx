import React from 'react';
import AdminHeader from '../components/AdminHeader';
import './Dashboard.css'; // Reusing dashboard styles for consistency

const Campaigns: React.FC = () => {
    return (
        <div className="dashboard-container">
            <AdminHeader />
            <main className="dashboard-main">
                <div className="container">
                    <div className="welcome-section fade-in">
                        <h2>✉️ Campañas</h2>
                        <p className="text-muted">Gestión de envíos y newsletter</p>
                    </div>
                    {/* Placeholder content */}
                    <div className="info-box" style={{ textAlign: 'center', marginTop: '2rem' }}>
                        <h3>Próximamente</h3>
                        <p className="text-muted">Este módulo está en construcción.</p>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Campaigns;
