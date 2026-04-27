import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ModuleHub, ModuleCard } from '../components/ModuleHub';
import AdminHeader from '../components/AdminHeader';

const AntroponomadasHub: React.FC = () => {
  const navigate = useNavigate();

  const subModules: ModuleCard[] = [
    {
      id: 'editions',
      title: 'Ediciones',
      icon: '📚',
      description: 'Gestionar ediciones de la revista',
      status: 'active',
      onClick: () => navigate('/antroponomadas/editions'),
    },
    {
      id: 'campaigns',
      title: 'Campañas',
      icon: '✉️',
      description: 'Gestionar campañas de email',
      status: 'active',
      onClick: () => navigate('/antroponomadas/campaigns'),
    },
    {
      id: 'subscribers',
      title: 'Suscriptores',
      icon: '📧',
      description: 'Gestionar suscriptores',
      status: 'active',
      onClick: () => navigate('/antroponomadas/subscribers'),
    },
  ];

  return (
    <div className="dashboard-container">
      <AdminHeader />
      <main className="dashboard-main">
        <div className="container">
          <ModuleHub
            title="Antroponómadas"
            description="Gestión editorial y de suscriptores"
            modules={subModules}
          />
        </div>
      </main>
    </div>
  );
};

export default AntroponomadasHub;
