export interface HttpResponse<T = any> {
  data: T;
  status: number;
}

export interface HttpClient {
  get<T>(url: string, params?: any): Promise<HttpResponse<T>>;
  post<T>(url: string, body?: any): Promise<HttpResponse<T>>;
  put<T>(url: string, body?: any): Promise<HttpResponse<T>>;
  delete<T>(url: string): Promise<HttpResponse<T>>;
}
