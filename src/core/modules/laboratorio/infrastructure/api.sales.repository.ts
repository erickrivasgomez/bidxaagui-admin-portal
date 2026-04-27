import { SalesRepository } from '../domain/sales.repository';
import { Product } from '../domain/product.model';
import { HttpClient } from '../../../shared/domain/http.client.interface';
import { NetworkError } from '../../../shared/domain/errors';

export class ApiSalesRepository implements SalesRepository {
  constructor(private httpClient: HttpClient) {}

  async getPosProducts(): Promise<Product[]> {
    // Por ahora retornamos el mock del frontend, pero listo para conectarse al endpoint real
    return [
      { id: '1', name: 'Pomada de Árnica 60g', price: 150.00 },
      { id: '2', name: 'Microdosis Valeriana 30ml', price: 90.00 },
      { id: '3', name: 'Tintura Madre Equinácea', price: 210.00 },
      { id: '4', name: 'Té Relajante Mezcla Especial', price: 85.00 },
    ];
  }

  async processSale(productIds: string[], total: number): Promise<void> {
    try {
      await this.httpClient.post('/api/labs/sales', { productIds, total });
    } catch (e) {
      throw new NetworkError('Error al procesar la venta en el Punto de Venta.');
    }
  }
}
