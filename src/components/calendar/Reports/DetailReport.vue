<script setup lang="ts">
import { ref, inject, onBeforeMount, nextTick, onBeforeUnmount, onMounted } from "vue";
import "+/css/carousel.css";
import { Carousel, Slide, Pagination, Navigation } from "vue3-carousel";
import type { i_calendar_item } from "^/core/types/calendar_types";

import type { Gc as IGc } from "^/core/Gc";
const Gc = inject("Gc") as typeof IGc;
const { get_report_api } = Gc["services"]["calendar_services"];

const props = defineProps<{
    idMem: string;
    nameMem: string;
    year: number;
    week: number;
}>();
const emits = defineEmits<{
    (e: "close"): void;
}>();

const close = (): void => {
    exitFullScreen(document);
    emits("close");
};
const handlePressESC = (event: KeyboardEvent): void => {
    if (event.key === "Escape") {
        emits("close");
    }
};
onMounted(() => {
    document.addEventListener("keydown", handlePressESC);
    document.addEventListener("fullscreenchange", exitHandler, false);
    document.addEventListener("mozfullscreenchange", exitHandler, false);
    document.addEventListener("MSFullscreenChange", exitHandler, false);
    document.addEventListener("webkitfullscreenchange", exitHandler, false);
});

const exitHandler = (): void => {
    console.log("is full", isFull.value);
    if (
        !(document as any).webkitIsFullScreen &&
        !(document as any).mozFullScreen &&
        !(document as any).msFullscreenElement
    ) {
        if (isFull.value) {
            exitFullScreen(document);
            isFull.value = false;
        } else {
            isFull.value = true;
        }
    }
};

const insideOverlay = (event: Event): void => {
    event.stopPropagation();
};
onBeforeUnmount(() => {
    document.removeEventListener("fullscreenchange", exitHandler, false);
    document.removeEventListener("mozfullscreenchange", exitHandler, false);
    document.removeEventListener("MSFullscreenChange", exitHandler, false);
    document.removeEventListener("webkitfullscreenchange", exitHandler, false);
});
onBeforeMount(async () => {
    await getReports();
});

const reports = ref<Array<i_calendar_item>>([]);

type ReportsByDay = {
    [key: string]: Array<i_calendar_item>;
};

const reportsByDay = ref<ReportsByDay>({
    Saturday: [],
    Sunday: [],
    Monday: [],
    Tuesday: [],
    Wednesday: [],
    Thursday: [],
    Friday: [],
});

const getReports = async (): Promise<void> => {
    try {
        await get_report_api(props.idMem, props.year, props.week).then((res) => {
            reports.value = res["data"].reverse();

            for (const report of reports.value) {
                const weekday = getWeekDay(report.start_time);
                reportsByDay.value[weekday].push(report);
            }

            console.log(reportsByDay.value);
        });
    } catch (error) {
        console.log(error);
    }
};

const currentSlide = ref(0);

const slideTo = (val: number): void => {
    currentSlide.value = val;
};

const isFull = ref(false);
interface DocumentWithFullscreen extends HTMLDocument {
    mozFullScreenElement?: Element;
    msFullscreenElement?: Element;
    webkitFullscreenElement?: Element;
    msExitFullscreen?: () => void;
    mozCancelFullScreen?: () => void;
    webkitExitFullscreen?: () => void;
}
const isFullScreen = (): boolean => {
    const doc = document as DocumentWithFullscreen;
    return !!(
        doc.fullscreenElement ||
        doc.mozFullScreenElement ||
        doc.webkitFullscreenElement ||
        doc.msFullscreenElement
    );
};
interface DocumentElementWithFullscreen extends HTMLElement {
    msRequestFullscreen?: () => void;
    mozRequestFullScreen?: () => void;
    webkitRequestFullscreen?: () => void;
}
const requestFullScreen = (element: DocumentElementWithFullscreen): void => {
    if (element.requestFullscreen) {
        element.requestFullscreen();
    } else if (element.msRequestFullscreen) {
        element.msRequestFullscreen();
    } else if (element.webkitRequestFullscreen) {
        element.webkitRequestFullscreen();
    } else if (element.mozRequestFullScreen) {
        element.mozRequestFullScreen();
    }
};

const exitFullScreen = (doc: DocumentWithFullscreen): void => {
    if (doc.exitFullscreen) {
        doc.exitFullscreen();
    } else if (doc.msExitFullscreen) {
        doc.msExitFullscreen();
    } else if (doc.webkitExitFullscreen) {
        doc.webkitExitFullscreen();
    } else if (doc.mozCancelFullScreen) {
        doc.mozCancelFullScreen();
    }
};
const toogleFullScreen = (): void => {
    if (!isFullScreen()) {
        requestFullScreen(document.documentElement);
    } else {
        exitFullScreen(document);
    }
};
const openFull = (): void => {
    showSlide.value = false;
    nextTick(() => {
        showSlide.value = true;
        isFull.value = true;
        toogleFullScreen();
    });
};
const closeFull = (): void => {
    showSlide.value = false;
    nextTick(() => {
        showSlide.value = true;
        isFull.value = false;
        toogleFullScreen();
    });
};

const showSlide = ref(true);

const getWeekDay = (timestamp: number): string => {
    const date = new Date(timestamp);
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const dayOfWeek = weekdays[date.getDay()];
    return dayOfWeek;
};
</script>

<template>
    <div
        class="container"
        :class="{ 'container--full': isFull }"
        @click="insideOverlay"
    >
        <div class="nav">
            <div class="nav-title">{{ props.nameMem }} | w{{ props.week }}</div>
            <button
                class="btn-show"
                @click="openFull"
            >
                {{ isFull ? "End slideshow" : "Slideshow" }}
            </button>
            <!-- <img
				@click="closeFull"
				src="+/icons/full-out.svg"
				v-if="isFull"
				class="icn-full"
			/>
			<img
				class="icn-full"
				@click="openFull"
				src="+/icons/full-in.svg"
				v-else
			/> -->
            <img
                v-if="!isFull"
                class="icn-close"
                src="+/icons/close.svg"
                @click="close"
            />
        </div>
        <div
            v-if="showSlide"
            class="body"
        >
            <div
                v-if="!isFull"
                class="slide__preview--list hide-scrollbar"
            >
                <div
                    v-for="(reports, key, index) of reportsByDay"
                    :key="key"
                    class="slide__preview--item"
                    :class="{ active: index === currentSlide }"
                    @click="slideTo(index)"
                >
                    <p>{{ index + 1 }}</p>
                    <div class="report--thumb">
                        <div
                            v-for="report of reports"
                            :key="report.id"
                            class="report"
                        >
                            <div class="">
                                {{ report.title }}
                            </div>
                            <div
                                class="content content-pre"
                                v-html="report.content"
                            ></div>
                            <div
                                class="report-report ql-editor-courses"
                                v-html="report.report"
                            ></div>
                        </div>
                    </div>
                </div>
            </div>
            <!-- <Carousel
				class="carousel-thumbnail"
				:items-to-show="4"
				:wrap-around="true"
				v-model="currentSlide"
				ref="carousel"
			>
				<Slide
					v-for="(reports, key, index) of reportsByDay"
					:key="key"
				>
					<div
						class="carousel__item_hover"
						:class="{
							'carousel-active': index == currentSlide
						}"
						@click="slideTo(index)"
					>
						{{ key }}
					</div>
				</Slide>
			</Carousel> -->
            <div class="slide__content">
                <Carousel
                    v-model="currentSlide"
                    class="carousel-main"
                    :items-to-show="1"
                    :wrap-around="false"
                >
                    <Slide
                        v-for="(reports, key) of reportsByDay"
                        :key="key"
                    >
                        <div
                            class="carousel__item"
                            :class="{ 'carousel__item--full': isFull }"
                        >
                            <p class="carousel__item--time">{{ key }}</p>
                            <div
                                v-for="report of reports"
                                :key="report.id"
                                class="report"
                            >
                                <div class="report-title">
                                    {{ report.title }}
                                </div>
                                <div
                                    class="content content-pre"
                                    v-html="report.content"
                                ></div>
                                <div
                                    class="report-report ql-editor-courses"
                                    v-html="report.report"
                                ></div>
                            </div>
                        </div>
                    </Slide>
                    <template #addons>
                        <Navigation />
                        <Pagination />
                    </template>
                </Carousel>
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
@import "/public/css/quillCourse.snow.css";
.hide-scrollbar {
    -ms-overflow-style: none;
    scrollbar-width: none;
}
.overlay {
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
    align-items: center;
}

.container {
    position: fixed;
    z-index: 999;
    top: 0;
    left: 0;
    background: #ffffff;
    border-radius: var(--popup-border-radius);
    width: 100vw;
    height: 100vh;
    padding: 24px;
    display: flex;
    flex-direction: column;
    padding-left: 0;
}

.body {
    display: flex;
    width: 100%;
    height: calc(100% - 49px);
    flex: 1;
    gap: 10px;

    .slide__preview--list {
        overflow-y: auto;
        overflow-x: hidden;
        height: 100%;
        padding-right: 21px;
        border-right: 2px solid var(--c-slight-blue-hover);
        padding-left: 20px;
        width: 242px;
        min-width: 242px;

        .slide__preview--item {
            height: 120px;
            background-color: #ffffff;
            width: 200px;
            border-radius: 8px;
            margin-top: 24px;
            position: relative;
            border: 2px solid #e8e8e8;
            transition: all 0.2s;
            cursor: pointer;

            &.active {
                border: 2px solid var(--c-green);
            }

            & > p {
                position: absolute;
                top: -12px;
                left: -12px;
            }
            .report--thumb {
                width: 100%;
                font-size: 9px;
                padding: 10px;
                height: 100%;
                overflow: hidden;
            }
        }
    }

    .slide__content {
        flex: 1 1 auto;
        padding: 10px;
        width: calc(100% - 242px);
        .carousel-main {
            height: 100%;
            background: #fff;
            border-radius: 10px;
            border: 2px solid #f5f5f5;
        }
    }
}
.container--full {
    width: 100%;
    height: 100%;

    &:deep() {
        .carousel__prev {
            height: 100%;
            transition: background 0.2s;
            &:hover {
                // background: linear-gradient(90deg, #cecece, transparent);
                transition: background 0.2s;
                left: -45px;
                width: 123px;
            }
        }
        .carousel__next {
            height: 100%;
            transition: background 0.2s;
            &:hover {
                // background: linear-gradient(270deg, #cecece, transparent);
                transition: background 0.2s;
                right: -46px;
                width: 123px;
            }
        }
    }
}
.carousel__item {
    height: 350px;
    width: 100%;
    font-size: 16px;
    border-radius: 8px;
    /* display: flex; */
    /* justify-content: center; */
    /* align-items: center; */
    text-align: left;
    padding: 24px 46px;
    overflow-y: auto;

    &--time {
        font-weight: 500;
        font-size: 27px;
        margin-bottom: 30px;
        border-bottom: 2px solid;
        display: inline-block;
        color: var(--c-green);
    }
}

.carousel__item--full {
    height: calc(100vh - 250px);
}
.carousel__item_hover {
    width: 100%;
    background-color: #334d6e;
    // color: white;
    font-size: 16px;
    border-radius: 8px;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 4px;
    cursor: pointer;
    opacity: 0.5;
}

.carousel-active {
    background-color: #334d6e;
    opacity: 1;
}
:deep() {
    .carousel__viewport,
    .carousel__track,
    .carousel__slide,
    .carousel__item {
        height: 100%;
    }
}
// .carousel-thumbnail,
// .carousel__slide {
// 	// padding: 10px;
// }
.carousel__prev,
.carousel__next {
    box-sizing: content-box;
    border: 5px solid white;
}

.nav {
    display: flex;
    align-items: center;
    padding-bottom: 24px;
    padding-left: 20px;
}

.nav-title {
    font-size: 16px;
    font-weight: 500;
}

.icn-full {
    cursor: pointer;
    width: 18px;
    margin-right: 24px;
    margin-left: 26px;
}
.btn-show {
    width: fit-content;
    background-color: transparent;
    padding: 6px 14px;
    border: 1px solid var(--vc-clr-secondary);
    border-radius: 30px;
    margin-left: auto;
    margin-right: 20px;

    &:hover {
        background-color: #f1f1f1;
    }
}
.icn-close {
    cursor: pointer;
}

.content-pre {
    white-space: pre-line;
}

.content {
    margin-bottom: 4px;
    padding-bottom: 4px;
}

.report-title {
    font-weight: 500;
    color: #111d2c;
    margin-bottom: 12px;
    font-size: 24px;
}

.report {
    border-bottom: 1px solid white;
    margin-bottom: 24px;
    padding-bottom: 12px;
}
</style>
