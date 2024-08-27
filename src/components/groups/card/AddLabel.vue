<script setup lang="ts">
import InputText from "primevue/inputtext";
import ColorPicker from "primevue/colorpicker";
import Button from "primevue/button";
import Chip from "@/components/base/Chip.vue";
import { notify } from "@/utils/toast";

const name = ref("");
const color = ref("FF0000");

const emit = defineEmits<{
    (e: "save", data: { name: string; color: string }): void;
    (e: "cancel"): void;
}>();

const save = async () => {
    console.log(name.value, color.value);
    if (!name.value.trim()) {
        return;
    }

    try {
        emit("save", { name: name.value, color: `#${color.value}` });
        // reset input
        name.value = "";
    } catch (error) {
        notify.error("Create label failed");
    }
};
</script>
<template>
    <div
        class="absolute w-[400px] h-fit top-full right-1/2 rounded-lg bg-white shadow-secondary p-4"
    >
        <p class="font-semibold">Add labels</p>
        <div class="mt-5">
            <p>Name</p>
            <InputText
                v-model="name"
                size="small"
                class="w-full"
                placeholder="enter label name"
            />
        </div>

        <div class="mt-5">
            <p>Name</p>
            <div class="flex items-center gap-5">
                <ColorPicker
                    v-model="color"
                    inline
                />
                <div>
                    <p>Preview:</p>
                    <Chip
                        id="1"
                        :color="`#${color}`"
                        :name="name || 'Label'"
                    />
                </div>
            </div>
        </div>

        <!-- divider -->
        <div class="border-b mt-5"></div>
        <!-- save -->
        <div class="mt-5 flex justify-end gap-2">
            <Button
                label="Cancel"
                class="p-button-secondary"
                size="small"
                @click="emit('cancel')"
            />
            <Button
                label="Save"
                class="p-button-primary"
                size="small"
                @click="save"
            />
        </div>
    </div>
</template>
