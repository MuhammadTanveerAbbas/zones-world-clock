import { formatInTimeZone, getTimezoneOffset } from "date-fns-tz";
import { formatDeltaHours } from "./time-utils";
import type { Zone } from "./zones";

export type TimeExportFormat = "plain" | "markdown";

export function formatZoneTimesPlain(
	zones: Zone[],
	homeId: string,
	homeTz: string,
	date: Date,
	use24h: boolean,
): string {
	const lines: string[] = [];
	for (const zone of zones) {
		const isHome = zone.id === homeId;
		const timeFmt = use24h ? "HH:mm:ss" : "hh:mm:ss a";
		const time = formatInTimeZone(date, zone.tz, timeFmt);
		const dateStr = formatInTimeZone(date, zone.tz, "EEE, MMM d");
		const delta = isHome
			? ""
			: ` (${formatDeltaHours(
					(getTimezoneOffset(homeTz, date) - getTimezoneOffset(zone.tz, date)) /
						3_600_000,
				)})`;
		const homeTag = isHome ? " [HOME]" : "";
		lines.push(`${zone.label}${homeTag}: ${time} — ${dateStr}${delta}`);
	}
	return lines.join("\n");
}

export function formatZoneTimesMarkdown(
	zones: Zone[],
	homeId: string,
	homeTz: string,
	date: Date,
	use24h: boolean,
): string {
	const timeFmt = use24h ? "HH:mm:ss" : "hh:mm:ss a";
	const rows = zones.map((zone) => {
		const isHome = zone.id === homeId;
		const time = formatInTimeZone(date, zone.tz, timeFmt);
		const dateStr = formatInTimeZone(date, zone.tz, "EEE, MMM d");
		const delta = isHome
			? "—"
			: formatDeltaHours(
					(getTimezoneOffset(homeTz, date) - getTimezoneOffset(zone.tz, date)) /
						3_600_000,
				);
		return `| ${zone.label}${isHome ? " ★" : ""} | ${time} | ${dateStr} | ${delta} |`;
	});

	return [
		"| Zone | Time | Date | Δ from home |",
		"| --- | --- | --- | --- |",
		...rows,
	].join("\n");
}

export function formatZoneTimes(
	zones: Zone[],
	homeId: string,
	homeTz: string,
	date: Date,
	use24h: boolean,
	format: TimeExportFormat = "plain",
): string {
	if (format === "markdown") {
		return formatZoneTimesMarkdown(zones, homeId, homeTz, date, use24h);
	}
	return formatZoneTimesPlain(zones, homeId, homeTz, date, use24h);
}
