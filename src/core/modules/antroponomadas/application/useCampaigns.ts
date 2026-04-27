import { useState, useEffect } from 'react';
import { getCampaignsUseCase, createCampaignUseCase, updateCampaignUseCase, deleteCampaignUseCase, sendCampaignUseCase, sendTestCampaignUseCase } from '../infrastructure/antroponomadas.dependencies';
import type { Campaign } from '../domain/campaign.model';
import { NetworkError } from '../../../shared/domain/errors';

export interface UseCampaignsReturn {
  campaigns: Campaign[];
  loading: boolean;
  error: string | null;
  fetchCampaigns: () => Promise<void>;
  createCampaign: (data: { subject: string; preview_text?: string; content: string }) => Promise<void>;
  updateCampaign: (id: string, data: { subject?: string; preview_text?: string; content?: string }) => Promise<void>;
  deleteCampaign: (id: string) => Promise<void>;
  sendCampaign: (id: string) => Promise<void>;
  sendTestCampaign: (id: string, emails: string[]) => Promise<void>;
}

/**
 * useCampaigns Custom Hook
 * Encapsulates all campaigns logic following Clean Architecture
 */
export const useCampaigns = (): UseCampaignsReturn => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCampaigns = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCampaignsUseCase.execute();
      setCampaigns(data || []);
    } catch (err) {
      console.error('Error fetching campaigns:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al cargar campañas');
    } finally {
      setLoading(false);
    }
  };

  const createCampaign = async (data: { subject: string; preview_text?: string; content: string }) => {
    setLoading(true);
    setError(null);
    try {
      await createCampaignUseCase.execute(data);
      await fetchCampaigns();
    } catch (err) {
      console.error('Error creating campaign:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al crear campaña');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateCampaign = async (id: string, data: { subject?: string; preview_text?: string; content?: string }) => {
    setLoading(true);
    setError(null);
    try {
      await updateCampaignUseCase.execute(id, data);
      await fetchCampaigns();
    } catch (err) {
      console.error('Error updating campaign:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al actualizar campaña');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteCampaign = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deleteCampaignUseCase.execute(id);
      await fetchCampaigns();
    } catch (err) {
      console.error('Error deleting campaign:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al eliminar campaña');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendCampaign = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await sendCampaignUseCase.execute(id);
      await fetchCampaigns();
    } catch (err) {
      console.error('Error sending campaign:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al enviar campaña');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const sendTestCampaign = async (id: string, emails: string[]) => {
    setLoading(true);
    setError(null);
    try {
      await sendTestCampaignUseCase.execute(id, emails);
    } catch (err) {
      console.error('Error sending test campaign:', err);
      setError(err instanceof NetworkError ? err.message : 'Error al enviar prueba');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCampaigns();
  }, []);

  return {
    campaigns,
    loading,
    error,
    fetchCampaigns,
    createCampaign,
    updateCampaign,
    deleteCampaign,
    sendCampaign,
    sendTestCampaign,
  };
};
