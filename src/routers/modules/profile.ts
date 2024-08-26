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

export const profleRoute: RouteRecordRaw = {
    path: "/profiles",
    name: "profile",
    // beforeEnter: [authGuard],
    children: [
        {
            path: "create",
            name: "profile-create",
            component: () => import("@/pages/profiles/create.vue"),
            beforeEnter: protectCreateProfileRoute,
            meta: {
                layout: "GuestLayout",
            },
        },
    ],
};
