<script setup lang="ts">
import { ref, inject, onBeforeMount } from "vue";
// types
import type { Gc as IGc } from "^/core/Gc";
const Gc = inject("Gc") as typeof IGc;

import type { i_profile } from "^/core/types/profile_types";
import type { t as trans } from "^/core/plugins/g_trans";

import type {
	i_calendar_group,
	i_member_group
} from "^/core/types/calendar_types";

// components
import FindMember from "./FindMember.vue";
// import ActionMember from "./ActionMember.vue";
// stores

const props = defineProps<{
	group: i_calendar_group;
}>();

const {
	remove_member_calendar_group_api,
	update_calendar_group_api,
	delete_calendar_group_api
} = Gc["services"]["calendar_services"];

const { set_question_store } = Gc["stores"]["question_store"];

const $t = inject("$t") as typeof trans;

const emits = defineEmits<{
	(e: "close"): void;
	(e: "deleteGroup"): void;
	(e: "delete-member", i: number): void;
	(e: "add-member", mem: i_member_group[]): void;
	(e: "update-group", data: string): void;
}>();

const addMember = (data: Array<i_member_group>): void => {
	choseShowPopup("LIST");

	emits("add-member", data);
};

onBeforeMount(async () => {});

const insideOverlay = (event: any): void => {
	event.stopPropagation();
};

const outsideOverlay = (): void => {
	close();
};

const close = (): void => {
	emits("close");
};

type TypeShowPopup = "LIST" | "ADD";
const showPopup = ref<TypeShowPopup>("LIST");

const choseShowPopup = (type: TypeShowPopup): void => {
	showPopup.value = type;
};

const removeMember = async (user: i_profile): Promise<void> => {
	if (user.user_id) {
		try {
			await remove_member_calendar_group_api(
				props.group.id,
				user.user_id
			).then(() => {
				const index = props.group.members.findIndex(
					(u: i_member_group) => u.id === user.id
				);
				if (index >= 0) {
					emits("delete-member", index);
				}
			});
		} catch (error) {
			console.log(error);
		}
	}
};
const confirmRemoveMember = (user: i_profile): void => {
	set_question_store({
		title: "Confirm",
		body: `Are you sure want to remove ${user.last_name} ${user.first_name}`,
		action: () => {
			removeMember(user);
		}
	});
};

const openEdit = async (): Promise<void> => {
	let title = prompt("Enter group title", props.group.title);

	if (title != null) {
		try {
			console.log("title ", title);
			await update_calendar_group_api(props.group.id, {
				title: title
			}).then((res) => {
				emits("update-group", res["data"].title);
			});
		} catch (error) {
			console.log(error);
		}
	}
};

const openDelete = async (): Promise<void> => {
	const c = confirm("Are you want to delete group");
	if (c) {
		try {
			await delete_calendar_group_api(props.group.id).then(() => {
				emits("deleteGroup");
			});
		} catch (error) {
			console.log(error);
		}
	}
};
</script>
<template>
	<div class="overlay" @click="outsideOverlay()" v-if="showPopup === 'LIST'">
		<div class="reasonContainer" @click="insideOverlay($event)">
			<img
				src="/public/icons/close.svg"
				class="reasonCloseBtn"
				@click="close()"
			/>
			<div class="reasonHeader">
				{{ group.title }}
				<img
					src="+/icons/action-edit.svg"
					class="icn-edit"
					@click="openEdit"
				/>
				<img
					src="/public/icons/remove.svg"
					class="icn-edit"
					@click="openDelete"
				/>
			</div>
			<div class="line"></div>
			<div class="reasonContent">
				<div
					v-for="user of group.members"
					:key="user.id"
					class="memberContainer"
				>
					<img
						v-if="user.avatar"
						:src="user.avatar"
						class="member-img"
					/>
					<img
						v-else
						src="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3e%3cpath fill='%23bcbcbc' fill-rule='evenodd' d='M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10Zm-7-3a3 3 0 1 1-6 0a3 3 0 0 1 6 0Zm-3 11.5a8.46 8.46 0 0 0 4.807-1.489c.604-.415.862-1.205.51-1.848C16.59 15.83 15.09 15 12 15c-3.09 0-4.59.83-5.318 2.163c-.351.643-.093 1.433.511 1.848A8.46 8.46 0 0 0 12 20.5Z' clip-rule='evenodd'/%3e%3c/svg%3e"
						class="member-img"
					/>
					<div class="member-name">
						<p>
							{{ user.first_name }}
							{{ user.last_name }}
						</p>
						<p>
							{{ user.email }}
						</p>
					</div>
					<img
						class="btn-remove"
						src="/public/icons/remove.svg"
						@click="confirmRemoveMember(user)"
					/>
				</div>
			</div>
			<div>
				<button class="btn-add" @click="choseShowPopup('ADD')">
					{{ $t("common.add_mem") }}
				</button>
			</div>
		</div>
	</div>
	<FindMember
		v-if="showPopup === 'ADD'"
		:group="group"
		@close="choseShowPopup('LIST')"
		@addMember="addMember"
	/>
</template>

<style scoped>
.overlay {
	position: fixed;
	width: 100%;
	height: 100%;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 4;
	display: flex;
	justify-content: center;
	align-items: center;
}

.reasonContainer {
	border-radius: 16px;
	width: 560px;
	background-color: white;
	text-align: center;
	padding: 24px;
	position: relative;
	max-height: 90%;
}

.reasonHeader {
	width: 100%;
	font-weight: 500;
	font-size: 18px;
	letter-spacing: 0.01em;
	color: #334d6e;
	text-align: left;
	display: flex;
	align-items: center;
}

.line {
	height: 1px;
	max-height: 1px;
	width: 100%;
	background-color: #7b96ad;
	margin: 10px 0 15px 0;
}

.list-menu-mem {
	display: flex;
	gap: 8px;
}

.list-menu-mem div:hover {
	cursor: pointer;
}

.active {
	border-bottom: 1px solid #00693b;
	font-weight: 600;
}

.reasonContent {
	margin: 20px 0px;
	text-align: left;
	max-height: 50vh;
	overflow-y: auto;
}

.cancelBtn {
	width: 150px;
	height: 48px;
	left: 732px;
	top: 346px;
	background: white;
	border-radius: 6px;
	margin-right: 20px;
	border: 1px solid #334d6e;

	font-weight: 500;
	font-size: 16px;
	line-height: 24px;
	letter-spacing: 0.02em;
	color: #334d6e;
}

.acceptBtn {
	width: 150px;
	height: 48px;
	left: 732px;
	top: 346px;
	background: #00693b;
	border-radius: 6px;
	border: 1px solid #00693b;

	font-weight: 500;
	font-size: 16px;
	line-height: 24px;

	letter-spacing: 0.02em;
	color: #f5f5f5;
}

.reasonCloseBtn {
	position: absolute;
	right: 24px;
	top: 24px;
}

.reasonCloseBtn:hover {
	cursor: pointer;
}

.routerBtn {
	margin-top: 24px;
}

.memberContainer {
	font-weight: 500;
	font-size: 16px;
	line-height: 24px;
	display: flex;
	align-items: center;
	letter-spacing: 0.02em;
	color: #525252;
	margin-top: 10px;
}

.member-img {
	width: 40px;
	height: 40px;
	border: 1px solid #cdd6df;
	box-sizing: border-box;
	border-radius: 20px;
	margin-right: 12px;
}

.memberName {
	width: auto;
	overflow: hidden;
	white-space: nowrap;
	text-overflow: ellipsis;
}

.btn-remove {
	margin-left: auto;
	cursor: pointer;
	display: none;
}

.memberContainer:hover .btn-remove {
	display: block;
}

.btn-add {
	align-items: center;
	background: #fff;
	border: 0.5px solid #cdd6df;
	border-radius: 4px;
	box-sizing: border-box;
	color: #334d6e;
	display: flex;
	font-size: 16px;
	font-weight: 500;
	height: 34px;
	justify-content: center;
	letter-spacing: 0.02em;
	line-height: 24px;
	white-space: nowrap;
	width: 100%;
	background: #f5f5f5;
}

.member-name p:nth-child(1) {
	line-height: 20px;
}

.member-name p:nth-child(2) {
	font-weight: 300;
	font-size: 14px;
}

.icn-edit {
	margin-left: 12px;
	cursor: pointer;
}

@media screen and (max-width: 600px) {
	.overlay {
		padding: 0 20px;
	}

	.cancelBtn {
		width: 150px;
	}

	.acceptBtn {
		width: 150px;
	}
}
</style>
