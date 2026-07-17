import { describe, expect, it } from "vitest";
import {
	DEFAULT_WORKING_HOURS,
	findBestOverlapWindow,
	getWorkingHourSegments,
} from "../meeting-overlap";
import {
	formatDeltaHours,
	getDSTTransitionInfo,
	getZoneTimeInfo,
} from "../time-utils";
import type { Zone } from "../zones";

describe("formatDeltaHours", () => {
	it("formats whole-hour deltas", () => {
		expect(formatDeltaHours(5)).toBe("+5h");
		expect(formatDeltaHours(-8)).toBe("-8h");
	});

	it("formats fractional-offset deltas", () => {
		expect(formatDeltaHours(5.5)).toBe("+5:30h");
		expect(formatDeltaHours(5.75)).toBe("+5:45h");
		expect(formatDeltaHours(-3.5)).toBe("-3:30h");
		expect(formatDeltaHours(12.75)).toBe("+12:45h");
	});

	it("returns empty string for zero", () => {
		expect(formatDeltaHours(0)).toBe("");
	});
});

describe("getZoneTimeInfo", () => {
	it("includes seconds in time info", () => {
		const date = new Date("2026-07-17T12:34:56Z");
		const info = getZoneTimeInfo(
			{ id: "nyc", tz: "America/New_York" },
			"home",
			"Europe/London",
			date,
			true,
		);
		expect(info.secondsStr).toMatch(/^\d{2}$/);
		expect(info.timeStr).toBeTruthy();
	});
});

describe("getDSTTransitionInfo", () => {
	it("returns null when no transition within 7 days", () => {
		const date = new Date("2026-01-15T12:00:00Z");
		const info = getDSTTransitionInfo("Asia/Tokyo", date);
		expect(info).toBeNull();
	});
});

describe("meeting-overlap", () => {
	const zones: Zone[] = [
		{
			id: "nyc",
			label: "New York",
			sublabel: "US",
			countryCode: "us",
			tz: "America/New_York",
		},
		{
			id: "london",
			label: "London",
			sublabel: "UK",
			countryCode: "gb",
			tz: "Europe/London",
		},
		{
			id: "paris",
			label: "Paris",
			sublabel: "France",
			countryCode: "fr",
			tz: "Europe/Paris",
		},
	];

	it("returns 24 hour segments per zone", () => {
		const date = new Date("2026-07-17T12:00:00Z");
		const segments = getWorkingHourSegments(
			"Asia/Kolkata",
			date,
			DEFAULT_WORKING_HOURS,
		);
		expect(segments).toHaveLength(24);
		expect(segments.every((s) => ["core", "edge", "off"].includes(s))).toBe(
			true,
		);
	});

	it("finds overlap window for 3+ zones including fractional offset", () => {
		const date = new Date("2026-07-17T12:00:00Z");
		const window = findBestOverlapWindow(zones, date, DEFAULT_WORKING_HOURS);
		expect(window).not.toBeNull();
		if (window) {
			expect(window.durationMinutes).toBeGreaterThan(0);
			expect(window.zoneCount).toBe(3);
		}
	});
});
