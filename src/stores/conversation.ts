// refactor user store
import type { Conversation } from "@/types/conversation";
import { defineStore } from "pinia";

export const useConversationStore = defineStore({
    id: "conversation",
    state: () => ({
        conversations: [] as Conversation[],
    }),
    actions: {
        setConsersations(conversations: Conversation[]) {
            this.conversations = conversations;
        },
        addConversation(conversation: Conversation) {
            this.conversations.unshift(conversation);
        },
        updateConversation(conversation: Conversation, index?: number) {
            if (!index) {
                const indx = this.conversations.findIndex((c) => c.id === conversation.id);
                Object.assign(this.conversations[indx], conversation);
            } else {
                Object.assign(this.conversations[index], conversation);
            }
        },
        removeConversation(conversationId: string) {
            const index = this.conversations.findIndex((c) => c.id === conversationId)
            index && this.conversations.splice(index, 1);
        },
    },
    getters: {
        getConversations: (state) => state.conversations,
    },
});
