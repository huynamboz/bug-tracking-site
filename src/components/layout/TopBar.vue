<script setup lang="ts">
import TopBarWorkspaceSwitcher from "./TopBar/TopBarWorkspaceSwitcher.vue";
</script>
<template>
    <div
        class="fixed top-0 left-0 z-[999] w-full h-[54px] items-center px-7 flex justify-between border-b"
    >
        <div class="navbar__left flex gap-5 items-center">
            <TopBarWorkspaceSwitcher />
            <!-- <TopBarMembers /> -->
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
