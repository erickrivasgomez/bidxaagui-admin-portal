import { Subscriber, SubscriberStats } from './subscriber.model';

export interface SubscriberRepository {
    getAll(params?: any): Promise<{ subscribers: Subscriber[], pagination: any }>;
    getStats(): Promise<SubscriberStats>;
    delete(id: string): Promise<void>;
    create(email: string, name?: string): Promise<void>;
    exportCSV(): Promise<Blob>;
}
