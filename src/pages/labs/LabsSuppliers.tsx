import React from 'react';
import './LabsLayout.css';

// SVG Icons
const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.3-4.3" />
  </svg>
);

const FilterIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" />
    <path d="M12 5v14" />
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

const EditIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
    <path d="m15 5 4 4" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

interface Supplier {
  id: string;
  name: string;
  phone: string;
  city: string;
}

const mockSuppliers: Supplier[] = [
  { id: '1023', name: 'Envases Globales S.A.', phone: '+52 55 1234 5678', city: 'Ciudad de México' },
  { id: '1024', name: 'Productores Orgánicos del Sur', phone: '+52 951 987 6543', city: 'Oaxaca' },
  { id: '1025', name: 'Etiquetas y Papel', phone: '+52 33 5555 4444', city: 'Guadalajara' },
  { id: '1026', name: 'Distribuidora Botánica', phone: '+52 222 111 2222', city: 'Puebla' },
];

export const LabsSuppliers: React.FC<{ view?: string }> = ({ view }) => {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

  if (view !== 'suppliers') return null;

  const toggleRow = (id: string) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedRows(newExpanded);
  };

  return (
    <>
      <header className="labs-header">
        <div>
          <h1>Proveedores</h1>
        </div>
        <div className="labs-header-actions">
          <div className="labs-icon-btn"><SearchIcon /></div>
          <div className="labs-icon-btn"><FilterIcon /></div>
          <button style={{ 
            background: 'var(--green)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '12px',
            padding: '0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontWeight: 600,
            cursor: 'pointer'
          }}>
            <PlusIcon /> Nuevo Proveedor
          </button>
        </div>
      </header>

      <div className="labs-content">
        <section className="labs-section">
          <div className="labs-section-header">
            <h3>Directorio de Socios</h3>
          </div>
          <div className="labs-list">
            {mockSuppliers.map(supplier => (
              <React.Fragment key={supplier.id}>
                <div 
                  className={`labs-row labs-row-expandable ${expandedRows.has(supplier.id) ? 'expanded' : ''}`} 
                  style={{ gridTemplateColumns: '40px 1fr 60px' }}
                  onClick={() => toggleRow(supplier.id)}
                >
                  <div className="labs-row-icon">
                    <TruckIcon />
                  </div>
                  <div className="labs-row-main">
                    <div className="labs-row-title">{supplier.name}</div>
                    <div className="labs-row-subtitle">ID: {supplier.id}</div>
                  </div>
                  <div className="labs-row-main labs-row-actions">
                    <div className="labs-row-chevron"><ChevronDownIcon /></div>
                  </div>
                </div>
                <div className="labs-row-expanded-content">
                  <div className="labs-expanded-detail">
                    <div>
                      <div className="labs-expanded-detail-label">Ciudad</div>
                      <div className="labs-expanded-detail-value">{supplier.city}</div>
                    </div>
                    <div>
                      <div className="labs-expanded-detail-label">Teléfono</div>
                      <div className="labs-expanded-detail-value">{supplier.phone}</div>
                    </div>
                  </div>
                  <div className="labs-row-main labs-row-actions" style={{ marginTop: 'var(--space-md)' }}>
                    <div style={{ cursor: 'pointer', color: 'var(--text-secondary)' }}><EditIcon /></div>
                    <div style={{ cursor: 'pointer', color: 'var(--error)' }}><TrashIcon /></div>
                  </div>
                </div>
              </React.Fragment>
            ))}
          </div>
        </section>
      </div>
    </>
  );
};
