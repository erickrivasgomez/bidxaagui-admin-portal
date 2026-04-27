import { SubscriberRepository } from '../domain/subscriber.repository';
import { Subscriber, SubscriberStats } from '../domain/subscriber.model';

export class GetSubscribersUseCase {
    constructor(private repository: SubscriberRepository) {}
    execute(params?: any): Promise<{ subscribers: Subscriber[], pagination: any }> {
        return this.repository.getAll(params);
    }
}

export class GetSubscribersStatsUseCase {
    constructor(private repository: SubscriberRepository) {}
    execute(): Promise<SubscriberStats> {
        return this.repository.getStats();
    }
}

export class DeleteSubscriberUseCase {
    constructor(private repository: SubscriberRepository) {}
    execute(id: string): Promise<void> {
        return this.repository.delete(id);
    }
}

export class ExportSubscribersCsvUseCase {
    constructor(private repository: SubscriberRepository) {}
    execute(): Promise<Blob> {
        return this.repository.exportCSV();
    }
}

export class CreateSubscriberUseCase {
    constructor(private repository: SubscriberRepository) {}
    execute(email: string, name?: string): Promise<void> {
        return this.repository.create(email, name);
    }
}
