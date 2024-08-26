<script setup lang="ts">
import { inject } from "vue";
import type {
	CDate,
	i_calendar_item,
	i_calendar_split_vuecal
} from "^/core/types/calendar_types";
import type { Gc as IGc } from "^/core/Gc";
const Gc = inject("Gc") as typeof IGc;
const { auth_user } = Gc["auth"];
const { is_modderator_store } = Gc["stores"]["workspaces_store"];

const props = defineProps<{
	calendar_times: Array<i_calendar_item>;
	splits: Array<i_calendar_split_vuecal>;
	selectedDate: CDate;
}>();

const emits = defineEmits<{
	(e: "close"): void;
}>();

const close = (): void => {
	emits("close");
};

const insideOverlay = (event: Event): void => {
	event.stopPropagation();
};

const outsideOverlay = (): void => {
	close();
};

function gFixed(num: number, precision: number): number {
	let formatted = num.toFixed(precision);
	formatted = parseFloat(formatted).toString(); // Convert to string to remove trailing zeros
	return parseFloat(formatted);
}

const getTimeByUser = (userId: string): number => {
	let time = 0;

	for (const cal of props.calendar_times) {
		if (cal.created_by.user_id == userId) {
			if (cal.total) {
				time = time + cal.total;
			}
		}
	}

	return gFixed(time / 60, 2);
};

const getTimeByUserByDay = (userId: string, day: number): number => {
	let time = 0;

	for (const cal of props.calendar_times) {
		if (parseInt((new Date(cal.start_time) as CDate).format("D")) == day) {
			if (cal.created_by.user_id == userId) {
				console.log(`[LOG: ${day}]:`, cal)
				if (cal.total) {
					time = time + cal.total;
				}
			}
		}
	}

	// return (time / 60).toFixed(2);
	return gFixed(time / 60, 2);
};

function indexToDayOfWeek(index: number): string {
	const dayOfWeekMap: Record<number, string> = {
		0: "CN",
		1: "T2",
		2: "T3",
		3: "T4",
		4: "T5",
		5: "T6",
		6: "T7"
	};

	return dayOfWeekMap[index] || "";
}

interface DayInfo {
	day: number;
	dayOfWeek: number;
}

function getDaysOfMonth(year: number, month: number): Array<DayInfo> {
	const daysInMonth = new Date(year, month, 0).getDate();
	const daysArray: Array<DayInfo> = [];

	for (let day = 1; day <= daysInMonth; day++) {
		const date = new Date(year, month - 1, day);
		const dayOfWeek = date.getDay();
		daysArray.push({ day, dayOfWeek });
	}

	return daysArray;
}

// document.addEventListener("DOMContentLoaded", () => {
// 	document.getElementById("btnExport")!.addEventListener("click", () => {
// 		tableToExcel("testExportId", "test", "TestExport");
// 	});
// });

function tableToExcel(table: HTMLElement | string, name?: string): void {
	const uri = "data:application/vnd.ms-excel;base64,";
	const template =
		'<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>';
	const base64 = (s: string): string => window.btoa(unescape(encodeURIComponent(s)));
	const format = (s: string, c: { [key: string]: string }): string =>
		s.replace(/{(\w+)}/g, (m, p) => c[p]);

	const getElement = (element: HTMLElement | string): HTMLElement | null => {
		if (typeof element === "string") {
			return document.getElementById(element);
		}
		return element;
	};

	const tableElement = getElement(table);
	if (!tableElement) {
		console.error("Table element not found.");
		return;
	}

	const ctx = {
		worksheet: name || "Worksheet",
		table: tableElement.innerHTML
	};
	window.location.href = uri + base64(format(template, ctx));
}

// function tableToExcel(
// 	table: HTMLElement | string,
// 	sheetName: string,
// 	fileName: string
// ): void {
// 	const ua: string = window.navigator.userAgent;
// 	const msie: number = ua.indexOf("MSIE ");
// 	// eslint-disable-next-line no-useless-escape
// 	if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv\:11\./)) {
// 		fnExcelReport(table, fileName);
// 		return;
// 	}

// 	const uri: string = "data:application/vnd.ms-excel;base64,";
// 	const templateData: string =
// 		'<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>{worksheet}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><meta http-equiv="content-type" content="text/plain; charset=UTF-8"/></head><body><table>{table}</table></body></html>';
// 	const base64Conversion = (s: string): string =>
// 		window.btoa(unescape(encodeURIComponent(s)));
// 	const formatExcelData = (s: string, c: { [key: string]: string }): string =>
// 		s.replace(/{(\w+)}/g, (m, p) => c[p]);

// 	const tableElement: HTMLElement =
// 		typeof table === "string" ? document.getElementById(table)! : table;

// 	const ctx = {
// 		worksheet: sheetName || "Worksheet",
// 		table: tableElement.innerHTML
// 	};

// 	const element = document.createElement("a");
// 	element.setAttribute(
// 		"href",
// 		"data:application/vnd.ms-excel;base64," +
// 			base64Conversion(formatExcelData(templateData, ctx))
// 	);
// 	element.setAttribute("download", fileName);
// 	element.style.display = "none";
// 	document.body.appendChild(element);
// 	element.click();
// 	document.body.removeChild(element);
// }

function fnExcelReport(table: HTMLElement | string, fileName: string): boolean {
	let tab_text: string = "<table border='2px'>";

	const tableElement: HTMLElement =
		typeof table === "string" ? document.getElementById(table)! : table;
	tab_text = tab_text + tableElement.innerHTML;

	tab_text = tab_text + "</table>";
	tab_text = tab_text.replace(/<A[^>]*>|<\/A>/g, ""); // remove if you want links in your table
	tab_text = tab_text.replace(/<img[^>]*>/gi, ""); // remove if you want images in your table
	tab_text = tab_text.replace(/<input[^>]*>|<\/input>/gi, ""); // removes input params

	const txtArea1 = document.createElement("textarea");
	document.body.appendChild(txtArea1);
	txtArea1.innerHTML = tab_text;
	txtArea1.select();
	const sa = document.execCommand("SaveAs", false, fileName + ".xls");
	document.body.removeChild(txtArea1);

	return sa;
}
</script>

<template>
	<div class="overlay" @click="outsideOverlay">
		<div class="container" @click="insideOverlay">
			<div class="table-container">
				<table id="testExportId">
					<tr>
						<th :colspan="splits.length + 2">
							SUCODEV WORKING TIME MONTH
							{{ selectedDate.format("M") }}
						</th>
					</tr>
					<tr id="header">
						<th style="width: 30px">DAY</th>
						<th style="width: 82px">Day of week</th>
						<th v-for="split of splits" :key="split.id">
							{{ split.label }}
						</th>
					</tr>
					<tr
						v-for="day of getDaysOfMonth(
							parseInt(selectedDate.format('YYYY')),
							parseInt(selectedDate.format('M'))
						)"
						:key="day.day"
						:class="{ lastDay: day.dayOfWeek === 0 }"
					>
						<th>{{ day.day }}</th>
						<th>{{ indexToDayOfWeek(day.dayOfWeek) }}</th>
						<td v-for="split of splits" :key="split.id">
							{{
								getTimeByUserByDay(split.id.toString(), day.day)
							}}
						</td>
					</tr>
					<tr>
						<th>Total:</th>
						<th></th>
						<th v-for="split of splits" :key="split.id">
							{{ getTimeByUser(split.id.toString()) }}
						</th>
					</tr>
				</table>
			</div>
			<button
				v-if="is_modderator_store || auth_user?.role === 'HOST'"
				id="export-btn"
				@click="
					tableToExcel(
						'testExportId',
						`sucodev-working-time-month${selectedDate.format('M')}`
					)
				"
			>
				Export Excel
			</button>
		</div>
	</div>
</template>

<style scoped>
.overlay {
	width: 100%;
	height: 100%;
	justify-content: center;
	position: fixed;
	top: 0;
	left: 0;
	display: flex;
	z-index: 20;
	overflow-y: auto;
	background: #00000069;
	align-items: center;
}
tr:hover {
	background: var(--c-bg-btn-hover);
}
#header {
	position: sticky;
	top: -1px;
	background: white;
}
.container {
	background: #ffffff;
	border-radius: var(--popup-border-radius);
	width: 720px;
	position: relative;
	z-index: 1;
	padding: 24px;
	display: flex;
	flex-direction: column;
	max-height: 90%;
}

table,
th,
td {
	border: 1px solid #727f8f;
}

table {
	width: 100%;
}

th,
td {
	text-align: center;
	padding: 4px;
}
#export-btn {
	margin-top: 10px;
	min-height: 32px;
	border: none;
	border-radius: 5px;
	background: var(--c-green);
	color: white;
	font-weight: 500;
}
.table-container {
	height: 100%;
	overflow: auto;
}
.lastDay {
	background-color: #e4e4e4;
}
</style>
