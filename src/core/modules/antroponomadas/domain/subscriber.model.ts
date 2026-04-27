export interface Subscriber {
    id: string;
    email: string;
    name?: string;
    subscribed: number;
    subscribed_at: string;
    unsubscribed_at?: string;
}

export interface SubscriberStats {
    total: number;
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
    recentGrowth: Array<{ date: string; count: number }>;
}
