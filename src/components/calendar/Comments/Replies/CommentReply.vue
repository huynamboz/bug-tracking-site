<script setup lang="ts">
import { inject, onBeforeMount, ref, computed } from "vue";
// types
import type { Gc as IGc } from "^/core/Gc";
const Gc = inject("Gc") as typeof IGc;
import CommentContent from "../CommentContent.vue";
const CustomEditor = Gc["components"]["common"]["CustomEditor"]();

import type { i_task_comment } from "^/core/types/tasks_type";
const { auth_user } = Gc["auth"];
const { get_task_comment_replies_api } = Gc["services"]["task_services"];
const { get_calendars_comment_replies_api } =
	Gc["services"]["calendar_services"];
const { set_question_store } = Gc["stores"]["question_store"];
import type { t as trans } from "^/core/plugins/g_trans";
import type { FromTo } from "moment";
const $t = inject("$t") as typeof trans;
const props = defineProps<{
	commentParent: i_task_comment;
	idTask?: string;
	idCalendar?: string;
	idComponent: number | string;
}>();

const emits = defineEmits<{
	(e: "deleteComment", id: string): void;
	(e: "sendReply", data: FormData): void;
	(
		e: "updateComment",
		data: FormData,
		idComment: string,
		doneUpdate?: () => void
	): void;
	(e: "openReply"): void;
}>();

const comments = ref<Array<i_task_comment>>([]);
onBeforeMount(() => {
	showReplies();
});

const getCommentReplies = async (page = 1): Promise<void> => {
	try {
		if (props.idTask) {
			await get_task_comment_replies_api(
				props.commentParent.id,
				page
			).then((res) => {
				comments.value = res["data"].reverse();
			});
		} else if (props.idCalendar) {
			await get_calendars_comment_replies_api(
				props.commentParent.id,
				page
			).then((res) => {
				comments.value = res["data"].reverse();
			});
		}
	} catch (error) {
		console.log(error);
	}
};

const pushToList = (val: i_task_comment): void => {
	comments.value.push(val);
};

const updateItem = (val: i_task_comment): void => {
	const index = comments.value.findIndex((c) => c.id === val.id);
	if (index > -1) comments.value[index] = val;
};

const removeItem = (id: string): void => {
	const index = comments.value.findIndex((c) => c.id === id);
	index > -1 && comments.value.splice(index, 1);
};

defineExpose({
	updateItem,
	pushToList,
	removeItem
});

const isClearDataEditor = ref<boolean>(false);
const isShowReplies = ref<boolean>(false);
// const commentContent = ref<string>("");

const isSendingComment = ref<boolean>(false);
const sendComment = async (formData: FormData): Promise<void> => {
	try {
		if (isSendingComment.value) return;
		isSendingComment.value = true;

		// if (props.idTask) {
		// 	await send_task_comment_reply_api(formData, props.idTask).then(
		// 		() => {
		// 			commentContent.value = "";
		// 			isClearDataEditor.value = true;
		// 		}
		// 	);
		// } else if (props.idCalendar) {
		// 	send_calendars_comment_reply_api(formData, props.idCalendar).then(
		// 		(res) => {
		// 			commentContent.value = "";
		// 			isClearDataEditor.value = true;
		// 			// comments.value.push(res.data);
		// 		}
		// 	);
		// }
		emits("sendReply", formData);
	} catch (error) {
		console.log(error);
	}
	isSendingComment.value = false;
};

const showReplies = async (): Promise<void> => {
	getCommentReplies();
	isShowReplies.value = true;
};

const confirmDelete = (id: string): void => {
	console.log(id);
	set_question_store({
		title: $t("question.confirm"),
		body: "Bạn chắc chắn muốn xóa bình luận này?",
		action: deleteComment,
		actionData: id
	});
};

const deleteComment = async (id: string): Promise<void> => {
	emits("deleteComment", id);
};

const updateComment = (
	data: FormData,
	idComment: string,
	closeEdit: () => void
): void => {
	emits("updateComment", data, idComment, () => {
		closeEdit();
	});
};
</script>
<template>
	<div>
		<div class="list-reply-content" v-if="comments.length > 0">
			<div v-for="comment in comments" :key="comment.id">
				<CommentContent
					:hide-reply-btn="true"
					:comment="comment"
					:id-task="idTask"
					:id-calendar="idCalendar"
					@confirm-delete="confirmDelete"
					@delete-comment="deleteComment"
					@update-comment="updateComment"
				/>
			</div>
		</div>
		<div class="inp-reply-container">
			<div class="inp-reply-main">
				<div class="comment-item-avatar" v-if="auth_user">
					<img
						v-if="auth_user.avatar"
						:src="auth_user.avatar"
						alt=""
						class="img-avatar"
					/>
					<img
						v-else
						src="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3e%3cpath fill='%23bcbcbc' fill-rule='evenodd' d='M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10Zm-7-3a3 3 0 1 1-6 0a3 3 0 0 1 6 0Zm-3 11.5a8.46 8.46 0 0 0 4.807-1.489c.604-.415.862-1.205.51-1.848C16.59 15.83 15.09 15 12 15c-3.09 0-4.59.83-5.318 2.163c-.351.643-.093 1.433.511 1.848A8.46 8.46 0 0 0 12 20.5Z' clip-rule='evenodd'/%3e%3c/svg%3e"
						class="img-avatar"
					/>
				</div>
				<div class="reply-inp" style="width: 100%">
					<CustomEditor
						v-bind="$attrs"
						:id-task="idTask"
						:reply-parent-id="commentParent.id"
						:type="'REPLY'"
						@send-data="sendComment"
					/>
				</div>
			</div>
		</div>
	</div>
</template>
<style scoped>
.inp-reply-container {
	display: flex;
	gap: 10px;
	flex-direction: column;
	margin-top: 15px;
}
.inp-reply-main {
	display: flex;
	gap: 10px;
}
.img-avatar {
	width: 24px;
	height: 24px;
	border-radius: 50%;
	object-fit: cover;
}
.list-reply-content {
	display: flex;
	gap: 20px;
	margin-top: 15px;
	flex-direction: column;
}
.inp-editor {
	width: 100%;
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
