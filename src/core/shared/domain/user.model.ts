export interface User {
    id: string;
    email: string;
    name?: string;
}

export interface VerifyMagicLinkResult {
    token: string;
    user: User;
}
