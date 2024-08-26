import { $http } from "@/http/ofetch";
import type { BaseResponse } from "@/types/api";
import type { IUser } from "@/types/user";

interface UserProfile {
    first_name: string;
    last_name: string;
}
export const getInfoApi = async (): Promise<BaseResponse<IUser>> => {
    return $http.default("/users/my-info", {
        method: "GET",
    });
};

export const getUserApi = async (id: string): Promise<BaseResponse<IUser[]>> => {
    return $http.default(`/users/profiles`, {
        method: "GET",
        query: {
            ids: id,
        },
    });
};

export const createProfileApi = async (payload: UserProfile): Promise<BaseResponse<IUser>> => {
    return $http.default("/users/info", {
        method: "POST",
        body: payload,
    });
};
