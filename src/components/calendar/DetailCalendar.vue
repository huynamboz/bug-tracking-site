<script setup lang="ts">
import { onBeforeMount, inject, ref, computed } from "vue";
import type { Gc as IGc } from "^/core/Gc";
const Gc = inject("Gc") as typeof IGc;
import { timeFormat, dateFormat } from "./time";
import type { i_calendar_item, i_calendar_group } from "^/core/types/calendar_types";
import { getCalendarApi } from "@/services/calendars/calendars";
import { useAuthStore } from "@/stores";
import CreateCalendar from "./CreateCalendar.vue";
// const {
//     get_calendar_api,
//     remove_calendar_api,
//     start_working_api,
//     end_working_api,
//     update_calendar_api,
// } = Gc["services"]["calendar_services"];
// const { set_question_store } = Gc["stores"]["question_store"];
// const { id_workspace_store } = Gc["stores"]["workspaces_store"];
// const { auth_store } = Gc["stores"]["auth_store"];
// const { getTimezoneOffsetString } = Gc["modules"]["time"];
// const { set_noti_mess_store } = Gc["stores"]["noti_mess_store"];
// import TimeRange, { type ITimeWorkings } from "./Modules/TimeRange.vue";
// import CreateCalendar from "./CreateCalendar.vue";
// import CommentCalendar from "./Comments/CommentCalendar.vue";

const props = defineProps<{
    idCal: string;
    mountShowUpdate: boolean;
    calendarGroup: Array<i_calendar_group>;
}>();

const authStore = useAuthStore();

const emits = defineEmits<{
    (e: "close"): void;
    (e: "update-cal", data: i_calendar_item): void;
    (e: "delete-cal", data: string): void;
}>();
const calendar = ref<i_calendar_item>();
const getDetaiWorkByDay = async (idCalendar: string): Promise<void> => {
    try {
        getCalendarApi(idCalendar).then((res) => {
            calendar.value = res["data"];
        });
    } catch (error) {
        console.log(error);
    }
};

const makeDayOff = async (type: string): Promise<void> => {
    if (calendar.value) {
        const newCal = calendar.value as i_calendar_item;
        const formData = new FormData();
        formData.append("title", newCal.title);
        formData.append("content", newCal.content);
        formData.append("off", type);
        if (newCal.report) {
            formData.append("report", newCal.report);
        }

        const dateChose = dateFormat(newCal.start_time);

        formData.append("start_time", dateChose + " " + newCal.start_time + ":00");
        formData.append("end_time", dateChose + " " + newCal.end_time + ":00");

        formData.append("timezone", getTimezoneOffsetString());

        try {
            update_calendar_api(newCal.id, formData).then((res) => {
                set_noti_mess_store({
                    mess: "Make day off success",
                });
                if (calendar.value) {
                    calendar.value.off = true;
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
};

const showUpdate = ref(false);

const openUpdate = (): void => {
    showUpdate.value = true;
};

const closeUpdate = (): void => {
    showUpdate.value = false;
};

const updateCal = (cal: i_calendar_item): void => {
    if (calendar.value) {
        calendar.value.title = cal.title;
        calendar.value.content = cal.content;

        calendar.value.report = cal.report;

        calendar.value.start_time = cal.start_time;
        calendar.value.end_time = cal.end_time;

        emits("update-cal", cal);
    }
};

onBeforeMount(async () => {
    await getDetaiWorkByDay(props.idCal);
    if (props.mountShowUpdate) {
        openUpdate();
    }
});

const isWorkOfUser = (id: any): boolean => {
    // if (id == auth_store.value.user?.property_id) {
    //     return true;
    // }
    return false;
};

const close = (): void => {
    emits("close");
};

const insideOverlay = (event: Event): void => {
    event.stopPropagation();
};
//Delete Calendar

const deleteCalendar = async (): Promise<void> => {
    try {
        await remove_calendar_api(props.idCal).then(() => {
            emits("delete-cal", props.idCal);
        });
    } catch (error) {
        console.log(error);
    }
};
const confirmDeleteTask = async (): Promise<void> => {
    await Promise.all([
        set_question_store({
            title: "Confirm",
            body: `Are you sure want to delete ${calendar.value?.title || ""}`,
            action: deleteCalendar,
        }),
    ]);
};

const callWorking = (status: boolean): void => {
    if (status) {
        set_question_store({
            title: "Xác nhận",
            body: `Bạn muốn kết thúc làm việc`,
            action: () => {
                onChangeWorkingStatus(status);
            },
        });
    } else {
        set_question_store({
            title: "Xác nhận",
            body: `Bạn muốn bắt đầu làm việc`,
            action: () => {
                onChangeWorkingStatus(status);
            },
        });
    }
};
const onChangeWorkingStatus = async (status: boolean): Promise<void> => {
    try {
        if (id_workspace_store.value && calendar.value) {
            const timeNow = timeFormat(new Date().getTime());
            if (status) {
                if (timeFormat(calendar.value.end_time) < timeNow) {
                    set_noti_mess_store({
                        error: true,
                        mess: "Kết thúc làm trễ hơn dự định, vui lòng chỉnh lại lịch",
                    });
                    // return;
                }
                const res = await end_working_api(props.idCal);
                calendar.value.working = false;
                calendar.value.time_workings = res.data.time_workings;
                emits("update-cal", calendar.value);
            } else {
                if (timeFormat(calendar.value.start_time) > timeNow) {
                    set_noti_mess_store({
                        error: true,
                        mess: "Bắt đầu làm sớm hơn dự định, vui lòng điều chỉnh lại lịch",
                    });
                    // return;
                }
                if (timeFormat(calendar.value.end_time) < timeNow) {
                    set_noti_mess_store({
                        error: true,
                        mess: "Bắt đầu làm trễ hơn hơn dự định, vui lòng điều chỉnh lại lịch",
                    });
                    // return;
                }
                const res = await start_working_api(props.idCal);
                calendar.value.working = true;
                calendar.value.time_workings = res.data.time_workings;
                emits("update-cal", calendar.value);
            }
        }
    } catch (error) {
        console.log(error);
    }
};

const lastTimeWorkingHour = computed(() => {
    let lastTime = "";
    let end = "";
    if (calendar.value) {
        if (calendar.value.time_workings.length === 0) return "";
        end = timeFormat(calendar.value.end_time);
        const len = calendar.value?.time_workings.length - 1;
        lastTime = timeFormat(
            calendar.value.time_workings[len].end_time_working ??
                calendar.value.time_workings[len].start_time_working,
        );
    }
    return lastTime > end ? lastTime : "";
});

const firstTimeWorking = computed(() => {
    if (calendar.value) {
        if (calendar.value?.time_workings[0]) {
            return calendar.value.time_workings[0].start_time_working;
        }
    }
    return undefined;
});

const endTimeWorking = computed(() => {
    if (calendar.value) {
        const len = calendar.value?.time_workings.length - 1;
        if (calendar.value?.time_workings[len]) {
            return calendar.value.time_workings[len].end_time_working;
        }
    }

    return undefined;
});

const totalTimeWorked = computed(() => {
    if (calendar.value) {
        let totalSeconds = 0;
        calendar.value.time_workings.forEach((i) => {
            if (i.end_time_working) totalSeconds += i.end_time_working - i.start_time_working;
        });
        const result = (totalSeconds / 1000 / 60 / 60).toFixed(1);
        return result;
    }
    return 0;
});
const unHealthyWorking = computed(() => {
    let err = "";
    if (calendar.value && calendar.value.start_time && calendar.value.end_time) {
        if (firstTimeWorking.value) {
            if (timeFormat(firstTimeWorking.value) < timeFormat(calendar.value.start_time)) {
                err =
                    err +
                    `. Thời gian bắt đầu làm (${timeFormat(
                        firstTimeWorking.value,
                    )}) sớm hơn thời gian dự định`;
            }
            if (timeFormat(firstTimeWorking.value) > timeFormat(calendar.value.end_time)) {
                err =
                    err +
                    `. Thời gian bắt đầu làm (${timeFormat(
                        firstTimeWorking.value,
                    )}) trễ hơn thời gian dự định`;
            }
        }
        if (endTimeWorking.value) {
            // if (endTimeWorking.value < calendar.value.start_time) {
            // 	err =
            // 		err +
            // 		`. Thời gian kết thúc làm (${timeFormat(
            // 			endTimeWorking.value
            // 		)}) sớm hơn thời gian dự định`;
            // }
            if (timeFormat(endTimeWorking.value) > timeFormat(calendar.value.end_time)) {
                err =
                    err +
                    `. Thời gian kết thúc làm (${timeFormat(
                        endTimeWorking.value,
                    )}) trễ hơn thời gian dự định`;
            }
        }
    }
    return err;
});
const updateTimeWorking = async (index: number, start: number, end: number): Promise<void> => {
    if (!calendar.value) return;
    calendar.value.time_workings[index].start_time_working = start;
    calendar.value.time_workings[index].end_time_working = end;
};

const addTimeWorking = async (id: number, start: number, end: number): Promise<void> => {
    if (!calendar.value) return;
    calendar.value.time_workings.push({
        id,
        start_time_working: start,
        end_time_working: end,
        content: "",
        status: "NORMAL",
        reason: "",
    });
};

const onDeleteCheckinTime = (index: number): void => {
    if (!calendar.value) return;
    calendar.value.time_workings.splice(index, 1);
};

const user_group_ids = computed((): Array<string> => {
    const user_ids: Array<string> = [];
    for (const group of props.calendarGroup) {
        for (const member of group.members) {
            const idf = user_ids.findIndex((item) => item === member.sub_id);
            if (idf < 0) {
                if (member.sub_id) {
                    user_ids.push(member.sub_id);
                }
            }
        }
    }
    return user_ids;
});

const updateTimeWorkingEmit = (times: ITimeWorkings[]): void => {
    if (calendar.value) {
        calendar.value.time_workings = times;
    }
};
</script>

<template>
    <div
        v-if="calendar"
        class="popup-work-container fadeIn"
        @click="close"
    >
        <div
            v-show="!showUpdate"
            class="popup-work-main"
            @click="insideOverlay"
        >
            <!-- Popup header -->
            <div class="popup-work-main-left">
                <div class="header-popup">
                    {{ calendar.title }}
                    <div
                        v-if="isWorkOfUser(calendar?.created_by?.id)"
                        class="container-icon"
                    >
                        <!-- <img
                            src="+/icons/action-edit.svg"
                            class="icn-edit"
                            @click="openUpdate"
                        />
                        <img
                            src="+/icons/remove.svg"
                            class="icn-edit"
                            @click.stop="confirmDeleteTask"
                        /> -->
                    </div>
                    <div
                        v-if="isWorkOfUser(calendar?.created_by?.id)"
                        class="ctn-working"
                    >
                        <button
                            v-if="!calendar.working"
                            class="btn-work"
                            @click="callWorking(calendar.working)"
                        >
                            Start Work
                        </button>
                        <button
                            v-else
                            class="btn-work"
                            style="background: #335a8e"
                            @click="callWorking(calendar.working)"
                        >
                            End Work
                        </button>
                    </div>
                    <div
                        v-else
                        class="ctn-working"
                    >
                        <div
                            v-if="calendar.working"
                            class="working-label"
                        >
                            Working
                        </div>
                    </div>
                    <!-- <div class="btn-close-x" @click="close">
						<img src="+/icons/close.svg" alt="" />
					</div> -->
                </div>
                <div class="desc-head">
                    <div class="item-desc">
                        <!-- <img
                            class="icn-label"
                            src="+/icons/person.svg"
                        /> -->
                        {{ calendar.created_by.first_name }}
                        {{ calendar.created_by.last_name }}
                    </div>
                    <div
                        class="item-desc"
                        style="margin-left: 32px"
                    >
                        <!-- <img
                            class="icn-label"
                            src="+/icons/time.svg"
                        /> -->
                        {{ dateFormat(calendar.start_time) }}
                    </div>
                </div>
                <TimeRange
                    :id-cal="calendar.id"
                    :time-workings="calendar.time_workings"
                    :start-range-time="calendar.start_time"
                    :end-range-time="calendar.end_time"
                    :creator="calendar.created_by.user_id as string"
                    @update-time-working="updateTimeWorking"
                    @add-time-working="addTimeWorking"
                    @delete="onDeleteCheckinTime"
                    @update_time_workings="updateTimeWorkingEmit"
                />
                <p style="margin-top: 16px">
                    <span class="inp-field-label">Total: </span><span> {{ totalTimeWorked }}h</span>
                </p>
                <p
                    v-if="unHealthyWorking"
                    class="warning"
                >
                    <span>Warning{{ unHealthyWorking }}</span>
                </p>
                <div class="content-field">
                    <p class="inp-field-label">Content:</p>
                    <div class="content content-pre">
                        {{ calendar.content }}
                    </div>
                </div>
                <div class="content-field">
                    <p class="inp-field-label">Report:</p>
                    <div
                        class="content ql-editor-courses"
                        v-html="calendar.report"
                    ></div>
                </div>
            </div>
            <!-- List file -->
            <!-- <div
				class="files-attached-field"
				v-if="calendar.files && calendar.files.length > 0"
			>
				<ListFile @delete-file="deleteFile" :files="calendar.files" />
			</div> -->
            <!-- Comment -->
            <CommentCalendar
                :id-calendar="idCal"
                class="popup-main-right"
                :option-editor="{
                    emoji: true,
                    mention: true,
                }"
                :user-ids="user_group_ids"
            />
        </div>
        <CreateCalendar
            v-if="calendar && showUpdate"
            :cal-detail="calendar"
            @close="closeUpdate"
            @update-cal="updateCal"
        />
    </div>
</template>
<style scoped>
@import "/css/quillEditor.snow.css";

.popup-work-container {
    width: 100%;
    height: 100%;
    justify-content: center;
    align-items: center;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    z-index: 20;
    overflow-y: auto;
    background: #00000069;
    animation: fadeIn-452c2f81 0.1s ease-in-out forwards;
}

@keyframes fadeIn {
    from {
        opacity: 0;
    }
    to {
        opacity: 1;
    }
}

.popup-work-main {
    background: #f0f1f4;
    border-radius: var(--popup-border-radius);
    max-width: 100%;
    height: fit-content;
    position: relative;
    z-index: 1;
    padding: 16px;
    display: flex;
    max-height: 100%;
    overflow: auto;
    gap: 12px;
}

.popup-work-main-left {
    flex: 1 1 auto;
    width: 550px;
    background: white;
    padding: 12px;
    border: 1px solid #c2cfe0;
    border-radius: 8px;
}

.popup-main-right {
    width: 356px;
    border-left: 1px solid var(--c-bg-btn-hover);
    padding-left: 16px;
    max-height: 500px;
    overflow-y: auto;
    background: white;
    padding: 12px;
    border: 1px solid #c2cfe0;
    border-radius: 8px;
    word-break: break-word;
}
@media screen and (max-width: 1024px) {
    .popup-main-right {
        width: 100%;
    }
}
.header-popup {
    display: flex;
    align-items: center;
    font-size: 18px;
    font-weight: 500;
    margin-bottom: 16px;
    border-bottom: 1px solid #c2cfe0;
    padding-bottom: 12px;
}

.btn-close-x {
    height: 30px;
    width: 30px;
    min-width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    margin-left: auto;
    border-radius: 50%;
}

.btn-close-x:hover {
    background: #b7b8bb;
    transition: 0.2s;
    cursor: pointer;
}

.header-title {
    display: flex;
    align-items: center;
    width: 100%;
    gap: 10px;
    margin-bottom: 13px;
}
.detail-popup {
    font-size: 13px;
    display: flex;
    align-items: center;
    gap: 4px;
    margin-top: 15px;
}

.input-field {
    display: flex;
    gap: 5px;
    width: 100%;
}

.inp-field-label {
    font-weight: 500;
    font-size: 15px;
    width: 90px;
}

.inp-container {
    border: 1px solid #b7b8bb;
    border-radius: 6px;
    padding: 7px 10px;
}

.inp-container input {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
}
.desc-head {
    font-size: 15px;
    margin-bottom: 12px;
    font-weight: 500;
    display: flex;
    align-items: center;
    color: #2a7fd9;
}
.desc-head.working {
    display: flex;
    gap: 10px;
    color: unset;
}
.desc-head.dayoff {
    display: flex;
    gap: 10px;
    color: unset;
    border-left: 1px solid var(--c-white-light);
    padding-left: 20px;
}
.content-field {
    margin-top: 12px;
}
.files-attached-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    margin-bottom: 15px;
    border-top: 1px solid #c2cfe0;
    padding-top: 12px;
}

:deep(.ql-editor-courses-border) {
    border: 1px solid #b7b8bb;
    border-radius: 6px;
}
.content {
    padding: 12px;
    border-radius: 4px;
    max-height: 400px;
    overflow: auto;
    background: #f5f5f5;
    margin-top: 4px;
}
/* list file attach */

.skeleton-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}
.end-time-tag {
    display: none;
}
.end-time {
    background: #ffedeb;
    color: #ae2a19;
    padding: 0 4px;
    font-size: 12px;
    white-space: nowrap;
    display: flex;
    width: fit-content;
    width: -moz-fit-content;
    align-items: center;
    gap: 4px;
    font-weight: 400;
    border-radius: 5px;
}
.end-time-field {
    display: flex;
    gap: 5px;
    align-items: end;
}
.disable-end-time-tag {
    display: none;
}
.main-button {
    display: flex;
    align-items: center;
}
.main-button button {
    padding: 8px 15px;
    border: none;
    border-radius: 16px;
    background-color: #2a7fd9;
    color: white;
}
.main-button button:hover {
    background-color: #103c6b;
}
.inp-container-date {
    font-weight: 600;
    color: #2a7fd9;
}
.icon-edit {
    cursor: pointer;
}
.icon-edit:hover {
    color: #2a7fd9;
}
.icon-delete {
    cursor: pointer;
}
.icon-delete:hover {
    color: #2a7fd9;
}
.container-icon {
    margin-left: 12px;
    padding-left: 12px;
}

.icn-label {
    width: 22px;
    margin-right: 12px;
}

.icn-edit {
    cursor: pointer;
}

.icn-edit + .icn-edit {
    margin-left: 12px;
}

.content-pre {
    white-space: pre-line;
}
.switch {
    position: relative;
    display: inline-block;
    width: 46px;
    height: 24px;
}

.switch input {
    opacity: 0;
    width: 0;
    height: 0;
}

.slider {
    position: absolute;
    cursor: pointer;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: #ccc;
    -webkit-transition: 0.4s;
    transition: 0.4s;
}
.slider:before {
    position: absolute;
    content: "";
    height: 16px;
    width: 16px;
    left: 4px;
    bottom: 4px;
    background-color: white;
    -webkit-transition: 0.4s;
    transition: 0.4s;
}

.slider.active {
    background-color: var(--c-green-100);
}

input:focus + .slider {
    box-shadow: 0 0 1px var(--c-green-100);
}

.slider.active::before {
    -webkit-transform: translateX(22px);
    -ms-transform: translateX(22px);
    transform: translateX(22px);
}

/* Rounded sliders */
.slider.round {
    border-radius: 34px;
}

.slider.round:before {
    border-radius: 50%;
}

.warning {
    margin-top: 12px;
}
.warning span {
    color: var(--c-warning);
    font-weight: 500;
}
.working-section {
    display: flex;
    gap: 20px;
}

.btn-work {
    background: #00693b;
    color: white;
    border: navajowhite;
    padding: 4px 12px;
    border-radius: 4px;
    font-weight: 500;
}

.ctn-working {
    margin-left: auto;
}

.working-label {
    color: #006058;
    font-size: 15px;
}

.item-desc {
    display: flex;
    align-items: center;
}

@media screen and (max-width: 1024px) {
    .popup-work-main {
        flex-direction: column;
    }
}
</style>
./Comments/CommentCalendar.vue
