import { httpClient } from '../../../shared/infrastructure/api.factory';

// Repositories
import { ApiEditionRepository } from './api.edition.repository';
import { ApiSubscriberRepository } from './api.subscriber.repository';
import { ApiCampaignRepository } from './api.campaign.repository';

// Use Cases
import { GetEditionsUseCase, CreateEditionUseCase, DeleteEditionUseCase, UploadEditionPageUseCase, GetEditionPagesUseCase, UploadEditionPdfUseCase } from '../application/edition.use-cases';
import { GetSubscribersUseCase, GetSubscribersStatsUseCase, DeleteSubscriberUseCase, ExportSubscribersCsvUseCase, CreateSubscriberUseCase } from '../application/subscriber.use-cases';
import { GetCampaignsUseCase, CreateCampaignUseCase, UpdateCampaignUseCase, DeleteCampaignUseCase, SendCampaignUseCase, SendTestCampaignUseCase } from '../application/campaign.use-cases';

// Instances
const editionRepository = new ApiEditionRepository(httpClient);
const subscriberRepository = new ApiSubscriberRepository(httpClient);
const campaignRepository = new ApiCampaignRepository(httpClient);

// Exports
export const getEditionsUseCase = new GetEditionsUseCase(editionRepository);
export const createEditionUseCase = new CreateEditionUseCase(editionRepository);
export const deleteEditionUseCase = new DeleteEditionUseCase(editionRepository);
export const uploadEditionPageUseCase = new UploadEditionPageUseCase(editionRepository);
export const getEditionPagesUseCase = new GetEditionPagesUseCase(editionRepository);
export const uploadEditionPdfUseCase = new UploadEditionPdfUseCase(editionRepository);

export const getSubscribersUseCase = new GetSubscribersUseCase(subscriberRepository);
export const getSubscribersStatsUseCase = new GetSubscribersStatsUseCase(subscriberRepository);
export const deleteSubscriberUseCase = new DeleteSubscriberUseCase(subscriberRepository);
export const exportSubscribersCsvUseCase = new ExportSubscribersCsvUseCase(subscriberRepository);
export const createSubscriberUseCase = new CreateSubscriberUseCase(subscriberRepository);

export const getCampaignsUseCase = new GetCampaignsUseCase(campaignRepository);
export const createCampaignUseCase = new CreateCampaignUseCase(campaignRepository);
export const updateCampaignUseCase = new UpdateCampaignUseCase(campaignRepository);
export const deleteCampaignUseCase = new DeleteCampaignUseCase(campaignRepository);
export const sendCampaignUseCase = new SendCampaignUseCase(campaignRepository);
export const sendTestCampaignUseCase = new SendTestCampaignUseCase(campaignRepository);
