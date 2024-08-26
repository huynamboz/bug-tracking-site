import { createWebHistory, createRouter, type RouteRecordRaw } from "vue-router";
import { authRoute, homeRoute, profleRoute, workspaceRoute, calendarRoute } from "./modules";

const routes: RouteRecordRaw[] = [
    homeRoute,
    profleRoute,
    ...authRoute,
    {
        ...workspaceRoute,
        children: [calendarRoute],
    },
    {
        path: "/test",
        component: () => import("@/pages/test.vue"),
    },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
