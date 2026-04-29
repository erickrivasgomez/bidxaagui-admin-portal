import React, { useState, useEffect, createContext, useContext } from 'react';
import { useTheme } from '../../hooks/useTheme';
import './Toast.css';

// Toast Types
export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  persistent?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

// Toast Context
interface ToastContextType {
  toasts: ToastMessage[];
  addToast: (toast: Omit<ToastMessage, 'id'>) => string;
  removeToast: (id: string) => void;
  clearToasts: () => void;
  success: (title: string, description?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'description'>>) => void;
  error: (title: string, description?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'description'>>) => void;
  warning: (title: string, description?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'description'>>) => void;
  info: (title: string, description?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'description'>>) => void;
}

const ToastContext = createContext<ToastContextType | null>(null);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

// Toast Provider
export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (toast: Omit<ToastMessage, 'id'>): string => {
    const id = Math.random().toString(36).substr(2, 9);
    const newToast: ToastMessage = { ...toast, id };
    
    setToasts(prev => [...prev, newToast]);
    
    // Auto-remove after duration
    if (!toast.persistent && toast.duration !== 0) {
      const duration = toast.duration || 5000;
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  };

  const clearToasts = () => {
    setToasts([]);
  };

  // Convenience methods
  const success = (title: string, description?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'description'>>) => {
    addToast({ type: 'success', title, description, ...options });
  };

  const error = (title: string, description?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'description'>>) => {
    addToast({ type: 'error', title, description, duration: 0, ...options }); // Errors are persistent by default
  };

  const warning = (title: string, description?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'description'>>) => {
    addToast({ type: 'warning', title, description, ...options });
  };

  const info = (title: string, description?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'description'>>) => {
    addToast({ type: 'info', title, description, ...options });
  };

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast, clearToasts, success, error, warning, info }}>
      {children}
      <ToastContainer />
    </ToastContext.Provider>
  );
};

// Toast Container
const ToastContainer: React.FC = () => {
  const { toasts } = useToast();
  const { isDark } = useTheme();

  return (
    <div className={`toast-container ${isDark ? 'dark' : 'light'}`}>
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
};

// Individual Toast Item
interface ToastItemProps {
  toast: ToastMessage;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast }) => {
  const { removeToast } = useToast();
  const [isExiting, setIsExiting] = useState(false);

  const handleRemove = () => {
    setIsExiting(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300); // Match exit animation duration
  };

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
          </svg>
        );
      case 'error':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        );
      case 'warning':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        );
      case 'info':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
        );
    }
  };

  return (
    <div 
      className={`toast toast-${toast.type} ${isExiting ? 'exiting' : ''}`}
      role="alert"
      aria-live="polite"
    >
      <div className="toast-icon">
        {getIcon()}
      </div>
      
      <div className="toast-content">
        <div className="toast-title">{toast.title}</div>
        {toast.description && (
          <div className="toast-description">{toast.description}</div>
        )}
      </div>
      
      <div className="toast-actions">
        {toast.action && (
          <button 
            className="toast-action-btn"
            onClick={() => {
              toast.action!.onClick();
              handleRemove();
            }}
          >
            {toast.action.label}
          </button>
        )}
        
        <button 
          className="toast-close-btn"
          onClick={handleRemove}
          title="Dismiss"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
};

// Convenience functions for common toast types
export const toast = {
  success: (title: string, description?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'description'>>) => {
    const { addToast } = React.useContext(ToastContext) || { addToast: () => '' };
    return addToast({ type: 'success', title, description, ...options });
  },
  
  error: (title: string, description?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'description'>>) => {
    const { addToast } = React.useContext(ToastContext) || { addToast: () => '' };
    return addToast({ type: 'error', title, description, duration: 0, ...options }); // Errors are persistent by default
  },
  
  warning: (title: string, description?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'description'>>) => {
    const { addToast } = React.useContext(ToastContext) || { addToast: () => '' };
    return addToast({ type: 'warning', title, description, ...options });
  },
  
  info: (title: string, description?: string, options?: Partial<Omit<ToastMessage, 'id' | 'type' | 'title' | 'description'>>) => {
    const { addToast } = React.useContext(ToastContext) || { addToast: () => '' };
    return addToast({ type: 'info', title, description, ...options });
  }
};
