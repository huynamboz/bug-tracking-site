<script setup lang="ts">
import type { IGroup, Task } from "@/types/task";
import CardDetailField from "./CardDetailField.vue";
defineProps<{
    group: IGroup;
}>();

const card = defineModel<Task>({ required: true });
</script>
<template>
    <div>
        <!-- header -->
        <div class="h-10 border-b flex justify-between items-center px-5">
            <div class="flex items-center gap-2">
                <Icon icon="hugeicons:cancel-01" />
                <div class="border-r-2 h-5"></div>
                <p>
                    {{ group.name }}
                </p>
            </div>

            <div>
                <Icon icon="fluent:more-vertical-24-filled" />
            </div>
        </div>
        <!-- end header -->

        <!-- main -->
        <div class="p-5">
            <h2 class="text-2xl font-semibold">
                {{ card.name }}
            </h2>

            <div class="mt-10">
                <CardDetailField
                    v-model="card"
                    :group-id="group.id"
                    label="Description"
                    :value="card.description"
                />
            </div>
        </div>
    </div>
</template>
