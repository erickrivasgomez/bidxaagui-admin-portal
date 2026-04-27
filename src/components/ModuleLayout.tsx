import React from 'react';
import './ModuleLayout.css';

export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon?: string;
}

interface ModuleLayoutProps {
  title: string;
  navigation: NavigationItem[];
  children: React.ReactNode;
  onNavigate: (path: string) => void;
  currentPath: string;
  deviceType: 'ios' | 'ipad' | 'desktop';
}

/**
 * ModuleLayout Component
 * Dumb component for adaptive layout based on device type
 * - iOS: Navigation Controller (header + back button)
 * - iPad: Tab bar + Split View
 * - Desktop: Sidebar persistente + Content area
 */
export const ModuleLayout: React.FC<ModuleLayoutProps> = ({
  title,
  navigation,
  children,
  onNavigate,
  currentPath,
  deviceType,
}) => {
  const renderNavigation = () => {
    switch (deviceType) {
      case 'ios':
        return (
          <div className="module-layout-ios-nav">
            <button className="back-button" onClick={() => onNavigate('/dashboard')}>
              ← Volver
            </button>
            <h1 className="module-title">{title}</h1>
          </div>
        );
      case 'ipad':
        return (
          <div className="module-layout-ipad-nav">
            <div className="tab-bar">
              {navigation.map((item) => (
                <button
                  key={item.id}
                  className={`tab-item ${currentPath === item.path ? 'active' : ''}`}
                  onClick={() => onNavigate(item.path)}
                >
                  {item.icon && <span className="tab-icon">{item.icon}</span>}
                  <span className="tab-label">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        );
      case 'desktop':
        return (
          <div className="module-layout-desktop-nav">
            <div className="sidebar">
              <div className="sidebar-header">
                <h2>{title}</h2>
              </div>
              <nav className="sidebar-nav">
                {navigation.map((item) => (
                  <button
                    key={item.id}
                    className={`nav-item ${currentPath === item.path ? 'active' : ''}`}
                    onClick={() => onNavigate(item.path)}
                  >
                    {item.icon && <span className="nav-icon">{item.icon}</span>}
                    <span className="nav-label">{item.label}</span>
                  </button>
                ))}
              </nav>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className={`module-layout module-layout-${deviceType}`}>
      {renderNavigation()}
      <div className="module-content">{children}</div>
    </div>
  );
};
