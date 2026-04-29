import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { NavItem } from '../../hooks/useNavigation';
import './UniversalLayout.css';

interface UniversalLayoutProps {
  children: React.ReactNode;
  navigation: NavItem[];
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export const UniversalLayout: React.FC<UniversalLayoutProps> = ({
  children,
  navigation,
  user
}) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [deviceType, setDeviceType] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());

  // Device detection
  useEffect(() => {
    const detectDevice = () => {
      const width = window.innerWidth;
      if (width < 768) {
        setDeviceType('mobile');
        setSidebarOpen(false);
      } else if (width < 1024) {
        setDeviceType('tablet');
        setSidebarOpen(true);
      } else {
        setDeviceType('desktop');
        setSidebarOpen(true);
      }
    };

    detectDevice();
    window.addEventListener('resize', detectDevice);
    return () => window.removeEventListener('resize', detectDevice);
  }, []);

  const handleNavigate = (path: string) => {
    navigate(path);
    if (deviceType === 'mobile') {
      setSidebarOpen(false);
    }
  };

  const toggleExpanded = (itemId: string) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const isActivePath = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const renderNavigationItem = (item: NavItem, level = 0) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.has(item.id);
    const isActive = isActivePath(item.path);

    return (
      <div key={item.id} className={`nav-item ${isActive ? 'active' : ''}`} style={{ paddingLeft: `${level * 16 + 8}px` }}>
        <button
          className="nav-button"
          onClick={() => {
            if (hasChildren) {
              toggleExpanded(item.id);
            } else {
              handleNavigate(item.path);
            }
          }}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
          {item.badge && <span className="nav-badge">{item.badge}</span>}
          {hasChildren && (
            <svg
              className={`nav-chevron ${isExpanded ? 'expanded' : ''}`}
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="m6 9 6 6 6-6" />
            </svg>
          )}
        </button>
        
        {hasChildren && isExpanded && (
          <div className="nav-children">
            {item.children!.map(child => renderNavigationItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`universal-layout device-${deviceType}`}>
      {/* Mobile Header */}
      {deviceType === 'mobile' && (
        <header className="mobile-header">
          <button
            className="menu-toggle"
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 12h18M3 6h18M3 18h18" />
            </svg>
          </button>
          
          <div className="mobile-logo">
            <div className="logo-icon">B</div>
            <span>Bidxaagui</span>
          </div>
          
          <div className="mobile-user">
            <button className="user-avatar">
              {user?.avatar ? (
                <img src={user.avatar} alt={user.name} />
              ) : (
                <span>{user?.name?.[0] || 'A'}</span>
              )}
            </button>
          </div>
        </header>
      )}

      {/* Desktop/Tablet Header */}
      {(deviceType === 'desktop' || deviceType === 'tablet') && (
        <header className="desktop-header">
          <div className="header-left">
            <div className="logo">
              <div className="logo-icon">B</div>
              <span>Bidxaagui Admin</span>
            </div>
          </div>
          
          <div className="header-center">
            <div className="search-bar">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.35-4.35" />
              </svg>
              <input type="text" placeholder="Buscar..." />
            </div>
          </div>
          
          <div className="header-right">
            <button className="header-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            
            <button className="header-button">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            </button>
            
            <div className="user-menu">
              <button className="user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{user?.name?.[0] || 'A'}</span>
                )}
              </button>
            </div>
          </div>
        </header>
      )}

      {/* Sidebar Overlay for Mobile */}
      {deviceType === 'mobile' && sidebarOpen && (
        <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'open' : ''} device-${deviceType}`}>
        <nav className="sidebar-nav">
          {navigation.map(item => renderNavigationItem(item))}
        </nav>
        
        {deviceType === 'desktop' && (
          <div className="sidebar-footer">
            <div className="user-info">
              <div className="user-avatar">
                {user?.avatar ? (
                  <img src={user.avatar} alt={user.name} />
                ) : (
                  <span>{user?.name?.[0] || 'A'}</span>
                )}
              </div>
              <div className="user-details">
                <div className="user-name">{user?.name || 'Admin'}</div>
                <div className="user-email">{user?.email || 'admin@bidxaagui.com'}</div>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={`main-content ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="content-wrapper">
          {children}
        </div>
      </main>

      {/* Mobile Tab Bar */}
      {deviceType === 'mobile' && (
        <nav className="mobile-tab-bar">
          {navigation.slice(0, 4).map(item => (
            <button
              key={item.id}
              className={`tab-item ${isActivePath(item.path) ? 'active' : ''}`}
              onClick={() => handleNavigate(item.path)}
            >
              <span className="tab-icon">{item.icon}</span>
              <span className="tab-label">{item.label}</span>
            </button>
          ))}
        </nav>
      )}
    </div>
  );
};
