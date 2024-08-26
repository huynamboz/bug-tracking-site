import type { RouteRecordRaw } from "vue-router";
import { authGuard } from "../auth-guard";
export const authRoute: RouteRecordRaw[] = [
    {
        path: "/login",
        component: () => import("@/pages/auth/Login.vue"),
        name: "login",
        meta: {
            layout: "GuestLayout",
            public: true,
        },
        beforeEnter: [authGuard],
    },
    {
        path: "/register",
        meta: {
            layout: "GuestLayout",
            public: true,
        },
        beforeEnter: [authGuard],
        children: [
            {
                path: "",
                name: "register",
                component: () => import("@/pages/auth/register/Register.vue"),
            },
            {
                path: "confirm",
                name: "register-confirm",
                component: () => import("@/pages/auth/register/Confirm.vue"),
            },
        ],
    },
    {
        path: "/password",
        name: "password",
        meta: {
            layout: "GuestLayout",
            public: true,
        },
        beforeEnter: [authGuard],
        children: [
            {
                path: "forgot",
                name: "password-forgot",
                component: () => import("@/pages/auth/password/Forgot.vue"),
            },
        ],
    },
];
