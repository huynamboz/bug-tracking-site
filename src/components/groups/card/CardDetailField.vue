<script setup lang="ts">
import Textarea from "primevue/textarea";
import Chip from "@/components/base/Chip.vue";
import type { Task } from "@/types/task";
import AddLabel from "./AddLabel.vue";
import { addCardLabelApi, deleteCardLabelApi, updateCardApi } from "@/services/tasks";
import { vOnClickOutside } from "@vueuse/components";
import { notify } from "@/utils/toast";
import { apiExceptionHandler } from "@/utils/exceptionHandler";

const prop = defineProps<{
    groupId: string;
}>();

const card = defineModel<Task>({ required: true });

const description = ref(card.value.description);
const isShowAddLabel = ref(false);

const handleAddLabel = async (data: { name: string; color: string }) => {
    console.log(data);
    try {
        const res = await addCardLabelApi(prop.groupId, card.value.id, data);
        if (!card.value.labels) {
            card.value.labels = [];
        }
        card.value.labels.push(res);
        isShowAddLabel.value = false;
    } catch (error) {
        console.log(error);
        notify.error(apiExceptionHandler(error).message);
    }
};

const hanleDeleteLabel = async (id: string) => {
    try {
        await deleteCardLabelApi(prop.groupId, card.value.id, id);
        if (!card.value.labels) {
            card.value.labels = [];
        }
        card.value.labels = card.value.labels.filter((label) => label.id !== id);
    } catch (error) {
        console.log(error);
        notify.error(apiExceptionHandler(error).message);
    }
};

const closeAddLabel = () => {
    isShowAddLabel.value = false;
};

const handleUdpateDescription = async () => {
    try {
        await updateCardApi(prop.groupId, card.value.id, { description: description.value });
        card.value.description = description.value;
        notify.success("Update description success");
    } catch (error) {
        console.log(error);
        notify.error(apiExceptionHandler(error).message);
    }
};
</script>
<template>
    <div>
        <!-- tag -->
        <div class="w-[100px] mt-4">
            <div class="flex items-center gap-2">
                <Icon icon="hugeicons:calendar-03" />
                <p class="text-sm font-base">Due date</p>
            </div>
        </div>

        <!-- tag -->
        <div class="flex items-center mt-4">
            <div class="w-[100px] flex items-center gap-2">
                <Icon icon="hugeicons:tag-01" />
                <p class="text-sm font-base">Tag</p>
            </div>
            <div class="flex flex-wrap gap-1">
                <Chip
                    v-for="label in card.labels"
                    :key="label.id"
                    v-bind="label"
                    :is-show-delete="true"
                    @delete="hanleDeleteLabel"
                />
                <div class="ml-2 relative">
                    <div
                        class="cursor-pointer flex gap-1 items-center hover:bg-slate-100 px-1 rounded-md"
                        @click="isShowAddLabel = !isShowAddLabel"
                    >
                        <span>new</span>
                        <Icon icon="fluent:add-16-filled" />
                    </div>
                    <AddLabel
                        v-if="isShowAddLabel"
                        v-on-click-outside="closeAddLabel"
                        @save="handleAddLabel"
                    />
                </div>
            </div>
        </div>

        <div class="flex items-center gap-2 mt-4">
            <Icon icon="hugeicons:google-doc" />
            <p class="text-sm font-base">Description</p>
        </div>
        <Textarea
            v-model="description"
            class="w-full mt-3"
            rows="3"
            cols="30"
            @blur="handleUdpateDescription"
        />
    </div>
</template>
