<script setup lang="ts">
import { inject, onBeforeMount, ref, watch } from "vue";
// types
import type { Gc as IGc } from "^/core/Gc";
const Gc = inject("Gc") as typeof IGc;
import type { i_task_comment } from "^/core/types/tasks_type";
import type { t as trans } from "^/core/plugins/g_trans";
const $t = inject("$t") as typeof trans;
import type { i_paging } from "^/core/types";
// services
const {
	get_calendars_comments_api,
	send_calendars_comment_api,
	delete_calendars_comment_api
} = Gc["services"]["calendar_services"];
// stores
const { auth_user } = Gc["auth"];
const { set_question_store } = Gc["stores"]["question_store"];
const { messages_store } = Gc["stores"]["noti_socket_store"];
// components
import CommentContent from "./CommentContent.vue";
import CommentReply from "./Replies/CommentReply.vue";
const CustomEditor = Gc["components"]["common"]["CustomEditor"]();
const props = defineProps<{
	idCalendar?: string;
	userIds?: string[];
}>();

onBeforeMount(() => {
	getComments();
});

const comments = ref<Array<i_task_comment>>([]);
const commentsMeta = ref<i_paging>();
const getComments = async (): Promise<void> => {
	try {
		if (props.idCalendar) {
			await get_calendars_comments_api(props.idCalendar).then((res) => {
				comments.value = res["data"];
				commentsMeta.value = res["meta"];
			});
		}
	} catch (error) {
		console.log(error);
	}
};

const isFetchingMoreComments = ref<boolean>(false);
const getMoreComments = async (): Promise<void> => {
	try {
		if (isFetchingMoreComments.value) return;
		isFetchingMoreComments.value = true;

		if (props.idCalendar) {
			if (
				commentsMeta.value &&
				commentsMeta.value?.current_page + 1 <=
					commentsMeta.value?.total_pages &&
				commentsMeta.value.total_pages > 0
			) {
				await get_calendars_comments_api(
					props.idCalendar,
					commentsMeta.value.current_page + 1
				).then((res) => {
					comments.value = comments.value.concat(res["data"]);
					commentsMeta.value = res["meta"];
				});
			}
		}
	} catch (error) {
		console.log(error);
	}
	isFetchingMoreComments.value = false;
};

const isSendingComment = ref<boolean>(false);
const sendComment = async (
	data: FormData,
	callback: () => void
): Promise<void> => {
	try {
		if (isSendingComment.value) return;
		isSendingComment.value = true;

		if (props.idCalendar) {
			await send_calendars_comment_api(data, props.idCalendar).then(
				() => {
					callback();
				}
			);
		}
	} catch (error) {
		console.log(error);
	}
	isSendingComment.value = false;
};

watch(
	() => messages_store.value,
	() => {
		if (
			messages_store.value &&
			messages_store.value.type == "COMMENT_CALENDAR"
		) {
			const dataSocket = messages_store.value.data.data as i_task_comment;
			if (dataSocket.calendar_id !== props.idCalendar) return;

			if (!dataSocket.parent_id) {
				switch (messages_store.value.action) {
					// handle when have new comment
					case "CREATE_COMMENT": {
						comments.value.unshift(dataSocket);
						break;
					}

					case "DELETE_COMMENT": {
						const index = comments.value.findIndex(
							(c) => c.id === dataSocket.id
						);
						index > -1 && comments.value.splice(index, 1);
						break;
					}

					case "EDIT_COMMENT": {
						const index = comments.value.findIndex(
							(c) => c.id === dataSocket.id
						);
						if (index > -1) comments.value[index] = dataSocket;
						break;
					}
				}
			} else {
				// find reply component have id === dataSocket.parent_id
				const index =
					listCommentRepliesEl.value?.findIndex(
						(comp) =>
							comp.$props.idComponent === dataSocket.parent_id
					) ?? -1;

				if (
					index > -1 &&
					listCommentRepliesEl.value &&
					listCommentRepliesEl.value[index]
				) {
					if (!comments.value[index].count_replies) {
						comments.value[index].count_replies = 0;
					}

					switch (messages_store.value.action) {
						case "CREATE_COMMENT": {
							(
								listCommentRepliesEl.value[index] as any
							).pushToList(dataSocket); //update data in child component
							++(comments.value[index].count_replies as number);
							break;
						}

						case "DELETE_COMMENT": {
							(
								listCommentRepliesEl.value[index] as any
							).removeItem(dataSocket.id); //remove comment in list reply component
							--(comments.value[index].count_replies as number);
							break;
						}

						case "EDIT_COMMENT": {
							(
								listCommentRepliesEl.value[index] as any
							).updateItem(dataSocket); //update comment in list reply component
							break;
						}
					}
				}
			}
		}
	}
);

const deleteComment = async (id: string): Promise<void> => {
	try {
		props.idCalendar &&
			(await delete_calendars_comment_api(id, props.idCalendar));
	} catch (error) {
		console.log(error);
	}
};

const confirmDelete = (id: string): void => {
	set_question_store({
		title: $t("question.confirm"),
		body: "Bạn chắc chắn muốn xóa bình luận này?",
		action: deleteComment,
		actionData: id
	});
};

const isShowReplies = ref<Array<boolean>>([false]);
const showReplies = (index: number): void => {
	isShowReplies.value[index] = true;
};

const listCommentRepliesEl = ref<Array<InstanceType<typeof CommentReply>>>();

const {
	update_calendars_comment_api,
	send_calendars_comment_reply_api,
	delete_calendars_comment_files_api
} = Gc["services"]["calendar_services"];
const deleteFile = async (idFile: number, idComment: string): Promise<void> => {
	try {
		if (!props.idCalendar) return;

		const indexComment = comments.value.findIndex(
			(comment) => comment.id === idComment
		);
		await delete_calendars_comment_files_api(
			idComment,
			props.idCalendar,
			idFile
		);

		// remove file deleted out of comment
		const index = comments.value[indexComment].files.findIndex(
			(f) => f.id === idFile
		);
		if (index != -1) {
			comments.value[indexComment].files.splice(index, 1);
		}

		// if list file in comment = 0 => delete comment
		if (
			comments.value[indexComment].files.length == 0 &&
			comments.value[indexComment].elements.length == 0
		) {
			deleteComment(idComment);
		}
	} catch (error) {
		console.log(error);
	}
};

const updateComment = async (
	data: FormData,
	idComment: string,
	doneUpdate?: () => void
): Promise<void> => {
	try {
		if (props.idCalendar) {
			await update_calendars_comment_api(
				idComment,
				props.idCalendar,
				data
			).then(() => {
				doneUpdate && doneUpdate(); // trigger to close edit
			});
		}
	} catch (error) {
		console.log(error);
	}
};

const sendReplyComment = async (data: FormData): Promise<void> => {
	props.idCalendar &&
		send_calendars_comment_reply_api(data, props.idCalendar);
};
</script>
<template>
	<div>
		<div>
			<p class="activities-title">Activities</p>
		</div>
		<!-- Input comment -->
		<div class="comment-container">
			<img
				v-if="auth_user && auth_user.avatar"
				:src="auth_user.avatar"
				alt=""
				class="img-avatar"
			/>
			<img
				v-else
				src="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 24 24'%3e%3cpath fill='%23bcbcbc' fill-rule='evenodd' d='M22 12c0 5.523-4.477 10-10 10S2 17.523 2 12S6.477 2 12 2s10 4.477 10 10Zm-7-3a3 3 0 1 1-6 0a3 3 0 0 1 6 0Zm-3 11.5a8.46 8.46 0 0 0 4.807-1.489c.604-.415.862-1.205.51-1.848C16.59 15.83 15.09 15 12 15c-3.09 0-4.59.83-5.318 2.163c-.351.643-.093 1.433.511 1.848A8.46 8.46 0 0 0 12 20.5Z' clip-rule='evenodd'/%3e%3c/svg%3e"
				class="img-avatar"
			/>
			<div class="comment-inp-container">
				<CustomEditor
					:user-ids="userIds"
					:type="'THREAD'"
					@send-data="sendComment"
				/>
			</div>
		</div>
		<!-- End input comment -->

		<!-- Comment list -->
		<div>
			<div class="list-comment-container">
				<div
					v-for="(comment, index) in comments"
					:key="comment.id"
					class="comment-item"
				>
					<CommentContent
						:user-ids="userIds"
						:comment="comment"
						@delete-file="deleteFile"
						@update-comment="updateComment"
						@confirm-delete="confirmDelete"
					/>
					<div class="reply-container">
						<div
							style="font-weight: 500; cursor: pointer"
							v-if="!isShowReplies[index]"
							@click="showReplies(index)"
						>
							<ISvg name="IReply" fill="none" />
							{{
								comment.count_replies &&
								comment.count_replies > 0
									? comment.count_replies
									: ""
							}}
							replies
						</div>
						<p
							style="font-weight: 500; cursor: pointer"
							v-if="isShowReplies[index]"
							@click="isShowReplies[index] = false"
						>
							Hide replies
						</p>
						<CommentReply
							ref="listCommentRepliesEl"
							v-if="isShowReplies[index]"
							:id-component="comment.id"
							:id-calendar="idCalendar"
							:comment-parent="comment"
							@delete-comment="deleteComment"
							@update-comment="updateComment"
							@send-reply="sendReplyComment"
						/>
					</div>
				</div>
				<!-- End list comment -->
				<div
					class="loadmore-btn"
					@click="getMoreComments"
					v-if="
						commentsMeta &&
						commentsMeta.current_page != commentsMeta.total_pages &&
						commentsMeta.total_pages > 0 &&
						!isFetchingMoreComments
					"
				>
					View more
				</div>
				<ISvg
					v-if="isFetchingMoreComments"
					name="IThreeDotLoading"
					alt=""
					style="width: 35px; margin-left: 45px"
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
.comment-container {
	display: flex;
	gap: 10px;
	width: 100%;
	margin-top: 13px;
	margin-bottom: 20px;
}
.comment-inp-container {
	width: 100%;
	background: white;
	border-radius: 12px;
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

/* task comment */
.activities-title {
	font-weight: 500;
	font-size: 16px;
}
.list-comment-container {
	display: flex;
	flex-direction: column;
	gap: 20px;
}
.comment-item {
	display: flex;
	flex-direction: column;
}

.commenting-btn {
	padding: 0 12px !important;
}
.btn-comment-disable {
	background: var(--c-bg-btn-hover) !important;
	pointer-events: none;
	cursor: not-allowed;
}
.loadmore-btn {
	display: inline-block;
	background: var(--c-white-light);
	width: fit-content;
	width: -moz-fit-content;
	padding: 6px;
	border-radius: 5px;
	margin-left: 45px;
	color: var(--c-blue-dark);
	cursor: pointer;
}
::v-deep .ql-editor-courses-border {
	border-radius: 10px !important;
	border: 1px solid #e5e5e5 !important;
}
.reply-container {
	margin-left: 42px;
}
</style>
