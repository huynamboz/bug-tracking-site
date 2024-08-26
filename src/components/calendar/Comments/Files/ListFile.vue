<script setup lang="ts">
import { ref, inject } from "vue";
// types
import type { Gc as IGc } from "^/core/Gc";
const Gc = inject("Gc") as typeof IGc;
import type { i_file_page } from "^/core/types/file_types";
const { set_question_store } = Gc["stores"]["question_store"];
import type { t as trans } from "^/core/plugins/g_trans";
const $t = inject("$t") as typeof trans;
const { current_workspace } = Gc["stores"]["workspaces_store"];
const ShowFiles = Gc["components"]["files"]["ShowFiles"]();
defineProps<{
	files: Array<i_file_page>;
}>();
const emits = defineEmits<{
	(e: "deleteFile", id: number): void;
}>();
const fileDataPreview = ref<i_file_page>();
const previewFile = (file: i_file_page): void => {
	fileDataPreview.value = file;
};

const closeFilePreview = (): void => {
	fileDataPreview.value = undefined;
};
const confirmDeleteFile = (id: number): void => {
	set_question_store({
		title: $t("question.confirm"),
		body: "Are you sure want to delete this file",
		action: deleteFile,
		actionData: id
	});
};
const deleteFile = (id: number): void => {
	emits("deleteFile", id);
};
</script>
<template>
	<ShowFiles
		v-if="fileDataPreview"
		:fileData="fileDataPreview"
		@close="closeFilePreview"
	/>
	<div class="list-file-container">
		<div v-for="(file, index) in files" :key="index">
			<div
				class="file-content-fileNotImg"
				v-if="!file.mime_type.startsWith('image/')"
				@click="previewFile(file)"
			>
				<div
					v-if="current_workspace?.permission != 'MEMBER'"
					class="unchose-file-notImg tooltip"
					@click.stop="confirmDeleteFile(file.id)"
				>
				<ISvg name="IClose" class="" />
					<span class="tooltip-text-bottom">Delete</span>
				</div>

				<!-- <img
					src="/public/icons/file-icon.svg"
					class="file-content-fileNotImgLogo"
				/> -->
				<div class="file-content-fileNotImgName">
					<div class="file-content-fileName">
						{{ file.name }}
					</div>
				</div>
			</div>
			<div
				v-if="file.mime_type.startsWith('image/')"
				@click="previewFile(file)"
				class="file-content-fileImg"
			>
				<div
					v-if="current_workspace?.permission != 'MEMBER'"
					class="unchose-file-img tooltip"
					@click.stop="confirmDeleteFile(file.id)"
				>
					<ISvg name="IClose" class="" />
					<span class="tooltip-text-bottom">Delete</span>
				</div>

				<img class="img-thumb" :src="file.url" style="" />
			</div>
		</div>
	</div>
</template>
<style scoped>
.list-file-container {
	display: flex;
	gap: 12px;
	flex-wrap: wrap;
}

.file-content-fileImg {
	/* width: 80px; */
	height: 80px;
	margin-top: 2px;
	position: relative;
	white-space: nowrap;
}

.file-content-fileImg:hover {
	cursor: pointer;
}

.file-content-fileImg:hover .unchose-file-img {
	display: block;
}

.unchose-file-img {
	position: absolute;
	right: 4px;
	top: 4px;
	display: none;
}

.file-content-fileImg:hover {
	cursor: pointer;
}

.file-content-fileNotImg {
	display: flex;
	align-items: center;
	padding: 6px;
	background: #f1f2f4;
	border-radius: 6px;
	max-width: 156px;
	text-overflow: ellipsis;
	cursor: pointer;
	position: relative;
}

.file-content-fileName {
	display: -webkit-box;
	-webkit-line-clamp: 1;
	-webkit-box-orient: vertical;
	overflow: hidden;
	text-overflow: ellipsis;
	word-wrap: break-word;
	width: 100px;
}

.unchose-file-img:hover {
	cursor: pointer;
}

.file-content-fileNotImg {
	display: flex;
	align-items: center;
	padding: 6px;
	background: #f1f2f4;
	border-radius: 6px;
	max-width: 156px;
	text-overflow: ellipsis;
	cursor: pointer;
	position: relative;
}

.file-content-fileNotImgLogo {
	width: 30px !important;
}

.unchose-file-notImg {
	position: absolute;
	right: -5px;
	top: -5px;
	display: none;
	margin: 0;
}

.file-content-fileNotImg:hover .unchose-file-notImg {
	display: block;
}

.img-thumb {
	width: 106px;
	height: 80px;
	object-fit: cover;
	border-radius: 8px;
	cursor: zoom-in;
}
</style>
