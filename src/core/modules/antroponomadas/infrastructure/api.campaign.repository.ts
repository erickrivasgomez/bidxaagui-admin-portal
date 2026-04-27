import { CampaignRepository } from '../domain/campaign.repository';
import { Campaign } from '../domain/campaign.model';
import { HttpClient } from '../../../shared/domain/http.client.interface';
import { NetworkError } from '../../../shared/domain/errors';

export class ApiCampaignRepository implements CampaignRepository {
    constructor(private httpClient: HttpClient) {}

    async getAll(): Promise<Campaign[]> {
        try {
            const res = await this.httpClient.get<any>('/api/admin/campaigns');
            return res.data.data || res.data;
        } catch {
            throw new NetworkError('Error al cargar campañas');
        }
    }

    async create(data: { subject: string; preview_text?: string; content: string }): Promise<Campaign> {
        try {
            const res = await this.httpClient.post<any>('/api/admin/campaigns', data);
            return res.data.data;
        } catch {
            throw new NetworkError('Error al crear campaña');
        }
    }

    async update(id: string, data: Partial<Campaign>): Promise<void> {
        try {
            await this.httpClient.put(`/api/admin/campaigns/${id}`, data);
        } catch {
            throw new NetworkError('Error al actualizar campaña');
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.httpClient.delete(`/api/admin/campaigns/${id}`);
        } catch {
            throw new NetworkError('Error al eliminar campaña');
        }
    }

    async send(id: string): Promise<void> {
        try {
            await this.httpClient.post(`/api/admin/campaigns/${id}/send`);
        } catch {
            throw new NetworkError('Error al enviar la campaña');
        }
    }

    async sendTest(id: string, emails: string[]): Promise<void> {
        try {
            await this.httpClient.post(`/api/admin/campaigns/${id}/send-test`, { emails });
        } catch {
            throw new NetworkError('Error al enviar correo de prueba');
        }
    }
}
