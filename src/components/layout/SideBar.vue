<script setup lang="ts">
import { useWorkspaceStore } from "@/stores/workspace";
import TopBarUserOption from "./TopBar/TopBarUserOption.vue";
import { useRoute } from "vue-router";
import Avatar from 'primevue/avatar';
import { getBoardsApi } from "@/services/tasks";
const route = useRoute();

const routeName = computed(() => {
    return route.name as string;
});

const boards = ref([]);
const getBoards = async () => {
  try {
    const res = await getBoardsApi();
    boards.value = res.results;
    console.log(boards.value);
  } catch (error) {
    
  }
}

onBeforeMount(() => {
  getBoards();
});
</script>
<template>
    <div class="w-18 w-20 py-3 flex flex-col w-[250px] min-w-[250px] border-r p-4 gap-2">
      <p class="font-semibold text-lg mt-5">All boards</p>
        <RouterLink :to="{ name: 'board-detail', params: { boardId: board.id} }" v-for="board in boards" :key="board.id" class="w-full flex items-center mt-1 border p-3 py-1 rounded-md">
          <Avatar image="https://primefaces.org/cdn/primevue/images/avatar/asiyajavayant.png" class="mr-2" shape="circle" />  
          <div>
              <div class="ml-2 text-sm font-semibold">{{ board.name }}</div>
              <div class="ml-2 text-xs font-base">{{ board.quote || '25 members' }}</div>
            </div>
        </RouterLink>
    </div>
</template>
<style>
.router-link-exact-active {
    background-color: #f7f7f7;
    color: #344054;
}
</style>