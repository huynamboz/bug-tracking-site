import { $http } from "@/http/ofetch";

export const getConversationsApi = (page: number = 1): Promise<any> => {
    return $http.workspace("/conversations", {
        query: { page },
    });
};

export const getConversationApi = (conversationId: string): Promise<any> => {
    return $http.workspace(`/conversations/${conversationId}`, {
        method: "GET",
    });
};

export const createConversationApi = (name: string): Promise<any> => {
    return $http.workspace("/conversations", {
        method: "POST",
        body: { name },
    });
};

export const changeConversationNameApi = (conversationId: string, name: string): Promise<any> => {
    return $http.workspace(`/conversations/${conversationId}/name/change`, {
        method: "POST",
        body: { name },
    });
};

export const pinConversationApi = (conversationId: string): Promise<any> => {
    return $http.workspace(`/conversations/${conversationId}/pin`, {
        method: "POST",
    });
};

export const turnOffNotiConversationApi = (conversationId: string): Promise<any> => {
    return $http.workspace(`/conversations/${conversationId}/turn-off-notification`, {
        method: "POST",
    });
};

export const markreadConversationApi = (conversationId: string): Promise<any> => {
    return $http.workspace(`/conversations/${conversationId}/mark_read`, {
        method: "POST",
    });
};

export const getPinsConversationApi = (conversationId: string): Promise<any> => {
    return $http.default(`/workspaces/conversations/${conversationId}/pins`, {
        method: "GET",
    });
};

export const pinMessageApi = (conversationId: string, messageId: string): Promise<any> => {
    return $http.default(`/workspaces/conversations/${conversationId}/messages/${messageId}/pin`, {
        method: "POST",
    });
};

export const findMemberApi = (conversationId: string, email: string): Promise<any> => {
    return $http.workspace(`/conversations/${conversationId}/members/find`, {
        method: "GET",
        query: { email },
    });
};

interface AddMemberPayload {
    member_ids: string[];
}

export const addMemberApi = (conversationId: string, payload: AddMemberPayload): Promise<any> => {
    return $http.workspace(`/conversations/${conversationId}/members/add`, {
        method: "POST",
        body: payload,
    });
};
