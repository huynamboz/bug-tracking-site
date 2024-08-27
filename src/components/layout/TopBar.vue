<script setup lang="ts">
import Button from "primevue/button";
import TopBarWorkspaceSwitcher from "./TopBar/TopBarWorkspaceSwitcher.vue";
import { useAuthStore } from "@/stores";
const authStore = useAuthStore();
</script>
<template>
    <div
        class="fixed top-0 left-0 z-[999] w-full h-[54px] items-center px-7 flex justify-between border-b"
    >
        <div class="navbar__left flex gap-5 items-center">
            <TopBarWorkspaceSwitcher />
            <!-- <TopBarMembers /> -->
        </div>
        <div>
            <Button
                class="text-xs"
                size="small"
                @click="authStore.logout"
            >
                <Icon icon="hugeicons:login-03" />
                <p>Logout</p>
            </Button>
        </div>
        <!-- <IconField>
            <InputIcon class="pi pi-search" />
            <InputText
                size="small"
                placeholder="Search"
            />
        </IconField> -->
        <!-- <TopBarUserOption /> -->
    </div>
</template>
<style lang="scss" scoped></style>
