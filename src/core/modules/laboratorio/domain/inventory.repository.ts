import { Product } from './product.model';

export interface InventoryItem extends Product {
  stock: number;
  min_stock: number;
}

export interface InventoryRepository {
  getInventory(): Promise<InventoryItem[]>;
  updateStock(id: string, quantity: number): Promise<void>;
}
