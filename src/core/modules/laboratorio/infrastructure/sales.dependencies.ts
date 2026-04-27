import { httpClient } from '../../../shared/infrastructure/api.factory';
import { ApiSalesRepository } from './api.sales.repository';
import { GetPosProductsUseCase, ProcessSaleUseCase } from '../application/sales.use-cases';

const salesRepository = new ApiSalesRepository(httpClient);

export const getPosProductsUseCase = new GetPosProductsUseCase(salesRepository);
export const processSaleUseCase = new ProcessSaleUseCase(salesRepository);
