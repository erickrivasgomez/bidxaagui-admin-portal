import React from 'react';
import { UniversalLayout } from '../components/layout/UniversalLayout';
import { useNavigation } from '../hooks/useNavigation';
import { useAuthStore } from '../store/authStore';
import { ContentCard } from '../components/ui/ContentCard';
import './NewDashboard.css';

const NewDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { navigationItems, handleNavigate, isActivePath } = useNavigation();

  const quickActions = [
    {
      id: 'new-edition',
      title: 'Nueva Edición',
      description: 'Crear una nueva edición de la revista',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
          <polyline points="14,2 14,8 20,8" />
          <line x1="12" y1="18" x2="12" y2="12" />
          <line x1="9" y1="15" x2="15" y2="15" />
        </svg>
      ),
      onClick: () => handleNavigate('/antroponomadas/editions?action=new')
    },
    {
      id: 'new-campaign',
      title: 'Nueva Campaña',
      description: 'Lanzar una campaña de email',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect width="20" height="16" x="2" y="4" rx="2" />
          <path d="m22 7-10 5L2 7" />
        </svg>
      ),
      onClick: () => handleNavigate('/antroponomadas/campaigns?action=new')
    },
    {
      id: 'add-supplier',
      title: 'Agregar Proveedor',
      description: 'Registrar un nuevo proveedor',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v8M8 12h8" />
        </svg>
      ),
      onClick: () => handleNavigate('/lab/proveedores?action=new')
    },
    {
      id: 'view-reports',
      title: 'Ver Reportes',
      description: 'Análisis y métricas del negocio',
      icon: (
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="18" y1="20" x2="18" y2="10" />
          <line x1="12" y1="20" x2="12" y2="4" />
          <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
      ),
      onClick: () => handleNavigate('/lab/reportes')
    }
  ];

  const recentActivity = [
    {
      id: '1',
      title: 'Edición #15 Publicada',
      description: 'La edición más reciente está ahora disponible',
      status: 'completed' as const,
      time: 'Hace 2 horas'
    },
    {
      id: '2',
      title: 'Campaña de Primavera',
      description: 'Enviada a 1,234 suscriptores',
      status: 'active' as const,
      time: 'Hace 5 horas'
    },
    {
      id: '3',
      title: 'Nuevo Proveedor',
      description: 'Laboratorios XYZ agregado al sistema',
      status: 'pending' as const,
      time: 'Ayer'
    }
  ];

  return (
    <UniversalLayout
      navigation={navigationItems}
      user={{
        name: user?.name || 'Administrador',
        email: user?.email || 'admin@bidxaagui.com',
        avatar: user?.avatar
      }}
    >
      <div className="new-dashboard">
        <div className="dashboard-header">
          <h1>Bienvenido, {user?.name || 'Administrador'}</h1>
          <p>Panel de administración de BIDXAAGUI</p>
        </div>

        <div className="dashboard-grid">
          {/* Quick Actions */}
          <section className="dashboard-section">
            <h2>Acciones Rápidas</h2>
            <div className="quick-actions-grid">
              {quickActions.map(action => (
                <ContentCard
                  key={action.id}
                  title={action.title}
                  description={action.description}
                  icon={action.icon}
                  onClick={action.onClick}
                  density="compact"
                />
              ))}
            </div>
          </section>

          {/* Recent Activity */}
          <section className="dashboard-section">
            <h2>Actividad Reciente</h2>
            <div className="activity-list">
              {recentActivity.map(activity => (
                <ContentCard
                  key={activity.id}
                  title={activity.title}
                  description={activity.description}
                  status={activity.status}
                  density="compact"
                  actions={[
                    {
                      id: 'view',
                      label: 'Ver',
                      onClick: () => console.log('View activity:', activity.id)
                    }
                  ]}
                />
              ))}
            </div>
          </section>

          {/* Stats Overview */}
          <section className="dashboard-section">
            <h2>Resumen</h2>
            <div className="stats-grid">
              <ContentCard
                title="15"
                subtitle="Ediciones Publicadas"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                    <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
                  </svg>
                }
                density="compact"
              />
              <ContentCard
                title="2,847"
                subtitle="Suscriptores Activos"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                }
                density="compact"
              />
              <ContentCard
                title="23"
                subtitle="Proveedores"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                  </svg>
                }
                density="compact"
              />
              <ContentCard
                title="89%"
                subtitle="Tasa de Apertura"
                icon={
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
                  </svg>
                }
                density="compact"
              />
            </div>
          </section>
        </div>
      </div>
    </UniversalLayout>
  );
};

export default NewDashboard;
