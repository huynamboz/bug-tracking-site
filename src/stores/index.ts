import { useAuthStore } from "./auth";
import { useSocketStore } from "./socket";
import { useMasterStore } from "./master";
import { notify } from "@/utils/toast";
import { useWorkspaceStore } from "./workspace";

export const initAuthStore = async () => {
    const authStore = useAuthStore();
    const workspaceStore = useWorkspaceStore();
    await authStore.setupAuth();
    // if (authStore.getIsLoggedIn) {
    //     await Promise.all([workspaceStore.setupWorkspace()]);
    // }
};

export const initMasterStore = async () => {
    try {
        // const masterStore = useMasterStore();
        // await Promise.all([masterStore.setMasterData(), masterStore.setEmojis()]);
    } catch (error) {
        notify.error("Xảy ra lỗi khi lấy dữ liệu");
    }
};

export const initWebSocketStore = async () => {
    const socketStore = useSocketStore();
    socketStore.setupSocketStore();
};

export { useAuthStore } from "./auth";
export { useUserStore } from "./user.store";
