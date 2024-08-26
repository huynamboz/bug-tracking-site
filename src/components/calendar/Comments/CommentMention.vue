<script setup lang="ts">
import { onBeforeMount, inject, ref } from "vue";
import type { Gc as IGc } from "^/core/Gc";
import type { i_message_element } from "^/core/types/chat_types";
import type { i_user } from "^/core/types/user_types";

const Gc = inject("Gc") as typeof IGc;
const { get_user_store } = Gc["stores"]["users_store"];

const props = defineProps<{
	element: i_message_element;
}>();

onBeforeMount(async () => {
	user.value = await get_user_store(props.element.content);
	console.log(user);
});

const user = ref<i_user>();
</script>
<template>
	<span v-if="user" class="mention-content contentMention">
		<div class="detail-mention">
			<img :src="user.avatar" alt="" />
			<span>{{ user.last_name }} {{ user.first_name }}</span>
		</div>
		@{{ user.last_name }} {{ user.first_name }}</span
	>
</template>
<style scoped>
.contentMention {
	background: #e6eff8;
	color: #0960bd;
	padding: 0 2px;
	border-radius: 3px;
	margin-right: 4px;
	position: relative;
	margin-bottom: 2px;
	clear: both;
	/* display: inline-block; */
}
.mention-content {
	color: #2a7fd9;
	position: relative;
}
.mention-content:hover .detail-mention {
	display: flex;
}
.detail-mention {
	position: absolute;
	display: none;
	left: 0px;
	top: -44px;
	background: #ffffff;
	border: 0.5px solid #cdd6df;
	box-sizing: border-box;
	border-radius: 6px;
	z-index: 4;
	gap: 5px;
	padding: 2px;
	padding: 5px 7px;
	color: #242424;
	align-items: center;
	box-shadow: 0 1px 5px rgb(135 135 135 / 14%);
}
.detail-mention img {
	width: 30px;
	height: 30px;
	border-radius: 50%;
	object-fit: cover;
	display: flex;
}
.detail-mention span {
	white-space: nowrap;
}
</style>
