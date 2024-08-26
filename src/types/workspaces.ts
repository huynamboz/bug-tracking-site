export interface IWorkspace {
    id: string;
    name: string;
    owner: Owner;
    permission: string;
    total_member: number;
}

interface Owner {
    id: string;
    first_name: string;
    last_name: string;
    email: string;
    user_id: string;
    active: boolean;
}
