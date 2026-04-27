import React from 'react';
import './AppInspector.css';

interface AppInspectorProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}

export const AppInspector: React.FC<AppInspectorProps> = ({ isOpen, onClose, title, children, footer }) => {
  if (!isOpen) return null;

  return (
    <aside className={`app-inspector ${isOpen ? 'open' : ''}`}>
      <div className="inspector-header">
        <h2 className="inspector-title">{title}</h2>
        <button className="inspector-close" onClick={onClose}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 6L6 18" />
            <path d="M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="inspector-content">
        {children}
      </div>
      {footer && <div className="inspector-footer">{footer}</div>}
    </aside>
  );
};
