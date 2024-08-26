<script setup lang="ts">
import { ref, inject, onBeforeMount, computed, watch, onMounted } from "vue";
import VueCal from "vue-cal";
import moment from "moment";
import "vue-cal/dist/vuecal.css";

// import CalendarGroup from "./Calendars/CalendarGroup.vue";
// import DetailCalendar from "./Calendars/DetailCalendar.vue";
import DetailCalendar from "@/components/calendar/DetailCalendar.vue";
// import DetailReport from "./Reports/DetailReport.vue";
// import DetailReport from "@/components/calendar/Reports/DetailReport.vue";
// import CalendarTime from "./Calendars/CalendarTime.vue";
// import CreateCalendar from "./Calendars/CreateCalendar.vue";
import type {
    i_calendar_group,
    i_calendar_item,
    i_calendar_split_vuecal,
    i_calendar_item_vuecal,
    CDate,
} from "^/core/types/calendar_types";
import { useAuthStore } from "@/stores";
import { getTimezoneOffsetString } from "@/utils/time";
import { getCalendarGroupsApi } from "@/services/calendars/calendar-groups";
import { createCalendarApi, getCalendarsApi, getTimeApi } from "@/services/calendars/calendars";
import CreateCalendar from "@/components/calendar/CreateCalendar.vue";

// import type { Gc as IGc } from "^/core/Gc";
// const Gc = inject("Gc") as typeof IGc;
// const { set_question_store } = Gc["stores"]["question_store"];
// const { is_modderator_store } = Gc["stores"]["workspaces_store"];

// const {
//     get_calendar_groups_api,
//     remove_calendar_api,
//     get_calendars_api,
//     update_time_calendar_api,
//     create_calendar_api,
//     get_time_api,
// } = Gc["services"]["calendar_services"];
// const { auth_user } = Gc["auth"];
// const { getTimezoneOffsetString } = Gc["modules"]["time"];
// const { resize_column } = Gc["modules"]["resize"];
// const CollapseButton = Gc["components"]["layouts"]["CollapseButton"]();
// const { useRoute, useRouter } = Gc["router"];
const route = useRoute();
const router = useRouter();

const authStore = useAuthStore();

moment.updateLocale("en", {
    week: {
        dow: 6,
        doy: 7,
    },
});

interface CalSetting {
    minColumn: boolean;
    monthEvent: boolean;
    columnLabel: "full" | "avatar" | "name";
    event: {
        title: boolean;
        time: boolean;
        content: boolean;
    };
    userCard: "" | "full" | "avatar" | "name";
    countTime: boolean;
    showReport: boolean;
    activeView: "years" | "year" | "month" | "week" | "day";
}

const calSetting = ref<CalSetting>({
    minColumn: false, // boolean
    monthEvent: false, // boolean
    columnLabel: "full", // full avatar name
    event: {
        title: true, // boolean
        time: true, // boolean
        content: false, // boolean
    },
    userCard: "avatar", // '' full avatar name,
    countTime: true, // boolean
    showReport: true,
    activeView: "day",
});

const calendar_groups = ref<Array<i_calendar_group>>([]);

const getCalendarGroups = async (): Promise<void> => {
    try {
        await getCalendarGroupsApi().then((res) => {
            calendar_groups.value = res["data"];
        });
    } catch (error) {
        console.log(error);
    }
};

const changeGroupSelect = async (): Promise<void> => {
    await callGetCalendars();
};
const splitDays = computed<Array<i_calendar_split_vuecal>>(() => {
    const splits: Array<i_calendar_split_vuecal> = [];

    if (!authStore.getUser) {
        return splits;
    }

    splits.push({
        id: authStore.getUser.id,
        class: "",
        label: authStore.getUser.last_name + " " + authStore.getUser.first_name,
        avatar: authStore.getUser.avatar,
        // off: myOff
    });

    for (const group of calendar_groups.value) {
        if (group.selected) {
            for (const member of group.members) {
                if (member.selected) {
                    const idf = splits.findIndex((item) => item.id === member.user_id);
                    if (idf < 0) {
                        if (member.user_id) {
                            splits.push({
                                id: member.user_id,
                                class: "",
                                label: member.last_name + " " + member.first_name,
                                avatar: member.avatar,
                            });
                        }
                    }
                }
            }
        }
    }
    return splits;
});

const leftElm = ref<HTMLElement>();
const mainElm = ref<HTMLElement>();
const resizeElm = ref<HTMLElement>();
onMounted(() => {
    if (leftElm.value && mainElm.value && resizeElm.value) {
        // resize_column(leftElm.value, mainElm.value, resizeElm.value);
    }
});

const doneInit = ref(false);
onBeforeMount(async () => {
    await Promise.all([loadSetting(), getCalendarGroups(), callGetCalendars()]);
    doneInit.value = true;

    if (idCalDetailRoute.value) {
        openDetailCal(idCalDetailRoute.value as string, false);
    }
});

const onEventClick = (event: i_calendar_item_vuecal, e: Event): void => {
    e.stopPropagation();
    if (event.off) return;
    console.log("on event click", event);
    if (event.id) {
        openDetailCal(event.id, false);
    } else {
        console.log("new event");
    }
};

const onEventCreate = (event: i_calendar_item_vuecal): i_calendar_item_vuecal | boolean => {
    console.log("--> on create", event);
    if (event.split != authStore.getUser?.id) {
        const date = (event.start as CDate).format();
        const index = calendars.value.findIndex((i) => i.date === date);
        if (index >= 0) {
            console.log("dat off");
            return false;
        }
        return false;
    }

    return event;
};

const onEventDragCreate = (event: i_calendar_item_vuecal): void => {
    console.log("--> on create drag ", event);
    createCal(event);
};

const createCal = async (event: i_calendar_item_vuecal): Promise<void> => {
    event.title = "";
    event.content = "";

    const formData = new FormData();
    formData.append("title", event.title);
    formData.append("content", event.content);

    const start = event.start as CDate;
    const end = event.end as CDate;
    formData.append("start_time", start.format() + " " + start.formatTime() + ":00");
    formData.append("end_time", end.format() + " " + end.formatTime() + ":00");
    formData.append("timezone", getTimezoneOffsetString());

    try {
        await createCalendarApi(formData).then((res) => {
            const newCal = res["data"];

            event.id = newCal.id;
            event.created_by = newCal.created_by;
            calendars.value.push(event);

            openDetailCal(newCal.id, true);
        });
    } catch (error) {
        console.log(error);
    }
};

type EventCal = {
    event: i_calendar_item_vuecal;
};

const onEventDrop = ({ event }: EventCal): boolean => {
    console.log("--> on drop");
    const date = (event.start as CDate).format();
    const index = calendars.value.findIndex((i) => i.date === date);
    if (index >= 0) {
        console.log("dat off");
        return false;
    }
    if (event.split != authStore.getUser?.id) {
        alert("Không được kéo qua chỗ người khác !!!");
        return false;
    }
    updateTimeCalendar(event);
    return true;
};

const onEventDurationChange = ({ event }: EventCal): void => {
    console.log("--> on resize");
    updateTimeCalendar(event);
};

const selectedDate = ref<CDate>(new Date() as CDate);

const currentSelect = computed(() => {
    return {
        year: Number(selectedDate.value.format("YYYY")),
        month: Number(selectedDate.value.format("MM")),
        week: moment(selectedDate.value).week(),
        day: Number(selectedDate.value.format("DD")),
    };
});

watch(
    () => selectedDate.value,
    (newVal, oldVal) => {
        if (!doneInit.value) {
            return;
        }
        console.log("---> selected date change");
        const newYear = newVal.format("YYYY");
        const oldYear = oldVal.format("YYYY");
        const newMonth = newVal.format("MM");
        const oldMonth = oldVal.format("MM");
        const newWeek = moment(newVal).week();
        const oldWeek = moment(oldVal).week();
        const newDay = newVal.format("DD");
        const oldDay = oldVal.format("DD");

        switch (calSetting.value.activeView) {
            case "years":
            case "year":
                if (newYear != oldYear) {
                    callGetCalendars();
                }
                break;
            case "month":
                if (newMonth != oldMonth) {
                    callGetCalendars();
                }
                break;
            case "week":
                if (newWeek != oldWeek) {
                    callGetCalendars();
                }
                break;
            case "day":
                if (newDay != oldDay) {
                    callGetCalendars();
                }
                break;
        }
    },
);

watch(
    () => calSetting.value.activeView,
    () => {
        if (!doneInit.value) {
            return;
        }
        console.log("---> activew change");
        callGetCalendars();
        saveSetting();
    },
);

const doneLoading = ref<boolean>(true);
const callGetCalendars = async (): Promise<void> => {
    doneLoading.value = false;
    if (showCountTime.value) {
        getCalendarTimes();
    }

    switch (calSetting.value.activeView) {
        case "years":
        case "year":
        case "month":
            await getCalendars(
                currentSelect.value.year,
                currentSelect.value.month,
                undefined,
                undefined,
            );
            break;
        case "week":
            await getCalendars(
                currentSelect.value.year,
                currentSelect.value.month,
                currentSelect.value.week,
                undefined,
            );
            break;
        case "day":
            await getCalendars(
                currentSelect.value.year,
                currentSelect.value.month,
                undefined,
                currentSelect.value.day,
            );
            break;
    }
    doneLoading.value = true;
};

const calendars = ref<Array<i_calendar_item_vuecal>>([]);
const getCalendars = async (
    year: number,
    month?: number,
    week?: number,
    day?: number,
): Promise<void> => {
    try {
        calendars.value = [];
        await getCalendarsApi(getTimezoneOffsetString(), year, month, week, day).then((res) => {
            const data = res["data"];

            for (const cal of data) {
                let resizable = false;
                let draggable = false;

                if (cal.created_by.user_id == authStore.getUser?.id) {
                    resizable = true;
                    draggable = true;
                }

                if (cal.off) {
                    resizable = false;
                    draggable = false;
                }

                calendars.value.push({
                    id: cal.id,

                    start: cal.off
                        ? (new Date(cal.date) as CDate).format() + " 00:01:00"
                        : (new Date(cal.start_time) as CDate),
                    end: cal.off
                        ? (new Date(cal.date) as CDate).format() + " 23:59:00"
                        : (new Date(cal.end_time) as CDate),

                    title: cal.title,
                    content: cal.content,

                    waiting_approve: cal.waiting_approve,
                    split: cal.created_by.user_id,

                    class: cal.off ? "off" : "",
                    resizable: resizable,
                    draggable: draggable,
                    off: cal.off,
                    date: cal.off ? (new Date(cal.date) as CDate).format() : "",
                    created_by: cal.created_by,
                    working: cal.working,
                });
            }
        });
    } catch (error) {
        console.log(error);
    }
};

const updateTimeCalendar = async (cal: i_calendar_item_vuecal): Promise<void> => {
    if (!cal.id) {
        return;
    }

    try {
        const formData = new FormData();
        const start = cal.start as CDate;
        const end = cal.end as CDate;
        formData.append("start_time", start.format() + " " + start.formatTime() + ":00");
        formData.append("end_time", end.format() + " " + end.formatTime() + ":00");
        formData.append("timezone", getTimezoneOffsetString());

        await update_time_calendar_api(cal.id, formData).then((res) => {});
    } catch (error) {
        console.log(error);
    }
};

const editableEvents = computed(() => {
    if (calSetting.value.activeView == "day" || calSetting.value.activeView == "week") {
        return { drag: true, resize: true, create: true };
    }
    return false;
});

const idCalDetail = ref<string>();
const showUpdateDetail = ref(false);

const idCalDetailRoute = computed(() => {
    return route.query.idCal;
});

watch(
    () => idCalDetailRoute.value,
    () => {
        if (idCalDetailRoute.value) {
            openDetailCal(idCalDetailRoute.value as string, false);
        }
    },
);

const openDetailCal = (idCal: string, showUpdate: boolean): void => {
    idCalDetail.value = idCal;
    showUpdateDetail.value = showUpdate;
};

const closeDetailCal = (): void => {
    idCalDetail.value = undefined;
    showUpdateDetail.value = false;
    router.push({ ...route.query });
};

const updateCal = (cal: i_calendar_item): void => {
    const idf = calendars.value.findIndex((item) => item.id == cal.id);
    console.log("onupdate", cal);
    if (idf >= 0) {
        calendars.value[idf].title = cal.title;
        calendars.value[idf].content = cal.content;
        calendars.value[idf].working = cal.working;

        calendars.value[idf].start = new Date(cal.start_time) as CDate;
        calendars.value[idf].end = new Date(cal.end_time) as CDate;
    }
};

const deleteCal = (idCal: string): void => {
    closeDetailCal();

    const idx = calendars.value.findIndex((item) => item.id == idCal);

    if (idx >= 0) {
        calendars.value.splice(idx, 1);
    }
};

const toArrow = (type: "NEXT" | "PREVIOUS", e: Event): void => {
    console.log("--> to arrow :", type);
    switch (calSetting.value.activeView) {
        case "year":
            if (type == "NEXT") {
                selectedDate.value = new Date(currentSelect.value.year + 1, 0, 1) as CDate;
            } else {
                selectedDate.value = new Date(currentSelect.value.year - 1, 0, 1) as CDate;
            }
            e.stopPropagation();
            break;
        case "month":
            if (type == "NEXT") {
                if (currentSelect.value.month == 12) {
                    selectedDate.value = new Date(currentSelect.value.year + 1, 0, 1) as CDate;
                } else {
                    selectedDate.value = new Date(
                        currentSelect.value.year,
                        currentSelect.value.month,
                        1,
                    ) as CDate;
                }
            } else {
                if (currentSelect.value.month == 1) {
                    selectedDate.value = new Date(currentSelect.value.year - 1, 11, 1) as CDate;
                } else {
                    selectedDate.value = new Date(
                        currentSelect.value.year,
                        currentSelect.value.month - 2,
                        1,
                    ) as CDate;
                }
            }
            e.stopPropagation();
            break;
        case "week":
            if (type == "NEXT") {
                selectedDate.value = selectedDate.value.addDays(7);
            } else {
                selectedDate.value = selectedDate.value.subtractDays(7);
            }
            e.stopPropagation();
            break;
        case "day":
            if (type == "NEXT") {
                selectedDate.value = selectedDate.value.addDays(1);
            } else {
                selectedDate.value = selectedDate.value.subtractDays(1);
            }
            e.stopPropagation();
            break;
    }
};

const choseToday = (): void => {
    selectedDate.value = new Date() as CDate;
};

const calSettingConst = {
    specialHours: {
        1: { from: 12 * 60, to: 13 * 60, class: "cal-lunch" },
        2: { from: 12 * 60, to: 13 * 60, class: "cal-lunch" },
        3: { from: 12 * 60, to: 13 * 60, class: "cal-lunch" },
        4: { from: 12 * 60, to: 13 * 60, class: "cal-lunch" },
        5: { from: 12 * 60, to: 13 * 60, class: "cal-lunch" },
        6: { from: 12 * 60, to: 13 * 60, class: "cal-lunch" },
        7: { from: 12 * 60, to: 13 * 60, class: "cal-lunch" },
    },
    startWeekOnDay: 6,
};

const saveSetting = (): void => {
    localStorage.setItem(key_setting, JSON.stringify(calSetting.value));
};

const key_setting = "CAL_SETTING";

const loadSetting = (): void => {
    const setting = localStorage.getItem(key_setting);
    if (setting) {
        const settingParse = JSON.parse(setting);
        try {
            calSetting.value = settingParse;
        } catch (error) {
            console.log(error);
            resetSetting();
        }
    }
};

const resetSetting = (): void => {
    calSetting.value = {
        minColumn: false,
        monthEvent: false,
        columnLabel: "full",
        event: {
            title: true,
            time: true,
            content: false,
        },
        userCard: "avatar",
        countTime: true,
        showReport: true,
        activeView: "day",
    };
    saveSetting();
};

const minSplitWidth = computed(() => {
    if (calSetting.value.minColumn) {
        return 200;
    }
    return 0;
});

const showMonthEvents = computed(() => {
    if (calSetting.value.monthEvent) {
        return "short";
    }
    return false;
});

const onCreateGroup = (data: i_calendar_group): void => {
    calendar_groups.value.unshift(data);
};

const onDeleteGroup = (index: number): void => {
    calendar_groups.value.splice(index, 1);
};

const showCountTime = computed(() => {
    if (calSetting.value.activeView == "month" && calSetting.value.countTime) {
        return true;
    } else {
        return false;
    }
});

const switchCountTime = async (): Promise<void> => {
    console.log("switch count time");
    if (showCountTime.value) {
        await getCalendarTimes();
    }
};

const calendar_times = ref<Array<i_calendar_item>>([]);

const getCalendarTimes = async (): Promise<void> => {
    try {
        await getTimeApi(currentSelect.value.year, currentSelect.value.month).then((res) => {
            calendar_times.value = res["data"];
        });
    } catch (error) {
        console.log(error);
    }
};

const showCalendarTime = ref(false);
const openCalendarTime = (): void => {
    showCalendarTime.value = true;
};
const closeCalendarTime = (): void => {
    showCalendarTime.value = false;
};

function gFixed(num: number, precision: number): number {
    let formatted = num.toFixed(precision);
    formatted = parseFloat(formatted).toString(); // Convert to string to remove trailing zeros
    return parseFloat(formatted);
}

const getTimeByUser = (userId: string): number => {
    let time = 0;

    for (const cal of calendar_times.value) {
        if (cal.created_by.user_id == userId) {
            if (cal.total) {
                time = time + cal.total;
            }
        }
    }

    return gFixed(time / 60, 2);
};

const showReport = computed(() => {
    if (calSetting.value.activeView == "week" && calSetting.value.showReport) {
        return true;
    } else {
        return false;
    }
});

interface report_props {
    idMem: string;
    nameMem: string;
    year: number;
    week: number;
}
const detailReport = ref<report_props>();

const openReport = (idMem: string, nameMem?: string): void => {
    detailReport.value = {
        idMem: idMem,
        nameMem: nameMem ? nameMem : "",
        year: currentSelect.value.year,
        week: currentSelect.value.week,
    };
};

const closeReport = (): void => {
    detailReport.value = undefined;
};

const callDayOff = async (): Promise<void> => {
    const event: any = {};
    event.title = "off";
    event.content = "off";
    const dateOff = selectedDate.value.format();
    const formData = new FormData();
    formData.append("title", event.title);
    formData.append("content", event.content);

    formData.append("start_time", dateOff + " 00:01:00");
    formData.append("end_time", dateOff + " 23:59:00");
    formData.append("date", dateOff);
    formData.append("timezone", getTimezoneOffsetString());
    formData.append("off", JSON.stringify(true));
    create_calendar_api(formData).then((res) => {
        const newCal = res["data"];

        event.id = newCal.id;
        event.created_by = newCal.created_by;
        event.off = true;
        // calendars.value = calendars.value.filter((item) => {
        // 	return !(new Date(item.start) as CDate).format().includes(dateOff);
        // });
        calendars.value.push({
            id: newCal.id,

            start: new Date(dateOff + " 00:01:00") as CDate,
            end: new Date(dateOff + " 23:59:00") as CDate,

            split: authStore.getUser?.id,

            class: "off",
            resizable: false,
            draggable: false,
            off: true,
            date: dateOff,
            created_by: event.created_by,
            working: false,
        });
    });
};

const cancelDayOff = async (id?: string): Promise<void> => {
    const date = selectedDate.value.format();
    // Nếu không truyền id thì sẽ xóa lịch xin off của chính tôi vào ngày đã chọn
    const idCal =
        id ??
        calendars.value.find(
            (i) => i.date === date && i.created_by?.user_id === authStore.getUser?.id,
        )?.id;
    console.log("id calendar to delete: ", idCal);
    if (idCal) {
        await remove_calendar_api(idCal);
        calendars.value = calendars.value.filter((item) => item.id !== idCal);
    }
};

const onMakeDayOff = (): void => {
    console.log(selectedDate.value.format());
    !isSelectedDayoff.value
        ? set_question_store({
              title: "Xác nhận",
              body: "Bạn có chắc chắn muốn xin nghỉ ngày " + selectedDate.value.format(),
              action: callDayOff,
          })
        : set_question_store({
              title: "Xác nhận",
              body: "Bạn có chắc chắn muốn hủy xin nghỉ ngày " + selectedDate.value.format(),
              action: cancelDayOff,
          });
};
const onDeleteDayOff = (value: string, id: string): void => {
    set_question_store({
        title: "Xác nhận",
        body: `Bạn có chắc chắn muốn xóa ngày vi phạm của ${value}? ${selectedDate.value.format()}`,
        action: cancelDayOff,
        actionData: id,
    });
};
const isSelectedDayoff = computed(() => {
    if (calSetting.value.activeView !== "day" && calSetting.value.activeView !== "week")
        return true;
    if (!doneLoading.value) return true;
    const date = selectedDate.value.format();
    const index = calendars.value.findIndex(
        (i) => i.date === date && i.created_by?.user_id === authStore.getUser?.id,
    );
    if (index >= 0) return true;
    return false;
});

const isShowCreateCalendar = ref<boolean>(false);
const onCreateCal = (val: i_calendar_item): void => {
    const event: i_calendar_item_vuecal = {
        id: val.id,
        title: val.title,
        content: val.content,
        created_by: val.created_by,
        start: new Date(val.start_time) as CDate,
        end: new Date(val.end_time) as CDate,
        working: val.working,
        off: val.off,
        split: authStore.getUser?.id,
    };

    calendars.value.push(event);
    isShowCreateCalendar.value = false;
};
const vuecal = ref<typeof VueCal>(null);
const onNextCal = (): void => {
    vuecal.value.next();
};
const onPrevCal = (): void => {
    vuecal.value.previous();
};

const showSetting = ref(false);
const toggleShowSetting = (): void => {
    showSetting.value = !showSetting.value;
};
const isOpenOptionMobile = ref<boolean>(false);
const toggleOpenOptionInMobile = (): void => {
    isOpenOptionMobile.value = !isOpenOptionMobile.value;
};
</script>

<template>
    <div class="cal-container">
        <CollapseButton
            class="collapse-container"
            :left-elm="leftElm"
            :main-elm="mainElm"
            :resize-elm="resizeElm"
            :show-week-numbers="true"
        />

        <div
            ref="leftElm"
            class="cal-left"
            :class="{ 'cal-left-active': isOpenOptionMobile }"
        >
            <vue-cal
                v-model:selected-date="selectedDate"
                xsmall
                :time="false"
                hide-view-selector
                active-view="month"
                :disable-views="['years', 'year', 'week', 'day']"
                class="vuecal--blue-theme vuecal--rounded-theme small-cal"
                style="height: 250px"
                :start-week-on-day="calSettingConst.startWeekOnDay"
            >
            </vue-cal>
            <!-- <button class="btn-off" @click="onMakeDayOff">
				{{ isSelectedDayoff ? "Hủy off" : "Xin off" }}
			</button> -->

            <div class="line"></div>

            <div class="flex-align">
                Selected:
                <span class="current-select">
                    {{ selectedDate.format() }}
                </span>
                <!-- <button class="btn-today" @click="choseToday">Today</button> -->
            </div>

            <div class="line"></div>

            <div style="display: flex; gap: 10px">
                <button
                    style="margin-left: 0"
                    class="btn-today"
                    @click="choseToday"
                >
                    Today
                </button>
                <button
                    style="margin-left: 0px"
                    class="btn-today"
                    @click="onMakeDayOff"
                >
                    {{ isSelectedDayoff ? "Hủy off" : "Xin off" }}
                </button>
            </div>
            <div class="line"></div>
            <div
                class="setting"
                @click="toggleShowSetting"
            >
                Setting
                <!-- <img
                    v-if="showSetting"
                    class="group-drop"
                    src="+/icons/arrow-up.svg"
                />
                <img
                    v-else
                    class="group-drop"
                    src="+/icons/arrow-down.svg"
                /> -->
            </div>

            <div v-show="showSetting">
                <div class="setting-div">
                    <label class="setting-label">Card:</label>
                    <div class="clear">
                        <input
                            v-model="calSetting.event.title"
                            class="setting-inp"
                            type="checkbox"
                            @change="saveSetting"
                        />
                        <label>Title - </label>
                    </div>
                    <div class="clear">
                        <input
                            v-model="calSetting.event.time"
                            class="setting-inp"
                            type="checkbox"
                            @change="saveSetting"
                        />
                        <label>Time - </label>
                    </div>
                    <div class="clear">
                        <input
                            v-model="calSetting.event.content"
                            class="setting-inp"
                            type="checkbox"
                            @change="saveSetting"
                        />
                        <label>Content</label>
                    </div>
                </div>
                <div class="setting-div">
                    <label class="setting-label">User in Card:</label>
                    <select
                        v-model="calSetting.userCard"
                        class="setting-inp"
                        @change="saveSetting"
                    >
                        <option value="">Hide</option>
                        <option value="full">Full</option>
                        <option value="avatar">Avatar</option>
                        <option value="name">Name</option>
                    </select>
                </div>
                <div class="setting-div">
                    <label class="setting-label">Column label:</label>
                    <select
                        v-model="calSetting.columnLabel"
                        class="setting-inp"
                        @change="saveSetting"
                    >
                        <option value="full">Full</option>
                        <option value="avatar">Avatar</option>
                        <option value="name">Name</option>
                    </select>
                </div>
                <div class="setting-div">
                    <label class="setting-label">Min Column:</label>
                    <input
                        v-model="calSetting.minColumn"
                        class="setting-inp"
                        type="checkbox"
                        @change="saveSetting"
                    />
                </div>
                <div class="setting-div">
                    <label class="setting-label">Month events:</label>
                    <input
                        v-model="calSetting.monthEvent"
                        class="setting-inp"
                        type="checkbox"
                        @change="saveSetting"
                    />
                </div>
                <div class="setting-div">
                    <button
                        class="btn-reset-setting"
                        @click="resetSetting"
                    >
                        Reset settings
                    </button>
                </div>
            </div>

            <div class="line"></div>
            <calendar-group
                :calendar_groups="calendar_groups"
                @change-select="changeGroupSelect"
                @delete-group="onDeleteGroup"
                @create-group="onCreateGroup"
            />
        </div>
        <div
            ref="mainElm"
            class="cal-main g-calendar"
        >
            <div
                ref="resizeElm"
                class="resizer"
            ></div>

            <div class="cal-main-hover">
                <!-- cal header -->
                <div class="header-cal">
                    <div class="header-cal-left">
                        <div
                            class="cal-left-navigation"
                            @click="toArrow('PREVIOUS', $event)"
                        >
                            <ISvg
                                name="IArrowLeftFill"
                                fill="#1649b9"
                                width="20"
                                height="20"
                            />
                        </div>
                        <div class="header-cal-left-time">
                            <span v-if="calSetting.activeView === 'years'">Years</span>
                            <span v-else-if="calSetting.activeView === 'year'">{{
                                currentSelect.year
                            }}</span>
                            <span v-else-if="calSetting.activeView === 'month'"
                                >{{ currentSelect.year }} / {{ currentSelect.month }}</span
                            >
                            <span v-else-if="calSetting.activeView === 'week'"
                                >{{ currentSelect.year }} / w{{ currentSelect.week }}
                            </span>
                            <span v-else-if="calSetting.activeView === 'day'"
                                >{{ currentSelect.year }}/{{ currentSelect.month }}/{{
                                    currentSelect.day
                                }}</span
                            >
                        </div>
                        <div
                            class="cal-left-navigation"
                            @click="toArrow('NEXT', $event)"
                        >
                            <ISvg
                                name="IArrowRightFill"
                                fill="#1649b9"
                                width="20"
                                height="20"
                            />
                        </div>
                    </div>
                    <div class="header-cal-right">
                        <div class="header-cal-right-view-list">
                            <div
                                :class="{
                                    active: calSetting.activeView == 'years',
                                }"
                                @click="calSetting.activeView = 'years'"
                            >
                                Years
                            </div>
                            <div
                                :class="{
                                    active: calSetting.activeView == 'year',
                                }"
                                @click="calSetting.activeView = 'year'"
                            >
                                Year
                            </div>
                            <div
                                :class="{
                                    active: calSetting.activeView == 'month',
                                }"
                                @click="calSetting.activeView = 'month'"
                            >
                                Month
                            </div>
                            <div
                                :class="{
                                    active: calSetting.activeView == 'week',
                                }"
                                @click="calSetting.activeView = 'week'"
                            >
                                Week
                            </div>
                            <div
                                :class="{
                                    active: calSetting.activeView == 'day',
                                }"
                                @click="calSetting.activeView = 'day'"
                            >
                                Day
                            </div>
                        </div>
                    </div>
                    <div style="width: 80px">
                        <div
                            v-if="!isSelectedDayoff"
                            class="header-cal-right-btn-create"
                            @click="isShowCreateCalendar = true"
                        >
                            + Create
                        </div>
                    </div>
                    <div
                        class="option-btn"
                        @click="toggleOpenOptionInMobile"
                    >
                        <span>Options</span>
                        <ISvg
                            name="ISetting"
                            width="20"
                            height="20"
                        />
                    </div>
                </div>
                <!-- end cal header -->
                <!-- <div
					v-if="!isSelectedDayoff"
					class="create-btn"
					@click="isShowCreateCalendar = true"
				>
					+
				</div> -->
                <div class="cal-cal">
                    <div class="cal-cal-hover">
                        <vue-cal
                            ref="vuecal"
                            v-model:selected-date="selectedDate"
                            v-model:active-view="calSetting.activeView"
                            hide-view-selector
                            hide-title-bar
                            class="vuecal--blue-theme"
                            :events="calendars"
                            :split-days="splitDays"
                            :on-event-click="onEventClick"
                            :on-event-create="onEventCreate"
                            :editable-events="editableEvents"
                            :events-on-month-view="showMonthEvents"
                            :watch-real-time="true"
                            :drag-to-create-threshold="15"
                            :snap-to-time="15"
                            :sticky-split-labels="true"
                            :min-split-width="minSplitWidth"
                            :today-button="false"
                            :special-hours="calSettingConst.specialHours"
                            :start-week-on-day="calSettingConst.startWeekOnDay"
                            @event-drag-create="onEventDragCreate"
                            @event-drop="onEventDrop"
                            @event-duration-change="onEventDurationChange"
                        >
                            <!-- Custom title -->
                            <template #title>
                                <!-- [
								<span v-if="view.id === 'years'">Years</span>
								<span v-else-if="view.id === 'year'">{{
									currentSelect.year
								}}</span>
								<span v-else-if="view.id === 'month'"
									>{{ currentSelect.year }} /
									{{ currentSelect.month }}</span
								>
								<span v-else-if="view.id === 'week'"
									>{{ currentSelect.year }} / w{{
										currentSelect.week
									}}
								</span>
								<span v-else-if="view.id === 'day'"
									>{{ currentSelect.year }}/{{
										currentSelect.month
									}}/{{ currentSelect.day }}</span
								>
								] -->
                            </template>

                            <template #split-label="{ split }">
                                <div class="split-container">
                                    <span
                                        v-if="
                                            calSetting.columnLabel == 'full' ||
                                            calSetting.columnLabel == 'avatar'
                                        "
                                    >
                                        <!-- <img
                                            v-if="split.avatar"
                                            class="split-avatar"
                                            :src="split.avatar"
                                        />
                                        <img
                                            v-else
                                            class="split-avatar"
                                            src="+/icons/person.svg"
                                        /> -->
                                    </span>
                                    <span
                                        v-if="
                                            calSetting.columnLabel == 'full' ||
                                            calSetting.columnLabel == 'name'
                                        "
                                        class="split-label"
                                        >{{ split.label }}</span
                                    >
                                </div>
                            </template>
                            <template #no-event>
                                <!-- <img src="+/icons/empty-cal.svg" /> -->
                            </template>
                            <template #arrow-prev>
                                <!-- <img
                                    class="icn-arrow"
                                    src="+/icons/arrow-left.svg"
                                    @click="toArrow('PREVIOUS', $event)"
                                /> -->
                            </template>
                            <template #arrow-next>
                                <!-- <img
                                    class="icn-arrow"
                                    src="+/icons/arrow-right.svg"
                                    @click="toArrow('NEXT', $event)"
                                /> -->
                            </template>

                            <template #event="{ event }">
                                <div
                                    v-if="event.off"
                                    class="off"
                                >
                                    <div
                                        v-if="event.created_by && calSetting.userCard"
                                        class="cal-user"
                                    >
                                        <span
                                            v-if="
                                                calSetting.userCard == 'full' ||
                                                calSetting.userCard == 'avatar'
                                            "
                                        >
                                            <!-- <img
                                                v-if="event.created_by.avatar"
                                                class="split-avatar"
                                                :src="event.created_by.avatar"
                                            />
                                            <img
                                                v-else
                                                class="split-avatar"
                                                src="+/icons/person.svg"
                                            /> -->
                                        </span>
                                        <span
                                            v-if="
                                                calSetting.userCard == 'full' ||
                                                calSetting.userCard == 'name'
                                            "
                                            class="cal-user-name"
                                        >
                                            {{ event.created_by.last_name }}
                                            {{ event.created_by.first_name }}
                                        </span>
                                    </div>
                                    <div>OFF</div>
                                    <button
                                        v-if="is_modderator_store || auth_user?.role === 'HOST'"
                                        class="btn--removeoff"
                                        @click.stop="
                                            onDeleteDayOff(
                                                event.created_by.first_name +
                                                    ' ' +
                                                    event.created_by.last_name,
                                                event.id,
                                            )
                                        "
                                    >
                                        <ISvg
                                            name="ICalendarCheck"
                                            width="16"
                                            fill="#00c56f"
                                            height="16"
                                        />
                                    </button>
                                </div>
                                <div
                                    v-if="!event.off"
                                    :class="{
                                        'wait-accept': event.waiting_approve,
                                    }"
                                    class="g-cal-event"
                                >
                                    <div
                                        v-if="calSetting.event.title"
                                        class="vuecal__event-title"
                                    >
                                        <span
                                            v-if="event.working"
                                            class="card-active"
                                        ></span>
                                        <div
                                            style="display: inline-block"
                                            v-html="event.title"
                                        ></div>
                                    </div>
                                    <div
                                        v-if="calSetting.event.time"
                                        class="vuecal__event-time"
                                    >
                                        {{ event.start.formatTime() }} -
                                        {{ event.end.formatTime() }}
                                    </div>
                                    <div
                                        v-if="event.created_by && calSetting.userCard"
                                        class="cal-user"
                                    >
                                        <span
                                            v-if="
                                                calSetting.userCard == 'full' ||
                                                calSetting.userCard == 'avatar'
                                            "
                                        >
                                            <!-- <img
                                                v-if="event.created_by.avatar"
                                                class="split-avatar"
                                                :src="event.created_by.avatar"
                                            />
                                            <img
                                                v-else
                                                class="split-avatar"
                                                src="+/icons/person.svg"
                                            /> -->
                                        </span>
                                        <span
                                            v-if="
                                                calSetting.userCard == 'full' ||
                                                calSetting.userCard == 'name'
                                            "
                                            class="cal-user-name"
                                        >
                                            {{ event.created_by.last_name }}
                                            {{ event.created_by.first_name }}
                                        </span>
                                    </div>
                                    <div
                                        v-if="calSetting.event.content"
                                        class="vuecal__event-content"
                                    >
                                        {{ event.content }}
                                    </div>
                                </div>
                            </template>
                        </vue-cal>
                    </div>
                </div>
                <div
                    v-if="showCountTime"
                    class="cal-time"
                >
                    <!-- <img
                        class="cal-time-full"
                        src="+/icons/full-in.svg"
                        @click="openCalendarTime"
                    /> -->
                    <table>
                        <tr>
                            <th
                                v-for="split of splitDays"
                                :key="split.id"
                            >
                                {{ split.label }}
                            </th>
                        </tr>
                        <tr>
                            <td
                                v-for="split of splitDays"
                                :key="split.id"
                                class="time-count"
                            >
                                {{ getTimeByUser(split.id.toString()) }}
                            </td>
                        </tr>
                    </table>
                </div>
                <div
                    v-if="showReport"
                    class="cal-time"
                >
                    <div
                        v-for="split of splitDays"
                        :key="split.id"
                        class="cal-time-item"
                    >
                        <p>{{ split.label }}</p>
                        <div
                            class="report--btn"
                            @click="openReport(split.id.toString(), split.label)"
                        >
                            Report
                            <ISvg
                                name="IOpenInNew"
                                width="18"
                                height="18"
                            />
                        </div>
                    </div>
                    <!-- <table>
						<tr>
							<th v-for="split of splitDays" :key="split.id">
								{{ split.label }}
							</th>
						</tr>
						<tr>
							<td
								v-for="split of splitDays"
								:key="split.id"
								@click="
									openReport(split.id.toString(), split.label)
								"
								class="report-link"
							>
								Report
							</td>
						</tr>
					</table> -->
                </div>
            </div>
        </div>
        <detail-calendar
            v-if="idCalDetail"
            :id-cal="idCalDetail"
            :mount-show-update="showUpdateDetail"
            :calendar-group="calendar_groups"
            @close="closeDetailCal"
            @delete-cal="deleteCal"
            @update-cal="updateCal"
        />
        <DetailReport
            v-if="detailReport"
            :id-mem="detailReport.idMem"
            :name-mem="detailReport.nameMem"
            :year="detailReport.year"
            :week="detailReport.week"
            @close="closeReport"
        />
        <CalendarTime
            v-if="showCalendarTime"
            :calendar_times="calendar_times"
            :splits="splitDays"
            :selected-date="selectedDate"
            @close="closeCalendarTime"
        />
        <CreateCalendar
            v-if="isShowCreateCalendar"
            :selected-date="selectedDate"
            @create-cal="onCreateCal"
            @close="isShowCreateCalendar = false"
        />
    </div>
</template>

<style scoped>
.cal-container {
    position: absolute;
    width: 100%;
    height: 100%;
}
.option-btn {
    display: none;
}
.cal-main {
    width: calc(100% - 272px);
    height: 100%;
    position: absolute;
    right: 0px;
    top: 0px;
    padding: 12px;
    background-color: #f7f8fc;
}

.cal-main-hover {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    display: flex;
    flex-flow: column;
}

.cal-cal {
    flex: 1 1 auto;
    overflow: hidden;
    /* width: 100%; */
    /* height: 100%; */
    /* position: relative; */
    /* padding: 12px 10px; */
    padding-top: 12px;
}

.cal-cal-hover {
    width: 100%;
    height: 100%;
    /* position: absolute; */
    box-shadow: 0px 1px 17px 1px #dbdbdb99;
    border-radius: 10px;
    background: white;
    padding: 10px 0;
}

.cal-cal-full {
    height: 100%;
}

.cal-time {
    display: flex;
    justify-content: space-around;
    border: 1px solid var(--c-white-light);
    border-radius: 8px;
    background-color: #fff;
    width: 100%;
    margin-top: 12px;
    position: relative;
}

.cal-time-item {
    text-align: center;
    padding: 5px;
}

.cal-time-full {
    position: absolute;
    width: 18px;
    /* height: 24px; */
    background: white;
    /* border-radius: 50%; */
    padding: 2px;
    right: 0px;
    top: -4px;
    border: 1px solid black;
    cursor: pointer;
}

.cal-time-label {
    margin-left: 12px;
    margin-top: 12px;
    font-weight: 500;
}

.cal-time-elm {
    clear: both;
    display: inline-flex;
    align-items: center;
    margin-left: 12px;
    margin-top: 12px;
    background: #eceb98;
    color: black;
    padding: 4px 12px;
    border-radius: 4px;
    font-weight: 500;
}

.cal-time-elm-report {
    cursor: pointer;
}

.cal-left {
    width: 272px;
    height: 100%;
    position: absolute;
    left: 0px;
    top: 0px;
    padding: 12px;
    overflow-y: auto;
    padding-bottom: 48px;
    box-shadow: 0px 1px 5px rgba(0, 0, 0, 0.15);
    border-right: 1px solid #c2cfe0;
    /* background: #f5f5f5; */
}

.split-avatar {
    width: 18px;
    border-radius: 50%;
    margin-right: 4px;
    height: 18px;
    background: white;
}

.split-label {
    font-size: 14px;
    font-weight: 500;
}

.line {
    width: 100%;
    height: 1px;
    background-color: #bbcee6;
    margin: 12px 0px;
}

.flex-align {
    display: flex;
    align-items: center;
}

.btn-today {
    background: #e9e9ed;
    border: 1px solid #bbcee6;
    border-radius: 4px;
    font-size: 12px;
    margin-left: auto;
    gap: 6px;
    display: flex;
    padding: 2px 6px;
}

.btn-reset-setting {
    background: #e9e9ed;
    border: 1px solid #bbcee6;
    border-radius: 4px;
    font-size: 12px;
    margin-top: 12px;
    gap: 6px;
    display: flex;
    padding: 2px 6px;
}

.current-select {
    color: #334d6e;
    font-weight: 500;
    margin-left: 4px;
}

.setting {
    display: flex;
    align-items: center;
    margin-bottom: 12px;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
}

.setting-div {
    margin-top: 4px;
}

.setting-label {
    margin-right: 4px;
}

.setting-inp {
}

.cal-user {
    margin-top: 4px;
}

.cal-user-name {
    font-size: 13px;
}

.small-cal {
    background-color: white;
}

.clear {
    clear: both;
    display: inline-block;
}

.icn-arrow {
    width: 18px;
    height: 18px;
    padding: 2px;
    background: #f5f5f5;
    border-radius: 2px;
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

.time-count {
    font-weight: 500;
    color: #0003de;
}

.report-link {
    font-weight: 500;
    color: #0003de;
    text-decoration: underline;
    cursor: pointer;
}

.card-active {
    background: #4dd965;
    /* line-height: 32px; */
    width: 12px;
    height: 12px;
    display: inline-block;
    margin-bottom: -2px;
    margin-right: 4px;
    border-radius: 50%;
}

.off-btn {
    border: none;
    font-size: 12px;
    padding: 1px 11px;
    background: var(--c-white-light);
    border-radius: 2px;
}

.btn-off {
    width: 100%;
    height: 30px;
    background: var(--c-bg-btn-hover-2);
    border: 1px solid var(--c-blue-hover);
    border-radius: 4px;
}

.create-btn {
    position: absolute;
    bottom: 10px;
    right: 30px;
    z-index: 5;
    width: 40px;
    height: 40px;
    background: var(--c-green);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    font-size: 20px;
    color: white;
}

/* header cal */
.header-cal {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    /* padding: 8px 0 0; */
}

.header-cal-left {
    display: flex;
    align-items: center;
    gap: 5px;
}

.header-cal-left-time {
    font-size: 18px;
    font-weight: 800;
}

.cal-left-navigation {
    width: 25px;
    height: 25px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 5px;
}

.cal-left-navigation:hover {
    background: #adb2d563;
    transition: 0.2s ease-in-out;
    cursor: pointer;
}

.header-cal-right {
    display: flex;
}

.header-cal-right-view-list {
    display: flex;
    margin-right: 10px;
    background: var(--c-slight-blue-hover);
    border-radius: 8px;
    padding: 2px 5px;
}

.header-cal-right-view-list > div {
    padding: 2px 12px;
    cursor: pointer;
}

.header-cal-right-view-list .active {
    border-radius: 8px;
    background: white;
    box-shadow: 0px 0px 11px 0px #81818159;
}

.header-cal-right-btn-create {
    display: flex;
    align-items: center;
    background: #1c4abe;
    padding: 5px 12px;
    border-radius: 8px;
    color: white;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
}

.group-drop {
    margin-left: auto;
}
.btn--removeoff {
    border: none;
    background: transparent;
    margin-top: 5px;
}
.report--btn {
    border-radius: 4px;
    padding: 2px;
    cursor: pointer;
}
.report--btn:hover {
    background-color: var(--c-bg-btn-hover);
}
@media screen and (max-width: 768px) {
    .cal-left {
        background: #fff;
        height: fit-content;
        z-index: 99;
        max-width: 90vw;
        max-height: 66vh;
        position: fixed;
        top: 21%;
        left: 50%;
        transform: translate(-50%, 0);
        display: none;
        overflow: auto;
        box-shadow: 0px 1px 14px rgb(0 0 0 / 29%);
        border-radius: 10px;
        padding-bottom: 12px;
    }
    .option-btn {
        display: block;
    }
    .cal-left-active {
        display: block;
    }
    .cal-main {
        height: calc(100% - 56px);
        top: 60px;
    }
    .header-cal {
        flex-wrap: wrap;
        gap: 10px;
        justify-content: flex-start;
    }
}
</style>
