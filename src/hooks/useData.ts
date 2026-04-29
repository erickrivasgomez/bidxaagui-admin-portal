import { useState, useEffect, useCallback } from 'react';

// Framework-Agnostic Data Hook Interface
export interface UseDataResult<T> {
  data: T[] | null;
  loading: boolean;
  error: string | null;
  empty: boolean;
  refreshing: boolean;
  refresh: () => Promise<void>;
  create: (item: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, updates: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  setFilters: (filters: Record<string, any>) => void;
  setSorting: (sorting: { field: string; direction: 'asc' | 'desc' }) => void;
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    hasNext: boolean;
    hasPrev: boolean;
    setPage: (page: number) => void;
    setPageSize: (pageSize: number) => void;
  };
}

export interface DataFetcher<T> {
  findAll: (filters?: Record<string, any>, pagination?: any, sorting?: any) => Promise<T[]>;
  create: (item: Omit<T, 'id'>) => Promise<T>;
  update: (id: string, updates: Partial<T>) => Promise<T>;
  delete: (id: string) => Promise<void>;
  count: (filters?: Record<string, any>) => Promise<number>;
}

export interface UseDataOptions<T> {
  fetcher: DataFetcher<T>;
  initialFilters?: Record<string, any>;
  initialSorting?: { field: string; direction: 'asc' | 'desc' };
  initialPageSize?: number;
  autoRefresh?: boolean;
  refreshInterval?: number;
}

// Generic Data Hook Implementation
export function useData<T extends { id: string }>({
  fetcher,
  initialFilters = {},
  initialSorting = { field: 'created_at', direction: 'desc' },
  initialPageSize = 20,
  autoRefresh = false,
  refreshInterval = 30000
}: UseDataOptions<T>): UseDataResult<T> {
  const [state, setState] = useState({
    data: null as T[] | null,
    loading: true,
    error: null as string | null,
    empty: false,
    refreshing: false
  });

  const [filters, setFilters] = useState(initialFilters);
  const [sorting, setSorting] = useState(initialSorting);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: initialPageSize,
    total: 0,
    hasNext: false,
    hasPrev: false
  });

  // Fetch data function
  const fetchData = useCallback(async (isRefresh = false) => {
    try {
      setState(prev => ({
        ...prev,
        loading: !isRefresh,
        refreshing: isRefresh,
        error: null
      }));

      const paginationParams = {
        page: pagination.page,
        pageSize: pagination.pageSize
      };

      const [data, total] = await Promise.all([
        fetcher.findAll(filters, paginationParams, sorting),
        fetcher.count(filters)
      ]);

      setState({
        data,
        loading: false,
        error: null,
        empty: data.length === 0,
        refreshing: false
      });

      setPagination(prev => ({
        ...prev,
        total,
        hasNext: (pagination.page * pagination.pageSize) < total,
        hasPrev: pagination.page > 1
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        loading: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        empty: false,
        refreshing: false
      }));
    }
  }, [fetcher, filters, sorting, pagination.page, pagination.pageSize]);

  // Initial load
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      fetchData(true);
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval, fetchData]);

  // CRUD operations
  const create = useCallback(async (item: Omit<T, 'id'>): Promise<T> => {
    try {
      const newItem = await fetcher.create(item);
      
      // Refresh data to get updated list
      await fetchData();
      
      return newItem;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create item';
      setState(prev => ({ ...prev, error: errorMessage }));
      throw error;
    }
  }, [fetcher, fetchData]);

  const update = useCallback(async (id: string, updates: Partial<T>): Promise<T> => {
    try {
      const updatedItem = await fetcher.update(id, updates);
      
      // Update local state optimistically
      setState(prev => ({
        ...prev,
        data: prev.data?.map(item => 
          item.id === id ? { ...item, ...updates } : item
        ) || null
      }));
      
      return updatedItem;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to update item';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      // Refresh data on error to restore correct state
      await fetchData();
      
      throw error;
    }
  }, [fetcher, fetchData]);

  const deleteItem = useCallback(async (id: string): Promise<void> => {
    try {
      await fetcher.delete(id);
      
      // Update local state optimistically
      setState(prev => ({
        ...prev,
        data: prev.data?.filter(item => item.id !== id) || null,
        empty: (prev.data?.filter(item => item.id !== id) || []).length === 0
      }));
      
      // Update pagination
      setPagination(prev => ({
        ...prev,
        total: prev.total - 1
      }));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete item';
      setState(prev => ({ ...prev, error: errorMessage }));
      
      // Refresh data on error to restore correct state
      await fetchData();
      
      throw error;
    }
  }, [fetcher, fetchData]);

  // Pagination controls
  const setPage = useCallback((page: number) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setPagination(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  return {
    ...state,
    refresh: () => fetchData(true),
    create,
    update,
    delete: deleteItem,
    setFilters,
    setSorting,
    pagination: {
      ...pagination,
      setPage,
      setPageSize
    }
  };
}

// Specific hooks for different entities
export function useCampaigns() {
  // This would be implemented with actual API calls
  const mockFetcher: DataFetcher<any> = {
    findAll: async () => [],
    create: async (item) => ({ ...item, id: Date.now().toString() }),
    update: async (id, updates) => ({ id, ...updates }),
    delete: async () => {},
    count: async () => 0
  };

  return useData({
    fetcher: mockFetcher,
    initialSorting: { field: 'created_at', direction: 'desc' }
  });
}

export function useEditions() {
  // This would be implemented with actual API calls
  const mockFetcher: DataFetcher<any> = {
    findAll: async () => [],
    create: async (item) => ({ ...item, id: Date.now().toString() }),
    update: async (id, updates) => ({ id, ...updates }),
    delete: async () => {},
    count: async () => 0
  };

  return useData({
    fetcher: mockFetcher,
    initialSorting: { field: 'fecha', direction: 'desc' }
  });
}

export function useSubscribers() {
  // This would be implemented with actual API calls
  const mockFetcher: DataFetcher<any> = {
    findAll: async () => [],
    create: async (item) => ({ ...item, id: Date.now().toString() }),
    update: async (id, updates) => ({ id, ...updates }),
    delete: async () => {},
    count: async () => 0
  };

  return useData({
    fetcher: mockFetcher,
    initialSorting: { field: 'fecha_suscripcion', direction: 'desc' }
  });
}

export function useSuppliers() {
  // This would be implemented with actual API calls
  const mockFetcher: DataFetcher<any> = {
    findAll: async () => [],
    create: async (item) => ({ ...item, id: Date.now().toString() }),
    update: async (id, updates) => ({ id, ...updates }),
    delete: async () => {},
    count: async () => 0
  };

  return useData({
    fetcher: mockFetcher,
    initialSorting: { field: 'created_at', direction: 'desc' }
  });
}
