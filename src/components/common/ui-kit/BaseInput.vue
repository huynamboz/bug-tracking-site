<script setup lang="ts">
import { defineModel } from 'vue';
defineProps<{
    placeholder?: string;
    type?: string;
    width?: string;
    height?: string;
}>()
const input = defineModel<string>({ required: true})
</script>
<template>
    <div class="base__wrapper" :style="{width: width, height: height}">
        <Icon class="icon" v-if="type === 'search'" icon="ph:magnifying-glass-light" />
        <input type="text" :class="{search: type === 'search'}" v-model="input" :placeholder="placeholder ?? 'Enter input'">
    </div>
</template>
<style lang="scss" scoped>
.base__wrapper {
    height: 38px;
    min-height: 38px;
    min-width: 100px;
    background-color: #ffffff;
    border: 1px solid #D5D5D5;
    border-radius: 18px;
    overflow: hidden;
    position: relative;

    .icon {
        position: absolute;
        top: 10px;
        left: 10px;
    }
    
    input {
        padding: 5px 10px;
        border: none;
        height: 100%;
        width: 100%;
        outline: none;
        background-color: transparent;
    }
    .search {
        padding-left: 30px;
    }
}
</style>