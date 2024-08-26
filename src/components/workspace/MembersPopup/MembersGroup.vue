<script setup lang="ts">
import Button from "primevue/button";
import Search from "./Search.vue";
import MembersList from "./MembersList.vue";
import type { IUser, Member } from "@/types";
import { addMembersApi, getMembersApi } from "@/services/workspaces";
import { notify } from "@/utils/toast";
import { apiExceptionHandler } from "@/utils/exceptionHandler";

defineEmits<{
    (e: "close"): void;
}>();

const members = ref<Member[]>([]);

const membersSelected = ref<IUser[]>([]);

const permission = ref("MEMBER");

async function onSubmit() {
    try {
        const { data } = await addMembersApi({
            member_ids: membersSelected.value.map((m) => String(m.user_id)),
            permission: permission.value,
        });
        members.value = members.value.concat(data);
        membersSelected.value = [];
        notify.success("Add member successfully");
    } catch (error) {
        notify.error(apiExceptionHandler(error).message);
    }
}

async function getMembers() {
    try {
        const { data } = await getMembersApi();
        members.value = data;
    } catch (error) {
        notify.error(apiExceptionHandler(error).message);
    }
}

onBeforeMount(() => {
    getMembers();
});
</script>
<template>
    <div
        class="fixed z-[999] top-0 left-0 w-full h-full bg-mark-bg flex justify-center items-center"
        @click="$emit('close')"
    >
        <div
            class="w-[600px] h-[500px] bg-white rounded-lg"
            @click.stop
        >
            <div class="flex justify-between p-5 pb-3">
                <p class="text-lg font-semibold">Members in workspace</p>
                <div
                    class="inline-flex justify-center items-center rounded-full cursor-pointer w-8 h-8 hover:bg-slate-50"
                    @click="$emit('close')"
                >
                    <span class="i-material-symbols-light-close-rounded text-xl"></span>
                </div>
            </div>
            <div class="px-5">
                <hr />
            </div>

            <!-- input -->
            <div class="p-5 pt-2">
                <p>Email</p>
                <div class="flex gap-2">
                    <div
                        class="flex-auto flex items-start p-1 px-4 border-secondary border rounded-lg justify-between"
                    >
                        <div class="flex gap-2 flex-wrap mt-1">
                            <!-- SEARCH -->
                            <Search v-model="membersSelected" />
                        </div>
                        <select
                            v-model="permission"
                            class="mt-1 outline-none"
                        >
                            <option value="MEMBER">Member</option>
                            <option value="OWNER">Owner</option>
                        </select>
                    </div>
                    <Button
                        class="h-fit px-4"
                        label="Add"
                        size="small"
                        @click="onSubmit"
                    />
                </div>
            </div>

            <!-- members -->
            <div class="p-5 pt-0">
                <p>Members</p>
                <MembersList :members="members" />
            </div>
        </div>
    </div>
</template>
