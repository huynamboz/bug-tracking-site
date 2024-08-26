// refactor user store
import { defineStore } from "pinia";
import { getEmojisApi, getLanguagesApi } from "@/services/master";
import type { Language } from "@/types/master";
import { apiExceptionHandler } from "@/utils/exceptionHandler";
import { notify } from "@/utils/toast";

export const useMasterStore = defineStore({
    id: "master",
    state: () => ({
        languages: [] as Language[],
        locale: {} as Language,
        emojis: [],
    }),
    actions: {
        async setMasterData() {
            // Promise.all([this.fetchLanguages()]);
        },
        async fetchLanguages() {
            try {
                const data = await getLanguagesApi();
                this.languages = data.data;
                let lang: "en" | "ja" | "vi" = "en";

                const langLocal = localStorage.getItem("locale") || "en";
                if (["en", "ja", "vi"].includes(langLocal)) {
                    lang = langLocal as "en" | "ja" | "vi";
                } else {
                    const langDefault = navigator.language;
                    if (/^en\b/.test(langDefault)) {
                        lang = "en";
                    }
                    if (/^vi\b/.test(langDefault)) {
                        lang = "vi";
                    }
                    if (/^ja\b/.test(langDefault)) {
                        lang = "ja";
                    }
                    localStorage.setItem("locale", lang);
                }
                this.locale = this.languages.find((l) => l.code === lang) || this.languages[0];
            } catch (e) {
                const err = apiExceptionHandler(e);
                notify.error(err.message);
            }
        },
        async setEmojis() {
            try {
                const { data } = await getEmojisApi();
                this.emojis = data;
            } catch (e) {
                const err = apiExceptionHandler(e);
                notify.error(err.message);
            }
        },
    },
    getters: {
        getLocale: (state) => state.locale,
        getLanguages: (state) => state.languages,
        getEmojis: (state) => state.emojis,
    },
});
