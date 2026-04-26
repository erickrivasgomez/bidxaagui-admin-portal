import React from 'react';
import './LabsLayout.css';

// SVG Icons
const ShoppingCartIcon = (props?: React.SVGProps<SVGSVGElement>) => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="8" cy="21" r="1" />
    <circle cx="19" cy="21" r="1" />
    <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12" />
  </svg>
);

const ReceiptIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15V4a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11" />
    <path d="M3 15a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2" />
    <path d="M3 15v6" />
    <path d="M21 15v6" />
  </svg>
);

const SearchIcon = (props?: React.SVGProps<SVGSVGElement>) => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
  </svg>
);

const CreditCardIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);

interface POSItem {
  id: string;
  name: string;
  price: number;
}

const posItems: POSItem[] = [
  { id: '1', name: 'Pomada de Árnica 60g', price: 150.00 },
  { id: '2', name: 'Microdosis Valeriana 30ml', price: 90.00 },
  { id: '3', name: 'Tintura Madre Equinácea', price: 210.00 },
  { id: '4', name: 'Té Relajante Mezcla Especial', price: 85.00 },
];

export const LabsSales: React.FC<{ view?: string }> = ({ view }) => {
  if (view !== 'sales') return null;

  return (
    <>
      <header className="labs-header">
        <div>
          <h1>
            Ventas 
            <span style={{ color: 'var(--green)', fontSize: '0.6em', verticalAlign: 'middle', background: 'rgba(74, 82, 57, 0.1)', padding: '2px 8px', borderRadius: '12px', marginLeft: '8px' }}>POS</span>
          </h1>
        </div>
        <div className="labs-header-actions">
          <div className="labs-icon-btn"><ReceiptIcon /></div>
        </div>
      </header>

      <div className="labs-content">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-lg)', marginBottom: '2rem' }}>
          
          <section className="labs-section" style={{ margin: 0 }}>
            <div className="labs-section-header" style={{ padding: '1rem 1.5rem' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <SearchIcon style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Buscar producto a vender..." 
                  style={{ 
                    width: '100%', 
                    background: 'var(--bg-app)', 
                    border: '1px solid var(--border)', 
                    borderRadius: '12px', 
                    padding: '10px 10px 10px 36px',
                    color: 'var(--text-primary)',
                    outline: 'none'
                  }} 
                />
              </div>
            </div>
            <div className="labs-list">
              {posItems.map(item => (
                <div key={item.id} className="labs-row" style={{ gridTemplateColumns: '1fr 80px 40px', padding: '1rem 1.5rem' }}>
                  <div className="labs-row-title">{item.name}</div>
                  <div className="labs-row-amount" style={{ textAlign: 'left', color: 'var(--text-secondary)' }}>${item.price.toFixed(2)}</div>
                  <div className="labs-icon-btn" style={{ width: '32px', height: '32px', cursor: 'pointer', background: 'var(--bg-app)' }}>
                    <PlusIcon />
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="labs-card" style={{ display: 'flex', flexDirection: 'column' }}>
            <div className="labs-card-label" style={{ marginBottom: '1rem' }}>Ticket Actual</div>
            
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '2rem 0' }}>
              <div style={{ marginBottom: '1rem', opacity: 0.3 }}>
                <ShoppingCartIcon />
              </div>
              <span style={{ fontSize: '0.9rem' }}>El ticket está vacío</span>
            </div>

            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: 'auto' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
                <span>Subtotal</span>
                <span>$0.00</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontWeight: 700, fontSize: '1.25rem' }}>
                <span>Total</span>
                <span style={{ color: 'var(--green)' }}>$0.00</span>
              </div>
              <button style={{ 
                width: '100%', 
                background: 'var(--bg-hover)', 
                color: 'var(--text-secondary)', 
                border: '1px solid var(--border)', 
                padding: '14px', 
                borderRadius: '12px',
                fontWeight: 600,
                cursor: 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <CreditCardIcon /> Cobrar
              </button>
            </div>
          </section>
        </div>
      </div>
    </>
  );
};
