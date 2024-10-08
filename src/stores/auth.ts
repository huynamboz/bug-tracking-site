import { defineStore } from "pinia";
import type { IUser } from "@/types";
import { getInfoApi } from "@/services/user";
import router from "@/routers/router";
import { useWorkspaceStore } from "./workspace";
export const useAuthStore = defineStore({
    id: "auth",
    state: () => ({
        // initialize state from local storage to enable user to stay logged in
        user: null as IUser | null,
        returnUrl: "",
        isLoggedIn: false,
        token: {
            access: "",
            refresh: "",
        },
    }),
    actions: {
        logout() {
            localStorage.removeItem("refresh_token");
            localStorage.removeItem("access_token");
            this.user = null;
            this.isLoggedIn = false;
            this.token = {
                access: "",
                refresh: "",
            };
            location.reload();
            // router.push({ name: "login" });
        },
        setUser(user: IUser) {
            this.user = user;
        },
        async setupAuth() {
            try {
                const access_token = localStorage.getItem("access_token") as string;

                if (access_token) {
                    this.token.access = access_token;
                    const user = await getInfoApi();
                    console.log("LOG user", user);
                    user && (this.user = user);
                    this.isLoggedIn = true;
                    console.log("Login state:", this.isLoggedIn, this.user);
                }
            } catch (error) {
                console.log("Setup auth error", error);
            }
        },
        setToken(access: string) {
            if (access) {
                this.token.access = access;
                localStorage.setItem("access_token", access);
            }
        },
    },
    getters: {
        getUser: (state) => state.user,
        getIsLoggedIn: (state) => state.isLoggedIn,
        isOwner: (state) =>
            useWorkspaceStore().getCurrentWorkspace?.owner.user_id === state.user?.user_id,
    },
});
