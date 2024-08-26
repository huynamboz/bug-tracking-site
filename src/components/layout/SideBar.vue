<script setup lang="ts">
import { useWorkspaceStore } from "@/stores/workspace";
import TopBarUserOption from "./TopBar/TopBarUserOption.vue";
import { useRoute } from "vue-router";
const route = useRoute();

const routeName = computed(() => {
    return route.name as string;
});

const workspaceStore = useWorkspaceStore();

const menu = ref([
    {
        icon: "fi fi-rr-home",
        name: "Home",
        path: "/chats",
        routeName: "chats",
    },
    {
        icon: "fi fi-rr-files-medical",
        name: "Tệp",
        path: "/threads",
        routeName: "threads",
    },
    {
        icon: "fi fi-rr-assept-document",
        name: "Tasks",
        path: "/boards",
        routeName: "boards",
    },
    {
        icon: "fi fi-rr-bell",
        name: "Notifications",
        path: "/notifications",
        routeName: "notifications",
    },
    {
        icon: "fi fi-rr-calendar",
        name: "Calendar",
        path: "/calendars",
        routeName: "calendars",
    },
]);

const changeTheme = (theme: string) => {
    const current = document.querySelector("html")?.getAttribute("data-theme");
    current
        ? document.querySelector("html")?.removeAttribute("data-theme")
        : document.querySelector("html")?.setAttribute("data-theme", "theme1");
};
</script>
<template>
    <div class="w-18 w-20 py-3 flex flex-col items-center justify-between w-[250px] min-w-[250px] border-r">
        <div class="flex flex-col items-center">
            <div
                class="bg-white text-[#667085] text-md font-medium rounded-lg w-10 h-10 grid place-content-center mb-8"
                @click="changeTheme('theme1')"
            >
                DE
            </div>
            <div class="flex gap-1 flex-col">
                <RouterLink
                    v-for="item in menu"
                    :key="item.icon"
                    v-tippy="{
                        content: item.name,
                        arrow: true,
                        theme: 'light',
                        placement: 'right',
                    }"
                    :to="`/`"
                    class="flex flex-col items-center rounded-md my-1"
                >
                    <div
                        class="hover:bg-primary-1 p-3 rounded-lg w-8 h-8 mb-1 grid place-content-center"
                        :class="{ 'bg-primary-1': routeName?.startsWith(item.routeName) }"
                    >
                        <i class="w-4 h-4 fill-white"></i>
                    </div>
                    <p class="text-[11px] font-semibold">{{ item.name }}</p>
                </RouterLink>
            </div>
            <div class="flex flex-col items-center rounded-md mt-2 gap-1 w-full cursor-pointer">
                <div
                    class="hover:bg-slate-200 p-3 rounded-lg"
                    @click="changeTheme('theme1')"
                >
                    <span class="i-solar-menu-dots-bold text-xl block"></span>
                </div>
                <p class="text-[10px] font-semibold">Switch</p>
            </div>
        </div>

        <TopBarUserOption />
    </div>
</template>
