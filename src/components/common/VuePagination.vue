<script setup lang="ts">
import { defineModel, computed, watch, onBeforeMount, defineEmits, defineProps } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
const routeQuery = computed(() => {
    return route.query.page;
});

defineProps<{
    countItem: number;
}>();
const emits = defineEmits<{
    (e: "changePage", page: number): void;
}>();
onBeforeMount(() => {
    if (routeQuery.value && !isNaN(Number(routeQuery.value as string))) {
        page.value = Number(routeQuery.value);
    }
    onChangePage();
});
watch(
    () => routeQuery.value,
    () => {
        if (routeQuery.value && !isNaN(Number(routeQuery.value as string))) {
            page.value = Number(routeQuery.value);
        }
    },
);
const page = defineModel<number>({ required: false, default: 1 });

const onChangePage = () => {
    const query = { ...route.query, page: page.value };
    router.push({ query });
    emits("changePage", page.value);
};
</script>
<template>
    <vue-awesome-paginate
        v-model="page"
        :total-items="countItem"
        :items-per-page="10"
        :max-pages-shown="5"
        :on-click="onChangePage"
    >
        <template #prev-button>
            <Icon icon="solar:alt-arrow-left-linear" />
        </template>
        <template #next-button>
            <Icon icon="solar:alt-arrow-right-linear" />
        </template>
    </vue-awesome-paginate>
</template>
