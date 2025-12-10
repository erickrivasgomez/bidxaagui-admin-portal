import React, { useState, useEffect } from 'react';
import { subscribersAPI, authAPI, type Subscriber } from '../services/api';
import AdminHeader from '../components/AdminHeader';
import './Subscribers.css';

const Subscribers: React.FC = () => {
    const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Pagination state
    const [page, setPage] = useState(1);
    const [limit, setLimit] = useState(25);
    const [total, setTotal] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    // Search and sort state
    const [search, setSearch] = useState('');
    const [sortBy, setSortBy] = useState('name');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('ASC');

    // Stats state
    const [stats, setStats] = useState({
        total: 0,
        thisMonth: 0,
        growthRate: 0,
    });

    // Modal & Import State
    const [isModalOpen, setIsModalOpen] = useState(false);
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
                        parsed = arr.map((item: any) => ({
                            email: item.email || item.Email || (typeof item === 'string' ? item : ''),
                            name: item.name || item.Name || undefined
                        })).filter(x => x.email && x.email.includes('@'));
                    } catch (e) {
                        // Not valid JSON, fall through
                    }
                }

                // 2. If no JSON success, try Lines (CSV/TSV/"Email Name")
                if (parsed.length === 0) {
                    const lines = text.split(/\n/);
                    parsed = lines.map(line => {
                        line = line.trim();
                        if (!line) return null;

                        // Check for common separators: comma, tab, pipe, or just space
                        // But ensure we don't split names incorrectly.
                        // Strategy: Look for the email part.

                        // Simple regex for email extraction
                        const emailMatch = line.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9_-]+)/);
                        if (emailMatch) {
                            const email = emailMatch[0];
                            // The rest is potentially the name
                            let name = line.replace(email, '').replace(/[,|;]/g, '').trim();
                            // Cleanup quotes
                            name = name.replace(/^["']|["']$/g, '');
                            return { email, name: name || undefined };
                        }
                        return null;
                    }).filter((x): x is { email: string; name: string | undefined } => x !== null);
                }

                // Remove duplicates in preview
                const unique = new Map();
                parsed.forEach(p => unique.set(p.email, p));
                setBulkPreview(Array.from(unique.values()));

            } catch (err) {
                console.error("Parse error", err);
            } finally {
                setIsParsing(false);
            }
        }, 500); // Debounce

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

            // In a real optimized backend we would have a batch endpoint.
            // Here we will loop. It's fine for small batches (<50).
            // For 2026 UX, we show progress.

            let successCount = 0;
            for (const user of usersToAdd) {
                try {
                    // Use the public endpoint for now as it does the job
                    await authAPI.subscribeNewsletter(user.email, user.name);
                    successCount++;
                } catch (e) {
                    console.error(`Failed to add ${user.email} `, e);
                }
            }

            if (successCount > 0) {
                alert(`✅ Se registraron ${successCount} suscriptores correctamente.`);
                setIsModalOpen(false);
                setSingleEmail('');
                setSingleName('');
                setBulkText('');
                fetchSubscribers();
                fetchStats();
            } else {
                alert('❌ No se pudo registrar a los suscriptores. Verifica que no estén duplicados.');
            }

        } catch (err) {
            alert('Error al procesar la solicitud.');
        } finally {
            setIsSubmitting(false);
        }
    };

    // Fetch subscribers
    const fetchSubscribers = async () => {
        try {
            setLoading(true);
            setError('');
            const response = await subscribersAPI.getAll({
                page,
                limit,
                search,
                sortBy,
                sortOrder,
            });

            setSubscribers(response.data.subscribers);
            setTotal(response.data.pagination.total);
            setTotalPages(response.data.pagination.totalPages);
        } catch (err: any) {
            setError(err.response?.data?.error || 'Error loading subscribers');
        } finally {
            setLoading(false);
        }
    };

    // Fetch stats
    const fetchStats = async () => {
        try {
            const response = await subscribersAPI.stats();
            setStats({
                total: response.data.total,
                thisMonth: response.data.thisMonth,
                growthRate: response.data.growthRate,
            });
        } catch (err) {
            console.error('Error loading stats:', err);
        }
    };

    // Delete subscriber
    const handleDelete = async (id: string, email: string) => {
        if (!confirm(`¿Eliminar suscriptor ${email}?`)) {
            return;
        }

        try {
            await subscribersAPI.delete(id);
            fetchSubscribers();
            fetchStats();
        } catch (err: any) {
            alert(err.response?.data?.error || 'Error al eliminar');
        }
    };

    // Export to CSV
    const handleExport = async () => {
        try {
            const blob = await subscribersAPI.exportCSV();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `subscribers - ${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (err: any) {
            alert('Error al exportar CSV');
        }
    };

    // Handle search with debounce
    useEffect(() => {
        const timeoutId = setTimeout(() => {
            setPage(1); // Reset to first page on search
            fetchSubscribers();
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [search]);

    // Fetch subscribers when page, limit, or sort changes
    useEffect(() => {
        fetchSubscribers();
    }, [page, limit, sortBy, sortOrder]);

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
        <div className="subscribers-page">
            <AdminHeader />

            <div className="subscribers-container">
                {/* Page Title */}
                {/* Page Title & Stats */}
                <div className="page-header">
                    <div className="header-left-group">
                        <div className="title-group">
                            <h2>Suscriptores</h2>
                            <p className="subtitle">Gestión de audiencia</p>
                        </div>

                        {/* Compact Stats Row */}
                        <div className="stats-compact-row">
                            <div className="stat-compact-item">
                                <span className="sc-value">{stats.total}</span>
                                <span className="sc-label">Total</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-compact-item">
                                <span className="sc-value">+{stats.thisMonth}</span>
                                <span className="sc-label">Mes</span>
                            </div>
                            <div className="stat-divider"></div>
                            <div className="stat-compact-item">
                                <span className={`sc - value ${stats.growthRate >= 0 ? 'text-success' : 'text-danger'} `}>
                                    {stats.growthRate.toFixed(1)}%
                                </span>
                                <span className="sc-label">Crecimiento</span>
                            </div>
                        </div>
                    </div>

                    <div className="header-buttons">
                        <button onClick={() => setIsModalOpen(true)} className="btn-primary-ios">
                            <span className="icon">+</span> Nuevo
                        </button>
                        <button onClick={handleExport} className="btn-secondary-ios">
                            <span className="icon">↓</span> CSV
                        </button>
                    </div>
                </div>

                {/* Search and Filters */}
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

                {/* Error Message */}
                {error && (
                    <div className="error-message">
                        ❌ {error}
                    </div>
                )}

                {/* Loading State */}
                {loading ? (
                    <div className="loading-state">
                        <div className="spinner"></div>
                        <p>Cargando suscriptores...</p>
                    </div>
                ) : subscribers.length === 0 ? (
                    /* Empty State */
                    <div className="empty-state">
                        <div className="empty-icon">📭</div>
                        <h3>No hay suscriptores</h3>
                        <p>Los suscriptores aparecerán aquí cuando se registren.</p>
                    </div>
                ) : (
                    /* Subscribers Table */
                    <>
                        <div className="table-container">
                            <table className="subscribers-table">
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
                                                    className="btn-delete"
                                                    title="Eliminar suscriptor"
                                                >
                                                    🗑️
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
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
            </div>

            {/* Modal - iOS Sheet Style */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Registrar Suscriptores</h3>
                            <button className="close-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>

                        <div className="tabs-ios">
                            <button
                                className={`tab - btn ${importMode === 'single' ? 'active' : ''} `}
                                onClick={() => setImportMode('single')}
                            >
                                Individual
                            </button>
                            <button
                                className={`tab - btn ${importMode === 'bulk' ? 'active' : ''} `}
                                onClick={() => setImportMode('bulk')}
                            >
                                Importación Masiva
                            </button>
                        </div>

                        <div className="modal-body">
                            {importMode === 'single' ? (
                                <div className="form-stack">
                                    <div className="input-group">
                                        <label>Correo Electrónico</label>
                                        <input
                                            type="email"
                                            value={singleEmail}
                                            onChange={e => setSingleEmail(e.target.value)}
                                            placeholder="ejemplo@bidxaagui.com"
                                            className="input-ios"
                                        />
                                    </div>
                                    <div className="input-group">
                                        <label>Nombre (Opcional)</label>
                                        <input
                                            type="text"
                                            value={singleName}
                                            onChange={e => setSingleName(e.target.value)}
                                            placeholder="Juan Pérez"
                                            className="input-ios"
                                        />
                                    </div>
                                </div>
                            ) : (
                                <div className="bulk-import-container">
                                    <div className="smart-textarea-wrapper">
                                        <textarea
                                            value={bulkText}
                                            onChange={e => setBulkText(e.target.value)}
                                            placeholder={`Pega tu lista aquí.Detectamos automáticamente:
- JSON: [{ "email": "...", "name": "..." }]
    - CSV: email, nombre
        - Texto: email nombre`}
                                            className="textarea-ios"
                                        />
                                        <div className="smart-badge">✨ Smart Parse Activo</div>
                                    </div>

                                    {/* Preview Section */}
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
                        </div>

                        <div className="modal-footer">
                            <button className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                            <button
                                className="btn-confirm"
                                onClick={handleAddSubscribers}
                                disabled={isSubmitting || (importMode === 'single' ? !singleEmail : bulkPreview.length === 0)}
                            >
                                {isSubmitting ? 'Registrando...' : `Registrar ${importMode === 'bulk' && bulkPreview.length > 0 ? `(${bulkPreview.length})` : ''} `}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Subscribers;
