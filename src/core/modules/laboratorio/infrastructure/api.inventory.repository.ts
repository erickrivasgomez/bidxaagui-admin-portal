import { InventoryRepository, InventoryItem } from '../domain/inventory.repository';
import { HttpClient } from '../../../shared/domain/http.client.interface';
import { NetworkError } from '../../../shared/domain/errors';

export class ApiInventoryRepository implements InventoryRepository {
  constructor(private httpClient: HttpClient) {}

  async getInventory(): Promise<InventoryItem[]> {
    try {
      // Mock data inicial, listo para cambiarse por this.httpClient.get('/api/labs/inventory')
      return [
        { id: '1', name: 'Pomada de Árnica 60g', price: 150.00, stock: 45, min_stock: 10 },
        { id: '2', name: 'Microdosis Valeriana 30ml', price: 90.00, stock: 12, min_stock: 15 },
        { id: '3', name: 'Tintura Madre Equinácea', price: 210.00, stock: 8, min_stock: 5 },
      ];
    } catch (e) {
      throw new NetworkError('Error al cargar inventario.');
    }
  }

  async updateStock(id: string, quantity: number): Promise<void> {
    try {
      await this.httpClient.put(`/api/labs/inventory/${id}`, { quantity });
    } catch (e) {
      throw new NetworkError('Error al actualizar el stock.');
    }
  }
}
