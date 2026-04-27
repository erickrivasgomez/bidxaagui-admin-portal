import { EditionRepository } from '../domain/edition.repository';
import { Edition, EditionPage } from '../domain/edition.model';
import { HttpClient } from '../../../shared/domain/http.client.interface';
import { NetworkError } from '../../../shared/domain/errors';

export class ApiEditionRepository implements EditionRepository {
    constructor(private httpClient: HttpClient) {}

    async getAll(): Promise<Edition[]> {
        try {
            const res = await this.httpClient.get<any>('/api/admin/editions');
            return res.data.data;
        } catch {
            throw new NetworkError('Error al cargar las ediciones');
        }
    }

    async create(data: { titulo: string; descripcion: string; fecha: string }): Promise<{ id: string }> {
        try {
            const res = await this.httpClient.post<any>('/api/admin/editions', data);
            return res.data.data;
        } catch {
            throw new NetworkError('Error al crear la edición');
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.httpClient.delete(`/api/admin/editions/${id}`);
        } catch {
            throw new NetworkError('Error al eliminar la edición');
        }
    }

    async uploadPage(id: string, formData: FormData): Promise<void> {
        try {
            await this.httpClient.post(`/api/admin/editions/${id}/pages`, formData);
        } catch {
            throw new NetworkError('Error al subir la página');
        }
    }

    async getPages(id: string): Promise<EditionPage[]> {
        try {
            const res = await this.httpClient.get<any>(`/api/admin/editions/${id}/pages`);
            return res.data.data;
        } catch {
            throw new NetworkError('Error al cargar las páginas');
        }
    }

    async uploadPDF(id: string, formData: FormData): Promise<void> {
        try {
            await this.httpClient.post(`/api/admin/editions/${id}/pdf`, formData);
        } catch {
            throw new NetworkError('Error al subir el PDF');
        }
    }
}
