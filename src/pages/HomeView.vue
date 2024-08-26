<script setup lang="ts">
import draggable from "vuedraggable";
import Group from "@/components/groups/Group.vue";
const groupTask = ref([
    {
        id: "0000-0000-0000-0000", // uuid
        name: "Group 1",
        position: 1,
    },
    {
        id: "0000-0000-0000-0001", // uuid
        name: "Group 2",
        position: 2,
    },
    {
        id: "0000-0000-0000-0002", // uuid
        name: "Group 3",
        position: 3,
    },
    {
        id: "0000-0000-0000-0003", // uuid
        name: "Group 4",
        position: 4,
    },
    {
        id: "0000-0000-0000-0004", // uuid
        name: "Group 5",
        position: 5,
    },
    {
        id: "0000-0000-0000-0005", // uuid
        name: "Group 6",
        position: 6,
    },
    {
        id: "0000-0000-0000-0006", // uuid
        name: "Group 7",
        position: 7,
    },
    {
        id: "0000-0000-0000-0007", // uuid
        name: "Group 8",
        position: 8,
    },
    {
        id: "0000-0000-0000-0008", // uuid
        name: "Group 9",
        position: 9,
    },
    {
        id: "0000-0000-0000-0009", // uuid
        name: "Group 10",
        position: 10,
    },
    {
        id: "0000-0000-0000-0010", // uuid
        name: "Group 11",
        position: 11,
    },
    {
        id: "0000-0000-0000-0011", // uuid
        name: "Group 12",
        position: 12,
    },
    {
        id: "0000-0000-0000-0012", // uuid
        name: "Group 13",
        position: 13,
    },
    {
        id: "0000-0000-0000-0013", // uuid
        name: "Group 14",
        position: 14,
    },
]);

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
          v-model="groupTask" item-key="id">
          <template #item="{element}">
            <Group :group="element" />
          </template>
        </draggable>
    </div>
</template>
