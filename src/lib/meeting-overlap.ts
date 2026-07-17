import { getTimezoneOffset, toZonedTime } from "date-fns-tz";
import type { Zone } from "./zones";

export type WorkingHours = {
	start: number;
	end: number;
};

export const DEFAULT_WORKING_HOURS: WorkingHours = { start: 9, end: 18 };

export type HourSegment = "core" | "edge" | "off";

export type OverlapWindow = {
	startMinutes: number;
	endMinutes: number;
	durationMinutes: number;
	zoneCount: number;
};

export function getLocalHour(date: Date, tz: string): number {
	const zoned = toZonedTime(date, tz);
	return zoned.getHours() + zoned.getMinutes() / 60 + zoned.getSeconds() / 3600;
}

export function classifyWorkingHour(
	hour: number,
	hours: WorkingHours,
): HourSegment {
	if (hour < hours.start || hour >= hours.end) return "off";
	if (hour >= hours.start + 1 && hour < hours.end - 1) return "core";
	return "edge";
}

/** 24 one-hour segments for a zone on a given reference day */
export function getWorkingHourSegments(
	tz: string,
	referenceDate: Date,
	hours: WorkingHours = DEFAULT_WORKING_HOURS,
): HourSegment[] {
	const segments: HourSegment[] = [];
	const base = new Date(referenceDate);
	base.setUTCHours(0, 0, 0, 0);

	for (let h = 0; h < 24; h++) {
		const slot = new Date(base.getTime() + h * 3600_000);
		const localHour = getLocalHour(slot, tz);
		segments.push(classifyWorkingHour(localHour, hours));
	}

	return segments;
}

function allZonesInWorkingHours(
	zones: Zone[],
	slotUtc: Date,
	hours: WorkingHours,
): boolean {
	for (const zone of zones) {
		const localHour = getLocalHour(slotUtc, zone.tz);
		if (localHour < hours.start || localHour >= hours.end) return false;
	}
	return true;
}

/**
 * Find the best contiguous overlap window (in minutes from reference midnight UTC)
 * where every zone is within working hours.
 */
export function findBestOverlapWindow(
	zones: Zone[],
	referenceDate: Date,
	hours: WorkingHours = DEFAULT_WORKING_HOURS,
	slotMinutes = 30,
): OverlapWindow | null {
	if (zones.length < 2) return null;

	const base = new Date(referenceDate);
	base.setUTCHours(0, 0, 0, 0);
	const totalSlots = (24 * 60) / slotMinutes;

	let best: OverlapWindow | null = null;
	let currentStart: number | null = null;

	for (let i = 0; i <= totalSlots; i++) {
		const inOverlap =
			i < totalSlots &&
			allZonesInWorkingHours(
				zones,
				new Date(base.getTime() + i * slotMinutes * 60_000),
				hours,
			);

		if (inOverlap && currentStart === null) {
			currentStart = i * slotMinutes;
		} else if (!inOverlap && currentStart !== null) {
			const endMinutes = i * slotMinutes;
			const duration = endMinutes - currentStart;
			if (!best || duration > best.durationMinutes) {
				best = {
					startMinutes: currentStart,
					endMinutes,
					durationMinutes: duration,
					zoneCount: zones.length,
				};
			}
			currentStart = null;
		}
	}

	return best;
}

export function formatOverlapTime(
	minutesFromMidnight: number,
	tz: string,
	referenceDate: Date,
	use24h: boolean,
): string {
	const base = new Date(referenceDate);
	base.setUTCHours(0, 0, 0, 0);
	const slot = new Date(base.getTime() + minutesFromMidnight * 60_000);
	const zoned = toZonedTime(slot, tz);
	const h = zoned.getHours();
	const m = zoned.getMinutes();
	if (use24h)
		return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
	const period = h >= 12 ? "PM" : "AM";
	const h12 = h % 12 || 12;
	return `${h12}:${String(m).padStart(2, "0")} ${period}`;
}

export function getZoneUtcOffsetHours(tz: string, date: Date): number {
	return getTimezoneOffset(tz, date) / 3_600_000;
}
