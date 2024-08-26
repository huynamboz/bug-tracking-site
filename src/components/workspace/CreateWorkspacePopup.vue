<script setup lang="ts">
import InputText from "primevue/inputtext";
import Button from "primevue/button";

const name = defineModel<string>({ required: true, default: "" });

defineEmits<{
    (e: "submit"): void;
    (e: "close"): void;
}>();
</script>
<template>
    <div
        v-motion
        :initial="{ opacity: 0 }"
        :enter="{ opacity: 1 }"
        :duration="100"
        class="fixed z-[9999] top-0 left-0 w-full h-full bg-mark-bg flex justify-center items-center"
        @click="$emit('close')"
    >
        <div
            v-motion
            :initial="{ opacity: 0, scale: 0.5 }"
            :enter="{ opacity: 1, scale: 1 }"
            :duration="100"
            class="w-[400px] h-[200px] bg-white rounded-xl p-5"
            @click.stop
        >
            <div class="flex justify-between">
                <p class="text-lg font-semibold">Create workspace</p>
                <div
                    class="inline-flex justify-center items-center rounded-full cursor-pointer w-8 h-8 hover:bg-slate-50"
                    @click="$emit('close')"
                >
                    <span class="i-material-symbols-light-close-rounded text-xl"></span>
                </div>
            </div>
            <form @submit.prevent="$emit('submit')">
                <InputText
                    v-model="name"
                    size="small"
                    class="w-full mt-5"
                    placeholder="Workspace name"
                    @enter="$emit('submit')"
                />
                <Button
                    type="button"
                    label="Save"
                    class="w-full mt-5"
                    @click="$emit('submit')"
                ></Button>
            </form>
        </div>
    </div>
</template>
