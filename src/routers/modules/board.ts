import type { NavigationGuardWithThis, RouteRecordRaw } from "vue-router";
import { authGuard } from "../auth-guard";
import { useAuthStore } from "@/stores";

const protectCreateProfileRoute: NavigationGuardWithThis<any> = (to, from, next) => {
    const authStore = useAuthStore();
    if (authStore.getUser) {
        next("/");
    } else {
        next();
    }
};

export const boardRoute: RouteRecordRaw = {
    path: "/boards",
    name: "boards",
    beforeEnter: [authGuard],
    component: () => import("@/pages/boards/index.vue"),
    children: [
        {
            path: ":boardId",
            name: "board-detail",
            component: () => import("@/pages/boards/_id.vue"),
        },
    ],
};
