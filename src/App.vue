<script setup lang="ts">
import { computed } from "vue";
import { useRoute } from "vue-router";
import { useLoadingStore } from "./stores/loading";
import ConfirmDialog from "primevue/confirmdialog";
const route = useRoute();

const layout = computed(() => {
    return route.meta.layout ?? "DefaultLayout";
});

const loadingStore = useLoadingStore();
</script>

<template>
    <!-- <div>
    <a href="https://vitejs.dev" target="_blank">
      <img src="/vite.svg" class="logo" alt="Vite logo" />
    </a>
    <a href="https://vuejs.org/" target="_blank">
      <img src="./assets/vue.svg" class="logo vue" alt="Vue logo" />
    </a>
  </div>
  <HelloWorld msg="Vite + Vue" /> -->
    <ConfirmDialog></ConfirmDialog>
    <ModalConfirm />
    <div
        v-if="loadingStore.getLoading"
        class="fixed top-0 left-0 w-full h-full flex justify-center items-center z-[999] bg-[#4c4c4c61]"
    >
        <Icon
            icon="svg-spinners:90-ring-with-bg"
            class="w-10 h-10"
        />
    </div>
    <component :is="layout">
        <RouterView />
    </component>
</template>

<style scoped>
.logo {
    height: 6em;
    padding: 1.5em;
    will-change: filter;
    transition: filter 300ms;
}

.logo:hover {
    filter: drop-shadow(0 0 2em #646cffaa);
}

.logo.vue:hover {
    filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
