import React from 'react';
import './ContentCard.css';

interface ActionItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  disabled?: boolean;
}

interface ContentCardProps {
  title: string | number;
  subtitle?: string;
  description?: string;
  actions?: ActionItem[];
  density?: 'compact' | 'normal';
  onClick?: () => void;
  icon?: React.ReactNode;
  badge?: string | number;
  status?: 'active' | 'inactive' | 'pending' | 'error' | 'success' | 'primary' | 'secondary' | 'warning' | 'danger';
  children?: React.ReactNode;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  subtitle,
  description,
  actions = [],
  density = 'normal',
  onClick,
  icon,
  badge,
  status = 'active',
  children
}) => {
  const cardClasses = [
    'content-card',
    `density-${density}`,
    `status-${status}`,
    onClick ? 'clickable' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={cardClasses} onClick={onClick}>
      <div className="card-header">
        {icon && <div className="card-icon">{icon}</div>}
        <div className="card-title-section">
          <h3 className="card-title">{title}</h3>
          {subtitle && <div className="card-subtitle">{subtitle}</div>}
        </div>
        {badge && <div className="card-badge">{badge}</div>}
      </div>
      
      {description && (
        <div className="card-description">
          <p>{description}</p>
        </div>
      )}
      
      {children && (
        <div className="card-content">
          {children}
        </div>
      )}
      
      {actions.length > 0 && (
        <div className="card-actions">
          {actions.map(action => (
            <button
              key={action.id}
              className={`action-button variant-${action.variant || 'secondary'}`}
              onClick={(e) => {
                e.stopPropagation();
                action.onClick();
              }}
            >
              {action.icon && <span className="action-icon">{action.icon}</span>}
              <span className="action-label">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
