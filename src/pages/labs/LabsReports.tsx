import React from 'react';
import './LabsLayout.css';

// SVG Icons
const BarChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" x2="12" y1="20" y2="10" />
    <line x1="18" x2="18" y1="20" y2="4" />
    <line x1="6" x2="6" y1="20" y2="16" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
    <line x1="16" x2="16" y1="2" y2="6" />
    <line x1="8" x2="8" y1="2" y2="6" />
    <line x1="3" x2="21" y1="10" y2="10" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const PieChartIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.21 15.89A10 10 0 1 1 8 2.83" />
    <path d="M22 12A10 10 0 0 0 12 2v10z" />
  </svg>
);

export const LabsReports: React.FC<{ view?: string }> = ({ view }) => {
  if (view !== 'reports') return null;

  return (
    <>
      <header className="labs-header">
        <div>
          <h1>Reportes KPI</h1>
        </div>
        <div className="labs-header-actions">
          <div className="labs-icon-btn"><CalendarIcon /></div>
          <div className="labs-icon-btn"><DownloadIcon /></div>
        </div>
      </header>

      <div className="labs-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)', marginBottom: '2rem' }}>
          
          <section className="labs-card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div className="labs-card-label">Ventas Semanales</div>
              <BarChartIcon style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', gap: '1rem', justifyContent: 'space-between', padding: '0 1rem' }}>
              {[40, 70, 45, 90, 65, 80, 100].map((h, i) => (
                <div key={i} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <div 
                    style={{ 
                      width: '100%', 
                      maxWidth: '30px', 
                      background: i === 6 ? 'var(--green)' : 'var(--bg-hover)', 
                      borderRadius: '4px',
                      height: `${h}%`,
                      transition: 'height 0.5s ease'
                    }}
                  />
                  <span style={{ fontSize: '10px', color: 'var(--text-secondary)' }}>{['L', 'M', 'X', 'J', 'V', 'S', 'D'][i]}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="labs-card" style={{ minHeight: '300px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <div className="labs-card-label">Top Categorías</div>
              <PieChartIcon style={{ color: 'var(--text-secondary)' }} />
            </div>
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1rem', justifyContent: 'center' }}>
              {[
                { label: 'Tinturas', val: 45, color: '#6366f1' },
                { label: 'Pomadas', val: 30, color: '#a855f7' },
                { label: 'Tés', val: 15, color: '#10b981' },
                { label: 'Consultas', val: 10, color: '#f59e0b' }
              ].map((cat, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: cat.color }} />
                  <div style={{ flex: 1, fontSize: '0.9rem' }}>{cat.label}</div>
                  <div style={{ fontWeight: 600 }}>{cat.val}%</div>
                </div>
              ))}
            </div>
          </section>

        </div>
      </div>
    </>
  );
};
