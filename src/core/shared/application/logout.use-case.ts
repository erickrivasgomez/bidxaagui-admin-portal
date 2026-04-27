export class LogoutUseCase {
    // Si en el futuro agregas revocación de tokens en backend, 
    // inyectarías el AuthRepository aquí.

    async execute(clearSessionCallback: () => void): Promise<void> {
        // En este momento el logout es puramente local (borrar JWT).
        clearSessionCallback();
        
        if (typeof window !== 'undefined') {
            window.location.href = '/login';
        }
    }
}
