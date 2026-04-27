import { CampaignRepository } from '../domain/campaign.repository';
import { Campaign } from '../domain/campaign.model';

export class GetCampaignsUseCase {
    constructor(private repository: CampaignRepository) {}
    execute(): Promise<Campaign[]> {
        return this.repository.getAll();
    }
}

export class CreateCampaignUseCase {
    constructor(private repository: CampaignRepository) {}
    execute(data: { subject: string; preview_text?: string; content: string }): Promise<Campaign> {
        return this.repository.create(data);
    }
}

export class UpdateCampaignUseCase {
    constructor(private repository: CampaignRepository) {}
    execute(id: string, data: Partial<Campaign>): Promise<void> {
        return this.repository.update(id, data);
    }
}

export class DeleteCampaignUseCase {
    constructor(private repository: CampaignRepository) {}
    execute(id: string): Promise<void> {
        return this.repository.delete(id);
    }
}

export class SendCampaignUseCase {
    constructor(private repository: CampaignRepository) {}
    execute(id: string): Promise<void> {
        return this.repository.send(id);
    }
}

export class SendTestCampaignUseCase {
    constructor(private repository: CampaignRepository) {}
    execute(id: string, emails: string[]): Promise<void> {
        return this.repository.sendTest(id, emails);
    }
}
