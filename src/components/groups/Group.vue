<script setup lang="ts">
import draggable from "vuedraggable";

import Card from "./card/Card.vue";
import type { Task } from "@/types/task";
const cards = ref<Task[]>([
    {
        id: "0000-0000-0000-0000", // uuid
        name: "Card 1",
        position: 1,
        description: "This is a card description",
        total_checklist: 3,
        total_checklist_done: 2,
        label: {
            name: "Label 1",
            color: "red",
            id: "0000-0000-0000-0000",
        }
    },
    {
        id: "0000-0000-0000-0001", // uuid
        name: "Card 2",
        position: 2,
        description: "This is a card description",
        total_checklist: 3,
        total_checklist_done: 1,
    },
    {
        id: "0000-0000-0000-0002", // uuid
        name: "Card 3",
        position: 3,
        description: "This is a card description",
        total_checklist: 3,
        total_checklist_done: 3,
    },
]);

const changePosition = (event) => {
    console.log(event);
};
</script>
<template>
    <div class="h-fit">
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
