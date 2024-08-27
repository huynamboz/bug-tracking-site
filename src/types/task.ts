export interface Task {
    id: string;
    name: string;
    position: number;
    description: string;
    total_checklist: number;
    total_checklist_done: number;
    label?: {
        id: string;
        name: string;
        color: string;
    };
}

export interface IGroup {
    name: string;
    position: number;
    board: string;
    id: string;
}
