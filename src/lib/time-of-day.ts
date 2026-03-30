import { formatInTimeZone } from "date-fns-tz";

export type TimeOfDay =
	| "night"
	| "dawn"
	| "morning"
	| "midday"
	| "afternoon"
	| "sunset"
	| "dusk"
	| "evening";

const PERIODS: { range: [number, number]; period: TimeOfDay }[] = [
	{ range: [0, 4], period: "night" },
	{ range: [5, 6], period: "dawn" },
	{ range: [7, 10], period: "morning" },
	{ range: [11, 13], period: "midday" },
	{ range: [14, 16], period: "afternoon" },
	{ range: [17, 18], period: "sunset" },
	{ range: [19, 20], period: "dusk" },
	{ range: [21, 23], period: "evening" },
];

const AMBIENT_INLINE_COLORS: Record<TimeOfDay, [string, string]> = {
	night: ["rgba(30, 27, 75, 0.14)", "rgba(15, 23, 42, 0.06)"],
	dawn: ["rgba(120, 53, 15, 0.12)", "rgba(136, 19, 55, 0.06)"],
	morning: ["rgba(251, 191, 36, 0.10)", "rgba(254, 240, 138, 0.04)"],
	midday: ["rgba(253, 224, 71, 0.10)", "rgba(186, 230, 253, 0.04)"],
	afternoon: ["rgba(253, 186, 116, 0.08)", "rgba(253, 230, 138, 0.04)"],
	sunset: ["rgba(249, 115, 22, 0.14)", "rgba(251, 113, 133, 0.07)"],
	dusk: ["rgba(88, 28, 135, 0.12)", "rgba(49, 46, 129, 0.06)"],
	evening: ["rgba(15, 23, 42, 0.12)", "rgba(30, 27, 75, 0.06)"],
};

// Country flag color themes - primary and secondary colors from each flag
const COUNTRY_COLORS: Record<string, [string, string]> = {
	pk: ["rgba(1, 66, 37, 0.12)", "rgba(255, 255, 255, 0.08)"], // Pakistan - Green & White
	us: ["rgba(60, 59, 110, 0.12)", "rgba(178, 34, 52, 0.08)"], // USA - Blue & Red
	gb: ["rgba(1, 33, 105, 0.12)", "rgba(200, 16, 46, 0.08)"], // UK - Blue & Red
	fr: ["rgba(0, 35, 149, 0.12)", "rgba(237, 41, 57, 0.08)"], // France - Blue & Red
	ae: ["rgba(0, 122, 61, 0.12)", "rgba(206, 17, 38, 0.08)"], // UAE - Green & Red
	jp: ["rgba(188, 0, 45, 0.12)", "rgba(255, 255, 255, 0.06)"], // Japan - Red & White
	au: ["rgba(0, 0, 139, 0.12)", "rgba(255, 255, 255, 0.06)"], // Australia - Blue & White
	de: ["rgba(0, 0, 0, 0.10)", "rgba(221, 0, 0, 0.08)"], // Germany - Black & Red
	cn: ["rgba(222, 41, 16, 0.12)", "rgba(255, 222, 0, 0.08)"], // China - Red & Yellow
	in: ["rgba(255, 153, 51, 0.10)", "rgba(19, 136, 8, 0.08)"], // India - Orange & Green
	br: ["rgba(0, 156, 59, 0.12)", "rgba(254, 223, 0, 0.08)"], // Brazil - Green & Yellow
	ca: ["rgba(255, 0, 0, 0.12)", "rgba(255, 255, 255, 0.06)"], // Canada - Red & White
	mx: ["rgba(0, 104, 71, 0.12)", "rgba(206, 17, 38, 0.08)"], // Mexico - Green & Red
	it: ["rgba(0, 146, 70, 0.12)", "rgba(206, 43, 55, 0.08)"], // Italy - Green & Red
	es: ["rgba(255, 196, 0, 0.10)", "rgba(198, 11, 30, 0.08)"], // Spain - Yellow & Red
	kr: ["rgba(205, 11, 30, 0.12)", "rgba(0, 71, 160, 0.08)"], // South Korea - Red & Blue
	sa: ["rgba(0, 98, 51, 0.12)", "rgba(255, 255, 255, 0.06)"], // Saudi Arabia - Green & White
	tr: ["rgba(227, 10, 23, 0.12)", "rgba(255, 255, 255, 0.06)"], // Turkey - Red & White
	ru: ["rgba(0, 57, 166, 0.12)", "rgba(213, 43, 30, 0.08)"], // Russia - Blue & Red
	za: ["rgba(0, 122, 77, 0.12)", "rgba(252, 181, 20, 0.08)"], // South Africa - Green & Yellow
	eg: ["rgba(206, 17, 38, 0.12)", "rgba(255, 255, 255, 0.06)"], // Egypt - Red & White
	ng: ["rgba(0, 135, 81, 0.12)", "rgba(255, 255, 255, 0.06)"], // Nigeria - Green & White
	ar: ["rgba(116, 172, 223, 0.12)", "rgba(255, 255, 255, 0.06)"], // Argentina - Blue & White
	th: ["rgba(45, 42, 74, 0.12)", "rgba(237, 28, 36, 0.08)"], // Thailand - Blue & Red
	sg: ["rgba(237, 28, 36, 0.12)", "rgba(255, 255, 255, 0.06)"], // Singapore - Red & White
	my: ["rgba(204, 0, 0, 0.12)", "rgba(0, 0, 102, 0.08)"], // Malaysia - Red & Blue
	nz: ["rgba(0, 36, 125, 0.12)", "rgba(204, 0, 0, 0.08)"], // New Zealand - Blue & Red
	se: ["rgba(0, 106, 167, 0.12)", "rgba(254, 204, 0, 0.08)"], // Sweden - Blue & Yellow
	no: ["rgba(186, 12, 47, 0.12)", "rgba(0, 40, 104, 0.08)"], // Norway - Red & Blue
	dk: ["rgba(198, 12, 48, 0.12)", "rgba(255, 255, 255, 0.06)"], // Denmark - Red & White
	fi: ["rgba(0, 47, 108, 0.12)", "rgba(255, 255, 255, 0.06)"], // Finland - Blue & White
	nl: ["rgba(174, 28, 40, 0.12)", "rgba(33, 70, 139, 0.08)"], // Netherlands - Red & Blue
	be: ["rgba(0, 0, 0, 0.10)", "rgba(253, 218, 36, 0.08)"], // Belgium - Black & Yellow
	ch: ["rgba(255, 0, 0, 0.12)", "rgba(255, 255, 255, 0.06)"], // Switzerland - Red & White
	at: ["rgba(237, 41, 57, 0.12)", "rgba(255, 255, 255, 0.06)"], // Austria - Red & White
	pl: ["rgba(220, 20, 60, 0.12)", "rgba(255, 255, 255, 0.06)"], // Poland - Red & White
	gr: ["rgba(13, 94, 175, 0.12)", "rgba(255, 255, 255, 0.06)"], // Greece - Blue & White
	pt: ["rgba(0, 102, 0, 0.12)", "rgba(255, 0, 0, 0.08)"], // Portugal - Green & Red
	ie: ["rgba(22, 155, 98, 0.12)", "rgba(255, 136, 62, 0.08)"], // Ireland - Green & Orange
	il: ["rgba(0, 56, 184, 0.12)", "rgba(255, 255, 255, 0.06)"], // Israel - Blue & White
	ph: ["rgba(0, 56, 168, 0.12)", "rgba(206, 17, 38, 0.08)"], // Philippines - Blue & Red
	vn: ["rgba(218, 37, 29, 0.12)", "rgba(255, 255, 0, 0.08)"], // Vietnam - Red & Yellow
	id: ["rgba(255, 0, 0, 0.12)", "rgba(255, 255, 255, 0.06)"], // Indonesia - Red & White
	bd: ["rgba(0, 106, 78, 0.12)", "rgba(244, 42, 65, 0.08)"], // Bangladesh - Green & Red
	cl: ["rgba(0, 56, 168, 0.12)", "rgba(217, 0, 0, 0.08)"], // Chile - Blue & Red
	co: ["rgba(252, 209, 22, 0.10)", "rgba(0, 56, 168, 0.08)"], // Colombia - Yellow & Blue
	pe: ["rgba(217, 16, 35, 0.12)", "rgba(255, 255, 255, 0.06)"], // Peru - Red & White
};

export function getTimeOfDay(date: Date, tz: string): TimeOfDay {
	const hour = Number.parseInt(formatInTimeZone(date, tz, "H"), 10);
	for (const { range, period } of PERIODS) {
		if (hour >= range[0] && hour <= range[1]) return period;
	}
	return "night";
}

export function getAmbientInlineGradient(
	period: TimeOfDay,
	direction: "right" | "bottom" = "right",
	countryCode?: string,
): string {
	const [timeA, timeB] = AMBIENT_INLINE_COLORS[period];

	// If country code provided, blend with country colors
	if (countryCode && COUNTRY_COLORS[countryCode]) {
		const [countryA, countryB] = COUNTRY_COLORS[countryCode];
		return `linear-gradient(to ${direction}, ${countryA}, ${timeA}, ${countryB}, ${timeB}, transparent)`;
	}

	return `linear-gradient(to ${direction}, ${timeA}, ${timeB}, transparent)`;
}
