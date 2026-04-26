import React from 'react';
import './LabsLayout.css';

// SVG Icons
const ArrowUpRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 12 7-7 7 7" />
    <path d="M12 19V5" />
  </svg>
);

const ArrowDownRightIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m5 5 7 7 7-7" />
    <path d="M12 19V5" />
  </svg>
);

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
  </svg>
);

const ChevronRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);

interface Transaction {
  id: string;
  name: string;
  date: string;
  type: 'PURCHASE' | 'SALE';
  amount: number;
  status: 'completed' | 'pending';
  category: string;
}

const mockTransactions: Transaction[] = [
  { id: '1', name: 'Materia Prima Lote #44', date: 'Hace 2h', type: 'PURCHASE', amount: 4500.00, status: 'completed', category: 'Insumos' },
  { id: '2', name: 'Venta Directa - Cliente VIP', date: 'Hace 5h', type: 'SALE', amount: 1200.00, status: 'completed', category: 'Ventas' },
  { id: '3', name: 'Suministros Oficina', date: 'Ayer', type: 'PURCHASE', amount: 150.25, status: 'completed', category: 'Gastos' },
  { id: '4', name: 'Venta E-commerce', date: 'Ayer', type: 'SALE', amount: 890.00, status: 'completed', category: 'Ventas' },
];

const MetricCard = ({ label, value, trend, trendValue }: { label: string, value: string, trend: 'up' | 'down', trendValue: string }) => (
  <div className="labs-card">
    <div className="labs-card-label">{label}</div>
    <div className="labs-card-value">
      {value}
      <span className={`labs-trend ${trend}`}>
        {trend === 'up' ? <ArrowUpRightIcon /> : <ArrowDownRightIcon />}
        {trendValue}
      </span>
    </div>
    <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
      vs. mes anterior (Abril)
    </div>
  </div>
);

const JournalRow = ({ tx }: { tx: Transaction }) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <div className="labs-row" onClick={() => setIsExpanded(!isExpanded)}>
      <div className="labs-row-icon">
        {tx.type === 'SALE' ? <ArrowUpRightIcon /> : <ArrowDownRightIcon />}
      </div>
      <div className="labs-row-main">
        <div className="labs-row-title">{tx.name}</div>
        <div className="labs-row-subtitle">{tx.category} • {tx.date}</div>
      </div>
      <div className={`labs-row-amount ${tx.type === 'SALE' ? 'positive' : 'negative'}`}>
        {tx.type === 'SALE' ? '+' : '-'}${tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>
    </div>
  );
};

export const LabsDashboard: React.FC<{ view?: string }> = ({ view }) => {
  if (view !== 'dashboard') return null;

  return (
    <>
      <header className="labs-header">
        <div>
          <h1>Dashboard</h1>
        </div>
        <div className="labs-header-actions">
          <div className="labs-icon-btn"><SearchIcon /></div>
          <div className="labs-icon-btn"><BellIcon /></div>
        </div>
      </header>

      <div className="labs-content">
        <section className="labs-metrics">
          <MetricCard label="Liquidez Proyectada" value="$48,920" trend="up" trendValue="+14.2%" />
          <MetricCard label="Afluencia de Ventas" value="$2,840" trend="up" trendValue="+8.1%" />
          <MetricCard label="Margen Operativo" value="68.4%" trend="down" trendValue="-0.5%" />
        </section>

        <section className="labs-section">
          <div className="labs-section-header">
            <h3>Journal de Movimientos</h3>
            <button>
              Auditar Todo <ChevronRightIcon />
            </button>
          </div>
          <div className="labs-list">
            {mockTransactions.map(tx => <JournalRow key={tx.id} tx={tx} />)}
          </div>
        </section>
      </div>
    </>
  );
};
