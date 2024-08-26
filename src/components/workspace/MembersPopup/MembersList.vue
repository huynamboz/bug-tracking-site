<script setup lang="ts">
import type { Member } from "@/types";

defineProps<{
    members: Member[];
}>();
</script>
<template>
    <div class="flex flex-col gap-4 mt-3 overflow-y-auto max-h[300px]">
        <div
            v-for="member in members"
            :key="member.member.id"
            class="flex gap-2 items-center"
        >
            <img
                v-image:avatar="
                    `https://primefaces.org/cdn/primevue/images/avatar/${member.member.avatar}`
                "
                class="w-10 h-10"
            />
            <div>
                <span class="font-medium">{{
                    [member.member.first_name, member.member.last_name].join(" ")
                }}</span>
                <div class="text-xs text-slate-500 dark:text-surface-400">
                    {{ member.member.email }}
                </div>
            </div>
            <div
                class="flex items-center gap-2 text-surface-500 dark:text-surface-400 ml-auto text-sm"
            >
                <span>{{ member.permission }}</span>
                <i class="pi pi-angle-down"></i>
            </div>
        </div>
    </div>
</template>
