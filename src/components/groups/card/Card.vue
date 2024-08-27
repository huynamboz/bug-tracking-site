<script setup lang="ts">
import type { Task } from '@/types/task';
import Chip from 'primevue/chip';
defineProps<{
  card: Task
}>()
</script>
<template>
  <div class="cursor-pointer p-4 pt-1">
    <div class="bg-white rounded-lg shadow-secondary border border-transparent hover:border-blue-500">
      <!-- header -->
      <div>
        <div class="p-2 h-10 flex justify-between items-center">
          <div class="text-xs font-semibold px-3 rounded-3xl text-white"
            :style="{ backgroundColor: card.label?.color }">{{ card.label?.name }}</div>
          <Icon icon="fluent:more-vertical-24-filled" class="text-gray-500 text-xl" />
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
  </div>
</template>