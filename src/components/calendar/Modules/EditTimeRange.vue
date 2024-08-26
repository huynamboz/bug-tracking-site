<script setup lang="ts">
import { computed, onBeforeMount, onBeforeUnmount, ref, inject } from "vue";
import type { Gc as IGc } from "^/core/Gc";
const Gc = inject("Gc") as typeof IGc;
import { dateFormat, timeFormat } from "../time";
const { set_question_store } = Gc["stores"]["question_store"];
const { approve_time_checkin_api, reject_time_checkin_api } =
	Gc["services"]["calendar_services"];
const { auth_store } = Gc["stores"]["auth_store"];
const { auth_user } = Gc["auth"];
const { is_modderator_store } = Gc["stores"]["workspaces_store"];

import type { ITimeWorkings } from "./TimeRange.vue";
import { DatePicker } from "v-calendar";
import "v-calendar/style.css";
import type { CDate } from "^/core/types/calendar_types";
const emits = defineEmits<{
	(e: "close"): void;
	(
		e: "update",
		id: number,
		val: {
			start: string;
			end: string;
			reason: string;
		}
	): void;
	(e: "delete", id: number): void;
	(
		e: "add",
		val: {
			start: string;
			end: string;
			reason: string;
		}
	): void;
	(e: "update_time_workings", val: ITimeWorkings[]): void;
}>();

const props = defineProps<{
	dayWork: number;
	idCal: string;
	timeWorkings: ITimeWorkings[];
	creator: string;
}>();
const item = ref<{
	id: number;
	start: string;
	end: string;
}>({
	id: 0,
	start: "",
	end: ""
});
onBeforeMount(() => {
	// if (props.initValue) {
	// 	item.value.start = timeFormat(props.initValue.raw.start);
	// 	item.value.end = timeFormat(props.initValue.raw.end);
	// }
	document.addEventListener("keyup", onPressESC);
});
const update = (id: number, type?: "update" | "add"): void => {
	if (validate.value) return;
	const start =
		editData.value.start.date +
		" " +
		(new Date(editData.value.start.time) as CDate).formatTime() +
		":00";
	const end =
		editData.value.end.date +
		" " +
		(new Date(editData.value.end.time) as CDate).formatTime() +
		":00";
	if (type === "update" && id) {
		emits("update", id, {
			start,
			end,
			reason: editData.value.reason
		});
		isShowEdit.value = [];
	} else {
		isAddNew.value = false;
		emits("add", {
			start,
			end,
			reason: editData.value.reason
		});
	}
};

onBeforeUnmount(() => {
	document.removeEventListener("keyup", onPressESC);
});

const onPressESC = (e: KeyboardEvent): void => {
	if (e.key === "Escape") {
		close();
	}
};
const close = (): void => {
	emits("close");
};

const validate = computed(() => {
	const len =
		props.timeWorkings.length > 0 ? props.timeWorkings.length - 1 : 0;
	console.log(props.timeWorkings, "timewoking");
	if (props.timeWorkings[len] && !props.timeWorkings[len].end_time_working)
		return "Kết thúc công việc trước khi chỉnh sửa";
	const start =
		editData.value.start.date +
		" " +
		(new Date(editData.value.start.time) as CDate).formatTime() +
		":00";
	const end =
		editData.value.end.date +
		" " +
		(new Date(editData.value.end.time) as CDate).formatTime() +
		":00";
	if (new Date(start).getTime() >= new Date(end).getTime()) {
		return "Thời gian kết thúc phải lớn hơn thòi gian bắt đầu";
	}
	if (!editData.value.reason) {
		return "Lý do không được để trống";
	}
	return "";
});
const onConfirmDelete = (id: number): void => {
	// if (!props.initValue.raw.end) {
	// 	return;
	// }
	set_question_store({
		title: "Confirm",
		body: `Are you sure want to delete this time`,
		action: onDelete,
		actionData: id
	});
};
const onDelete = async (id: number): Promise<void> => {
	emits("delete", id);
	isShowEdit.value = [];
};

const timeComputed = computed(() => {
	const arr = props.timeWorkings.map((time) => {
		return {
			dayStart: dateFormat(time.start_time_working),
			dayEnd: time.end_time_working
				? dateFormat(time.end_time_working)
				: null,
			start: timeFormat(time.start_time_working),
			id: time.id,
			end: time.end_time_working
				? timeFormat(time.end_time_working)
				: null,
			status: time.status,
			content: time.content,
			reason: time.reason
		};
	});
	return arr;
});
const isShowEdit = ref<Array<boolean>>([]);
const onOpenEdit = (index: number): void => {
	isShowEdit.value = [];
	isShowEdit.value[index] = true;
	editData.value = {
		start: {
			date: timeComputed.value[index].dayStart,
			time: new Date(
				timeComputed.value[index].dayStart +
					" " +
					timeComputed.value[index].start
			)
		},
		end: {
			date: timeComputed.value[index].dayEnd || "",
			time: new Date(
				timeComputed.value[index].dayEnd +
					" " +
					timeComputed.value[index].end
			)
		},
		reason: ""
	};
	console.log(editData.value);
};
const onCloseEdit = (): void => {
	isShowEdit.value = [];
};

const editData = ref<{
	start: {
		date: string;
		time: Date;
	};
	end: {
		date: string;
		time: Date;
	};
	reason: string;
}>({
	start: {
		date: "",
		time: new Date()
	},
	end: {
		date: "",
		time: new Date()
	},
	reason: ""
});

const isAddNew = ref<boolean>(false);
const onShowAddNew = (): void => {
	if (isAddNew.value) {
		isAddNew.value = false;
		return;
	}
	isAddNew.value = true;
	editData.value = {
		start: {
			date: (new Date(props.dayWork) as CDate).format(),
			time: new Date()
		},
		end: {
			date: (new Date(props.dayWork) as CDate).format(),
			time: new Date()
		},
		reason: ""
	};
};

const convertStatus = (
	status: "WAITING" | "APPROVED" | "REJECTED" | "NORMAL"
): string => {
	switch (status) {
		case "WAITING":
			return "Chờ duyệt";
		case "APPROVED":
			return "Chấp nhận";
		case "REJECTED":
			return "Từ chối";
		case "NORMAL":
			return "";
	}
	return "";
};

const approveTime = async (id: number): Promise<void> => {
	try {
		await approve_time_checkin_api(props.idCal, id).then((res) => {
			emits("update_time_workings", res["data"].time_workings);
		});
	} catch (error) {
		console.log(error);
	}
};

const rejectTime = async (id: number): Promise<void> => {
	const reason = prompt("Enter reason reject");
	if (reason) {
		try {
			await reject_time_checkin_api(props.idCal, id, {
				reason: reason
			}).then((res) => {
				emits("update_time_workings", res["data"].time_workings);
			});
		} catch (error) {
			console.log(error);
		}
	}
};
</script>
<template>
	<div class="edit-time-container" @click="close">
		<div @click.stop class="edit-popup">
			<table>
				<tr>
					<th>Time</th>
					<th>Status</th>
					<th>Reason</th>
					<th>Reason reject</th>
					<th>Action</th>
				</tr>
				<tr v-for="(item, index) in timeComputed" :key="item.id">
					<td class="time-item">
						<div class="time-item__hours__detail">
							<p>{{ item.dayStart }}</p>
							<p>{{ item.start }}</p>
						</div>
						<ISvg name="IArrowRightLight" width="20" height="20" />
						<div class="time-item__hours__detail">
							<p>{{ item.dayEnd }}</p>
							<p>{{ item.end || "working" }}</p>
						</div>
					</td>
					<td>
						<span class="status">{{
							convertStatus(item.status)
						}}</span>
					</td>
					<td>
						{{ item.content }}
					</td>
					<td>{{ item.reason }}</td>
					<td v-if="item.end && creator === auth_store.user?.id">
						<ISvg
							@click="onConfirmDelete(item.id)"
							name="IRecycleBin"
							width="18"
							height="18"
							style="cursor: pointer"
						/>
						<ISvg
							@click="onOpenEdit(index)"
							name="IEdit"
							width="20"
							height="20"
							style="cursor: pointer"
						/>
					</td>
					<td
						v-if="auth_user?.role === 'HOST' || is_modderator_store"
					>
						<div
							v-if="item.status === 'WAITING'"
							style="display: flex"
						>
							<p class="accept" @click="approveTime(item.id)">
								Approve
							</p>
							<p
								class="reject"
								style="margin-left: 12px"
								@click="rejectTime(item.id)"
							>
								Reject
							</p>
						</div>
					</td>

					<div
						v-if="isShowEdit[index]"
						class="overlay-edit-time"
						@click="onCloseEdit"
					>
						<div class="popup-edit-time" @click.stop>
							<div class="edit-picker">
								<div class="edit-inp">
									<input
										v-model="editData.start.date"
										type="date"
										name=""
										id=""
									/>
									<DatePicker
										:minute-increment="5"
										class="date-picker"
										v-model="editData.start.time"
										mode="time"
										hide-time-header
										is24hr
									/>
								</div>
								<ISvg
									name="IArrowRightLight"
									width="20"
									height="20"
								/>
								<div class="edit-inp">
									<input
										v-model="editData.end.date"
										type="date"
										name=""
										id=""
									/>
									<DatePicker
										:minute-increment="5"
										class="date-picker"
										v-model="editData.end.time"
										mode="time"
										hide-time-header
										is24hr
									/>
								</div>
								<textarea
									class="inp-reason"
									placeholder="Enter reason"
									v-model="editData.reason"
								></textarea>
							</div>
							<div class="err">
								<ISvg
									v-if="validate"
									name="IWarningSolid"
									width="18"
									height="18"
								/>
								{{ validate }}
							</div>
							<div class="edit-action">
								<p style="cursor: pointer" @click="onCloseEdit">
									cancel
								</p>
								<p @click="onConfirmDelete(item.id)">delete</p>
								<p @click="update(item.id, 'update')">save</p>
							</div>
						</div>
					</div>
				</tr>
			</table>

			<p v-if="timeComputed.length === 0" style="text-align: center">
				Empty
			</p>
			<div
				v-if="isAddNew"
				class="overlay-edit-time"
				@click="onShowAddNew"
			>
				<div class="popup-edit-time" @click.stop>
					<div class="edit-picker">
						<div class="edit-inp">
							<input
								v-model="editData.start.date"
								type="date"
								name=""
								id=""
							/>
							<DatePicker
								:minute-increment="5"
								class="date-picker"
								v-model="editData.start.time"
								mode="time"
								hide-time-header
								is24hr
							/>
						</div>
						<ISvg name="IArrowRightLight" width="20" height="20" />
						<div class="edit-inp">
							<input
								v-model="editData.end.date"
								type="date"
								name=""
								id=""
							/>
							<DatePicker
								:minute-increment="5"
								class="date-picker"
								v-model="editData.end.time"
								mode="time"
								hide-time-header
								is24hr
							/>
						</div>
						<textarea
							class="inp-reason"
							placeholder="Enter reason"
							v-model="editData.reason"
						></textarea>
					</div>
					<div class="err">
						<ISvg
							v-if="validate"
							name="IWarningSolid"
							width="18"
							height="18"
						/>
						{{ validate }}
					</div>
					<div class="edit-action">
						<p style="cursor: pointer" @click="onShowAddNew">
							cancel
						</p>
						<p @click="update(0, 'add')">save</p>
					</div>
				</div>
			</div>
			<div
				class="add-new"
				@click="onShowAddNew"
				v-if="!isAddNew && creator === auth_store.user?.id"
			>
				Add new
			</div>
			<!-- <div class="edit-action">
				<p style="cursor: pointer" @click="close">cancel</p>
				<p @click="onConfirmDelete">delete</p>
				<p @click="update">save</p>
			</div> -->
		</div>
	</div>
</template>
<style scoped>
.edit-time-container {
	background: #2a2a2a78;
	width: 100%;
	position: fixed;
	top: 0;
	left: 0;
	height: 100%;
	z-index: 1;
	display: flex;
	justify-content: center;
	align-items: center;
}
.edit-popup {
	min-width: 540px;
	background: white;
	z-index: 3;
	border-radius: 5px;
	cursor: default;
	padding: 18px;
	overflow-y: auto;
	max-height: 90vh;
}
.time-item {
	display: flex;
	align-items: center;
	justify-content: center;
}
.time-item__hours {
	display: flex;
	align-items: center;
	gap: 12px;
	width: 100%;
	justify-content: space-around;
}
.time-item__hours.edit {
	flex-direction: column;
	gap: 0;
	align-items: unset;
}
.time-item__hours__detail p:nth-child(2) {
	font-size: 18px;
	font-weight: 600;
	margin-top: 6px;
}
.action {
	border-left: 1px solid var(--c-white-light);
	padding: 10px;
	margin-left: 10px;
	margin-left: auto;
	display: flex;
	gap: 5px;
}
.action svg {
	cursor: pointer;
}
.edit-picker {
	display: flex;
	align-items: center;
}
input[type="date"] {
	padding: 2px;
	border-radius: 3px;
	border: 1px solid var(--vc-gray-300);
	margin-left: 4px;
	margin-bottom: 2px;
}
.edit-inp {
	display: flex;
	flex-direction: column;
}
.add-new {
	width: 100%;
	display: flex;
	justify-content: center;
	align-items: center;
	padding: 10px;
	margin-top: 10px;
	background: var(--c-bg-btn-hover);
	border-radius: 5px;
	cursor: pointer;
}
.edit-action {
	display: flex;
	justify-content: end;
	margin-top: 10px;
	gap: 10px;
	align-items: center;
}
.edit-action p:nth-child(3),
.accept {
	background: var(--c-blue-dark);
	color: white;
	padding: 4px 12px;
	border-radius: 3px;
	cursor: pointer;
}
.edit-action p:nth-child(2),
.reject {
	background: var(--c-warning);
	color: white;
	padding: 4px 16px;
	border-radius: 3px;
	cursor: pointer;
}
.err {
	color: var(--c-warning);
	margin-top: 5px;
	font-size: 13px;
	display: flex;
	align-items: center;
	gap: 5px;
}
.date-picker {
	border: none;
}
:deep(select) {
	border: none;
}

.inp-reason {
	height: 100%;
	margin-left: 12px;
	border: 0.5px solid #c2cfe0;
	background: #f2f4f7;
	border-radius: 4px;
	padding: 4px;
	resize: none;
	font-size: 14px;
	min-height: 72px;
}

table,
th,
td {
	border: 1px solid #727f8f;
}

table {
	width: 100%;
}

th,
td {
	text-align: center;
	padding: 4px;
}

.overlay-edit-time {
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
	align-items: center;
	justify-content: center;
}

.popup-edit-time {
	background: white;
	padding: 24px;
	border-radius: 12px;
}

.status {
	color: #334d6e;
	font-weight: 500;
}
</style>
