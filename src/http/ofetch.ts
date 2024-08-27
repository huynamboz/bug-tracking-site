import { ofetch, type $Fetch, type FetchOptions, type FetchContext } from "ofetch";
import { useAuthStore } from "@/stores/auth";
import { useWorkspaceStore } from "@/stores/workspace";
import { config } from "./config";

// add workspace prefix like /w/:workspaceId
const WORKSPACE_PREFIX = "/workspaces/";

async function refreshToken() {
    const authStore = useAuthStore();
    try {
        const response = await ofetch(`${config.baseURL}/${config.path.refreshToken}`, {
            retry: false,
            method: "POST",
            body: {
              refreshToken: localStorage.getItem(config.key.refreshToken),
            },
        });
        authStore.token.access = response.access.token;
        authStore.token.refresh = response.refresh.token;
        localStorage.setItem(config.key.accessToken, authStore.token.access);
        localStorage.setItem(config.key.refreshToken, authStore.token.refresh);
        return true;
    } catch (error) {
        console.error("Failed to refresh token", error);
        return false;
    }
}

async function handleUnauthorizedError(error: FetchContext): Promise<any> {
    const authStore = useAuthStore();
    if ((error.options as any).retried) {
        authStore.logout();
    } else if (error.response && error.options.retryStatusCodes?.includes(error.response.status)) {
        const isSuccess = await refreshToken();
        if (isSuccess) {
            // Retry the request with the new token
            const newOptions = {
                ...error.options,
                headers: {
                    ...error.options.headers,
                    Authorization: `Bearer ${authStore.token.access}`,
                },
                retried: true,
            };
            return newOptions;
        } else {
            authStore.logout();
        }
    }
}

function isAllowRefreshToken(error: FetchContext) {
  console.log("Unauthorized.", error);
    return (
        error.response &&
        config.retryStatusCodes.includes(error.response.status) &&
        !error.response?.url.includes('/login')
    );
}

export const fetchInstance: $Fetch = ofetch.create({
    baseURL: config.baseURL,
    retry: 1,
    retryStatusCodes: config.retryStatusCodes,
    async onResponseError(error) {
        console.log("Unauthorized.", error);
        if (isAllowRefreshToken(error)) {
            error.options = await handleUnauthorizedError(error);
        }
    },
});

function createFetchOptions(options: FetchOptions, isAuthHeader: boolean) {
    const { token } = useAuthStore();
    if (isAuthHeader) {
        return {
            ...options,
            headers: {
                ...options.headers,
                Authorization: `Bearer ${token.access}`,
            },
        };
    }
    return options;
}

function callbackHttp(endpoint: string, options: FetchOptions, isAuthHeader: boolean = true) {
    return fetchInstance(endpoint, createFetchOptions(options, isAuthHeader));
}

function callbackHttpWithWorkspacePrefix(
    endpoint: string,
    options: FetchOptions,
    isAuthHeader: boolean = true,
) {
    const workspaceStore = useWorkspaceStore();
    endpoint = `${WORKSPACE_PREFIX}${workspaceStore.getCurrentWorkspace?.id}${endpoint}`;
    return fetchInstance(endpoint, createFetchOptions(options, isAuthHeader));
}

export const $http = {
    default: callbackHttp,
    workspace: callbackHttpWithWorkspacePrefix,
};
