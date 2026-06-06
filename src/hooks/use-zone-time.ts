"use client";

import {
	formatPeriod,
	formatTime,
	getDayDelta,
	getDeltaHours,
	getZonedTime,
} from "@/lib/time-utils";
import type { Zone } from "@/lib/zones";
import { useMemo } from "react";

export type ZoneTimeInfo = {
	delta: number;
	deltaStr: string;
	timeStr: string;
	period: string;
	dayDelta: -1 | 0 | 1;
	dayLabel: string;
};

export function useZoneTime(
	zone: Zone,
	homeId: string,
	homeTz: string,
	displayTime: Date,
	use24h: boolean,
): ZoneTimeInfo {
	return useMemo(() => {
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
	}, [zone.id, zone.tz, homeId, homeTz, displayTime.getTime(), use24h]);
}
