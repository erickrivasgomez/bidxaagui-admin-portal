import React from 'react';
import './LabsLayout.css';

// SVG Icons
const HomeIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

const ShoppingCartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

const TruckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
    <path d="M15 18H9" />
    <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
    <circle cx="17" cy="18" r="2" />
  </svg>
);

const SettingsIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.09a2 2 0 0 1-1-1.74v-.47a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const PlusIcon = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const UserIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

const Sidebar = ({ currentView, setView }: { currentView: string; setView: (view: string) => void }) => (
  <aside className="labs-sidebar">
    <div className="labs-logo">
      <div className="labs-logo-icon" />
      Bidxaagui Ops
    </div>
    <nav className="labs-nav">
      <a href="#" className={`labs-nav-link ${currentView === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('dashboard'); }}>
        <HomeIcon /> Dashboard
      </a>
      <a href="#" className={`labs-nav-link ${currentView === 'inventory' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('inventory'); }}>
        <PackageIcon /> Inventario
      </a>
      <a href="#" className={`labs-nav-link ${currentView === 'sales' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('sales'); }}>
        <ShoppingCartIcon /> Ventas
      </a>
      <a href="#" className={`labs-nav-link ${currentView === 'finance' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('finance'); }}>
        <CreditCardIcon /> Finanzas
      </a>
      <a href="#" className={`labs-nav-link ${currentView === 'suppliers' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('suppliers'); }}>
        <TruckIcon /> Proveedores
      </a>
      <a href="#" className={`labs-nav-link ${currentView === 'reports' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('reports'); }}>
        <BarChartIcon /> Reportes
      </a>
    </nav>
    <div className="labs-nav-footer">
      <a href="#" className="labs-nav-link"><SettingsIcon /> Configuración</a>
    </div>
  </aside>
);

interface LabsLayoutProps {
  children: React.ReactNode;
  currentView: string;
  setView: (view: string) => void;
}

export const LabsLayout: React.FC<LabsLayoutProps> = ({ children, currentView, setView }) => {
  return (
    <div className="labs-wrapper">
      <Sidebar currentView={currentView} setView={setView} />
      <main className="labs-main">
        {children}

        <nav className="labs-mobile-nav">
          <a href="#" className={`labs-nav-item ${currentView === 'dashboard' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('dashboard'); }}>
            <HomeIcon /> Inicio
          </a>
          <a href="#" className={`labs-nav-item ${currentView === 'inventory' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('inventory'); }}>
            <PackageIcon /> Stock
          </a>
          <a href="#" className="labs-nav-item labs-fab">
            <div className="labs-fab-icon"><PlusIcon /></div>
          </a>
          <a href="#" className={`labs-nav-item ${currentView === 'finance' ? 'active' : ''}`} onClick={(e) => { e.preventDefault(); setView('finance'); }}>
            <CreditCardIcon /> Cash
          </a>
          <a href="#" className="labs-nav-item"><UserIcon /> Perfil</a>
        </nav>
      </main>
    </div>
  );
};
