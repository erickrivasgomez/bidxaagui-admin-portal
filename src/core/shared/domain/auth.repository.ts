import { VerifyMagicLinkResult } from './user.model';

export interface AuthRepository {
    requestMagicLink(email: string): Promise<void>;
    verifyMagicLink(token: string): Promise<VerifyMagicLinkResult>;
}
