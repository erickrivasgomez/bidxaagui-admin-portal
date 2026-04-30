import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

interface ManagementLayoutProps {
  children?: React.ReactNode;
}

/**
 * ManagementLayout - Layout de 3 Paneles para el módulo /management
 * Sigue estrictamente el UI/UX Standard:
 * - Panel 1: Sidebar 260px fijo (Desktop) / Drawer (Mobile <390px)
 * - Panel 2: Canvas con max-width 1400px centrado
 * - Panel 3: Inspector 450px fijo (Desktop) / Full-Screen Sheet (Mobile)
 */
export const ManagementLayout: React.FC<ManagementLayoutProps> = ({ children }) => {
  const [isMobile, setIsMobile] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Detectar iPhone 13 Mini breakpoint (<390px)
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 390);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Panel 1: Sidebar Component - 260px fijo
  const Sidebar = () => (
    <aside className="w-[260px] bg-[#F8F8F4] border-r border-[#DDDDCF] flex-shrink-0 flex flex-col">
      <div className="p-6 h-full flex flex-col">
        <div className="mb-8">
          <h2 className="text-[16px] font-semibold text-[#1F1F1A] mb-6">Laboratorio</h2>
          <nav className="space-y-1">
            <a 
              href="/management/labs/suppliers"
              className="flex items-center px-3 py-2.5 text-[13px] font-medium text-white bg-[#868466] rounded-lg"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Proveedores
            </a>
            <a 
              href="#"
              className="flex items-center px-3 py-2.5 text-[13px] font-medium text-[#8A8A77] hover:text-[#1F1F1A] hover:bg-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
              Inventario
            </a>
            <a 
              href="#"
              className="flex items-center px-3 py-2.5 text-[13px] font-medium text-[#8A8A77] hover:text-[#1F1F1A] hover:bg-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              Análisis
            </a>
            <a 
              href="#"
              className="flex items-center px-3 py-2.5 text-[13px] font-medium text-[#8A8A77] hover:text-[#1F1F1A] hover:bg-white rounded-lg transition-colors"
            >
              <svg className="w-4 h-4 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v1a1 1 0 001 1h4a1 1 0 001-1v-1m3-2V8a2 2 0 00-2-2H8a2 2 0 00-2 2v6m9-1h-6" />
              </svg>
              Reportes
            </a>
          </nav>
        </div>
        
        <div className="mt-auto pt-6 border-t border-[#E5E5DA]">
          <div className="px-3 py-2.5">
            <p className="text-[11px] text-[#8A8A77] mb-1">Módulo Activo</p>
            <p className="text-[12px] font-medium text-[#868466]">Gestión de Laboratorio</p>
          </div>
        </div>
      </div>
    </aside>
  );

  // Desktop Layout: 3 Paneles
  if (!isMobile) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#F8F8F4] font-system">
        {/* Panel 1: Sidebar - 260px fijo */}
        <Sidebar />

        {/* Panel 2: Canvas - Outlet para rutas hijas */}
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          {children || <Outlet />}
        </main>

        {/* Panel 3: Inspector - 450px fijo, renderizado por rutas hijas */}
        <aside className="w-[450px] bg-white border-l border-[#DDDDCF] flex-shrink-0 overflow-hidden">
          {/* El Inspector se inyecta desde las rutas hijas via context */}
        </aside>
      </div>
    );
  }

  // Mobile Layout: Full Screen con Sidebar Drawer
  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-[#F8F8F4] font-system">
      {/* Mobile Header con Hamburger menu */}
      <header className="bg-white border-b border-[#DDDDCF] px-4 py-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          {/* Hamburger Menu Button - 44x44px touch target */}
          <button 
            className="w-11 h-11 flex items-center justify-center rounded-lg hover:bg-[#F0F0EC] transition-colors"
            onClick={() => setIsSidebarOpen(true)}
            aria-label="Menú"
          >
            <svg className="w-5 h-5 text-[#1F1F1A]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <div>
            <h1 className="text-[18px] font-semibold text-[#1F1F1A] tracking-[-0.02em]">Management</h1>
            <p className="text-[12px] text-[#8A8A77] mt-0.5">Laboratorio</p>
          </div>
        </div>
      </header>

      {/* Mobile Content - overscroll-behavior none */}
      <main className="flex-1 overflow-y-auto px-4 py-4 overscroll-behavior-none">
        {children || <Outlet />}
      </main>

      {/* Mobile Sidebar Drawer - emerge desde izquierda con backdrop blur */}
      {isSidebarOpen && (
        <>
          <div 
            className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
            onClick={() => setIsSidebarOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 w-[260px] bg-[#F8F8F4] border-r border-[#DDDDCF] z-50 flex flex-col">
            <Sidebar />
          </div>
        </>
      )}

      {/* Mobile Inspector - Full Screen Sheet (renderizado por rutas hijas) */}
    </div>
  );
};
