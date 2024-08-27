<script setup lang="ts">
import draggable from "vuedraggable";
import CreateGroup from "./CreateGroup.vue";
import Card from "./card/Card.vue";
import type { IGroup, Task } from "@/types/task";
import { changeCardPositionApi, createCardApi, deleteCardApi, getCardsApi } from "@/services/tasks";
import { apiExceptionHandler } from "@/utils/exceptionHandler";
import { notify } from "@/utils/toast";
import Drawer from "primevue/drawer";
import CardDetail from "./card/CardDetail.vue";

const cards = ref<Task[]>([]);

const prop = defineProps<{
    group: IGroup;
}>();

const getCards = async () => {
    try {
        const res = await getCardsApi(prop.group.id);
        cards.value = res.results;
    } catch (error) {
        notify.error(apiExceptionHandler(error).message);
    }
};

onBeforeMount(() => {
    getCards();
});

const handleCreateCard = async (data: string) => {
    try {
        const res = await createCardApi(prop.group.id, {
            name: data,
            description: "",
        });
        cards.value.unshift(res);
    } catch (error) {
        notify.error("Create card failed");
    }
};

const onAdd = async (e: any) => {
    if (!e.added && !e.moved) return;
    const card = e.added || e.moved;
    try {
        await changeCardPositionApi(prop.group.id, card.element.id, {
            previousCardId: cards.value[card.newIndex + 1]?.id || null,
            newGroupId: prop.group.id,
        });
    } catch (error) {
        console.log(error);
        notify.error("Change card position failed");
    }
};

const visible = ref(false);

const cardDetailIndex = ref<number>(-1);

const openDetail = (val: Task) => {
    console.log(val);
    // card.value = val;
    const index = cards.value.findIndex((item) => item.id === val.id);
    cardDetailIndex.value = index;
    visible.value = true;
};

const handleDeleteCard = async (id: string) => {
    try {
        await deleteCardApi(prop.group.id, id);
        cards.value = cards.value.filter((card) => card.id !== id);
        notify.success("Delete card success");
    } catch (error) {
        notify.error("Delete card failed");
    }
};
</script>
<template>
    <div class="flex flex-col w-[280px] bg-[#f6f7f9] rounded-xl h-full overflow-hidden">
        <Drawer
            v-model:visible="visible"
            class="w-[400px]"
            header="Card detail"
            position="right"
        >
            <template #container="{ closeCallback }">
                <CardDetail
                    v-if="visible && cardDetailIndex !== -1"
                    v-model="cards[cardDetailIndex]"
                    :group="group"
                    @close="closeCallback"
                />
            </template>
        </Drawer>
        <div class="mb-3 flex items-center gap-1 px-4 pt-4">
            <div class="w-2 min-w-2 h-2 rounded-full bg-blue-500"></div>
            <p class="text-lg font-semibold">
                {{ group.name }}
            </p>
            <div
                class="ml-auto w-5 min-w-5 h-5 rounded-md flex items-center text-xs justify-center text-white bg-blue-400"
            >
                <!-- <Icon
                    icon="fluent:more-vertical-24-filled"
                    class="text-gray-500 text-xl min-w-5 cursor-pointer"
                /> -->
                {{ cards.length }}
            </div>
        </div>
        <div class="px-4 pb-2">
            <CreateGroup
                label="Add card"
                @save="handleCreateCard"
            />
        </div>
        <draggable
            :drag="true"
            class="flex flex-col overflow-y-auto h-full"
            group="cards"
            :list="cards"
            item-key="id"
            @change="onAdd"
        >
            <template #item="{ element }">
                <Card
                    :card="element"
                    @click="openDetail(element)"
                    @delete="handleDeleteCard"
                />
            </template>
        </draggable>
    </div>
</template>
