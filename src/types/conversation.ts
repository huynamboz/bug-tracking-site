import type { IUser } from ".";

// export interface Conversation {
//     id: string;
//     name: string;
//     owner: IUser;
//     permission: string;
//     total_member: number;
// }

export interface Conversation {
    id: string;
    name: string;
    type: string;
    count_unread_messages: number;
    user_ids: string[];
    is_pin: boolean;
    turn_off_notification: boolean;
    is_in_call: boolean;
}
