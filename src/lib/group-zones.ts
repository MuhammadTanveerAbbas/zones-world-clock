import {
	formatPeriod,
	formatTime,
	getDayDelta,
	getDeltaHours,
	getTimezoneAbbreviation,
	getZonedTime,
	isDST,
} from "./time-utils";
import type { Zone } from "./zones";

export type ZoneGroup = {
	offset: number;
	zones: Zone[];
	tz: string;
	timeStr: string;
	period: string;
	dayDelta: -1 | 0 | 1;
	abbreviation: string;
	dst: boolean;
};

export function groupZones(
	zones: Zone[],
	homeId: string,
	homeTz: string,
	displayTime: Date,
	use24h: boolean,
): ZoneGroup[] {
	const groups = new Map<number, Zone[]>();

	for (const zone of zones) {
		const delta =
			zone.id === homeId ? 0 : getDeltaHours(homeTz, zone.tz, displayTime);
		if (!groups.has(delta)) groups.set(delta, []);
		const bucket = groups.get(delta);
		if (bucket) bucket.push(zone);
	}

	const homeZoned = getZonedTime(displayTime, homeTz);
	const sortedEntries = Array.from(groups.entries()).sort(([a], [b]) => a - b);
	const result: ZoneGroup[] = [];

	// Always render home group first (offset 0), then sorted by offset
	const homeGroup = groups.get(0);
	if (homeGroup) {
		result.push({
			offset: 0,
			zones: homeGroup,
			tz: homeTz,
			timeStr: formatTime(displayTime, homeTz, use24h),
			period: use24h ? "" : formatPeriod(displayTime, homeTz),
			dayDelta: 0,
			abbreviation: getTimezoneAbbreviation(homeTz, displayTime),
			dst: isDST(homeTz, displayTime),
		});
	}

	for (const [offset, groupZones] of sortedEntries) {
		if (offset === 0) continue;
		const tz = groupZones[0].tz;
		const targetZoned = getZonedTime(displayTime, tz);
		result.push({
			offset,
			zones: groupZones,
			tz,
			timeStr: formatTime(displayTime, tz, use24h),
			period: use24h ? "" : formatPeriod(displayTime, tz),
			dayDelta: getDayDelta(homeZoned, targetZoned),
			abbreviation: getTimezoneAbbreviation(tz, displayTime),
			dst: isDST(tz, displayTime),
		});
	}

	return result;
}
