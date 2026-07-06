import { formatInTimeZone, getTimezoneOffset, toZonedTime } from "date-fns-tz";

export function getZonedTime(base: Date, tz: string): Date {
	return toZonedTime(base, tz);
}

export function formatTime(date: Date, tz: string, use24h = false): string {
	if (use24h) return formatInTimeZone(date, tz, "HH:mm");
	return formatInTimeZone(date, tz, "hh:mm");
}

export function formatPeriod(date: Date, tz: string): string {
	return formatInTimeZone(date, tz, "a").toUpperCase();
}

export function getDeltaHours(
	baseZone: string,
	targetZone: string,
	base: Date,
): number {
	const baseOffset = getTimezoneOffset(baseZone, base);
	const targetOffset = getTimezoneOffset(targetZone, base);
	return (targetOffset - baseOffset) / (60 * 60 * 1000);
}

export function formatDate(date: Date, tz: string): string {
	try {
		return formatInTimeZone(date, tz, "EEE, MMM d");
	} catch {
		return "";
	}
}

export function getTimezoneAbbreviation(tz: string, date: Date): string {
	try {
		const formatter = new Intl.DateTimeFormat("en", {
			timeZone: tz,
			timeZoneName: "short",
		});
		const parts = formatter.formatToParts(date);
		return parts.find((p) => p.type === "timeZoneName")?.value || "";
	} catch {
		return "";
	}
}

export function isDST(tz: string, date: Date): boolean {
	try {
		const jan = new Date(date.getFullYear(), 0, 1);
		const jul = new Date(date.getFullYear(), 6, 1);
		const janOffset = getTimezoneOffset(tz, jan);
		const julOffset = getTimezoneOffset(tz, jul);
		return janOffset !== julOffset;
	} catch {
		return false;
	}
}

/**
 * Compares the calendar day between two zoned dates.
 * Uses UTC date values from the zoned representations to avoid
 * cross-month boundary issues (e.g. day 31 vs day 1).
 */
export function getDayDelta(homeZoned: Date, targetZoned: Date): -1 | 0 | 1 {
	const homeDay = homeZoned.getDate();
	const targetDay = targetZoned.getDate();
	const homeMonth = homeZoned.getMonth();
	const targetMonth = targetZoned.getMonth();
	const homeYear = homeZoned.getFullYear();
	const targetYear = targetZoned.getFullYear();

	if (targetYear > homeYear) return 1;
	if (targetYear < homeYear) return -1;
	if (targetMonth > homeMonth) return 1;
	if (targetMonth < homeMonth) return -1;
	if (targetDay > homeDay) return 1;
	if (targetDay < homeDay) return -1;
	return 0;
}

export type ZoneTimeInfo = {
	delta: number;
	deltaStr: string;
	timeStr: string;
	period: string;
	dayDelta: -1 | 0 | 1;
	dayLabel: string;
};

export function getZoneTimeInfo(
	zone: { id: string; tz: string },
	homeId: string,
	homeTz: string,
	displayTime: Date,
	use24h: boolean,
): ZoneTimeInfo {
	const isHome = zone.id === homeId;
	const delta = isHome ? 0 : getDeltaHours(homeTz, zone.tz, displayTime);
	const homeZoned = getZonedTime(displayTime, homeTz);
	const targetZoned = getZonedTime(displayTime, zone.tz);
	const dayDelta = isHome ? 0 : getDayDelta(homeZoned, targetZoned);
	const timeStr = formatTime(displayTime, zone.tz, use24h);
	const period = use24h ? "" : formatPeriod(displayTime, zone.tz);
	const deltaSign = delta > 0 ? "+" : "";
	const deltaStr = delta !== 0 ? `${deltaSign}${delta}h` : "";
	const dayLabel = dayDelta !== 0 ? (dayDelta > 0 ? "+1d" : "-1d") : "";

	return { delta, deltaStr, timeStr, period, dayDelta, dayLabel };
}
