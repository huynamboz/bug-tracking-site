export const config = {
    baseURL:  import.meta.env.VITE_API_ENDPOINT,
    path: {
        refreshToken: "refresh_token",
    },
    key: {
        refreshToken: "refresh_token", //KEY SAVED IN LOCALSTORAGE
        accessToken: "access_token", //KEY SAVED IN LOCALSTORAGE
    },
    retryStatusCodes: [401, 403],
};
