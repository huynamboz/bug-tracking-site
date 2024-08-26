<script setup lang="ts">
import draggable from "vuedraggable";
import Group from "@/components/groups/Group.vue";
import { apiExceptionHandler } from "@/utils/exceptionHandler";
import { notify } from "@/utils/toast";
import { getGroupsApi } from "@/services/tasks";
const groupCards = ref();

const route = useRoute();

const boardId = computed(() => {
    return route.params.boardId as string;
});

const getGroups = async () => {
    try {
        const res = await getGroupsApi(boardId.value);
        groupCards.value = res.results;
    } catch (error) {
        notify.error(apiExceptionHandler(error).message);
    }
};

onBeforeMount(() => {
    getGroups();
});

const drag = ref(false);
</script>
<template>
    <div class="w-full h-full overflow-hidden flex flex-col bg-[#f7f7f7]">
        <!-- header -->
        <div></div>

        <!-- main -->
        <draggable
          :drag="true"
          class="flex gap-5 overflow-x-auto h-full p-5"
          v-model="groupCards" item-key="id">
          <template #item="{element}">
            <Group :group="element"/>
          </template>
        </draggable>
    </div>
</template>
