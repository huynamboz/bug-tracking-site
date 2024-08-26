<script setup lang="ts">
import { useWorkspaceStore } from "@/stores/workspace";

const workspaceStore = useWorkspaceStore();
</script>
<template>
    <!-- Force page rerender when workspace change -->
    <RouterView :key="workspaceStore.getCurrentWorkspace?.id" />
</template>
