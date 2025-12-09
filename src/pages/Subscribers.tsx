import React, { useState, useEffect } from 'react';
import { subscribersAPI, type Subscriber } from '../services/api';
import { useAuthStore } from '../store/authStore';
import './Subscribers.css';

const Subscribers: React.FC = () => {
    const user = useAuthStore((state) => state.user);
    const logout = useAuthStore((state) => state.logout);

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
    const [sortBy, setSortBy] = useState('subscribed_at');
    const [sortOrder, setSortOrder] = useState<'ASC' | 'DESC'>('DESC');

    // Stats state
    const [stats, setStats] = useState({
        total: 0,
        thisMonth: 0,
        growthRate: 0,
    });

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
            a.download = `subscribers-${new Date().toISOString().split('T')[0]}.csv`;
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
            {/* Header */}
            <header className="subscribers-header">
                <div className="header-content">
                    <h1>BIDXAAGUI</h1>
                    <p className="subtitle">Panel de Administración</p>
                </div>
                <div className="header-actions">
                    <span className="user-email">{user?.email}</span>
                    <button onClick={logout} className="btn-logout">
                        Cerrar Sesión
                    </button>
                </div>
            </header>

            <div className="subscribers-container">
                {/* Page Title */}
                <div className="page-header">
                    <h2>Suscriptores</h2>
                    <button onClick={handleExport} className="btn-export">
                        📥 Exportar CSV
                    </button>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon">👥</div>
                        <div className="stat-content">
                            <h3>{stats.total}</h3>
                            <p>Total Suscriptores</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">📈</div>
                        <div className="stat-content">
                            <h3>{stats.thisMonth}</h3>
                            <p>Nuevos Este Mes</p>
                        </div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon">
                            {stats.growthRate >= 0 ? '🔥' : '📉'}
                        </div>
                        <div className="stat-content">
                            <h3>{stats.growthRate.toFixed(1)}%</h3>
                            <p>Crecimiento</p>
                        </div>
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
                                                setSortBy('email');
                                                setSortOrder(sortOrder === 'ASC' ? 'DESC' : 'ASC');
                                            }}
                                            className="sortable"
                                        >
                                            Email {sortBy === 'email' && (sortOrder === 'ASC' ? '↑' : '↓')}
                                        </th>
                                        <th>Nombre</th>
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
                                            <td className="email-cell">{sub.email}</td>
                                            <td>{sub.name || '-'}</td>
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
        </div>
    );
};

export default Subscribers;
