<script setup lang="ts">
import { ref, inject, onBeforeMount, onMounted, computed } from "vue";
// types
import type { Gc as IGc } from "^/core/Gc";
const Gc = inject("Gc") as typeof IGc;
import type {
	i_calendar_group,
	i_member_group
} from "^/core/types/calendar_types";

// stores
const { set_question_store } = Gc["stores"]["question_store"];
// services
const { find_member_calendar_group_api, add_member_to_calendar_group_api } =
	Gc["services"]["calendar_services"];
import type { t as trans } from "^/core/plugins/g_trans";
import type { i_profile } from "^/core/types/profile_types";
const $t = inject("$t") as typeof trans;

const props = defineProps<{
	group: i_calendar_group;
}>();

onBeforeMount(async () => {
	await findMembers();
});

const emits = defineEmits<{
	(e: "close"): void;
	(e: "addMember", member: Array<i_member_group>): void;
}>();

const insideOverlay = (event: MouseEvent): void => {
	event.stopPropagation();
};

onMounted(() => {});

const outsideOverlay = (): void => {
	close();
};

const close = (): void => {
	emits("close");
};

const members = ref<Array<i_profile>>([]);
const inviting = ref<boolean>(false);
const inviteMember = async (): Promise<void> => {
	inviting.value = true;
	const ids = [];
	for (const u of listUserAdded.value) {
		if (u.user_id) {
			ids.push(u.user_id);
		}
	}
	try {
		await add_member_to_calendar_group_api(props.group.id, {
			user_ids: ids
		}).then((res) => {
			const data = res["data"];
			set_question_store({
				type: "SUCCESS",
				title: $t("question.success"),
				body: `${$t("common.add")} ${$t("question.success")}`
			});
			emits("addMember", data.members);
		});
	} catch (error) {
		console.log(error);
	}
	inviting.value = false;
};

const keySearch = ref("");
const timeOutCallSearch = ref<number>();
const callSearch = (): void => {
	if (timeOutCallSearch.value) {
		clearTimeout(timeOutCallSearch.value);
	}
	timeOutCallSearch.value = setTimeout(async () => {
		await findMembers();
	}, 500);
};
const doneLoading = ref<boolean>(false);
const findMembers = async (): Promise<void> => {
	try {
		doneLoading.value = false;
		await find_member_calendar_group_api(
			props.group.id,
			keySearch.value
		).then((res) => {
			const data = res["data"];
			members.value = data;
			doneLoading.value = true;
		});
	} catch (error) {
		console.log(error);
		doneLoading.value = true;
	}
};

const listUserAdded = ref<Array<i_profile>>([]);
const showFindMembers = ref<boolean>(false);

const openFindMember = (): void => {
	showFindMembers.value = true;
};

const addToList = (user: i_profile): void => {
	showFindMembers.value = false;
	const index = listUserAdded.value.findIndex((mem) => mem.id == user.id);
	if (index != -1) return;
	listUserAdded.value.push(user);
};

const removeUser = (user: i_profile): void => {
	listUserAdded.value.forEach((item, index) => {
		if (item.id == user.id) {
			listUserAdded.value.splice(index, 1);
		}
	});
};

const listMemberFiltered = computed(() => {
	return members.value.filter(
		(mem) => listUserAdded.value.findIndex((i) => i.id == mem.id) == -1
	);
});
</script>

<template>
	<div class="overlay" @click="outsideOverlay()">
		<div class="detailMemberContainer" @click="insideOverlay($event)">
			<div class="find-member-header">
				{{ $t("common.add_mem") }}
			</div>
			<div class="find-mem-container">
				<div class="inp-find-container">
					<img src="+/icons/search-chat-inp.svg" alt="" />
					<input
						type="text"
						:placeholder="$t('placeholder.enter_email')"
						v-model="keySearch"
						spellcheck="false"
						autocomplete="off"
						autocapitalize="off"
						autocorrect="off"
						list="autocompleteOff"
						@input="callSearch"
						@click="openFindMember"
					/>
					<img
						v-if="!doneLoading"
						src="+/icons/loading.gif"
						alt=""
						class="loading-gif"
					/>
					<div
						class="list-member-suggestion-container"
						v-show="showFindMembers"
					>
						<div
							class="list-member-suggestion-overlay"
							@click="showFindMembers = false"
						></div>
						<div class="list-member-suggestion">
							<p
								style="text-align: center"
								v-if="members.length == 0"
							>
								Not have member
							</p>
							<div
								class="item-member-search"
								v-for="user in listMemberFiltered"
								:key="user.id"
								@click="addToList(user)"
							>
								<img
									v-if="user.avatar"
									:src="user.avatar"
									alt=""
								/>
								<img
									v-else
									src="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3e%3cpath fill='%23bcbcbc' fill-rule='evenodd' d='M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10Zm-7-3a3 3 0 1 1-6 0a3 3 0 0 1 6 0Zm-3 11.5a8.46 8.46 0 0 0 4.807-1.489c.604-.415.862-1.205.51-1.848C16.59 15.83 15.09 15 12 15c-3.09 0-4.59.83-5.318 2.163c-.351.643-.093 1.433.511 1.848A8.46 8.46 0 0 0 12 20.5Z' clip-rule='evenodd'/%3e%3c/svg%3e"
								/>
								<div class="item-member-search-name">
									<p>
										{{ user.first_name }}
										{{ user.last_name }}
									</p>
									<p>{{ user.email }}</p>
								</div>
								<div
									class=""
									style="margin-left: auto"
									v-if="listUserAdded.includes(user)"
								>
									<svg
										xmlns="http://www.w3.org/2000/svg"
										width="28"
										height="28"
										viewBox="0 0 24 24"
									>
										<path
											fill="var(--c-blue)"
											d="M9 16.17L4.83 12l-1.42 1.41L9 19L21 7l-1.41-1.41L9 16.17z"
										/>
									</svg>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
			<div class="list-member-added-container">
				<div class="list-member-added">
					<div
						class="member-item"
						v-for="user in listUserAdded"
						:key="user.id"
					>
						<img v-if="user.avatar" :src="user.avatar" alt="" />
						<img
							v-else
							src="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3e%3cpath fill='%23bcbcbc' fill-rule='evenodd' d='M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10Zm-7-3a3 3 0 1 1-6 0a3 3 0 0 1 6 0Zm-3 11.5a8.46 8.46 0 0 0 4.807-1.489c.604-.415.862-1.205.51-1.848C16.59 15.83 15.09 15 12 15c-3.09 0-4.59.83-5.318 2.163c-.351.643-.093 1.433.511 1.848A8.46 8.46 0 0 0 12 20.5Z' clip-rule='evenodd'/%3e%3c/svg%3e"
							class="member-img"
						/>
						<p>{{ user.first_name }} {{ user.last_name }}</p>
						<img
							@click="removeUser(user)"
							class="delete-mem-btn"
							src="+/icons/close.svg"
						/>
					</div>
				</div>
			</div>
			<div class="action-container">
				<div></div>
				<div class="action-list">
					<button @click="$emit('close')">Hủy</button>
					<button @click="inviteMember">
						<img
							v-if="inviting"
							src="+/icons/loading.gif"
							alt=""
							style="width: 17px; height: 17px"
						/>
						<p v-if="!inviting">Thêm</p>
					</button>
				</div>
			</div>
		</div>
	</div>
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
.detailMemberContainer {
	/* position: relative;
	border-radius: 6px;
	width: 496px;
	height: 420px;
	background-color: white;
	padding: 16px; */
	position: relative;
	border-radius: 13px;
	width: 566px;
	height: 320px;
	background-color: white;
	padding: 35px;
	padding-top: 20px;
	display: flex;
	padding-bottom: 20px;
	gap: 10px;
	flex-direction: column;
}

.find-member-header {
	/* border-bottom: 1px solid #c2cfe0; */
	color: #334d6e;
	font-weight: 600;
	height: 32px;
	display: flex;
	align-items: center;
	font-size: 18px;
}

.close-btn {
	margin-left: auto;
	cursor: pointer;
}
.detail-member-scroll {
	height: calc(100% - 62px);
	overflow: auto;
	position: relative;
}
.memberContainer {
	font-style: normal;
	font-weight: 500;
	font-size: 16px;
	line-height: 24px;
	display: flex;
	align-items: center;
	letter-spacing: 0.02em;
	color: #525252;
	margin-top: 13px;
}
.member-img {
	width: 40px;
	height: 40px;
	left: 0px;
	top: 0px;

	/* Table gray */
	border: 1px solid #cdd6df;
	box-sizing: border-box;

	/* Inside Auto Layout */
	flex: none;
	order: 0;
	flex-grow: 0;
	border-radius: 20px;
	margin-right: 12px;
}
.memberAction {
	clear: both;
	display: inline-block;
	/* position: absolute; */
	right: 16px;
	margin-left: auto;
	font-style: normal;
	font-weight: 500;
	font-size: 15px;
	line-height: 22px;

	display: flex;
	justify-content: center;
	align-items: center;
	letter-spacing: 0.02em;
	height: 32px;

	background: #00693b;
	border-radius: 6px;
	color: white;
	padding: 12px;
	width: 72px;
}
.memberAction:hover {
	cursor: pointer;
}
.memberStatus {
	clear: both;
	display: inline-block;
	position: absolute;
	right: 24px;

	font-style: normal;
	font-weight: normal;
	font-size: 15px;
	line-height: 22px;

	/* identical to box height, or 147% */
	display: flex;
	align-items: center;
	text-align: right;
	letter-spacing: 0.02em;

	background: white;
	color: #334d6e;
}

.inp-find-member {
	margin-top: 6px;
}
.inp-find-container {
	margin: 10px 0;
	height: 36px;
	background: #f5f5f5;
	border: 1px solid #e2e6e8;
	width: 100%;
	border-radius: 4px;
	display: flex;
	align-items: center;
	padding: 6px 6px;
	gap: 12px;
	position: relative;
}
.list-member-suggestion-container {
	position: absolute;
	top: 110%;
	right: 0;
	width: 100%;
	padding: 5px;
	background: #ffffff;
	border-radius: 5px;
	box-shadow: 1px 3px 6px #c9c9c9;
}
.list-member-suggestion {
	width: 100%;
	max-height: 200px;
	height: fit-content;
	display: flex;
	flex-direction: column;
	overflow-y: auto;
	background: #ffffff;
	padding: 0 5px;
	position: relative;
	z-index: 1;
}
.list-member-suggestion-overlay {
	position: fixed;
	top: 0;
	left: 0;
	width: 100vw;
	height: 100vh;
	z-index: 0;
}
.item-member-search {
	display: flex;
	align-items: center;
	gap: 10px;
	padding: 5px 10px;
	border-radius: 5px;
}
.item-member-search:hover {
	background: #ededed;
	cursor: pointer;
}
.item-member-search-name {
	display: flex;
	flex-direction: column;
}
.item-member-search-name p:nth-child(1) {
	font-weight: 500;
}
.item-member-search-name p:nth-child(2) {
	font-size: 13px;
}
.item-member-search img:nth-child(1) {
	width: 30px;
	height: 30px;
	border-radius: 50%;
	object-fit: cover;
}
.inp-find-container input {
	width: 100%;
	border: none;
	background-color: transparent;
	outline: none;
}
.member-name p:nth-child(1) {
	line-height: 20px;
}
.member-name p:nth-child(2) {
	font-weight: 300;
	font-size: 14px;
}
.empty-value {
	text-align: center;
	margin-top: 25px;
}
.loading-gif {
	width: 22px;
	height: 22px;
}
.list-member-added-container {
	width: 100%;
	height: 100%;
	border: 1px solid #c0c0c0;
	border-radius: 6px;
	padding: 10px;
	overflow-y: auto;
}
.list-member-added {
	display: flex;
	flex-wrap: wrap;
	gap: 5px;
}
.member-item {
	display: flex;
	gap: 5px;
	border: 1px solid #c0c0c0;
	border-radius: 10px;
	width: fit-content;
	height: fit-content;
	align-items: center;
	padding: 4px;
}
.member-item img:nth-child(1) {
	width: 20px;
	height: 20px;
	border-radius: 50%;
	object-fit: cover;
}
.delete-mem-btn {
	width: 15px;
	height: 15px;
	cursor: pointer;
}
.find-mem-container {
	display: flex;
	align-items: center;
	gap: 10px;
	position: relative;
}
.set-permission-container {
	position: relative;
	height: 36px;
	display: flex;
	border: 1px solid #e1e1e1;
	justify-content: center;
	align-items: center;
	padding: 0 20px;
	border-radius: 5px;
	padding-right: 0;
}
.current-permission-label {
	display: flex;
	align-items: center;
	gap: 5px;
	cursor: pointer;
}
.set-permission-popup {
	width: 100%;
	position: absolute;
	top: 110%;
	height: fit-content;
	right: 0;
	padding: 10px 5px;
	border-radius: 5px;
	background: #ffffff;
	justify-content: center;
	box-shadow: 1px 3px 6px #c9c9c9;
}
.set-permission-popup:hover {
	background: #ededed;
	cursor: pointer;
}
.action-container {
	display: flex;
	justify-content: space-between;
}
.action-list {
	display: flex;
	gap: 10px;
}
.action-list button:nth-child(1) {
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 16px;
	color: var(--c-blue);
	border: none;
	padding: 8px 16px;
	transition: 0.2s;
	background: #ffffff;
	font-weight: 500;
}
.action-list button:nth-child(1):hover {
	background: var(--c-bg-btn-hover-2);
	transition: 0.2s;
}
.action-list button:nth-child(2) {
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 16px;
	font-weight: 500;
	color: white;
	border: none;
	padding: 8px 12px;
	background: var(--c-blue);
	transition: 0.2s;
	width: 66px;
}
.action-list button:nth-child(2):hover {
	background: var(--c-blue-dark);
	transition: 0.2s;
}
@media screen and (max-width: 600px) {
	.overlay {
		padding: 0 20px;
	}
}
</style>
