import { SalesRepository } from '../domain/sales.repository';
import { Product } from '../domain/product.model';

export class GetPosProductsUseCase {
  constructor(private salesRepository: SalesRepository) {}
  execute(): Promise<Product[]> {
    return this.salesRepository.getPosProducts();
  }
}

export class ProcessSaleUseCase {
  constructor(private salesRepository: SalesRepository) {}
  execute(productIds: string[], total: number): Promise<void> {
    return this.salesRepository.processSale(productIds, total);
  }
}
