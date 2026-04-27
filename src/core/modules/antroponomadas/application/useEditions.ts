import { useState, useEffect } from 'react';
import { getEditionsUseCase, createEditionUseCase, deleteEditionUseCase } from '../infrastructure/antroponomadas.dependencies';
import type { Edition } from '../domain/edition.model';
import { NetworkError } from '../../../shared/domain/errors';

export interface UseEditionsReturn {
  editions: Edition[];
  loading: boolean;
  error: string | null;
  fetchEditions: () => Promise<void>;
  createEdition: (data: { titulo: string; descripcion: string; fecha: string }) => Promise<void>;
  deleteEdition: (id: string) => Promise<void>;
}

/**
 * useEditions Custom Hook
 * Encapsulates all editions logic following Clean Architecture
 * Components should only use this hook, not use cases directly
 */
export const useEditions = (): UseEditionsReturn => {
  const [editions, setEditions] = useState<Edition[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEditions = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getEditionsUseCase.execute();
      setEditions(data || []);
    } catch (err) {
      console.error('Error fetching editions:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al cargar ediciones');
    } finally {
      setLoading(false);
    }
  };

  const createEdition = async (data: { titulo: string; descripcion: string; fecha: string }) => {
    setLoading(true);
    setError(null);
    try {
      await createEditionUseCase.execute(data);
      await fetchEditions();
    } catch (err) {
      console.error('Error creating edition:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al crear edición');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteEdition = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteEditionUseCase.execute(id);
      await fetchEditions();
    } catch (err) {
      console.error('Error deleting edition:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al eliminar edición');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEditions();
  }, []);

  return {
    editions,
    loading,
    error,
    fetchEditions,
    createEdition,
    deleteEdition,
  };
};
