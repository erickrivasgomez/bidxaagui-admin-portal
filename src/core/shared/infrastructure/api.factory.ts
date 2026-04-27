import { AxiosHttpClient } from './axios.http.client';
import { useAuthStore } from '../../../store/authStore'; 

// Obtenemos la URL de la API con lógica idéntica a la legacy para no romper el entorno
let API_URL = import.meta.env.VITE_API_URL;

if (!API_URL) {
    if (typeof window !== 'undefined' &&
        (window.location.hostname.includes('bidxaagui.com') || window.location.hostname.includes('pages.dev'))) {
        API_URL = 'https://api.bidxaagui.com';
    } else {
        API_URL = 'http://localhost:8787';
    }
}

// Instancia global compartida que cumple con la interfaz HttpClient pura
export const httpClient = new AxiosHttpClient(
  API_URL,
  () => useAuthStore.getState().token,
  () => {
    useAuthStore.getState().logout();
    if (typeof window !== 'undefined') {
      window.location.href = '/login';
    }
  }
);
