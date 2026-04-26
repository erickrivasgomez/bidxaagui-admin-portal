import React from 'react';
import './LabsLayout.css';

// SVG Icons
const CreditCardIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

const TrendingUpIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
    <polyline points="17 6 23 6 23 12" />
  </svg>
);

const TrendingDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
    <polyline points="17 18 23 18 23 12" />
  </svg>
);

const RefreshCcwIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

export const LabsFinance: React.FC<{ view?: string }> = ({ view }) => {
  if (view !== 'finance') return null;

  return (
    <>
      <header className="labs-header">
        <div>
          <h1>Finanzas</h1>
        </div>
        <div className="labs-header-actions">
          <div className="labs-icon-btn"><FilterIcon /></div>
          <div className="labs-icon-btn"><DownloadIcon /></div>
        </div>
      </header>

      <div className="labs-content">
        <section className="labs-metrics" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
          <div className="labs-card">
            <div className="labs-card-label">Flujo de Efectivo Mensual</div>
            <div className="labs-card-value" style={{ color: 'var(--success)' }}>+$12,450.00</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <TrendingUpIcon style={{ color: 'var(--success)' }} /> 24% más alto que Abril
            </div>
          </div>
          
          <div className="labs-card">
            <div className="labs-card-label">Gastos Fijos y Materia</div>
            <div className="labs-card-value" style={{ color: 'var(--error)' }}>-$3,890.50</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              <div style={{ color: 'var(--error)' }}><TrendingDownIcon /></div> 5% más alto que Abril
            </div>
          </div>

          <div className="labs-card" style={{ background: 'linear-gradient(135deg, rgba(74, 82, 57, 0.1), rgba(184, 92, 60, 0.1))', borderColor: 'rgba(74, 82, 57, 0.3)' }}>
            <div className="labs-card-label" style={{ color: 'var(--text-primary)' }}>Balance Total (Cajas/Bancos)</div>
            <div className="labs-card-value">$84,920.00</div>
            <button style={{ 
              marginTop: '1rem',
              background: 'var(--green)',
              border: 'none',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '8px',
              fontSize: '0.8rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer'
            }}>
              <RefreshCcwIcon /> Conciliar Cuentas
            </button>
          </div>
        </section>

        <section className="labs-section">
          <div className="labs-section-header">
            <h3>Cuentas Bancarias y Ubicaciones</h3>
          </div>
          <div className="labs-list">
            {[
              { id: 1, name: 'Banco BBVA - Principal', type: 'Cuenta Corriente', balance: 45200.00 },
              { id: 2, name: 'Caja Fija (Clínica)', type: 'Efectivo', balance: 5400.00 },
              { id: 3, name: 'Stripe / Pagos Online', type: 'Pasarela', balance: 34320.00 },
            ].map(acc => (
              <div key={acc.id} className="labs-row">
                <div className="labs-row-icon"><CreditCardIcon /></div>
                <div className="labs-row-main">
                  <div className="labs-row-title">{acc.name}</div>
                  <div className="labs-row-subtitle">{acc.type}</div>
                </div>
                <div className="labs-row-amount">${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};
