import { useState, useEffect } from 'react';
import { getSubscribersUseCase, getSubscribersStatsUseCase, deleteSubscriberUseCase, exportSubscribersCsvUseCase, createSubscriberUseCase } from '../infrastructure/antroponomadas.dependencies';
import type { Subscriber } from '../domain/subscriber.model';
import { NetworkError } from '../../../shared/domain/errors';

export interface UseSubscribersReturn {
  subscribers: Subscriber[];
  loading: boolean;
  error: string | null;
  stats: { total: number; thisMonth: number; growthRate: number };
  pagination: { total: number; totalPages: number };
  fetchSubscribers: (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC' }) => Promise<void>;
  fetchStats: () => Promise<void>;
  deleteSubscriber: (id: string) => Promise<void>;
  exportCsv: () => Promise<Blob>;
  createSubscriber: (email: string, name?: string) => Promise<void>;
}

/**
 * useSubscribers Custom Hook
 * Encapsulates all subscribers logic following Clean Architecture
 */
export const useSubscribers = (): UseSubscribersReturn => {
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, growthRate: 0 });
  const [pagination, setPagination] = useState({ total: 0, totalPages: 0 });

  const fetchSubscribers = async (params?: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'ASC' | 'DESC' }) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubscribersUseCase.execute(params);
      setSubscribers(data.subscribers || []);
      setPagination(data.pagination || { total: 0, totalPages: 0 });
    } catch (err) {
      console.error('Error fetching subscribers:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al cargar suscriptores');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const data = await getSubscribersStatsUseCase.execute();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const deleteSubscriber = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteSubscriberUseCase.execute(id);
      await fetchSubscribers();
      await fetchStats();
    } catch (err) {
      console.error('Error deleting subscriber:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al eliminar suscriptor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const exportCsv = async () => {
    try {
      return await exportSubscribersCsvUseCase.execute();
    } catch (err) {
      console.error('Error exporting CSV:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al exportar CSV');
      throw err;
    }
  };

  const createSubscriber = async (email: string, name?: string) => {
    setLoading(true);
    setError(null);
    try {
      await createSubscriberUseCase.execute(email, name);
      await fetchSubscribers();
      await fetchStats();
    } catch (err) {
      console.error('Error creating subscriber:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al crear suscriptor');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscribers();
    fetchStats();
  }, []);

  return {
    subscribers,
    loading,
    error,
    stats,
    pagination,
    fetchSubscribers,
    fetchStats,
    deleteSubscriber,
    exportCsv,
    createSubscriber,
  };
};
