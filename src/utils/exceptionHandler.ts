import type { ApiError } from "@/types/exception";

export const apiExceptionHandler = (e: any) => {
    const error: ApiError = {
        code: "",
        message: "Internal server error",
    };

    if (e?.data?.error) {
        error.code = e?.data?.error?.code?.replace(".", "_") ?? "";
        error.message = e?.data?.error?.message ?? "";
    } else if (e.code && e.message) {
        error.code = e?.code;
        error.message = e?.message;
    }
    console.log(error)
    return error;
};
