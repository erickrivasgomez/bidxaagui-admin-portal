import React from 'react';
import { useTheme } from '../../hooks/useTheme';
import './DataStates.css';

// Data State Types
export interface DataState<T = any> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  empty: boolean;
  refreshing?: boolean;
}

export interface EmptyStateProps {
  type: 'no-data' | 'no-results' | 'network-error' | 'permission-error' | 'server-error';
  title: string;
  description: string;
  primaryAction?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  illustration?: React.ReactNode;
}

export interface LoadingStateProps {
  type: 'table' | 'card' | 'list' | 'form';
  rows?: number;
  showHeader?: boolean;
  height?: string;
}

export interface ErrorStateProps {
  error: {
    code: string;
    message: string;
    details?: any;
    recoverable: boolean;
  };
  onRetry?: () => void;
  onReport?: () => void;
  onContact?: () => void;
}

// Empty State Component
export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  primaryAction,
  secondaryAction,
  illustration
}) => {
  const { getStatusColor } = useTheme();

  const getDefaultIcon = () => {
    switch (type) {
      case 'no-data':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="20" height="16" x="2" y="4" rx="2" />
            <path d="m22 7-10 5L2 7" />
          </svg>
        );
      case 'no-results':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
        );
      case 'network-error':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L2.34 18c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'permission-error':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="16" r="1" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
      case 'server-error':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        );
      default:
        return null;
    }
  };

  const getStatusVariant = () => {
    switch (type) {
      case 'no-data': return 'info';
      case 'no-results': return 'secondary';
      case 'network-error': return 'warning';
      case 'permission-error': return 'danger';
      case 'server-error': return 'danger';
      default: return 'info';
    }
  };

  return (
    <div className="empty-state">
      <div className="empty-icon">
        {illustration || getDefaultIcon()}
      </div>
      <h3 className="empty-title">{title}</h3>
      <p className="empty-description">{description}</p>
      
      <div className="empty-actions">
        {primaryAction && (
          <button 
            className={`btn-${getStatusVariant() === 'danger' ? 'secondary' : getStatusVariant()}`}
            onClick={primaryAction.onClick}
          >
            {primaryAction.icon && <span className="action-icon">{primaryAction.icon}</span>}
            {primaryAction.label}
          </button>
        )}
        {secondaryAction && (
          <button className="btn-ghost" onClick={secondaryAction.onClick}>
            {secondaryAction.label}
          </button>
        )}
      </div>
    </div>
  );
};

// Loading State Component
export const LoadingState: React.FC<LoadingStateProps> = ({
  type,
  rows = 5,
  showHeader = true,
  height = 'auto'
}) => {
  const renderTableSkeleton = () => (
    <div className="skeleton-table" style={{ height }}>
      {showHeader && (
        <div className="skeleton-header">
          <div className="skeleton-cell skeleton-title" />
          <div className="skeleton-cell skeleton-title" />
          <div className="skeleton-cell skeleton-title" />
          <div className="skeleton-cell skeleton-title" />
          <div className="skeleton-cell skeleton-button" />
        </div>
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-row">
          <div className="skeleton-cell skeleton-avatar" />
          <div className="skeleton-cell skeleton-title" />
          <div className="skeleton-cell skeleton-text" />
          <div className="skeleton-cell skeleton-text" />
          <div className="skeleton-cell skeleton-button" />
        </div>
      ))}
    </div>
  );

  const renderCardSkeleton = () => (
    <div className="skeleton-cards" style={{ height }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-card">
          <div className="skeleton-header" />
          <div className="skeleton-content" />
          <div className="skeleton-actions" />
        </div>
      ))}
    </div>
  );

  const renderListSkeleton = () => (
    <div className="skeleton-list" style={{ height }}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="skeleton-list-item">
          <div className="skeleton-avatar" />
          <div className="skeleton-content">
            <div className="skeleton-title" />
            <div className="skeleton-text" />
          </div>
          <div className="skeleton-actions" />
        </div>
      ))}
    </div>
  );

  const renderFormSkeleton = () => (
    <div className="skeleton-form" style={{ height }}>
      <div className="skeleton-form-group">
        <div className="skeleton-label" />
        <div className="skeleton-input" />
      </div>
      <div className="skeleton-form-group">
        <div className="skeleton-label" />
        <div className="skeleton-input" />
      </div>
      <div className="skeleton-form-group">
        <div className="skeleton-label" />
        <div className="skeleton-textarea" />
      </div>
      <div className="skeleton-form-actions">
        <div className="skeleton-button" />
        <div className="skeleton-button" />
      </div>
    </div>
  );

  switch (type) {
    case 'table':
      return renderTableSkeleton();
    case 'card':
      return renderCardSkeleton();
    case 'list':
      return renderListSkeleton();
    case 'form':
      return renderFormSkeleton();
    default:
      return renderTableSkeleton();
  }
};

// Error State Component
export const ErrorState: React.FC<ErrorStateProps> = ({
  error,
  onRetry,
  onReport,
  onContact
}) => {
  const getErrorIcon = () => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L2.34 18c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'PERMISSION_ERROR':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="10" rx="2" />
            <circle cx="12" cy="16" r="1" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        );
      case 'VALIDATION_ERROR':
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      default:
        return (
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
    }
  };

  const getErrorTitle = () => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'Error de Conexión';
      case 'PERMISSION_ERROR':
        return 'Acceso Denegado';
      case 'VALIDATION_ERROR':
        return 'Datos Inválidos';
      case 'SERVER_ERROR':
        return 'Error del Servidor';
      default:
        return 'Error Inesperado';
    }
  };

  const getErrorDescription = () => {
    switch (error.code) {
      case 'NETWORK_ERROR':
        return 'No se pudo conectar con el servidor. Por favor, verifica tu conexión a internet.';
      case 'PERMISSION_ERROR':
        return 'No tienes permisos para realizar esta acción. Contacta al administrador.';
      case 'VALIDATION_ERROR':
        return 'Los datos proporcionados no son válidos. Por favor, revisa el formulario.';
      case 'SERVER_ERROR':
        return 'Ocurrió un error en el servidor. Por favor, intenta nuevamente más tarde.';
      default:
        return error.message || 'Ocurrió un error inesperado. Por favor, intenta nuevamente.';
    }
  };

  return (
    <div className="error-state">
      <div className="error-icon">
        {getErrorIcon()}
      </div>
      <h3 className="error-title">{getErrorTitle()}</h3>
      <p className="error-description">{getErrorDescription()}</p>
      
      {error.details && (
        <details className="error-details">
          <summary>Detalles técnicos</summary>
          <pre>{JSON.stringify(error.details, null, 2)}</pre>
        </details>
      )}
      
      <div className="error-actions">
        {error.recoverable && onRetry && (
          <button className="btn-primary" onClick={onRetry}>
            Reintentar
          </button>
        )}
        {onReport && (
          <button className="btn-ghost" onClick={onReport}>
            Reportar Error
          </button>
        )}
        {onContact && (
          <button className="btn-ghost" onClick={onContact}>
            Contactar Soporte
          </button>
        )}
      </div>
    </div>
  );
};

// Data State Wrapper Component
interface DataStateWrapperProps<T> {
  state: DataState<T>;
  type?: 'table' | 'card' | 'list' | 'form';
  emptyState?: Omit<EmptyStateProps, 'type'>;
  loadingComponent?: React.ReactNode;
  errorComponent?: React.ReactNode;
  children: (data: T[]) => React.ReactNode;
}

export const DataStateWrapper = <T,>({
  state,
  type = 'table',
  emptyState,
  loadingComponent,
  errorComponent,
  children
}: DataStateWrapperProps<T>) => {
  if (state.loading && !state.refreshing) {
    return loadingComponent || <LoadingState type={type} />;
  }

  if (state.error) {
    if (errorComponent) return errorComponent;
    
    return (
      <ErrorState
        error={{
          code: 'UNKNOWN_ERROR',
          message: state.error,
          recoverable: true
        }}
        onRetry={() => window.location.reload()}
      />
    );
  }

  if (state.empty || !state.data || state.data.length === 0) {
    if (emptyState) {
      return (
        <EmptyState
          type="no-data"
          title={emptyState.title}
          description={emptyState.description}
          primaryAction={emptyState.primaryAction}
          secondaryAction={emptyState.secondaryAction}
          illustration={emptyState.illustration}
        />
      );
    }

    return (
      <EmptyState
        type="no-data"
        title="No hay datos disponibles"
        description="No se encontraron elementos para mostrar."
      />
    );
  }

  return <>{children(state.data)}</>;
};
