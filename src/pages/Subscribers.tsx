import React, { useState, useEffect } from 'react';
import { useSubscribers } from '../core/modules/antroponomadas/application/useSubscribers';
import { AppCanvas } from '../components/AppCanvas';
import { AppInspector } from '../components/AppInspector';
import './Subscribers.css';

const Subscribers: React.FC = () => {
    const { subscribers, loading, error, stats, pagination, fetchSubscribers, fetchStats, deleteSubscriber, exportCsv, createSubscriber } = useSubscribers();

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);

    // Search and sort state
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

    const total = pagination.total;
    const totalPages = pagination.totalPages;

    // Inspector & Import State
    const [isInspectorOpen, setIsInspectorOpen] = useState(false);
    const [importMode, setImportMode] = useState<'single' | 'bulk'>('single');
    const [singleEmail, setSingleEmail] = useState('');
    const [singleName, setSingleName] = useState('');
    const [bulkText, setBulkText] = useState('');
    const [bulkPreview, setBulkPreview] = useState<Array<{ email: string; name?: string }>>([]);
    const [isParsing, setIsParsing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    await createSubscriber(user.email, user.name);
                    successCount++;
                } catch (e) {
                    console.error(`Failed to add ${user.email} `, e);
                }
            }

            if (successCount > 0) {
                alert(`✅ Se registraron ${successCount} suscriptores correctamente.`);
                // Clean form after successful submission
                setIsInspectorOpen(false);
                setSingleEmail('');
                setSingleName('');
                setBulkText('');
                setBulkPreview([]);
                await fetchSubscribers({ page, limit, search, sortBy, sortOrder });
                await fetchStats();
            } else {
                alert('❌ No se pudo registrar a los suscriptores. Verifica que no estén duplicados.');
            }

        } catch {
            alert('Error al procesar la solicitud.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Delete subscriber
    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`¿Eliminar suscriptor ${email}?`)) {
            return;
        }

        try {
            await deleteSubscriber(id);
        } catch (err: unknown) {
            alert((err as { response?: { data?: { error?: string } } })?.response?.data?.error || 'Error al eliminar');
        }
    };

    // Export to CSV
    const handleExport = async () => {
        try {
            const blob = await exportCsv();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `subscribers - ${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch {
            alert('Error al exportar CSV');
        }
    };

    // Handle search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPage(1);
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    // Fetch subscribers when page, limit, or sort changes
    useEffect(() => {
        fetchSubscribers({ page, limit, search, sortBy, sortOrder });
    }, [page, limit, sortBy, sortOrder, search]);

    // Fetch stats on mount
    useEffect(() => {
        fetchStats();
    }, []);

    // Format date
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('es-MX', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    return (
        <>
            <AppCanvas
                title="Suscriptores"
                header={
                    <div className="canvas-stats-row">
                        <div className="stat-item">
                            <span className="stat-value">{stats.total}</span>
                            <span className="stat-label">Total</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className="stat-value">+{stats.thisMonth}</span>
                            <span className="stat-label">Mes</span>
                        </div>
                        <div className="stat-divider" />
                        <div className="stat-item">
                            <span className={`stat-value ${stats.growthRate >= 0 ? 'text-success' : 'text-danger'}`}>
                                {stats.growthRate.toFixed(1)}%
                            </span>
                            <span className="stat-label">Crecimiento</span>
                        </div>
                    </div>
                }
                actions={
                    <>
                        <button onClick={handleExport} className="btn-secondary" style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 600 }}>
                            ↓ CSV
                        </button>
                        <button onClick={() => setIsInspectorOpen(true)} className="btn-primary" style={{ borderRadius: '12px', padding: '10px 20px', fontWeight: 600 }}>
                            + Nuevo
                        </button>
                    </>
                }
            >
                <div className="table-controls">
                    <input
                        type="text"
                        placeholder="Buscar por email o nombre..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="search-input"
                    />
                    <select
                        value={limit}
                        onChange={(e) => {
                            setLimit(Number(e.target.value));
                            setPage(1);
                        }}
                        className="limit-select"
                    >
                        <option value="10">10 por página</option>
                        <option value="25">25 por página</option>
                        <option value="50">50 por página</option>
                        <option value="100">100 por página</option>
                    </select>
                </div>

                {error && (
                    <div className="error-message">
                        ❌ {error}
                    </div>
                )}

                {loading ? (
                    <div className="skeleton-table">
                        <div className="skeleton-row" />
                        <div className="skeleton-row" />
                        <div className="skeleton-row" />
                    </div>
                ) : subscribers.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No hay suscriptores</h3>
                        <p>Los suscriptores aparecerán aquí cuando se registren.</p>
                    </div>
                ) : (
                    <>
                        <table className="modern-table">
                            <thead>
                                <tr>
                                    <th
                                        onClick={() => {
                                            setSortBy('name');
                                            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                                        }}
                                        className="sortable"
                                    >
                                        Nombre {sortBy === 'name' && (sortOrder === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => {
                                            setSortBy('email');
                                            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                                        }}
                                        className="sortable"
                                    >
                                        Email {sortBy === 'email' && (sortOrder === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th
                                        onClick={() => {
                                            setSortBy('subscribed_at');
                                            setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                                        }}
                                        className="sortable"
                                    >
                                        Fecha {sortBy === 'subscribed_at' && (sortOrder === 'ASC' ? '↑' : '↓')}
                                    </th>
                                    <th>Acciones</th>
                                </tr>
                            </thead>
                            <tbody>
                                {subscribers.map((sub) => (
                                    <tr key={sub.id}>
                                        <td style={{ fontWeight: 500 }}>{sub.name || '-'}</td>
                                        <td className="email-cell">{sub.email}</td>
                                        <td>{formatDate(sub.subscribed_at)}</td>
                                        <td>
                                            <button
                                                onClick={() => handleDelete(sub.id, sub.email)}
                                                className="btn-action-danger"
                                                title="Eliminar suscriptor"
                                            >
                                                🗑️
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>

                        <div className="pagination">
                            <div className="pagination-info">
                                Mostrando {Math.min((page - 1) * limit + 1, total)} - {Math.min(page * limit, total)} de {total}
                            </div>
                            <div className="pagination-controls">
                                <button
                                    onClick={() => setPage(page - 1)}
                                    disabled={page === 1}
                                    className="btn-page"
                                >
                                    ← Anterior
                                </button>
                                <span className="page-indicator">
                                    Página {page} de {totalPages}
                                </span>
                                <button
                                    onClick={() => setPage(page + 1)}
                                    disabled={page === totalPages}
                                    className="btn-page"
                                >
                                    Siguiente →
                                </button>
                            </div>
                        </div>
                    </>
                )}
            </AppCanvas>

            <AppInspector
                isOpen={isInspectorOpen}
                onClose={() => setIsInspectorOpen(false)}
                title="Registrar Suscriptores"
                footer={
                    <>
                        <button className="btn-secondary" onClick={() => setIsInspectorOpen(false)}>
                            Cancelar
                        </button>
                        <button
                            className="btn-primary"
                            onClick={handleAddSubscribers}
                            disabled={isSubmitting || (importMode === 'single' ? !singleEmail : bulkPreview.length === 0)}
                        >
                            {isSubmitting ? 'Registrando...' : `Registrar ${importMode === 'bulk' && bulkPreview.length > 0 ? `(${bulkPreview.length})` : ''}`}
                        </button>
                    </>
                }
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
                                className="form-input"
                            />
                        </div>
                        <div className="form-group">
                            <label>Nombre (Opcional)</label>
                            <input
                                type="text"
                                value={singleName}
                                onChange={e => setSingleName(e.target.value)}
                                placeholder="Juan Pérez"
                                className="form-input"
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
            </AppInspector>
        </>
    );
};

export default Subscribers;
