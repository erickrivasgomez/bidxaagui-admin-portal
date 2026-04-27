import { useNavigate, useLocation } from 'react-router-dom';
import { NavigationService } from '../domain/navigation.service.interface';

/**
 * React Router Adapter
 * Implements NavigationService using React Router
 * This adapter should be used as a hook in components
 */
export const useReactRouterNavigation = (): NavigationService => {
  const navigate = useNavigate();
  const location = useLocation();

  return {
    navigate: (path: string) => navigate(path),
    back: () => navigate(-1),
    forward: () => navigate(1),
    replace: (path: string) => navigate(path, { replace: true }),
    getCurrentPath: () => location.pathname,
  };
};
