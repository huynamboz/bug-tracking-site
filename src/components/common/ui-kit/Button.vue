<script setup lang="ts">
import { defineProps } from "vue";

defineProps<{
    title?: string;
    styleType?: string;
    width?: string;
    borderRadius?: string;
    borderColor?: string;
    color?: string;
    fontWeight?: string;
    loading?: boolean;
}>();
</script>
<template>
    <button
        class="base__btn"
        :class="[styleType, { loading: loading }]"
        :style="{ width, borderRadius, borderColor, color, fontWeight }"
    >
        <Icon
            v-if="loading"
            icon="svg-spinners:90-ring-with-bg"
        />
        <slot>{{ title }}</slot>
    </button>
</template>
<style lang="scss" scoped>
.base__btn {
    background-color: #00693b;
    color: white;
    border: none;
    height: 40px;
    border-radius: 8px;
    padding: 2px 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    gap: 10px;

    &:hover {
        background-color: #0d8652;
    }

    &.loading {
        cursor: not-allowed;
        background-color: #0d8652;
    }

    &.light {
        background-color: transparent;
        border: 1px solid #00693b;
        color: #00693b;
        &:hover {
            background-color: #ffffff;
        }
    }
}
</style>
