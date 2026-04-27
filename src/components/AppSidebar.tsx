import React, { useState } from 'react';
import './AppSidebar.css';

export interface SidebarSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  items: SidebarItem[];
  defaultOpen?: boolean;
}

export interface SidebarItem {
  id: string;
  label: string;
  path: string;
  icon?: React.ReactNode;
  badge?: number;
}

interface AppSidebarProps {
  sections: SidebarSection[];
  activePath?: string;
  onNavigate: (path: string) => void;
}

export const AppSidebar: React.FC<AppSidebarProps> = ({ sections, activePath, onNavigate }) => {
  const [openSections, setOpenSections] = useState<Set<string>>(
    new Set(sections.filter(s => s.defaultOpen).map(s => s.id))
  );

  const toggleSection = (sectionId: string) => {
    const newOpen = new Set(openSections);
    if (newOpen.has(sectionId)) {
      newOpen.delete(sectionId);
    } else {
      newOpen.add(sectionId);
    }
    setOpenSections(newOpen);
  };

  return (
    <aside className="app-sidebar">
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2L2 7l10 5 10-5-10-5z" />
            <path d="M2 17l10 5 10-5" />
            <path d="M2 12l10 5 10-5" />
          </svg>
          <span>Bidxaagui</span>
        </div>
      </div>

      <nav className="sidebar-nav">
        {sections.map(section => (
          <div key={section.id} className="sidebar-section">
            <button
              className={`sidebar-section-header ${openSections.has(section.id) ? 'open' : ''}`}
              onClick={() => toggleSection(section.id)}
            >
              <span className="section-icon">{section.icon}</span>
              <span className="section-title">{section.title}</span>
              <svg
                className={`section-chevron ${openSections.has(section.id) ? 'open' : ''}`}
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>

            {openSections.has(section.id) && (
              <div className="sidebar-section-items">
                {section.items.map(item => (
                  <button
                    key={item.id}
                    className={`sidebar-item ${activePath === item.path ? 'active' : ''}`}
                    onClick={() => onNavigate(item.path)}
                  >
                    {item.icon && <span className="item-icon">{item.icon}</span>}
                    <span className="item-label">{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="item-badge">{item.badge}</span>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-user">
          <div className="user-avatar">A</div>
          <div className="user-info">
            <div className="user-name">Admin</div>
            <div className="user-role">Super Admin</div>
          </div>
        </div>
      </div>
    </aside>
  );
};
