import { getWorkspaceApi } from "@/services/workspaces";
import { useAuthStore } from "@/stores";
import { useWorkspaceStore } from "@/stores/workspace";
import type { NavigationGuardWithThis } from "vue-router";

export const authGuard: NavigationGuardWithThis<any> = async (to, from, next) => {
    document.title = `TASK TRACKER`;
    const authStore = useAuthStore();
    console.log("authGuard", authStore.getIsLoggedIn, to);

    if (authStore.getIsLoggedIn) {
        // redirect to create profile page
        // if user not create profile yet
        if (!authStore.getUser && to.name !== "profile-create") {
            console.log("[Guard]: To create profile");
            next({ name: "profile-create" });
        } else if (to.meta?.public) {
            next("/");
        } else {
            next();
        }
    } else {
        if (to.meta?.public) {
            next();
        } else {
            next({ name: "login" });
        }
    }
};

export const workspaceGuard: NavigationGuardWithThis<any> = async (to, from, next) => {
    const workspaceIdParam = to.params.workspaceId;
    const savedWorkspaceId = localStorage.getItem("WORKSPACE_ID");

    const workspaceStore = useWorkspaceStore();

    // fetch current workspace before enter route
    if (workspaceIdParam) {
        try {
            const { data } = await getWorkspaceApi(String(workspaceIdParam));
            workspaceStore.setCurrentWorkspace(data);
            localStorage.setItem("WORKSPACE_ID", String(workspaceIdParam));
            next();
        } catch (error) {
            next("/");
        }
    } else if (!workspaceIdParam || !savedWorkspaceId) {
        next("/");
    }
};
