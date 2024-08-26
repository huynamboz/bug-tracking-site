<script setup lang="ts">
import Card from "primevue/card";
import Button from "primevue/button";

import InputText from "primevue/inputtext";
import { createProfileApi } from "@/services/user";
import { useAuthStore } from "@/stores";

const isLoading = ref(false);

const user = ref({
    first_name: "",
    last_name: "",
});

const router = useRouter();

const authStore = useAuthStore();

const onSubmit = async () => {
    isLoading.value = true;
    try {
        const { data } = await createProfileApi(user.value);
        authStore.setUser(data);
        router.push("/");
    } catch (error) {}
    isLoading.value = false;
};
</script>
<template>
    <div class="w-full h-full flex justify-center items-center">
        <Card style="width: 25rem; overflow: hidden">
            <template #header>
                <img
                    alt="user header"
                    src="https://primefaces.org/cdn/primevue/images/usercard.png"
                />
            </template>
            <template #title>Create profiles</template>
            <template #content>
                <InputText
                    v-model="user.first_name"
                    class="w-full"
                    placeholder="First name"
                />

                <InputText
                    v-model="user.last_name"
                    class="w-full mt-5"
                    placeholder="Last name"
                />
            </template>
            <template #footer>
                <div class="flex gap-4 mt-1">
                    <Button
                        :loading="isLoading"
                        label="Save"
                        class="w-full"
                        @click="
                            () => {
                                !isLoading && onSubmit();
                            }
                        "
                    />
                </div>
            </template>
        </Card>
    </div>
</template>
