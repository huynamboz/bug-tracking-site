import { defineStore } from "pinia";
import type { IWorkspace } from "@/types/workspaces";
import { getWorkspaceApi, getWorkspacesApi } from "@/services/workspaces";
import { notify } from "@/utils/toast";
import router from "@/routers/router";

export const useWorkspaceStore = defineStore({
    id: "workspace",
    state: () => ({
        workspaces: [] as IWorkspace[],
        current: null as IWorkspace | null,
    }),
    actions: {
        async setupWorkspace() {
            try {
                const savedWorkspaceId = localStorage.getItem("WORKSPACE_ID");

                // if (savedWorkspaceId) {
                //     try {
                //         const { data } = await getWorkspaceApi(savedWorkspaceId);
                //         this.current = data;
                //     } catch (error) {
                //         notify.error(
                //             ((error as any).data?.error?.message as string) ||
                //                 "Get detail workspaces error",
                //         );
                //         localStorage.removeItem("WORKSPACE_ID");
                //         window.location.href = "/"
                //     }
                // }

                const { data } = await getWorkspacesApi();
                this.workspaces = data;
            } catch (error) {
                notify.error(
                    ((error as any).data?.error?.message as string) || "Get workspaces error",
                );
            }
        },
        addWorkspace(workspace: IWorkspace) {
            this.workspaces.unshift(workspace);
        },
        setCurrentWorkspace(workspace: IWorkspace) {
            this.current = workspace;
        },
    },
    getters: {
        getWorkspaces: (state) => state.workspaces,
        getCurrentWorkspace: (state) => state.current,
    },
});
