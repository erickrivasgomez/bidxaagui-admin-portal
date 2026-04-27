import { AuthRepository } from '../domain/auth.repository';
import { VerifyMagicLinkResult } from '../domain/user.model';
import { HttpClient } from '../domain/http.client.interface';
import { AuthenticationError } from '../domain/errors';

export class ApiAuthRepository implements AuthRepository {
    constructor(private httpClient: HttpClient) {}

    async requestMagicLink(email: string): Promise<void> {
        try {
            await this.httpClient.post('/api/auth/magic-link/request', { email });
        } catch (error: any) {
            // Check if it's an Axios error or generic (depending on abstraction)
            if (error.response?.status === 404) {
                throw new AuthenticationError('Correo no encontrado. Por favor contacta al administrador.');
            }
            throw new AuthenticationError('Error al solicitar el enlace. Por favor intenta de nuevo.');
        }
    }

    async verifyMagicLink(token: string): Promise<VerifyMagicLinkResult> {
        try {
            const response = await this.httpClient.get<{ success: boolean; data: VerifyMagicLinkResult }>(
                `/api/auth/magic-link/verify?token=${token}`
            );
            return response.data.data;
        } catch (error: any) {
            throw new AuthenticationError('Token inválido, expirado o ya utilizado');
        }
    }
}
