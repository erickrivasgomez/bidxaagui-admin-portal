import { httpClient } from './api.factory';
import { ApiAuthRepository } from './api.auth.repository';
import { RequestMagicLinkUseCase } from '../application/request-magic-link.use-case';
import { VerifyMagicLinkUseCase } from '../application/verify-magic-link.use-case';
import { LogoutUseCase } from '../application/logout.use-case';

// Creamos la instancia del repositorio
const authRepository = new ApiAuthRepository(httpClient);

// Inyectamos las dependencias en los Casos de Uso
export const requestMagicLinkUseCase = new RequestMagicLinkUseCase(authRepository);
export const verifyMagicLinkUseCase = new VerifyMagicLinkUseCase(authRepository);
export const logoutUseCase = new LogoutUseCase();
