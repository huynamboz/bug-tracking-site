import { createWebHistory, createRouter, type RouteRecordRaw } from "vue-router";
import { authRoute, homeRoute, boardRoute } from "./modules";

const routes: RouteRecordRaw[] = [
    homeRoute,
    boardRoute,
    ...authRoute,
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
