import { $http } from "@/http/ofetch";

export const getMessagesApi = (conversationId: string): Promise<any> => {
    return $http.default(`/workspaces/conversations/${conversationId}/messages`, {
        method: "GET",
        query: { paging: 20 },
    });
};

export const getMessagesAboveApi = (conversationId: string, messageId: string): Promise<any> => {
    return $http.default(
        `/workspaces/conversations/${conversationId}/messages/${messageId}/above`,
        {
            method: "GET",
            query: { paging: 20 },
        },
    );
};

export const getRepliesApi = (conversationId: string, parentId: string): Promise<any> => {
    return $http.default(
        `/workspaces/conversations/${conversationId}/messages/${parentId}/replies`,
        {
            method: "GET",
        },
    );
};

export const sendMessageApi = (payload: any, conversationId: string): Promise<any> => {
    return $http.default(`/workspaces/conversations/${conversationId}/messages`, {
        method: "POST",
        body: payload,
    });
};

export const reactMessageApi = (
    conversationId: string,
    messageId: string,
    type: string,
): Promise<any> => {
    return $http.default(
        `/workspaces/conversations/${conversationId}/messages/${messageId}/react`,
        {
            method: "POST",
            query: { type },
        },
    );
};

export const editMessageApi = (
    payload: any,
    conversationId: string,
    messageId: string,
): Promise<any> => {
    return $http.default(`/workspaces/conversations/${conversationId}/messages/${messageId}`, {
        method: "PATCH",
        body: payload,
    });
};

export const deleteMessageApi = (conversationId: string, messageId: string): Promise<any> => {
    return $http.default(`/workspaces/conversations/${conversationId}/messages/${messageId}`, {
        method: "DELETE",
    });
};

export const deleteFileApi = (conversationId: string, messageId: string): Promise<any> => {
    return $http.default(
        `/workspaces/conversations/${conversationId}/messages/${messageId}/files`,
        {
            method: "DELETE",
        },
    );
};
