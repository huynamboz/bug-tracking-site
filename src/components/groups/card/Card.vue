<script setup lang="ts">
import type { Task } from '@/types/task';
import Chip from 'primevue/chip';
defineProps<{
  card: Task
}>()
</script>
<template>
  <div class="border bg-white rounded-lg cursor-pointer">
    <!-- header -->
    <div>
      <div class="p-2 flex justify-between items-center">
        <div class="text-xs font-semibold px-3 rounded-3xl text-white" :style="{ backgroundColor: card.label?.color }">{{ card.label?.name }}</div>
        <div class="text-sm font-semibold">{{ card.position }}</div>
      </div>
    </div>

    <!-- main -->
     <div>
      <div class="p-4 pt-0">
        <div class="text-sm font-semibold">{{ card.name }}</div>
        <div class="text-sm text-gray-500">{{ card.description }}</div>
        <div class="mt-4 text-gray-500 border w-fit h-[24px] px-2 flex justify-center items-center gap-1 rounded-lg">
          <Icon icon="hugeicons:check-list" class="text-gray-500" />
          <div class="text-xs font-semibold">
            {{ card.total_checklist_done }}/{{ card.total_checklist }}
          </div>
        </div>
      </div>

      <div class="border-b"></div>

      <div class="p-4 flex justify-between">
        <div class="text-sm text-gray-500">Due Date</div>
        <div class="text-sm font-semibold">Today</div>
      </div>
     </div>
  </div>
</template>