import React from 'react';
import './LabsLayout.css';

// SVG Icons
const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m7.5 4.27 9 5.15" />
    <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
    <path d="m3.3 7 8.7 5 8.7-5" />
    <path d="M12 22V12" />
  </svg>
);

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

const AlertTriangleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
    <path d="M12 9v4" />
    <path d="M12 17h.01" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m6 9 6 6 6-6" />
  </svg>
);

interface InventoryItem {
  id: string;
  name: string;
  stock: number;
  minStock: number;
  price: number;
  category: string;
  warning?: boolean;
}

const inventoryMock: InventoryItem[] = [
  { id: '1', name: 'Botella de Vidrio 500ml', stock: 120, minStock: 50, price: 15.50, category: 'Empaquetado' },
  { id: '2', name: 'Etiquetas Bidxaagui', stock: 45, minStock: 100, price: 2.00, category: 'Empaquetado', warning: true },
  { id: '3', name: 'Extracto de Lavanda', stock: 5, minStock: 10, price: 250.00, category: 'Materia Prima', warning: true },
  { id: '4', name: 'Cera de Abeja Natural', stock: 18, minStock: 15, price: 85.00, category: 'Materia Prima' },
];

export const LabsInventory: React.FC<{ view?: string }> = ({ view }) => {
  const [expandedRows, setExpandedRows] = React.useState<Set<string>>(new Set());

  if (view !== 'inventory') return null;

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
          <h1>Inventario</h1>
        </div>
        <div className="labs-header-actions">
          <div className="labs-icon-btn"><SearchIcon /></div>
          <div className="labs-icon-btn"><FilterIcon /></div>
          <div className="labs-icon-btn primary"><PlusIcon /></div>
        </div>
      </header>

      <div className="labs-content">
        <section className="labs-section">
          <div className="labs-section-header">
            <h3>Catálogo de Insumos</h3>
          </div>
          <div className="labs-list">
            {inventoryMock.map(item => (
              <React.Fragment key={item.id}>
                <div 
                  className={`labs-row labs-row-expandable ${expandedRows.has(item.id) ? 'expanded' : ''}`} 
                  style={{ gridTemplateColumns: '40px 1fr 60px' }}
                  onClick={() => toggleRow(item.id)}
                >
                  <div className="labs-row-icon" style={{ background: item.warning ? 'rgba(200, 92, 74, 0.1)' : 'var(--bg-hover)', color: item.warning ? 'var(--error)' : 'var(--green)' }}>
                    {item.warning ? <AlertTriangleIcon /> : <PackageIcon />}
                  </div>
                  <div className="labs-row-main">
                    <div className="labs-row-title">{item.name}</div>
                    <div className="labs-row-subtitle">{item.category}</div>
                  </div>
                  <div className="labs-row-main labs-row-actions">
                    <div className="labs-row-chevron"><ChevronDownIcon /></div>
                  </div>
                </div>
                <div className="labs-row-expanded-content">
                  <div className="labs-expanded-detail">
                    <div>
                      <div className="labs-expanded-detail-label">Stock</div>
                      <div className="labs-expanded-detail-value" style={{ color: item.warning ? 'var(--error)' : 'var(--text-primary)' }}>
                        {item.stock} / {item.minStock}
                      </div>
                    </div>
                    <div>
                      <div className="labs-expanded-detail-label">Precio</div>
                      <div className="labs-expanded-detail-value">${item.price.toFixed(2)}</div>
                    </div>
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
