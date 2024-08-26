<script setup lang="ts">
import Select from "primevue/select";

const model = defineModel({ required: true });
defineProps<{
    options: any;
    placeholder: string;
}>()
</script>
<template>
    <Select
        v-model="model"
        :options="options"
        option-label="name"
        placeholder="Select"
        class="w-full md:w-56"
    >
        <template #value="slotProps">
            <div
                v-if="slotProps.value"
                class="flex items-center"
            >
                <img
                    :alt="slotProps.value.label"
                    src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png"
                    :class="`mr-2 flag flag-${slotProps.value.code.toLowerCase()}`"
                    style="width: 18px"
                />
                <div>{{ slotProps.value.name }}</div>
            </div>
            <span v-else>
                {{ slotProps.placeholder }}
            </span>
        </template>
        <template #option="slotProps">
            <div class="flex items-center">
                <img
                    :alt="slotProps.option.label"
                    src="https://primefaces.org/cdn/primevue/images/flag/flag_placeholder.png"
                    :class="`mr-2 flag flag-${slotProps.option.code.toLowerCase()}`"
                    style="width: 18px"
                />
                <div>{{ slotProps.option.name }}</div>
            </div>
        </template>
    </Select>
</template>
