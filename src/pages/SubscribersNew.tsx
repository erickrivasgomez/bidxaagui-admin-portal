import React, { useState, useEffect } from 'react';
import { UniversalLayout } from '../components/layout/UniversalLayout';
import { Inspector } from '../components/layout/Inspector';
import { ContentCard } from '../components/ui/ContentCard';
import { DataStateWrapper } from '../components/ui/DataStates';
import { useToast } from '../components/ui/Toast';
import { useNavigation } from '../hooks/useNavigation';
import { useData } from '../hooks/useData';
import './SubscribersNew.css';

interface Subscriber {
  id: string;
  email: string;
  name: string;
  created_at: string;
}

const SubscribersNew: React.FC = () => {
  const { navigationItems } = useNavigation();
  const toast = useToast();
  
  // Use our new custom hook
  const subscribersData = useData<Subscriber>({
    fetcher: {
      findAll: async () => {
        // Mock implementation - replace with actual API call
        return [
          { id: '1', email: 'user1@example.com', name: 'Usuario Uno', created_at: '2024-01-01' },
          { id: '2', email: 'user2@example.com', name: 'Usuario Dos', created_at: '2024-01-15' },
          { id: '3', email: 'user3@example.com', name: 'Usuario Tres', created_at: '2024-02-01' }
        ];
      },
      create: async (item) => {
        // Mock implementation
        return { ...item, id: Date.now().toString() } as Subscriber;
      },
      update: async (id, updates) => {
        // Mock implementation
        return { id, ...updates } as Subscriber;
      },
      delete: async () => {
        // Mock implementation
      },
      count: async () => 3
    },
    initialSorting: { field: 'created_at', direction: 'desc' },
    initialPageSize: 20
  });

  const {
    data: subscribers,
    loading,
    error,
    empty,
    refresh,
    create,
    delete: deleteSubscriber,
    setFilters,
    pagination
  } = subscribersData;

  // Inspector state
  const [isInspectorOpen, setIsInspectorOpen] = useState(false);
  const [importMode, setImportMode] = useState<'single' | 'bulk'>('single');
  const [singleEmail, setSingleEmail] = useState('');
  const [singleName, setSingleName] = useState('');
  const [bulkText, setBulkText] = useState('');
  const [bulkPreview, setBulkPreview] = useState<Array<{ email: string; name?: string }>>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Smart Parser Logic
  useEffect(() => {
    if (importMode !== 'bulk' || !bulkText.trim()) {
      setBulkPreview([]);
      return;
    }

    setIsParsing(true);
    const timer = setTimeout(() => {
      try {
        const text = bulkText.trim();
        let parsed: Array<{ email: string; name?: string }> = [];

        // 1. Try JSON
        if (text.startsWith('[') || text.startsWith('{')) {
          try {
            const json = JSON.parse(text);
            const arr = Array.isArray(json) ? json : [json];
            parsed = arr.map((item: { email?: string; Email?: string; name?: string; Name?: string } | string) => {
              const email = typeof item === 'string' ? item : (item.email || item.Email || '');
              const name = typeof item === 'string' ? undefined : (item.name || item.Name || undefined);
              return { email, name };
            }).filter(x => x.email && x.email.includes('@'));
          } catch {
            // Not valid JSON, fall through
          }
        }

        // 2. If no JSON success, try Lines (CSV/TSV/"Email Name")
        if (parsed.length === 0) {
          const lines = text.split(/\n/);
          parsed = lines.map(line => {
            line = line.trim();
            if (!line) return null;

            const emailMatch = line.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
            if (emailMatch) {
              const email = emailMatch[0];
              let name = line.replace(email, '').replace(/[,|;]/g, '').trim();
              name = name.replace(/^["']|["']$/g, '');
              return { email, name: name || undefined };
            }
            return null;
          }).filter((x): x is { email: string; name: string | undefined } => x !== null);
        }

        const unique = new Map();
        parsed.forEach(p => unique.set(p.email, p));
        setBulkPreview(Array.from(unique.values()));

      } catch (err) {
        console.error("Parse error", err);
      } finally {
        setIsParsing(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [bulkText, importMode]);

  // Handle search with debounce
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setFilters(searchQuery ? { email: searchQuery } : {});
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [searchQuery, setFilters]);

  // Add Subscriber(s)
  const handleAddSubscribers = async () => {
    setIsSubmitting(true);
    try {
      const usersToAdd = importMode === 'single'
        ? [{ email: singleEmail, name: singleName }]
        : bulkPreview;

      if (usersToAdd.length === 0) return;

      let successCount = 0;
      for (const user of usersToAdd) {
        try {
          await create({ email: user.email, name: user.name || '', created_at: new Date().toISOString() });
          successCount++;
        } catch (e) {
          console.error(`Failed to add ${user.email} `, e);
        }
      }

      if (successCount > 0) {
        toast.success(`✅ Se registraron ${successCount} suscriptores correctamente.`);
        // Clean form after successful submission
        setIsInspectorOpen(false);
        setSingleEmail('');
        setSingleName('');
        setBulkText('');
        setBulkPreview([]);
        await refresh();
      } else {
        toast.error('❌ No se pudo registrar a los suscriptores. Verifica que no estén duplicados.');
      }

    } catch {
      toast.error('Error al procesar la solicitud.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Delete subscriber
  const handleDelete = async (id: string, email: string) => {
    try {
      await deleteSubscriber(id);
      toast.success(`Suscriptor ${email} eliminado correctamente.`);
    } catch (err: unknown) {
      toast.error((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error al eliminar');
    }
  };

  // Export to CSV
  const handleExport = async () => {
    try {
      // Mock export - replace with actual implementation
      const csvContent = "Email,Name,Date\njohn@example.com,John Doe,2023-01-01";
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `subscribers - ${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success('CSV exportado correctamente.');
    } catch {
      toast.error('Error al exportar CSV');
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Mock stats
  const stats = {
    total: subscribers?.length || 0,
    thisMonth: 0,
    growthRate: 0
  };

  return (
    <UniversalLayout
      navigation={navigationItems}
      user={{
        name: 'Administrador',
        email: 'admin@bidxaagui.com'
      }}
    >
      <div className="subscribers-new">
        {/* Header */}
        <div className="subscribers-header">
          <div className="subscribers-title">
            <h1>Suscriptores</h1>
            <p>Gestiona tu lista de suscriptores</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={handleExport}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              Exportar CSV
            </button>
            <button className="btn-primary" onClick={() => setIsInspectorOpen(true)}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <line x1="22" y1="11" x2="22" y2="13" />
                <line x1="22" y1="17" x2="22" y2="19" />
              </svg>
              Nuevo Suscriptor
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="stats-grid">
          <ContentCard
            title={stats.total}
            subtitle="Total Suscriptores"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
              </svg>
            }
            density="compact"
          />
          <ContentCard
            title={`+${stats.thisMonth}`}
            subtitle="Este Mes"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            }
            density="compact"
          />
          <ContentCard
            title={`${stats.growthRate.toFixed(1)}%`}
            subtitle="Crecimiento"
            icon={
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
              </svg>
            }
            density="compact"
            status={stats.growthRate >= 0 ? 'success' : 'danger'}
          />
        </div>

        {/* Search and Filters */}
        <div className="search-controls">
          <div className="search-input-wrapper">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Buscar por email o nombre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
          </div>
          <select
            value={pagination.pageSize}
            onChange={(e) => pagination.setPageSize(Number(e.target.value))}
            className="page-size-select"
          >
            <option value="10">10 por página</option>
            <option value="25">25 por página</option>
            <option value="50">50 por página</option>
            <option value="100">100 por página</option>
          </select>
        </div>

        {/* Subscribers List */}
        <div className="subscribers-content">
          <DataStateWrapper
            state={{
              data: subscribers,
              loading,
              error,
              empty,
              refreshing: false
            }}
            type="table"
            emptyState={{
              title: "No hay suscriptores",
              description: "Los suscriptores aparecerán aquí cuando se registren.",
              primaryAction: {
                label: "Agregar Primer Suscriptor",
                onClick: () => setIsInspectorOpen(true),
                icon: (
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                )
              }
            }}
          >
            {(subscriberList) => (
              <>
                <div className="subscribers-table">
                  <div className="table-header">
                    <div className="table-cell sortable">
                      Nombre
                    </div>
                    <div className="table-cell sortable">
                      Email
                    </div>
                    <div className="table-cell sortable">
                      Fecha
                    </div>
                    <div className="table-cell">Acciones</div>
                  </div>
                  <div className="table-body">
                    {subscriberList.map((sub) => (
                      <div key={sub.id} className="table-row">
                        <div className="table-cell name-cell">
                          {sub.name || '-'}
                        </div>
                        <div className="table-cell email-cell">
                          {sub.email}
                        </div>
                        <div className="table-cell date-cell">
                          {formatDate(sub.created_at)}
                        </div>
                        <div className="table-cell actions-cell">
                          <button
                            onClick={() => handleDelete(sub.id, sub.email)}
                            className="btn-action-danger"
                            title="Eliminar suscriptor"
                          >
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6h14zM10 11v6M14 11v6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Pagination */}
                {pagination.total > pagination.pageSize && (
                  <div className="pagination">
                    <div className="pagination-info">
                      Mostrando {Math.min((pagination.page - 1) * pagination.pageSize + 1, pagination.total)} - {Math.min(pagination.page * pagination.pageSize, pagination.total)} de {pagination.total}
                    </div>
                    <div className="pagination-controls">
                      <button
                        onClick={() => pagination.setPage(pagination.page - 1)}
                        disabled={pagination.page === 1}
                        className="btn-page"
                      >
                        ← Anterior
                      </button>
                      <span className="page-indicator">
                        Página {pagination.page} de {Math.ceil(pagination.total / pagination.pageSize)}
                      </span>
                      <button
                        onClick={() => pagination.setPage(pagination.page + 1)}
                        disabled={!pagination.hasNext}
                        className="btn-page"
                      >
                        Siguiente →
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </DataStateWrapper>
        </div>

        {/* Inspector Panel */}
        <Inspector
          isOpen={isInspectorOpen}
          onClose={() => setIsInspectorOpen(false)}
          title="Registrar Suscriptores"
          mode="create"
        >
          <div className="inspector-tabs">
            <button
              className={`tab-btn ${importMode === 'single' ? 'active' : ''}`}
              onClick={() => setImportMode('single')}
            >
              Individual
            </button>
            <button
              className={`tab-btn ${importMode === 'bulk' ? 'active' : ''}`}
              onClick={() => setImportMode('bulk')}
            >
              Importación Masiva
            </button>
          </div>

          {importMode === 'single' ? (
            <div className="inspector-form">
              <div className="form-group">
                <label>Correo Electrónico</label>
                <input
                  type="email"
                  value={singleEmail}
                  onChange={e => setSingleEmail(e.target.value)}
                  placeholder="ejemplo@bidxaagui.com"
                  className="input"
                />
              </div>
              <div className="form-group">
                <label>Nombre (Opcional)</label>
                <input
                  type="text"
                  value={singleName}
                  onChange={e => setSingleName(e.target.value)}
                  placeholder="Juan Pérez"
                  className="input"
                />
              </div>
            </div>
          ) : (
            <div className="bulk-import-container">
              <div className="smart-textarea-wrapper">
                <textarea
                  value={bulkText}
                  onChange={e => setBulkText(e.target.value)}
                  placeholder={`Pega tu lista aquí. Detectamos automáticamente:
- JSON: [{ "email": "...", "name": "..." }]
- CSV: email, nombre
- Texto: email nombre`}
                  className="textarea-ios"
                />
                <div className="smart-badge">✨ Smart Parse Activo</div>
              </div>

              <div className="parse-preview">
                <h4>Vista Previa ({bulkPreview.length} detectados)</h4>
                {isParsing ? (
                  <div className="preview-loading">Analizando...</div>
                ) : (
                  <ul>
                    {bulkPreview.slice(0, 5).map((u, i) => (
                      <li key={i}>
                        <span className="p-email">{u.email}</span>
                        {u.name && <span className="p-name">{u.name}</span>}
                      </li>
                    ))}
                    {bulkPreview.length > 5 && (
                      <li className="more-indicator">...y {bulkPreview.length - 5} más</li>
                    )}
                    {bulkText && bulkPreview.length === 0 && (
                      <li className="no-match">No se detectaron emails válidos</li>
                    )}
                  </ul>
                )}
              </div>
            </div>
          )}

          <div className="inspector-actions">
            <button className="btn-ghost" onClick={() => setIsInspectorOpen(false)}>
              Cancelar
            </button>
            <button
              className="btn-primary"
              onClick={handleAddSubscribers}
              disabled={isSubmitting || (importMode === 'single' ? !singleEmail : bulkPreview.length === 0)}
            >
              {isSubmitting ? 'Registrando...' : `Registrar ${importMode === 'bulk' && bulkPreview.length > 0 ? `(${bulkPreview.length})` : ''}`}
            </button>
          </div>
        </Inspector>
      </div>
    </UniversalLayout>
  );
};

export default SubscribersNew;
