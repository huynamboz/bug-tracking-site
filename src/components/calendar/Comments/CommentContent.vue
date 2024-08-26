<script setup lang="ts">
import { inject, onBeforeMount, ref } from "vue";
// types
import type { Gc as IGc } from "^/core/Gc";
const Gc = inject("Gc") as typeof IGc;
import type { i_task_comment } from "^/core/types/tasks_type";
import type { time_ago as i_time_ago } from "^/core/plugins/time_ago";
const time_ago = inject("time_ago") as typeof i_time_ago;
import type { t as trans } from "^/core/plugins/g_trans";
const $t = inject("$t") as typeof trans;
import type { i_profile } from "^/core/types/profile_types";
// stores
const { auth_user } = Gc["auth"];

import ListFile from "./Files/ListFile.vue";
const CustomEditor = Gc["components"]["common"]["CustomEditor"]();
import CommentContentElement from "./CommentContentElement.vue";
const props = defineProps<{
	comment: i_task_comment;
	userIds?: string[];
	// idTask?: string;
	// idCalendar?: string;
	// hideReplyBtn?: boolean;
	members?: Array<i_profile>;
}>();

const emits = defineEmits<{
	(e: "confirmDelete", id: string): void;
	(e: "deleteComment", id: string): void;
	(e: "deleteFile", idFile: number, idComment: string): void;
	(
		e: "updateComment",
		data: FormData,
		idComment: string,
		doneUpdate: () => void
	): void;
	(e: "openReply"): void;
}>();

const isEdit = ref<boolean>(false);
// const deleteFile = async (id: number): Promise<void> => {
// 	try {
// 		if (commentData.value) {
// 			if (props.idCalendar)
// 				await delete_calendars_comment_files_api(
// 					props.comment.id,
// 					props.idCalendar,
// 					id
// 				);
// 			const index = commentData.value?.files.findIndex((f) => f.id == id);
// 			if (index != -1) {
// 				commentData.value.files.splice(index, 1);
// 			}
// 			if (
// 				commentData.value.files.length == 0 &&
// 				!commentData.value.elements
// 			) {
// 				emits("deleteComment", commentData.value.id);
// 			}
// 		}
// 	} catch (error) {
// 		console.log(error);
// 	}
// };

const isSendingComment = ref<boolean>(false);

// const updateComment = async (formData: FormData): Promise<void> => {
// 	isSendingComment.value = true;
// 	try {
// 		if (props.idCalendar) {
// 			await update_calendars_comment_api(
// 				props.comment.id,
// 				props.idCalendar,
// 				formData
// 			).then((res) => {
// 				commentData.value = res["data"];
// 			});
// 			closeEdit();
// 		}
// 	} catch (error) {
// 		console.log(error);
// 	}
// 	isSendingComment.value = false;
// };

const closeEdit = (): void => {
	isSendingComment.value = false;
	isEdit.value = false;
};

const toggleEdit = (): void => {
	isEdit.value = !isEdit.value;
};

const onEmitDeleteFile = (idFile: number): void => {
	emits("deleteFile", idFile, props.comment.id);
};

const onEmitUpdateComment = (data: FormData): void => {
	isSendingComment.value = true;
	emits("updateComment", data, props.comment.id, closeEdit);
};
</script>
<template>
	<div style="display: flex; gap: 10px">
		<div class="comment-item-avatar" v-if="comment">
			<img
				v-if="comment.created_by.avatar"
				:src="comment.created_by.avatar"
				alt=""
				class="img-avatar"
			/>
			<img
				v-else
				src="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3e%3cpath fill='%23bcbcbc' fill-rule='evenodd' d='M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10Zm-7-3a3 3 0 1 1-6 0a3 3 0 0 1 6 0Zm-3 11.5a8.46 8.46 0 0 0 4.807-1.489c.604-.415.862-1.205.51-1.848C16.59 15.83 15.09 15 12 15c-3.09 0-4.59.83-5.318 2.163c-.351.643-.093 1.433.511 1.848A8.46 8.46 0 0 0 12 20.5Z' clip-rule='evenodd'/%3e%3c/svg%3e"
				class="img-avatar"
			/>
		</div>
		<div class="comment-item-content-container" v-if="comment">
			<div class="comment-item-header">
				<div class="comment-item-info-header">
					{{ comment.created_by.last_name }}
					{{ comment.created_by.first_name }}
					·
					<span class="comment-time">
						{{ time_ago(comment.created_at, $t("common.ago")) }}
					</span>
				</div>
				<div
					class="comment-item-btn-delete-header"
					v-if="
						auth_user && auth_user.id == comment.created_by.user_id
					"
				>
					<div
						class="edit-btn-header btn-header-left-item"
						@click="toggleEdit"
					>
						<ISvg name="IEdit" />
					</div>
					<div
						class="delete-btn-header btn-header-left-item"
						@click="emits('confirmDelete', comment.id)"
					>
						<ISvg name="IRecycleBin" />
					</div>
				</div>
			</div>
			<div style="width: 100%" v-if="isEdit">
				<CustomEditor
					:user-ids="userIds"
					:elements="comment.elements"
					:type="'THREAD'"
					@close="closeEdit"
					@send-data="onEmitUpdateComment"
				/>
			</div>
			<div class="comment-detail" v-else>
				<CommentContentElement :elements="comment.elements" />
				<!-- Show list file attach -->
				<ListFile
					@delete-file="onEmitDeleteFile"
					:files="comment.files"
				/>
			</div>
		</div>
	</div>
</template>

<style scoped>
.img-avatar {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	object-fit: cover;
}

.list-file-comment {
	display: flex;
	gap: 5px;
	flex-wrap: wrap;
}

.comment-item-content-container {
	display: flex;
	flex-direction: column;
	width: 100%;
	gap: 5px;
}

.comment-item-content-action {
	display: flex;
	gap: 6px;
}

.comment-item-info-header {
	font-weight: 500;
	font-size: 16px;
}

.comment-item-header {
	display: flex;
	justify-content: space-between;
	height: 24px;
	position: relative;
}

.comment-item-btn-delete-header {
	display: flex;
	gap: 8px;
	display: none;
	position: absolute;
	right: 0px;
	background: white;
}

.btn-header-left-item {
	box-shadow: 0px 3px 8px #c9c9c97a;
	border-radius: 7px;
	padding: 2px;
	height: 24px;
	width: 24px;
	display: flex;
	justify-content: center;
	cursor: pointer;
}

.comment-item-content-container:hover .comment-item-btn-delete-header {
	display: flex;
}

.comment-time {
	font-size: 13px;
	font-weight: 400;
}

.comment-item-content-text {
	border-radius: 8px;
	width: 100%;
	word-break: break-word;
}

.comment-item-content-text :deep(img) {
	width: 100%;
	max-height: 300px;
	object-fit: contain;
}

.comment-item-content-action {
	font-size: 13px;
}

.comment-item-content-action p {
	text-decoration: underline;
	cursor: pointer;
}

:deep(.ql-container-min-120 .ql-container) {
	min-height: 120px;
	height: auto;
}

.commenting-btn {
	padding: 0 12px !important;
}

.btn-comment-disable {
	background: var(--c-bg-btn-hover) !important;
	pointer-events: none;
	cursor: not-allowed;
}

.comment-detail {
	display: flex;
	flex-direction: column;
	gap: 5px;
}

.action-list {
	display: flex;
	gap: 10px;
	margin-left: auto;
	justify-content: end;
	margin-top: 10px;
}

.action-list button:nth-child(1) {
	display: flex;
	justify-content: center;
	align-items: center;
	border-radius: 6px;
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
	border-radius: 6px;
	font-weight: 500;
	color: white;
	border: none;
	padding: 0px 12px;
	height: 32px;
	background: var(--c-blue);
	transition: 0.2s;
	min-width: 66px;
}

.action-list button:nth-child(2):hover {
	background: var(--c-blue-dark);
	transition: 0.2s;
}
</style>
