<script setup lang="ts">
import { ref, onMounted, computed, inject } from "vue";
import type { Gc as IGc } from "^/core/Gc";
const Gc = inject("Gc") as typeof IGc;
import { dateFormat, timeFormat } from "../time";
import EditTimeRange from "./EditTimeRange.vue";
const { set_noti_mess_store } = Gc["stores"]["noti_mess_store"];

const {
	update_time_checkin_api,
	add_time_checkin_api,
	delete_time_checkin_api
} = Gc["services"]["calendar_services"];
const props = defineProps<{
	idCal: string;
	startRangeTime: number;
	endRangeTime: number;
	timeWorkings: ITimeWorkings[];
	creator: string;
}>();
export interface ITimeWorkings {
	id: number;
	start_time_working: number;
	end_time_working: number;
	content: string;
	status: "WAITING" | "APPROVED" | "REJECTED" | "NORMAL";
	reason: string;
}
const emits = defineEmits<{
	(e: "update-time-working", id: number, start: number, end: number): void;
	(e: "add-time-working", id: number, start: number, end: number): void;
	(e: "delete", index: number): void;
	(e: "update_time_workings", val: ITimeWorkings[]): void;
}>();
const pointerScroll = (elem: any): void => {
	let isDrag = false;

	const checkTag = (el: HTMLElement): boolean => {
		if (el && el?.dataset?.noDragscroll) {
			return false;
		}
		while (el && el.parentNode) {
			el = el.parentNode as HTMLElement;
			if (el?.dataset?.noDragscroll) {
				return false;
			} else if (el?.dataset?.parentHere) {
				return true;
			}
		}
		return true;
	};

	const dragStart = (e: any): any => {
		isDrag = checkTag(e.target);
	};

	const dragEnd = (): any => (isDrag = false);
	const drag = (ev: any): any => {
		if (!isDrag) return false;
		// prevent text selection when mouse move
		if (ev.stopPropagation) ev.stopPropagation();
		if (ev.preventDefault) ev.preventDefault();
		ev.cancelBubble = true;
		ev.returnValue = false;
		return isDrag && (elem.scrollLeft -= ev.movementX);
	};

	elem.addEventListener("pointerdown", dragStart);
	addEventListener("pointerup", dragEnd);
	addEventListener("pointermove", drag);
};

// const timeWorkings = ref<
// 	{
// 		start_time_working: number;
// 		end_time_working: number;
// 	}[]
// >([
// 	{
// 		start_time_working: 1704871219237,
// 		end_time_working: 1704871227521
// 	},
// 	{
// 		start_time_working: 1704871233950,
// 		end_time_working: 1704871238148
// 	},
// 	{
// 		start_time_working: 1705243591278,
// 		end_time_working: 1705243606875
// 	},
// 	{
// 		start_time_working: 1705333479192,
// 		end_time_working: 1705333487275
// 	}
// ]);
onMounted(() => {
	// const timeStart = Number(propsTimeComputed.value.start.split(":")[0]);
	// const timeEnd = Number(propsTimeComputed.value.end.split(":")[0]);
	// for (let i = timeStart; i <= timeEnd; i++) {
	// 	range.value.push(i.toString());
	// }
	// const timeMinuteEnd = Number(timeFormat(props.endRangeTime).split(":")[1]);
	// if (timeMinuteEnd > 0) {
	// 	range.value.push(timeEnd + ":" + timeMinuteEnd);
	// }
});

// const range = ref<string[]>([]);
// const calculateTotalMinutes = (start: string, end: string): number => {
// 	const [hourStart, minuteStart] = start.split(":");
// 	const [hourEnd, minuteEnd] = end.split(":");
// 	if (hourStart === hourEnd) return Number(minuteEnd) - Number(minuteStart);
// 	const total =
// 		(Number(hourEnd) - Number(hourStart)) * 60 +
// 		Number(minuteStart) +
// 		Number(minuteEnd);
// 	console.log(total);
// 	return total;
// };

const pixelComputed = computed(() => {
	const totalMinutes =
		(props.endRangeTime - props.startRangeTime) / 1000 / 60;
	const arr = props.timeWorkings.map(
		(item: {
			id: number;
			start_time_working: number;
			end_time_working: number;
		}) => {
			const startTimeFormated = timeFormat(item.start_time_working);

			const endTimeFormated = item?.end_time_working
				? timeFormat(item.end_time_working)
				: timeFormat(new Date().getTime());

			let left =
				((item.start_time_working - props.startRangeTime) /
					1000 /
					60 /
					totalMinutes) *
				100;

			let right =
				100 -
				((item.end_time_working - props.startRangeTime) /
					1000 /
					60 /
					totalMinutes) *
					100;
			console.log("cal", left, right, totalMinutes);
			if (left > 100) left = 100;
			if (right < 0) right = 0;
			if (left < 0) left = 0;
			return {
				id: item.id,
				style: {
					left: left + "%",
					right: right + "%"
				},
				raw: {
					start: item.start_time_working,
					end: item.end_time_working
				},
				start: startTimeFormated,
				end: endTimeFormated
			};
		}
	);
	return arr;
});

const showEditRange = ref<boolean>(false);
const onUpdate = async (
	id: number,
	val: {
		start: string;
		end: string;
		reason: string;
	}
): Promise<void> => {
	try {
		const index = props.timeWorkings.findIndex(
			(t: ITimeWorkings) => t.id === id
		);
		if (index !== -1) {
			await update_time_checkin_api(
				{
					start_time: val.start,
					end_time: val.end,
					timezone: "UTC+7",
					content: val.reason
				},
				props.idCal,
				id
			);
			set_noti_mess_store({
				mess: "Update time success"
			});
			emits(
				"update-time-working",
				index,
				new Date(val.start).getTime(),
				new Date(val.end).getTime()
			);
		}
	} catch (error) {
		console.log(error);
	}
};

const onAdd = async (val: {
	start: string;
	end: string;
	reason: string;
}): Promise<void> => {
	try {
		const res = await add_time_checkin_api(
			{
				start_time: val.start,
				end_time: val.end,
				timezone: "UTC+7",
				content: val.reason
			},
			props.idCal
		);
		set_noti_mess_store({
			mess: "Add time success"
		});
		emits(
			"add-time-working",
			res.data.time_workings[res.data.time_workings.length - 1].id,
			new Date(val.start).getTime(),
			new Date(val.end).getTime()
		);
	} catch (error) {
		console.log(error);
	}
};

const onDelete = async (id: number): Promise<void> => {
	try {
		const index = props.timeWorkings.findIndex(
			(t: ITimeWorkings) => t.id === id
		);
		if (index !== -1) {
			await delete_time_checkin_api(props.idCal, id);
			set_noti_mess_store({
				mess: "Delete time success"
			});
			emits("delete", index);
		}
	} catch (error) {
		console.log(error);
	}
};

const updateTimeWorking = (times: ITimeWorkings[]): void => {
	emits("update_time_workings", times);
};

</script>
<template>
	<div class="time-range-container">
		<EditTimeRange
			v-if="showEditRange"
			@close="showEditRange = false"
			@update="onUpdate"
			@delete="onDelete"
			@add="onAdd"
			@update_time_workings="updateTimeWorking"
			:time-workings="timeWorkings"
			:creator="creator"
			:id-cal="idCal"
			:day-work="startRangeTime"
		/>
		<div class="time-list">
			<div class="time-list-item">
				{{ timeFormat(props.startRangeTime) }}
			</div>
			<div class="time-list-item" style="margin-left: auto">
				{{ timeFormat(props.endRangeTime) }}
			</div>
		</div>
		<div class="time-range-background" @click="showEditRange = true">
			<div
				v-for="item in pixelComputed"
				:key="item.id"
				:style="item.style"
				class="time-element"
			>
				<div>
					<div class="time-hover">
						<p>{{ item.start }}</p>
						<ISvg name="IArrowRightLight" width="20" height="20" />
						<p>{{ item.end }}</p>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>
<style scoped>
.time-range-container {
	width: 100%;
}
.time-range-background {
	position: relative;
	height: 10px;
	width: 100%;
	background-color: var(--c-bg-btn-hover);
	border-radius: 5px;
	cursor: pointer;
}
.time-list {
	display: flex;
	flex-flow: row;
}
.time-list-item {
	font-size: 15px;
	font-weight: 500;
	color: #2a7fd9;
}
.time-element {
	height: 100%;
	position: absolute;
	bottom: 0;
	background: #f59110;
	border-left: 1px solid black;
	cursor: pointer;
}
.time-element > div {
	width: 100%;
	position: relative;
	height: 100%;
}
.time-hover {
	position: absolute;
	display: flex;
	justify-content: space-between;
	top: 100%;
	display: none;
	gap: 5px;
	background: var(--c-slight-blue-hover);
	min-width: 100%;
	padding: 2px 10px;
	top: calc(100% + 5px);
	border-radius: 5px;
	align-items: center;
	z-index: 1;
	border: 1px solid var(--c-white-light);
}
.time-element > div:hover .time-hover {
	display: flex;
}
</style>
