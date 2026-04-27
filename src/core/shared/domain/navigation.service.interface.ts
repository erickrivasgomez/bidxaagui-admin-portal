/**
 * Navigation Service Interface
 * Framework-agnostic navigation abstraction
 * Allows switching between React Router, Next.js, Vue Router, etc.
 */
export interface NavigationService {
  navigate(path: string): void;
  back(): void;
  forward(): void;
  replace(path: string): void;
  getCurrentPath(): string;
}
