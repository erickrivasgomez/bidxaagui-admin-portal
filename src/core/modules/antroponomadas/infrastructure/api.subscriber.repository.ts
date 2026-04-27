import { SubscriberRepository } from '../domain/subscriber.repository';
import { Subscriber, SubscriberStats } from '../domain/subscriber.model';
import { HttpClient } from '../../../shared/domain/http.client.interface';
import { NetworkError } from '../../../shared/domain/errors';

export class ApiSubscriberRepository implements SubscriberRepository {
    constructor(private httpClient: HttpClient) {}

    async getAll(params?: any): Promise<{ subscribers: Subscriber[], pagination: any }> {
        try {
            const queryParams = new URLSearchParams();
            if (params?.page) queryParams.append('page', params.page.toString());
            if (params?.limit) queryParams.append('limit', params.limit.toString());
            if (params?.search) queryParams.append('search', params.search);
            if (params?.sortBy) queryParams.append('sortBy', params.sortBy);
            if (params?.sortOrder) queryParams.append('sortOrder', params.sortOrder);

            const res = await this.httpClient.get<any>(`/api/admin/subscribers?${queryParams.toString()}`);
            return res.data;
        } catch {
            throw new NetworkError('Error al cargar los suscriptores');
        }
    }

    async getStats(): Promise<SubscriberStats> {
        try {
            const res = await this.httpClient.get<any>('/api/admin/subscribers/stats');
            return res.data.data;
        } catch {
            throw new NetworkError('Error al cargar las estadísticas');
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.httpClient.delete(`/api/admin/subscribers/${id}`);
        } catch {
            throw new NetworkError('Error al eliminar el suscriptor');
        }
    }

    async create(email: string, name?: string): Promise<void> {
        try {
            await this.httpClient.post('/api/auth/newsletter/subscribe', { email, name });
        } catch {
            throw new NetworkError('Error al crear el suscriptor');
        }
    }

    async exportCSV(): Promise<Blob> {
        try {
            const res = await this.httpClient.get<Blob>('/api/admin/subscribers/export');
            return res.data;
        } catch {
            throw new NetworkError('Error al exportar los suscriptores');
        }
    }
}
