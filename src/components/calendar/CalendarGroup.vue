<script setup lang="ts">
import { ref, inject, computed } from "vue";
import GroupDetail from "./MangeGroups/GroupDetail.vue";
import type {
	i_calendar_group,
	i_member_group
} from "^/core/types/calendar_types";
import type { Gc as IGc } from "^/core/Gc";
const Gc = inject("Gc") as typeof IGc;

const {
	create_calendar_group_api,
	select_group_calendar_api,
	select_member_calendar_api
} = Gc["services"]["calendar_services"];

const props = defineProps<{
	calendar_groups: Array<i_calendar_group>;
}>();
const emits = defineEmits<{
	(e: "change-select"): void;
	(e: "create-group", data: i_calendar_group): void;
	(e: "delete-group", index: number): void;
}>();

const { auth_user } = Gc["auth"];

const isHost = computed(() => {
	return auth_user.value?.role === "HOST";
});

const groupDetail = ref<i_calendar_group>();
const closeDetail = (): void => {
	groupDetail.value = undefined;
};

const deleteGroup = (): void => {
	const idx = props.calendar_groups.findIndex(
		(item: i_calendar_group) => item.id == groupDetail.value?.id
	);

	if (idx >= 0) {
		closeDetail();
		// props.calendar_groups.splice(idx, 1);
		emits("delete-group", idx);
	}
};

const openGroupDetail = (group: i_calendar_group): void => {
	console.log("open group ", group);
	groupDetail.value = group;
};

const openCreate = async (): Promise<void> => {
	const title = prompt("Enter group title");

	if (title) {
		try {
			await create_calendar_group_api({
				title: title
			}).then((res) => {
				// props.calendar_groups.unshift(res["data"]);
				emits("create-group", res["data"]);
			});
		} catch (error) {
			console.log(error);
		}
	}
};

const switchDrop = (group: i_calendar_group): void => {
	group._drop = !group._drop;
};

const emitChange = (): void => {
	emits("change-select");
};

const selectGroup = async (group: i_calendar_group): Promise<void> => {
	try {
		await select_group_calendar_api(group.id).then(() => {
			emitChange();
		});
	} catch (error) {
		console.log(error);
	}
};

const selectMember = async (group: i_calendar_group): Promise<void> => {
	const ids = [];
	for (const member of group.members) {
		if (member.selected && member.user_id) {
			ids.push(member.user_id);
		}
	}
	try {
		await select_member_calendar_api(group.id, {
			user_ids: ids
		}).then(() => {
			emitChange();
		});
	} catch (error) {
		console.log(error);
	}
};

const onDeleteMember = (i: number): void => {
	if (groupDetail.value) {
		groupDetail.value.members.splice(i, 1);
	}
};

const onAddMember = (mem: i_member_group[]): void => {
	if (groupDetail.value) {
		groupDetail.value.members = mem;
	}
};

const onUpdateGroup = (data: string): void => {
	if (groupDetail.value) {
		groupDetail.value.title = data;
	}
};
</script>

<template>
	<div class="group-container">
		<div class="group-nav">
			Groups
			<img
				v-if="isHost"
				class="btn-create"
				src="+/icons/plus.svg"
				@click="openCreate"
			/>
		</div>
		<div
			class="group-item"
			v-for="group of calendar_groups"
			:key="group.id"
		>
			<div class="group-title">
				<input
					type="checkbox"
					v-model="group.selected"
					@change="selectGroup(group)"
				/>
				<div class="group-title-text" @click="switchDrop(group)">
					<span>{{ group.title }}</span>
					<span
						v-if="group.count_waiting_approve > 0"
						class="count-approve"
					>
						<span>
							{{ group.count_waiting_approve }}
						</span>
					</span>
				</div>

				<img
					v-if="isHost"
					class="group-edit"
					src="+/icons/action-edit.svg"
					@click="openGroupDetail(group)"
				/>

				<img
					class="group-drop"
					@click="switchDrop(group)"
					src="+/icons/arrow-up.svg"
					v-if="group._drop"
				/>
				<img
					class="group-drop"
					@click="switchDrop(group)"
					src="+/icons/arrow-down.svg"
					v-else
				/>
			</div>
			<div v-show="group._drop" class="group-members">
				<div v-for="member of group.members" :key="member.id">
					<div>
						<input
							type="checkbox"
							v-model="member.selected"
							@change="selectMember(group)"
						/>
						{{ member.first_name }} {{ member.last_name }}
						<span
							v-if="member.count_waiting_approve > 0"
							class="count-approve"
							style="display: inline-flex; margin-right: 5px"
							>{{ member.count_waiting_approve }}</span
						>
					</div>
				</div>
			</div>
		</div>
		<GroupDetail
			v-if="groupDetail"
			:group="groupDetail"
			@close="closeDetail"
			@delete-group="deleteGroup"
			@delete-member="onDeleteMember"
			@add-member="onAddMember"
			@update-group="onUpdateGroup"
		/>
	</div>
</template>

<style scoped>
.group-nav {
	display: flex;
	align-items: center;
	margin-bottom: 12px;
	font-size: 14px;
	font-weight: 500;
}

.btn-create {
	margin-left: auto;
	background: #e9e9ed;
	border-radius: 4px;
	padding: 2px;
	width: 24px;
	cursor: pointer;
}

.group-item {
	margin-top: 12px;
}
.group-title {
	display: flex;
	align-items: center;
}

.group-title-text {
	width: 100%;
	cursor: pointer;
	margin-left: 4px;
	font-size: 15px;
}

.group-edit {
	width: 18px;
	margin-left: auto;
	margin-right: 12px;
	cursor: pointer;
}

.group-drop {
	cursor: pointer;
	width: 18px;
}

.group-members {
	padding-left: 12px;
	margin-left: 12px;
	border-left: 1px solid #c2cfe0;
	margin-top: 4px;
}
.count-approve {
	width: 18px;
	border-radius: 50%;
	min-width: 18px;
	height: 18px;
	background: #f46414;
	display: inline-flex;
	justify-content: center;
	align-items: center;
	color: white;
	font-size: 12px;
	margin-right: 5px;
	margin-left: 5px;
}
</style>
