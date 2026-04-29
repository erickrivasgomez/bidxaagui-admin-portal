import React, { useState, useEffect } from 'react';
import { useTheme } from '../../hooks/useTheme';
import './Inspector.css';

interface InspectorProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  mode?: 'view' | 'edit' | 'create';
  entity?: any;
  children: React.ReactNode;
  actions?: React.ReactNode;
  width?: number;
  resizable?: boolean;
}

export const Inspector: React.FC<InspectorProps> = ({
  isOpen,
  onClose,
  title,
  mode = 'view',
  // entity: any,
  children,
  actions,
  width = 400,
  resizable = true
}) => {
  const { isDark } = useTheme();
  const [inspectorWidth, setInspectorWidth] = useState(width);
  const [isResizing, setIsResizing] = useState(false);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Handle resize
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!resizable) return;
    
    setIsResizing(true);
    e.preventDefault();
    
    const startX = e.clientX;
    const startWidth = inspectorWidth;

    const handleMouseMove = (e: MouseEvent) => {
      const deltaX = startX - e.clientX;
      const newWidth = Math.min(800, Math.max(300, startWidth + deltaX));
      setInspectorWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`inspector-backdrop ${isDark ? 'dark' : 'light'}`}
        onClick={handleBackdropClick}
      />
      
      {/* Inspector Panel */}
      <div 
        className={`inspector-panel ${isDark ? 'dark' : 'light'} ${mode}`}
        style={{ width: `${inspectorWidth}px` }}
      >
        {/* Header */}
        <div className="inspector-header">
          <div className="inspector-title-section">
            <h2 className="inspector-title">{title}</h2>
            {mode === 'edit' && (
              <span className="inspector-mode-badge edit">Editando</span>
            )}
            {mode === 'create' && (
              <span className="inspector-mode-badge create">Nuevo</span>
            )}
          </div>
          
          <button 
            className="inspector-close-btn"
            onClick={onClose}
            title="Cerrar (Esc)"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="inspector-content">
          {children}
        </div>

        {/* Footer Actions */}
        {actions && (
          <div className="inspector-footer">
            {actions}
          </div>
        )}

        {/* Resize Handle */}
        {resizable && (
          <div 
            className={`inspector-resize-handle ${isResizing ? 'active' : ''}`}
            onMouseDown={handleMouseDown}
            title="Arrastrar para redimensionar"
          >
            <svg width="4" height="16" viewBox="0 0 4 16" fill="currentColor">
              <circle cx="2" cy="2" r="1" />
              <circle cx="2" cy="6" r="1" />
              <circle cx="2" cy="10" r="1" />
              <circle cx="2" cy="14" r="1" />
            </svg>
          </div>
        )}
      </div>
    </>
  );
};
