import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ModuleHub, ModuleCard } from '../components/ModuleHub';
import AdminHeader from '../components/AdminHeader';

const LabHub: React.FC = () => {
  const navigate = useNavigate();

  const subModules: ModuleCard[] = [
    {
      id: 'proveedores',
      title: 'Proveedores',
      icon: '🚚',
      description: 'Gestionar proveedores',
      status: 'active',
      onClick: () => navigate('/lab/proveedores'),
    },
    {
      id: 'compras',
      title: 'Compras',
      icon: '🛒',
      description: 'Gestionar compras',
      status: 'coming-soon',
      onClick: () => {},
    },
    {
      id: 'ventas',
      title: 'Ventas',
      icon: '💰',
      description: 'Gestionar ventas',
      status: 'coming-soon',
      onClick: () => {},
    },
    {
      id: 'colegas',
      title: 'Colegas',
      icon: '👥',
      description: 'Gestionar colegas',
      status: 'coming-soon',
      onClick: () => {},
    },
    {
      id: 'tinturas',
      title: 'Tinturas',
      icon: '🧪',
      description: 'Gestionar tinturas',
      status: 'coming-soon',
      onClick: () => {},
    },
  ];

  return (
    <div className="dashboard-container">
      <AdminHeader />
      <main className="dashboard-main">
        <div className="container">
          <ModuleHub
            title="Laboratorio"
            description="Gestión de operaciones"
            modules={subModules}
          />
        </div>
      </main>
    </div>
  );
};

export default LabHub;
