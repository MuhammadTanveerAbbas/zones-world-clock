import { formatInTimeZone, getTimezoneOffset, toZonedTime } from "date-fns-tz";

export function getZonedTime(base: Date, tz: string): Date {
	return toZonedTime(base, tz);
}

/** Format a float hour delta as +5:30h, -3:30h, +12:45h, etc. */
export function formatDeltaHours(delta: number): string {
	if (delta === 0) return "";
	const sign = delta > 0 ? "+" : "-";
	const abs = Math.abs(delta);
	const hours = Math.floor(abs);
	const minutes = Math.round((abs - hours) * 60);
	if (minutes === 0) return `${sign}${hours}h`;
	return `${sign}${hours}:${String(minutes).padStart(2, "0")}h`;
}

export function formatTime(date: Date, tz: string, use24h = false): string {
	if (use24h) return formatInTimeZone(date, tz, "HH:mm");
	return formatInTimeZone(date, tz, "hh:mm");
}

export function formatSeconds(date: Date, tz: string): string {
	return formatInTimeZone(date, tz, "ss");
}

export function formatTimeWithSeconds(
	date: Date,
	tz: string,
	use24h = false,
): { time: string; seconds: string } {
	return {
		time: formatTime(date, tz, use24h),
		seconds: formatSeconds(date, tz),
	};
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

export type DSTTransitionInfo = {
	daysUntil: number;
	isSpringForward: boolean;
	label: string;
};

/** Returns DST transition info when a zone's offset changes within 7 days */
export function getDSTTransitionInfo(
	tz: string,
	date: Date,
): DSTTransitionInfo | null {
	try {
		const currentOffset = getTimezoneOffset(tz, date);
		for (let d = 1; d <= 7; d++) {
			const future = new Date(date.getTime() + d * 86_400_000);
			const futureOffset = getTimezoneOffset(tz, future);
			if (futureOffset !== currentOffset) {
				const isSpringForward = futureOffset > currentOffset;
				const verb = isSpringForward ? "forward" : "back";
				const label =
					d === 1 ? `Clocks ${verb} tomorrow` : `Clocks ${verb} in ${d}d`;
				return { daysUntil: d, isSpringForward, label };
			}
		}
		return null;
	} catch {
		return null;
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
	secondsStr: string;
	period: string;
	dayDelta: -1 | 0 | 1;
	dayLabel: string;
	dstTransition: DSTTransitionInfo | null;
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
	const { time: timeStr, seconds: secondsStr } = formatTimeWithSeconds(
		displayTime,
		zone.tz,
		use24h,
	);
	const period = use24h ? "" : formatPeriod(displayTime, zone.tz);
	const deltaStr = formatDeltaHours(delta);
	const dayLabel = dayDelta !== 0 ? (dayDelta > 0 ? "+1d" : "-1d") : "";
	const dstTransition = getDSTTransitionInfo(zone.tz, displayTime);

	return {
		delta,
		deltaStr,
		timeStr,
		secondsStr,
		period,
		dayDelta,
		dayLabel,
		dstTransition,
	};
}
