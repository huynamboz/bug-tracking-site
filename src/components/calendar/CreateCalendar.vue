<script setup lang="ts">
import { inject, onBeforeMount, ref } from "vue";

import { timeFormat, dateFormat } from "./time";

import type { Gc as IGc } from "^/core/Gc";
import type { i_calendar_item, CDate } from "^/core/types/calendar_types";
import type { i_file_page } from "^/core/types/file_types";

// const Gc = inject("Gc") as typeof IGc;
// const { update_calendar_api, create_calendar_api } = Gc["services"]["calendar_services"];
// const { g_validation } = Gc["modules"]["validation"];
// const { getTimezoneOffsetString } = Gc["modules"]["time"];
// const { set_noti_mess_store } = Gc["stores"]["noti_mess_store"];
// const FormatEditor_v2 = Gc["components"]["files"]["FormatEditor_v2"]();

const props = defineProps<{
    calDetail?: i_calendar_item;
    selectedDate?: CDate;
}>();
const newCal = ref<{
    title: string;
    content: string;
    report?: string;
    start_time: string;
    end_time: string;
    files?: Array<i_file_page>;
    off: boolean;
}>({
    title: "",
    content: "",
    report: "",
    end_time: "",
    start_time: "",
    off: false,
});

const emits = defineEmits<{
    (e: "close"): void;
    (e: "update-cal", data: i_calendar_item): void;
    (e: "create-cal", data: i_calendar_item): void;
}>();

onBeforeMount(() => {
    if (props.calDetail) {
        newCal.value.title = props.calDetail.title;
        newCal.value.content = props.calDetail.content;
        newCal.value.report = props.calDetail.report;
        newCal.value.files = props.calDetail.files;

        newCal.value.start_time = timeFormat(props.calDetail.start_time);
        newCal.value.end_time = timeFormat(props.calDetail.end_time);
        dayChoosen.value = dateFormat(props.calDetail.start_time);
    }
    if (props.selectedDate) {
        dayChoosen.value = props.selectedDate.format();
        console.log("mount", dayChoosen.value);
    }
});

const toolbarEditor = ref<any>([
    ["bold", "italic", "underline"],
    [{ list: "ordered" }, { list: "bullet" }],
]);

const createTask = async (): Promise<void> => {
    if (!checkTitle() || !checkStart() || !checkEnd() || !checkContent()) {
        return;
    }

    const formData = new FormData();
    formData.append("title", newCal.value.title);
    formData.append("content", newCal.value.content);

    if (newCal.value.report) {
        formData.append("report", newCal.value.report);
    }

    const dateChose = dayChoosen.value;

    formData.append("start_time", dateChose + " " + newCal.value.start_time + ":00");
    formData.append("end_time", dateChose + " " + newCal.value.end_time + ":00");

    formData.append("timezone", getTimezoneOffsetString());

    try {
        if (props.calDetail) {
            await update_calendar_api(props.calDetail.id, formData).then((res) => {
                set_noti_mess_store({
                    mess: "calendar saved",
                });
                emits("update-cal", res["data"]);
            });
        } else {
            await create_calendar_api(formData).then((res) => {
                set_noti_mess_store({
                    mess: "calendar created",
                });
                emits("create-cal", res["data"]);
            });
        }
    } catch (error) {
        console.log(error);
    }
};

const errTitle = ref<string>("");
const errContent = ref<string>("");

const errStart = ref<string>("");
const errEnd = ref<string>("");

const errReport = ref<string>("");

const checkTitle = (): boolean => {
    errTitle.value = g_validation({
        label: "Title",
        data: newCal.value.title,
        max: 10240,
    }) as string;
    if (errTitle.value) {
        return false;
    } else {
        return true;
    }
};

const checkContent = (): boolean => {
    errContent.value = g_validation({
        label: "Content",
        data: newCal.value.content,
        max: 10240,
        isNull: true,
    }) as string;
    if (errContent.value) {
        return false;
    } else {
        return true;
    }
};

const checkStart = (): boolean => {
    errStart.value = g_validation({
        label: "Start time",
        data: newCal.value.start_time,
    }) as string;
    if (errStart.value) {
        return false;
    } else {
        const [startHour, startMinute] = newCal.value.start_time.split(":").map(Number);
        const [endHour, endMinute] = newCal.value.end_time.split(":").map(Number);

        if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
            errEnd.value = "end time must be greater than start time";
            return false;
        } else {
            errEnd.value = "";
        }

        return true;
    }
};

const checkEnd = (): boolean => {
    errEnd.value = g_validation({
        label: "End time",
        data: newCal.value.end_time,
    }) as string;
    if (errEnd.value) {
        return false;
    } else {
        const [startHour, startMinute] = newCal.value.start_time.split(":").map(Number);
        const [endHour, endMinute] = newCal.value.end_time.split(":").map(Number);

        if (startHour > endHour || (startHour === endHour && startMinute >= endMinute)) {
            errEnd.value = "end time must be greater than start time";
            return false;
        } else {
            errEnd.value = "";
        }

        return true;
    }
};

const close = (): void => {
    emits("close");
};

const insideOverlay = (event: Event): void => {
    event.stopPropagation();
};
const outsideOverlay = (event: Event): void => {
    event.stopPropagation();
    emits("close");
};

const updateReport = (val: string): void => {
    newCal.value.report = val;
};

const dayChoosen = ref<string>("");
</script>
<template>
    <div
        class="popup-calendar-create"
        @click="outsideOverlay"
    >
        <div
            class="popup-calendar-main"
            @click="insideOverlay"
        >
            <div class="header-popup">
                <div class="header-title">
                    <div class="title-main">
                        <p class="title-popup">
                            {{ calDetail ? "Update Calendar" : "Create calendar" }}
                        </p>
                    </div>
                    <div
                        class="btn-close-x"
                        @click="close"
                    >
                        <!-- <img
                            src="+/icons/close.svg"
                            alt=""
                        /> -->
                    </div>
                </div>
            </div>
            <!--  -->
            <div class="input-field">
                <p class="inp-field-label">Title</p>
                <div class="inp-container">
                    <input
                        v-model="newCal.title"
                        placeholder="Enter title task"
                        type="text"
                        @input="checkTitle"
                    />
                </div>
                <p class="err-label">
                    {{ errTitle }}
                </p>
            </div>

            <div
                class="inp-date-field row"
                style="display: flex"
            >
                <div class="input-field column">
                    <p class="inp-field-label">Date</p>
                    <div class="inp-container">
                        <input
                            v-model="dayChoosen"
                            type="date"
                        />
                    </div>
                    <p class="err-label">
                        <!-- {{ errEnd }} -->
                    </p>
                </div>
                <div class="input-field column">
                    <p class="inp-field-label">Start</p>
                    <div class="inp-container">
                        <input
                            v-model="newCal.start_time"
                            type="time"
                            @input="checkStart"
                        />
                    </div>
                    <p class="err-label">
                        {{ errStart }}
                    </p>
                </div>

                <div class="input-field column">
                    <p class="inp-field-label">End</p>
                    <div class="inp-container">
                        <input
                            v-model="newCal.end_time"
                            type="time"
                            @input="checkEnd"
                        />
                    </div>
                    <p class="err-label">
                        {{ errEnd }}
                    </p>
                </div>
            </div>

            <div class="content-field">
                <p class="inp-field-label">Content</p>
                <div class="calendar-container-quill">
                    <textarea
                        v-model="newCal.content"
                        placeholder="Enter content"
                        rows="5"
                        cols="50"
                        spellcheck="false"
                        @input="checkContent"
                    ></textarea>
                </div>
                <p class="err-label">
                    {{ errContent }}
                </p>
            </div>
            <div class="report-field">
                <p class="inp-field-label">Report</p>
                <div class="calendar-container-report">
                    <!-- <FormatEditor
						:data="newCal.report"
						:toolbar="toolbarEditor"
						placeholder="Enter report"
						class="ql-container-min-120 ql-container-max-200"
					/> -->
                    <FormatEditor_v2
                        :content="newCal.report"
                        placeholder="Enter report"
                        class="ql-container-min-120 ql-container-max-200"
                        @input="updateReport"
                    />
                </div>
                <p class="err-label">
                    {{ errReport }}
                </p>
            </div>
            <!-- <div class="report-field" v-if="newCal.files && newCal.files.length > 0">
				<p class="inp-field-label">Files Attached</p>
				<ListFile @delete-file="deleteFile" :files="newCal.files" />
			</div> -->
            <div class="action-list">
                <button @click="emits('close')">Close</button>
                <button @click.stop="createTask">Save</button>
            </div>
        </div>
    </div>
</template>

<style scoped>
.popup-calendar-create {
    width: 100%;
    height: 100%;
    justify-content: center;
    position: fixed;
    top: 0;
    left: 0;
    display: flex;
    z-index: 20;
    overflow-y: auto;
    background: #00000069;
    /* padding: 30px; */
    align-items: center;
    justify-content: center;
}

.popup-calendar-main {
    background: #ffffff;
    border-radius: var(--popup-border-radius, 8px);
    width: 720px;
    height: fit-content;
    position: relative;
    z-index: 1;
    padding: 24px;
    display: flex;
    flex-direction: column;
    /* margin-top: 10px; */
    max-height: 100%;
    overflow-y: auto;
}

.btn-close-x {
    height: 30px;
    min-width: 30px;
    width: 30px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
}

.btn-close-x:hover {
    background: #b7b8bb;
    transition: 0.2s;
    cursor: pointer;
}

.header-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 2px;
    margin-bottom: 13px;
}

.title-popup {
    font-size: 20px;
    font-weight: 500;
    float: left;
}

.detail-popup {
    font-size: 13px;
}

.input-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
    width: 100%;
}

.inp-field-label {
    font-weight: 500;
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

.err-label {
    color: #ee2624;
    display: flex;
    align-items: center;
    gap: 3px;
    height: 24px;
}

.skeleton-container {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.calendar-container-quill {
    border: 1px solid #b7b8bb;
    border-radius: 6px;
    padding: 7px 10px;
}

.calendar-container-quill textarea {
    width: 100%;
    border: none;
    outline: none;
    background: transparent;
}

.report-field {
    display: flex;
    flex-direction: column;
    gap: 5px;
}

.action-list {
    display: flex;
    gap: 10px;
    margin-left: auto;
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

.title-main {
    display: flex;
    flex-direction: column;
}

.popup-overlay {
    background-color: rgba(0, 0, 0, 0.5);
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    z-index: 0;
}

.popup-main {
    width: 340px;
    background: #fff;
    border-radius: 16px;
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 20px 12px;
    gap: 12px;
}

.column {
    float: left;
    width: 50%;
    padding-right: 0px;
}

.column + .column {
    padding-right: 0px;
    padding-left: 12px;
}

/* Clear floats after the columns */
.row:after {
    content: "";
    display: table;
    clear: both;
}
</style>
