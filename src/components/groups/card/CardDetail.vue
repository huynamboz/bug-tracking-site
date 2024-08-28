<script setup lang="ts">
import type { IGroup, Task } from "@/types/task";
import InputText from "primevue/inputtext";
import CardDetailField from "./CardDetailField.vue";
import { updateCardApi } from "@/services/tasks";
import { notify } from "@/utils/toast";
import { apiExceptionHandler } from "@/utils/exceptionHandler";
const prop = defineProps<{
    group: IGroup;
}>();

defineEmits<{
    (e: "close"): void;
}>();

const card = defineModel<Task>({ required: true });

const isShowEdit = ref(false);

const handleUpdateTitle = async () => {
    try {
        await updateCardApi(prop.group.id, card.value.id, { name: title.value });
        isShowEdit.value = false;
        card.value.name = title.value;
        notify.success("Update title success");
    } catch (error) {
        notify.error(apiExceptionHandler(error).message);
    }
};

const handleOpenEditAndFocus = () => {
    isShowEdit.value = true;
    nextTick(() => {
        const title = document.querySelector("input#title") as HTMLInputElement;
        title?.focus();
    });
};

const title = ref(card.value.name);
</script>
<template>
    <div>
        <!-- header -->
        <div class="h-10 border-b flex justify-between items-center px-5">
            <div class="flex items-center gap-2">
                <Icon
                    class="cursor-pointer"
                    icon="hugeicons:cancel-01"
                    @click="$emit('close')"
                />
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
            <h2
                v-if="!isShowEdit"
                class="text-2xl font-semibold"
                @click="handleOpenEditAndFocus"
            >
                {{ card.name }}
            </h2>

            <InputText
                v-if="isShowEdit"
                id="title"
                v-model="title"
                class="w-full"
                placeholder="Enter a title for this card..."
                @blur="handleUpdateTitle"
            />

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
