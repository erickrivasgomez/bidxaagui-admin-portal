import { Campaign } from './campaign.model';

export interface CampaignRepository {
    getAll(): Promise<Campaign[]>;
    create(data: { subject: string; preview_text?: string; content: string }): Promise<Campaign>;
    update(id: string, data: Partial<Campaign>): Promise<void>;
    delete(id: string): Promise<void>;
    send(id: string): Promise<void>;
    sendTest(id: string, emails: string[]): Promise<void>;
}
