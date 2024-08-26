<script setup lang="ts">
const route = useRoute();
const boardId = computed(() => {
    return route.params.boardId as string;
});
</script>
<template>
  <RouterView :key="boardId" />
</template>