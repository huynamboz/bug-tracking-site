<template>
    <div
        ref="parent"
        class="flex gap-2 w-full flex-wrap relative"
    >
        <div
            v-for="(member, index) in membersSelected"
            :key="member.id"
            class="bg-slate-200 text-xs py-1 px-2 rounded-full flex items-center"
        >
            <p>{{ member.email }}</p>
            <span
                class="i-material-symbols-light-close text-base ml-1 cursor-pointer block"
                @click="removeMember(index)"
            ></span>
        </div>
        <input
            v-model="email"
            placeholder="Enter email..."
            type="text"
            class="block"
            style="outline: none"
            @click="toggle"
            @input="debouncedFn"
        />

        <div
            v-if="isShowPopover"
            v-on-click-outside="closePopover"
            class="flex flex-col gap-4 w-[25rem] absolute top-full bg-white shadow-md p-3 rounded-md"
        >
            <div>
                <span class="font-medium block mb-2">Team Members</span>
                <ul class="list-none p-0 m-0 flex flex-col gap-4">
                    <li
                        v-for="member in membersComputed"
                        :key="member.name"
                        class="flex items-center gap-2 hover:bg-slate-100 rounded-md p-1 cursor-pointer"
                        @click="selectMember(member)"
                    >
                        <img
                            :src="`https://primefaces.org/cdn/primevue/images/avatar/${member.avatar}`"
                            style="width: 32px"
                        />
                        <div>
                            <span class="font-medium">{{
                                [member.first_name, member.last_name].join(" ")
                            }}</span>
                            <div class="text-sm text-surface-500 dark:text-surface-400">
                                {{ member.email }}
                            </div>
                        </div>
                        <div
                            class="flex items-center gap-2 text-surface-500 dark:text-surface-400 ml-auto text-sm"
                        >
                            <!-- <span>{{ member.role }}</span>
                                <i class="pi pi-angle-down"></i> -->
                        </div>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Popover from "primevue/popover";
import { useDebounceFn } from "@vueuse/core";
import { findMembersApi } from "@/services/workspaces";
import type { IUser } from "@/types";
import { vOnClickOutside } from "@vueuse/components";

const email = ref("");

const debouncedFn = useDebounceFn(async () => {
    const { data } = await findMembersApi(email.value);
    members.value = data;
}, 500);

const op = ref();

const members = ref<IUser[]>([]);

const membersComputed = computed(() => {
    return members.value.filter(
        (m) => !membersSelected.value.some((selected) => selected.id === m.id),
    );
});

const isShowPopover = ref(false);

const toggle = () => {
    isShowPopover.value = true;
};

const membersSelected = defineModel<IUser[]>({ required: true });

function selectMember(mem: IUser) {
    membersSelected.value.push(mem);
    isShowPopover.value = false;
    email.value = "";
}

function closePopover() {
    isShowPopover.value = false;
}

function removeMember(index: number) {
    membersSelected.value.splice(index, 1);
}
</script>
