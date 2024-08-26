<script setup lang="ts">
import { registerApi } from "@/services/auth";
import { useMasterStore } from "@/stores/master";

// import { mapActions, mapGetters } from "vuex";
// import {
//   validEmail,
//   validPass,
//   validPassConfirm,
// } from "~/modules/validation/ValidAuth.js";
// import { register_client_api } from "~/services/authService.js";
// import langAuth from "~/components/Layout/langAuth.vue";
// import QuestionPopup from "~/components/Layout/QuestionPopup.vue";
// import "~/static/assets/css/login.css";
// export default {
//   auth: false,
//   middleware: "guest",
//   components: {
//     langAuth,
//     QuestionPopup,
//   },
//   data() {
//     return {
//       userName: "",
//       userFirstName: "",
//       userLastName: "",
//       email: "",
//       password: "",
//       confirmation_password: "",
//       errorEmail: "",
//       errorPassword: "",
//       errorName: "",
//       errorFirstName: "",
//       errorLastName: "",
//       errorConfirmPassword: "",
//       error: "",
//       question: null,
//       isPersonal: true
//     };
//   },
//   computed: {
//     ...mapGetters({
//       get_locale_id: "common/get_locale_id"
//     })
//   },

//   methods: {
//     ...mapActions({
//       set_noti_mess: "noti_mess/set_noti_mess",
//     }),

//     checkPassword() {
//       let check = validPass(this.password);
//       this.errorPassword = check.mess;

//       if (check.check) {
//         if (this.confirmation_password) {
//           return this.checkConfirmPassword();
//         }

//       } else {
//         return check.check;
//       }

//     },
//     checkEmail() {
//       let check = validEmail(this.email);
//       this.errorEmail = check.mess;

//       return check.check;
//     },
//     checkName() {
//       if (this.userName === "") {
//         this.errorName = this.$t("validation.name_blank");
//         return false;
//       } else {
//         this.errorName = "";
//         return true;
//       }
//     },
//     checkFirstName() {
//       if (this.userFirstName === "") {
//         this.errorFirstName = this.$t("validation.first_name_blank");
//         return false;
//       } else {
//         this.errorFirstName = "";
//         return true;
//       }
//     },
//     checkLastName() {
//       if (this.userLastName === "") {
//         this.errorLastName = this.$t("validation.last_name_blank");
//         return false;
//       } else {
//         this.errorLastName = "";
//         return true;
//       }
//     },
//     checkConfirmPassword() {
//       let check = validPassConfirm(this.confirmation_password, this.password);
//       this.errorConfirmPassword = check.mess;

//       return check.check;
//     },
//     async register() {
//       if (
//         this.checkEmail() &&
//         this.checkPassword() &&
//         this.checkConfirmPassword()
//       ) {
//         try {
//           await register_client_api({
//             email: this.email,
//             password: this.password,
//             confirmation_password: this.confirmation_password,
//             language_id: this.get_locale_id,
//             is_company: !this.isPersonal
//           }).then(() => {
//             this.question = {
//               type: "SUCCESS",
//               body: this.$t("question.register_success"),
//             };
//           });
//         } catch (e) {
//           this.errorEmail = e;
//         }
//       }
//     },
//     onGoToLogin() {
//       this.$router.push("/login");
//     },
//     onGoToHomePage() {
//       this.$router.push("/");
//     },

//     changePersonal(bool) {
//       this.isPersonal = bool;
//     }
//   },
// };
import { useI18n } from "vue-i18n";
const { t } = useI18n();
import Button from "@/components/common/ui-kit/Button.vue";
import { useModalConfirm } from "@/stores/modal.store";
import { validEmail, validPass, validPassConfirm } from "@/utils/validate";
import { apiExceptionHandler } from "@/utils/exceptionHandler";
import { notify } from "@/utils/toast";
const modalConfirm = useModalConfirm();
const masterStore = useMasterStore();
import Select from "@/components/common/ui-kit/Select.vue";

const email = ref("");
const password = ref("");
const confirmation_password = ref("");
const isPersonal = ref(false);
const validate = ref({
    errorEmail: "",
    errorPassword: "",
    errorConfirmPassword: "",
});
const changePersonal = (type: boolean) => {
    isPersonal.value = type;
};

function checkPassword() {
    const check = validPass(password.value);
    validate.value.errorPassword = check.mess;

    if (check.check) {
        if (confirmation_password.value) {
            return checkConfirmPassword();
        }
    } else {
        return check.check;
    }
}
function checkEmail() {
    const check = validEmail(email.value);
    validate.value.errorEmail = check.mess;

    return check.check;
}

function checkConfirmPassword() {
    const check = validPassConfirm(confirmation_password.value, password.value);
    validate.value.errorConfirmPassword = check.mess;
    return check.check;
}

const router = useRouter();

const isLoading = ref(false);
const register = async () => {
    if (checkEmail() && checkPassword() && checkConfirmPassword()) {
        try {
            isLoading.value = true;
            await registerApi({
                email: email.value,
                password: password.value,
                confirmation_password: confirmation_password.value,
                language_id: masterStore.getLocale.id,
                is_company: !isPersonal.value,
            });
            modalConfirm.setQuestion({
                title: "Notification",
                question: t("question.register_success"),
                onlyConfirm: true,
                actionConfirm: () => {
                    router.push({ name: "login" });
                },
            });
        } catch (e) {
            console.log(e);
            const err = apiExceptionHandler(e);
            notify.error(t(`error_code.${err.code}`), { type: "error" });
            // this.errorEmail = e;
        } finally {
            isLoading.value = false;
        }
    }
};
</script>

<template>
    <div class="login-container">
        <!-- <question-popup
      @close="$router.push('/login')"
      @accept="question.action()"
      :question="question"
      v-if="question != null"
    /> -->
        <!-- <img
            src="~/assets/images/sucodevLogo.svg"
            class="login-logo"
        /> -->
        <div class="login-left-container">
            <div class="login-left-bottom"></div>
            <!-- <img
                src="~/assets/images/auth_pic_client.svg"
                class="login-left-img"
            /> -->
        </div>
        <div class="login-right-container">
            <div class="login-form-container">
                <div class="login-header-name">{{ $t("auth.sign_up") }}</div>
                <div class="login-form-label">{{ $t("auth.email") }}</div>
                <input
                    v-model="email"
                    type="text"
                    class="login-form-input"
                    :placeholder="$t('placeholder.enter_email')"
                    @input="checkEmail"
                    @keyup.enter="register"
                />
                <div class="login-validation">{{ validate.errorEmail }}</div>

                <div class="login-form-label">{{ $t("auth.password") }}</div>
                <input
                    v-model="password"
                    class="login-form-input"
                    type="password"
                    :placeholder="$t('placeholder.enter_pass')"
                    @input="checkPassword"
                    @keyup.enter="register"
                />
                <div class="login-validation">{{ validate.errorPassword }}</div>

                <div class="login-form-label">{{ $t("auth.confirm_pass") }}</div>
                <input
                    v-model="confirmation_password"
                    class="login-form-input"
                    type="password"
                    :placeholder="$t('placeholder.enter_confirm_pass')"
                    @input="checkConfirmPassword"
                    @keyup.enter="register"
                />
                <div class="login-validation">{{ validate.errorConfirmPassword }}</div>

                <Button
                    :loading="isLoading"
                    width="100%"
                    font-weight="600"
                    class="login-form-button-signin"
                    @click="
                        () => {
                            !isLoading && register();
                        }
                    "
                >
                    {{ $t("auth.sign_up") }}
                </Button>

                <div class="login-form-end-label">
                    {{ $t("auth.already_member") }}
                    <RouterLink
                        :to="{ name: 'login' }"
                        class="login-link"
                    >
                        {{ $t("auth.sign_in") }}
                    </RouterLink>
                </div>
            </div>
        </div>

        <langAuth />
    </div>
</template>

<style scoped>
.columnFirstName {
    float: left;
    width: 50%;
    padding-right: 12px;
}

.columnLastName {
    float: left;
    width: 50%;
    padding-left: 12px;
}

.rowName:after {
    content: "";
    display: table;
    clear: both;
}

.checkTypeContainer {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
}

.labelType {
    clear: both;
    display: inline-block;
}

.btnType {
    width: 20px;
    height: 20px;
    margin-left: 26px;
    margin-right: 6px;
    accent-color: #334d6e;
    margin-bottom: 2px;
}
.btnType:hover {
    cursor: pointer;
}
.labelRadio {
    font-weight: 500;
    font-size: 16px;
    line-height: 24px;
    letter-spacing: 0.02em;
    color: #334d6e;
}
</style>
