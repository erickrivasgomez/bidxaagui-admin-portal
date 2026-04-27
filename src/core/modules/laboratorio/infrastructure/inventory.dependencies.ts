import { httpClient } from '../../../shared/infrastructure/api.factory';
import { ApiInventoryRepository } from './api.inventory.repository';
import { GetInventoryUseCase, UpdateStockUseCase } from '../application/inventory.use-cases';

const inventoryRepository = new ApiInventoryRepository(httpClient);

export const getInventoryUseCase = new GetInventoryUseCase(inventoryRepository);
export const updateStockUseCase = new UpdateStockUseCase(inventoryRepository);
