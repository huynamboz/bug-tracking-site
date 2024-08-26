import { $http } from "@/http/ofetch";

export const getCalendarGroupsApi = (): Promise<any> => {
    return $http.workspace("/calendars/groups", {
        method: "GET",
    });
};
