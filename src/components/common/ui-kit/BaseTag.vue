<script setup lang="ts">
defineProps<{
    title: string;
    type: "success" | "warning";
    width?: string;
    height?: string;
}>()
</script>
<template>
    <div class="tag__wrapper" :class="type" :style="{ width: width, height: height }">
        {{ title }}
    </div>
</template>
<style lang="scss" scoped>
.tag__wrapper {
    &.success {
        background-color: $color-green-50;
        color: $color-green-100;
    }

    &.warning {
        background-color: $color-warning-50;
        color: $color-warning-100;
    }

    height: 27px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 4px;
}
</style>