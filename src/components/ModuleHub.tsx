import React from 'react';
import './ModuleHub.css';

export interface ModuleCard {
  id: string;
  title: string;
  icon: string;
  description: string;
  status: 'active' | 'coming-soon';
  onClick: () => void;
}

interface ModuleHubProps {
  title: string;
  description: string;
  modules: ModuleCard[];
}

/**
 * ModuleHub Component
 * Dumb component for displaying module cards
 * Framework-agnostic, receives all data via props
 */
export const ModuleHub: React.FC<ModuleHubProps> = ({ title, description, modules }) => {
  return (
    <div className="module-hub">
      <div className="module-hub-header">
        <h2>{title}</h2>
        <p className="text-muted">{description}</p>
      </div>
      <div className="module-hub-grid">
        {modules.map((module) => (
          <div
            key={module.id}
            className={`module-card ${module.status === 'coming-soon' ? 'coming-soon' : 'clickable'}`}
            onClick={module.status === 'active' ? module.onClick : undefined}
          >
            <div className="module-card-icon">{module.icon}</div>
            <h3>{module.title}</h3>
            <p className={`module-card-status ${module.status}`}>
              {module.status === 'active' ? '✓ Activo' : 'Próximamente'}
            </p>
            <p className="text-muted">{module.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
