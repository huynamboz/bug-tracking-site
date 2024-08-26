<!-- eslint-disable vue/no-mutating-props -->
<script setup lang="ts">
import { onBeforeMount, inject } from "vue";
import type { Gc as IGc } from "^/core/Gc";
import type { i_message_element } from "^/core/types/chat_types";

const Gc = inject("Gc") as typeof IGc;
const { emojis_store } = Gc["stores"]["common_store"];
import CommentMention from "./CommentMention.vue";
const props = defineProps<{
	elements: Array<i_message_element>;
}>();

onBeforeMount(() => {
	props.elements.sort(function (a: i_message_element, b: i_message_element) {
		return a.id - b.id;
	});
});

const emojiData = (type: string): string | undefined => {
	for (const emoji of emojis_store.value) {
		if (emoji.type == type) {
			return emoji.url;
		}
	}
};
const checkLink = (element: string): string => {
	const content = element;
	const regex = RegExp(
		// eslint-disable-next-line no-useless-escape
		/(http|ftp|https):\/\/([\w_-]+(?:(?:\.[\w_-]+)+))([\w.,@?^=%&:\/~+#-]*[\w@?^=%&\/~+#-])/g,
		"g"
	);
	let array1;
	while ((array1 = regex.exec(content))) {
		element = element.replace(
			array1[0],
			`<a href="${array1[0]}" target="_blank">${array1[0]}</a>`
		);
	}
	element = element.replace(/\r\n/g, "<br>");
	return element;
};
</script>

<template>
	<span>
		<span v-for="element of elements" :key="element.id">
			<span v-if="element.type == 'TEXT'">
				<span
					:class="{
						cssBold: element.bold,
						cssItalic: element.italic,
						cssStrike: element.strike
					}"
					v-html="checkLink(element.content)"
				></span>
			</span>
			<span v-if="element.type == 'EMOJI'">
				<img
					:src="emojiData(element.content)"
					class="ContentChatEmoji"
				/>
			</span>
			<CommentMention v-if="element.type == 'USER'" :element="element" />
		</span>
	</span>
</template>

<style scoped>
.clear {
	clear: both;
	display: inline-block;
}

.ContentChatEmoji {
	width: 22px;
	height: 22px;
}

.contentElement {
	white-space: pre-line;
	white-space: pre-wrap;
	margin-right: 4px;
}

/* .contentMention {
	background: #e6eff8;
	color: #0960bd;
	padding: 0 2px;
	border-radius: 3px;
	margin-right: 4px;
	position: relative;
	margin-bottom: 2px;
	clear: both;
	display: inline-block;
} */

.contentMentionPhone {
	background: #e6eff8;
	color: #0960bd;
	padding: 0 2px;
	border-radius: 3px;
	margin-right: 4px;
	position: relative;
	margin-bottom: 2px;
}

.contentMention:hover {
	cursor: pointer;
}

.user-emoji {
	display: none;
}

.contentMention:hover .user-emoji {
	display: block;
}

.cssBold {
	font-weight: bold;
}

.cssItalic {
	font-style: italic;
}

.cssStrike {
	text-decoration: underline;
}

.emojisContainer {
	position: relative;
}

.limitWidth {
	display: -webkit-box;
	overflow: hidden;
	-webkit-line-clamp: 2;
	-webkit-box-orient: vertical;
}
</style>
