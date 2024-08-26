import type { Language } from "@/types/master";
import type { BaseResponse } from "@/types/api";
import { $http } from "@/http/ofetch";

export const getLanguagesApi = async (): Promise<BaseResponse<Language[]>> => {
    return $http.default(`/language/workings`, {
        method: "GET",
    });
};

export const getEndpointApi = (): Promise<BaseResponse<string>> => {
    return $http.default(`/teams/notifications/endpoint`, {
        method: "GET",
    });
};

export const getEmojisApi = (): Promise<any> => {
    return $http.default("/emojis", {
        method: "GET",
    });
};
