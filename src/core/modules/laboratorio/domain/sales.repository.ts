import { Product } from './product.model';

export interface SalesRepository {
  getPosProducts(): Promise<Product[]>;
  processSale(productIds: string[], total: number): Promise<void>;
}
