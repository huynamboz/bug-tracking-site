import { $http } from "@/http/ofetch";

export const createCalendarApi = (payload: any): Promise<any> => {
    return $http.workspace("/calendars", {
        method: "POST",
        body: payload,
    });
};

export const getCalendarsApi = (
    timeZone: string,
    year: number,
    month?: number,
    week?: number,
    day?: number,
): Promise<any> => {
    return $http.workspace("/calendars", {
        method: "GET",
        query: {
            timeZone,
            year,
            month,
            week,
            day,
        },
    });
};

export const getCalendarApi = (id: string): Promise<any> => {
    return $http.workspace(`/calendars/${id}`, {
        method: "GET",
    });
};

export const getTimeApi = async (year: number, month: number): Promise<any> => {
    return $http.workspace("/work-time-management", {
        method: "GET",
        query: {
            year,
            month,
        },
    });
};
