import type { RouteRecordRaw } from "vue-router";
import { authGuard } from "../auth-guard";

export const calendarRoute: RouteRecordRaw = {
    path: "calendars",
    name: "calendars",
    // beforeEnter: [authGuard],
    component: () => import("@/pages/calendars/index.vue"),
};
