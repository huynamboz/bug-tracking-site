<script setup lang="ts">
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import { notify } from "@/utils/toast";

defineProps<{
    label: string;
}>();
const emit = defineEmits<{
    (e: "save", data: string): void;
}>();

const isShowInput = ref(false);
const showInput = () => {
    isShowInput.value = true;
};

const hideInput = () => {
    isShowInput.value = false;
};

const name = ref("");

const save = async () => {
    console.log(name.value);
    if (!name.value.trim()) {
        return;
    }

    try {
        emit("save", name.value);
        // reset input
        name.value = "";
        hideInput();
    } catch (error) {
        notify.error("Create group failed");
    }
};
</script>
<template>
    <div class="">
        <div
            class="cursor-pointer h-fit border bg-white mb-3 p-2 flex justify-center rounded-md text-blue-500 font-semibold"
            @click="showInput"
        >
            + {{ label }}
        </div>
        <div v-if="isShowInput">
            <InputText
                v-model="name"
                placeholder="Enter group name"
                size="small"
                class="w-full"
            />
            <div class="mt-2 flex justify-end gap-2">
                <Button
                    label="Cancel"
                    severity="secondary"
                    size="small"
                    class="text-xs"
                    @click="hideInput"
                />
                <Button
                    label="Save"
                    size="small"
                    class="text-xs"
                    @click="save"
                />
            </div>
        </div>
    </div>
</template>
