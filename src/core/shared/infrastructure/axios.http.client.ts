import axios, { AxiosInstance, AxiosError } from 'axios';
import { HttpClient, HttpResponse } from '../domain/http.client.interface';
import { NetworkError, AuthenticationError } from '../domain/errors';

export class AxiosHttpClient implements HttpClient {
  private instance: AxiosInstance;

  constructor(
    baseURL: string, 
    private getToken: () => string | null, 
    private onUnauthorized: () => void
  ) {
    this.instance = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.instance.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token && config.headers) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.instance.interceptors.response.use(
      (response) => response,
      (error: AxiosError) => {
        if (error.response?.status === 401) {
          this.onUnauthorized();
          throw new AuthenticationError();
        }
        if (!error.response) {
          throw new NetworkError();
        }
        throw error;
      }
    );
  }

  async get<T>(url: string, params?: any): Promise<HttpResponse<T>> {
    const response = await this.instance.get<T>(url, { params });
    return { data: response.data, status: response.status };
  }

  async post<T>(url: string, body?: any): Promise<HttpResponse<T>> {
    const response = await this.instance.post<T>(url, body);
    return { data: response.data, status: response.status };
  }

  async put<T>(url: string, body?: any): Promise<HttpResponse<T>> {
    const response = await this.instance.put<T>(url, body);
    return { data: response.data, status: response.status };
  }

  async delete<T>(url: string): Promise<HttpResponse<T>> {
    const response = await this.instance.delete<T>(url);
    return { data: response.data, status: response.status };
  }
}
