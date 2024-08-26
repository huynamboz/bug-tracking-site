import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import "@/assets/scss/main.scss";
import "./assets/css/main.css";
import "./assets/css/tailwind.css";
import router from "./routers/router";
import { Icon } from "@iconify/vue";
// import Icon from "./components/base/Icon.vue";
import DefaultLayout from "@/layouts/DefaultLayout.vue";
import GuestLayout from "@/layouts/GuestLayout.vue";
import NoSideBarLayout from "@/layouts/NoSideBarLayout.vue";
import { initAuthStore, initWebSocketStore, initMasterStore } from "./stores";
const app = createApp(App);
const store = createPinia();
import ConfirmModal from "@/components/common/modal/ConfirmModal.vue";
import VueAwesomePaginate from "vue-awesome-paginate";
import { plugin as VueTippy } from "vue-tippy";
import { MotionPlugin } from "@vueuse/motion";
import TouchOutSide from "@/plugins/directives/VueTouchOutside";
import VImage from "@/plugins/directives/image";
import "tippy.js/dist/tippy.css"; // optional for styling
import "vue-awesome-paginate/dist/style.css";
import { i18n } from "./plugins/i18n";
import PrimeVue from "primevue/config";
import Aura from "@primevue/themes/aura";
import Vue3Toastify from "./plugins/toast";
const initApp = async () => {
    app.component("Icon", Icon);
    app.use(Vue3Toastify.Vue3Toastify, Vue3Toastify.options);
    app.use(PrimeVue, {
        theme: {
            preset: Aura,
            options: {
                cssLayer: {
                    name: "primevue",
                    order: "tailwind-base, primevue, tailwind-utilities",
                },
            },
        },
    });
    app.use(i18n);
    app.use(MotionPlugin);
    app.use(TouchOutSide);
    app.use(VImage);
    app.use(
        VueTippy,
        // optional
        {
            directive: "tippy", // => v-tippy
            component: "tippy", // => <tippy/>
            componentSingleton: "tippy-singleton", // => <tippy-singleton/>,
            defaultProps: {
                placement: "auto-end",
                allowHTML: true,
            }, // => Global default options * see all props
        },
    );
    app.use(VueAwesomePaginate);
    app.component("ModalConfirm", ConfirmModal);
    app.component("DefaultLayout", DefaultLayout);
    app.component("GuestLayout", GuestLayout);
    app.component("NoSideBarLayout", NoSideBarLayout);
    app.use(createPinia());
    await initAuthStore();
    // await initWebSocketStore();
    await initMasterStore();
    app.use(router);
    router.isReady().then(() => {
        app.mount("#app");
    });
};

initApp();
