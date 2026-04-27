import { AuthRepository } from '../domain/auth.repository';
import { VerifyMagicLinkResult } from '../domain/user.model';
import { ValidationError } from '../domain/errors';

export class VerifyMagicLinkUseCase {
    constructor(private authRepository: AuthRepository) {}

    async execute(token: string | null): Promise<VerifyMagicLinkResult> {
        if (!token) {
            throw new ValidationError('Token no proporcionado o inválido en la URL');
        }

        return await this.authRepository.verifyMagicLink(token);
    }
}
