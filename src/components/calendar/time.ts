import type { CDate } from "^/core/types/calendar_types";

export const timeFormat = (dateInt: number): string => {
	const date = new Date(dateInt) as CDate;
	return date.formatTime();
};

export const dateFormat = (dateInt: number): string => {
	const date = new Date(dateInt) as CDate;
	return date.format();
};
