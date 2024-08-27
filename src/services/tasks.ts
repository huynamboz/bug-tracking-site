import { $http } from "@/http/ofetch";

export const getBoardsApi = (): Promise<any> => {
    return $http.default("/boards", {
        method: "GET",
    });
};

export const createBoardApi = (name: string): Promise<any> => {
    return $http.default("/boards", {
        method: "POST",
        body: { name },
    });
};

export const getGroupsApi = (boardId: string): Promise<any> => {
    return $http.default(`/boards/${boardId}/group-cards`, {
        method: "GET",
    });
};

export const updateGroupsApi = (
    boardId: string,
    groupId: string,
    payload: {
        title: string;
    },
): Promise<any> => {
    return $http.default(`/workspaces/boards/${boardId}/group-tasks/${groupId}`, {
        method: "GET",
        body: payload,
    });
};

export const deleteGroupApi = (boardId: string, taskId: string): Promise<any> => {
    return $http.default(`/workspaces/boards/${boardId}/group-tasks/${taskId}`, {
        method: "DELETE",
    });
};

export const createGroupApi = (boardId: string, name: string): Promise<any> => {
    return $http.default(`/boards/${boardId}/group-cards`, {
        method: "POST",
        body: {
            name,
        },
    });
};

export const getCardsApi = (groupId: string, page: number = 1): Promise<any> => {
    return $http.default(`/boards/group-cards/${groupId}/cards`, {
        method: "GET",
        query: { page },
    });
};

export const getTaskApi = (groupId: string, taskId: string): Promise<any> => {
    return $http.default(`/workspaces/group-tasks/${groupId}/tasks/${taskId}`, {
        method: "GET",
    });
};

export const createCardApi = (groupId: string, data: any): Promise<any> => {
    return $http.default(`/boards/group-cards/${groupId}/cards`, {
        method: "POST",
        body: data,
    });
};

export const deleteTaskApi = (groupId: string, taskId: string): Promise<any> => {
    return $http.default(`/workspaces/group-tasks/${groupId}/tasks/${taskId}`, {
        method: "DELETE",
    });
};

export const updateTaskApi = (groupId: string, taskId: string, payload: any): Promise<any> => {
    return $http.default(`/workspaces/group-tasks/${groupId}/tasks/${taskId}`, {
        method: "PATCH",
        body: payload,
    });
};

interface ChangeCardPositionPayload {
    previousCardId: string | null;
    newGroupId: string;
}

export const changeCardPositionApi = (
    groupId: string,
    cardId: string,
    payload: ChangeCardPositionPayload,
): Promise<any> => {
    return $http.default(`/boards/group-cards/${groupId}/cards/${cardId}/change-position`, {
        method: "POST",
        body: payload,
    });
};

interface addLabelPayload {
    name: string | null;
    color: string;
}

export const addCardLabelApi = (
    groupId: string,
    cardId: string,
    payload: addLabelPayload,
): Promise<any> => {
    return $http.default(`/boards/group-cards/${groupId}/cards/${cardId}/add-label`, {
        method: "POST",
        body: payload,
    });
};

export const deleteCardLabelApi = (
    groupId: string,
    cardId: string,
    labelId: string,
): Promise<any> => {
    return $http.default(`/boards/group-cards/${groupId}/cards/${cardId}/remove-label/${labelId}`, {
        method: "DELETE",
    });
};

// CHECKLIST
export const createChecklistApi = (taskId: string, payload: any): Promise<any> => {
    return $http.default(`/workspaces/tasks/${taskId}`, {
        method: "POST",
        body: payload,
    });
};

export const updateChecklistApi = (
    taskId: string,
    checkListId: string,
    payload: any,
): Promise<any> => {
    return $http.default(`/workspaces/tasks/${taskId}/checklists/${checkListId}`, {
        method: "PATCH",
        body: payload,
    });
};

// END CHECKLIST

// CHECKLIST ITEM
export const createChecklistItemApi = (checkListId: string, payload: any): Promise<any> => {
    return $http.default(`/workspaces/tasks/checklists/${checkListId}`, {
        method: "POST",
        body: payload,
    });
};

export const updateChecklistItemApi = (
    checkListId: string,
    checkListItemId: string,
    payload: any,
): Promise<any> => {
    return $http.default(`/workspaces/tasks/checklists/${checkListId}/items/${checkListItemId}`, {
        method: "PATCH",
        body: payload,
    });
};

export const deleteChecklistItemApi = (
    checkListId: string,
    checkListItemId: string,
): Promise<any> => {
    return $http.default(`/workspaces/tasks/checklists/${checkListId}/items/${checkListItemId}`, {
        method: "DELETE",
    });
};

// END CHECKLIST ITEM

// TASK COMMENT //
export const getTaskCommentsApi = (taskId: string): Promise<any> => {
    return $http.default(`/workspaces/tasks/${taskId}/comments`, {
        method: "GET",
    });
};

export const sendTaskCommentApi = (taskId: string, payload: any): Promise<any> => {
    return $http.default(`/workspaces/tasks/${taskId}/comments`, {
        method: "POST",
        body: payload,
    });
};
