import { $http } from "@/http/ofetch";
import type { IUser, Member } from "@/types";
import type { BaseResponse } from "@/types/api";
import type { IWorkspace } from "@/types/workspaces";

export const getWorkspacesApi = async (): Promise<BaseResponse<IWorkspace[]>> => {
    return $http.default("/workspaces", {
        method: "GET",
    });
};

export const getWorkspaceApi = async (id: string): Promise<BaseResponse<IWorkspace>> => {
    return $http.default("/workspaces/" + id, {
        method: "GET",
    });
};

export const createWorkspacesApi = async (name: string): Promise<BaseResponse<IWorkspace>> => {
    return $http.default("/workspaces", {
        method: "POST",
        body: { name },
    });
};

export const findMembersApi = async (email: string): Promise<BaseResponse<IUser[]>> => {
    return $http.workspace("/members/find", {
        method: "GET",
        query: { email },
    });
};

export const getMembersApi = async (): Promise<BaseResponse<Member[]>> => {
    return $http.workspace("/members", {
        method: "GET",
    });
};

interface AddMemberPayload {
    member_ids: string[];
    permission: string;
}
export const addMembersApi = async (payload: AddMemberPayload): Promise<BaseResponse<Member>> => {
    return $http.workspace("/members/invite", {
        method: "POST",
        body: payload,
    });
};
