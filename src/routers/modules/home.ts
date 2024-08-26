import type { RouteRecordRaw } from "vue-router";
import { authGuard } from "../auth-guard";

export const homeRoute: RouteRecordRaw = {
    path: "/",
    name: "home",
    // beforeEnter: [authGuard],
    component: () => import("@/pages/HomeView.vue"),
};
