<script setup lang="ts">
import draggable from "vuedraggable";

import Card from "./card/Card.vue";
import type { Task } from "@/types/task";
import { getCardsApi } from "@/services/tasks";
import { apiExceptionHandler } from "@/utils/exceptionHandler";
import { notify } from "@/utils/toast";
const cards = ref<Task[]>([]);

const prop = defineProps<{
    group: any
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
</script>
<template>
    <div class="h-fit w-[250px] ">
      <div class="mb-3 flex items-center gap-1">
        <div class="w-2 h-2 rounded-full bg-blue-500"></div>
        <p class="text-lg font-semibold">
          {{ group.name }}
        </p>
      </div>
      <div class="w-full border bg-white mb-3 p-2 flex justify-center rounded-md text-blue-500 font-semibold">
        + Add Card
      </div>
      <draggable
          :drag="true"
          class="flex flex-col gap-5 overflow-hidden h-full"
          group="cards"
          :list="cards" item-key="id">
          <template #item="{element}">
              <Card :card="element" />
          </template>
        </draggable>
    </div>
</template>
