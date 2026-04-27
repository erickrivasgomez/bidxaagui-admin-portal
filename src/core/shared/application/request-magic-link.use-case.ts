import { AuthRepository } from '../domain/auth.repository';
import { ValidationError } from '../domain/errors';

export class RequestMagicLinkUseCase {
    constructor(private authRepository: AuthRepository) {}

    async execute(email: string): Promise<void> {
        if (!email.trim()) {
            throw new ValidationError('Por favor ingresa tu correo electrónico');
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            throw new ValidationError('Por favor ingresa un correo electrónico válido');
        }

        await this.authRepository.requestMagicLink(email);
    }
}
