export interface Campaign {
    id: string;
    subject: string;
    preview_text?: string;
    content: string;
    status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';
    sent_at?: string;
    total_recipients: number;
    successful_sends: number;
    failed_sends: number;
    created_at: string;
    updated_at: string;
}
