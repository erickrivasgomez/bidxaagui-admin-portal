import { InventoryRepository, InventoryItem } from '../domain/inventory.repository';

export class GetInventoryUseCase {
  constructor(private inventoryRepository: InventoryRepository) {}
  execute(): Promise<InventoryItem[]> {
    return this.inventoryRepository.getInventory();
  }
}

export class UpdateStockUseCase {
  constructor(private inventoryRepository: InventoryRepository) {}
  execute(id: string, quantity: number): Promise<void> {
    return this.inventoryRepository.updateStock(id, quantity);
  }
}
