import React from 'react';
import './AppCanvas.css';

interface AppCanvasProps {
  children: React.ReactNode;
  title?: string;
  actions?: React.ReactNode;
  header?: React.ReactNode;
}

export const AppCanvas: React.FC<AppCanvasProps> = ({ children, title, actions, header }) => {
  return (
    <main className="app-canvas">
      {(title || actions || header) && (
        <header className="canvas-header">
          {header || (
            <>
              {title && <h1 className="canvas-title">{title}</h1>}
              {actions && <div className="canvas-actions">{actions}</div>}
            </>
          )}
        </header>
      )}
      <div className="canvas-content">
        {children}
      </div>
    </main>
  );
};
