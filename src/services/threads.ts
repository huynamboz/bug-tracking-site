import { $http } from "@/http/ofetch";

export const getThreadsApi = async (page: number = 1): Promise<any> => {
    return $http.workspace("/threads/messages", {
        method: "GET",
        query: {
            page,
            paging: 10,
        },
    });
};
