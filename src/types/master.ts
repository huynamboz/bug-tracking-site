export interface Language {
    code: string;
    id: string;
    name: string;
}

export interface IMessageSocket {
    id?: number;
    is_read?: boolean;
    created_at?: number;
    type: string;
    action: string;
    project_id?: string;
    sender_id?: string;
    conversation_id?: string;
    objectable_id?: string;
    data: {
        status: string;
        data: any;
    };
}
