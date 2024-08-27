<script setup lang="ts">
import draggable from "vuedraggable";
import Group from "@/components/groups/Group.vue";
import CreateGroup from "@/components/groups/CreateGroup.vue";
import { apiExceptionHandler } from "@/utils/exceptionHandler";
import { notify } from "@/utils/toast";
import { changeGroupCardPositionApi, createGroupApi, getGroupsApi } from "@/services/tasks";
import type { IGroup } from "@/types/task";
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

const handleCreateGroup = async (data: string) => {
    try {
        const res = await createGroupApi(boardId.value, data);
        groupCards.value.push(res);
    } catch (error) {
        notify.error("Create group failed");
    }
};

const onMove = async (e: any) => {
    const group = e.moved;
    console.log(group, group.newIndex + 1, groupCards.value[group.newIndex + 1]?.id);
    try {
        await changeGroupCardPositionApi(boardId.value, group.element.id, {
            previousGroupId: groupCards.value[group.newIndex + 1]?.id || null,
        });
    } catch (error) {
        console.log(error);
        notify.error("Change card position failed");
    }
};
</script>
<template>
    <div class="w-full h-full overflow-hidden flex">
        <!-- header -->
        <!-- main -->
        <div class="w-full overflow-x-auto flex p-5 gap-5">
            <draggable
                v-model="groupCards"
                :drag="true"
                class="flex gap-5 h-full"
                item-key="id"
                @change="onMove"
            >
                <template #item="{ element }">
                    <Group :group="element" />
                </template>
            </draggable>
            <div class="min-w-[280px] h-fit bg-[#f6f7f9] rounded-xl p-4">
                <CreateGroup
                    label="Add Group"
                    :board-id="boardId"
                    @save="handleCreateGroup"
                />
            </div>
        </div>
    </div>
</template>
