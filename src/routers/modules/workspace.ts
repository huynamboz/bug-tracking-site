import type { RouteRecordRaw } from "vue-router";
import { authGuard, workspaceGuard } from "../auth-guard";

export const workspaceRoute: RouteRecordRaw = {
    path: "/w/:workspaceId",
    name: "workspace",
    // beforeEnter: [authGuard, workspaceGuard],
    component: () => import("@/pages/workspace.vue"),
    children: [],
};
