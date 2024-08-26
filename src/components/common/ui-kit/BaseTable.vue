<script setup lang="ts">
import { defineProps, defineModel } from 'vue';
import BaseInput from './BaseInput.vue';
const searchInp = defineModel<string>({ required: false})
defineProps<{
    col: number;
    headers: Array<string>;
    data: any;
}>()


</script>
<template>
    <div class="table__wrapper">
        <BaseInput type="search" height="38px" width="300px"  v-if="searchInp !== undefined" v-model="searchInp" />
        <div class="table__wrapper--header" :class="`col-${col}`">
            <slot name="header" />
        </div>
        <div class="table__wrapper--body" v-if="data && data.length > 0" :class="`col-${col}`">
            <slot name="body" />
        </div>
        <div v-else class="empty__data">
            <p>Not have data</p> <Icon icon="ph:empty" />
        </div>
        <div class="table__wrapper--footer">
            <slot name="footer" />
        </div>
    </div>
</template>
<style lang="scss" scoped>
.table__wrapper {
    width: 100%;
    padding: 20px;
    // border: 1px solid #dfdfdf;
    border-radius: 14px;
    background-color: #fff;
    overflow: hidden;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    box-shadow: 1px 1px 20px 5px rgb(212 212 212 / 31%);

    .table__wrapper--header {
        display: grid;
        margin-top: 16px;
        width: 100%;
        gap: 10px;
        background-color: #F1F4F9;
        border-radius: 10px;
        padding: 16px 20px;
        padding-right: 36px;
        // border-bottom: 1px solid #dfdfdf;
        @include text(16px, 600, inherit, auto);

        &:deep() {
            .col-center {
                display: flex;
                justify-content: center;
            }
        }

    }
    .empty__data {
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 5px;

        & > svg {
            display: block;
        }
    }
    .table__wrapper--body {
        background-color: #fff;
        width: 100%;
        overflow-y: auto;
        height: 100%;
        @include text(14px, 400, #202224, auto);
        &:deep() {
            .tb-row {
                box-sizing: border-box;
                display: grid;
                border-bottom: 0.5px solid #ececec;
                padding: 5px 20px;
                gap: 10px;

                &:hover {
                    background-color: #ececec;
                }

                &--col {
                    padding: 10px 0;
                    width: 100%;
                    overflow: hidden; //to truncate working
                    display: flex;
                    align-items: center;

                    p, span {
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    &.col-center {
                        justify-content: center;
                    }
                } 
            }
        }
    }
}


.col-1 {
    grid-template-columns: repeat(1, 1fr) repeat(1, 8.33333vw);
    &:deep() {
        .tb-row {
            grid-template-columns: repeat(0, 1fr) repeat(1, 8.33333vw);
        }
    }
}

.col-2 {
    grid-template-columns: repeat(1, 1fr) repeat(1, 8.33333vw);
    &:deep() {
        .tb-row {
            grid-template-columns: repeat(1, 1fr) repeat(1, 8.33333vw);
        }
    }
}

.col-3 {
    grid-template-columns: repeat(2, 1fr) repeat(1, 8.33333vw);
    &:deep() {
        .tb-row {
            grid-template-columns: repeat(2, 1fr) repeat(1, 8.33333vw);
        }
    }
}

.col-4 {
    grid-template-columns: repeat(3, 1fr) repeat(1, 8.33333vw);
    &:deep() {
        .tb-row {
            grid-template-columns: repeat(3, 1fr) repeat(1, 8.33333vw);
        }
    }
}

.col-5 {
    grid-template-columns: repeat(4, 1fr) repeat(1, 8.33333vw);
    &:deep() {
        .tb-row {
            grid-template-columns: repeat(4, 1fr) repeat(1, 8.33333vw);
        }
    }
}

.col-6 {
    grid-template-columns: repeat(5, 1fr) repeat(1, 8.33333vw);
    &:deep() {
        .tb-row {
            grid-template-columns: repeat(5, 1fr) repeat(1, 8.33333vw);
        }
    }
}

.col-7 {
    grid-template-columns: repeat(6, 1fr) repeat(1, 8.33333vw);
    &:deep() {
        .tb-row {
            grid-template-columns: repeat(6, 1fr) repeat(1, 8.33333vw);
        }
    }
}

.col-8 {
    grid-template-columns: repeat(7, 1fr) repeat(1, 8.33333vw);
    &:deep() {
        .tb-row {
            grid-template-columns: repeat(7, 1fr) repeat(1, 8.33333vw);
        }
    }
}

.col-9 {
    grid-template-columns: repeat(8, 1fr) repeat(1, 8.33333vw);
    &:deep() {
        .tb-row {
            grid-template-columns: repeat(8, 1fr) repeat(1, 8.33333vw);
        }
    }
}

.col-10 {
    grid-template-columns: repeat(9, 1fr) repeat(1, 8.33333vw);
    &:deep() {
        .tb-row {
            grid-template-columns: repeat(9, 1fr) repeat(1, 8.33333vw);
        }
    }
}

.col-11 {
    grid-template-columns: repeat(10, 1fr) repeat(1, 8.33333vw);
    &:deep() {
        .tb-row {
            grid-template-columns: repeat(10, 1fr) repeat(1, 8.33333vw);
        }
    }
}

.col-12 {
    grid-template-columns: repeat(11, 1fr) repeat(1, 8.33333vw);
    &:deep() {
        .tb-row {
            grid-template-columns: repeat(11, 1fr) repeat(1, 8.33333vw);
        }
    }
}

</style>