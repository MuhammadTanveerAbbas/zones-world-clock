import { describe, it, expect, beforeEach } from "vitest";
import { analyticsStore } from "../store-analytics";

beforeEach(() => {
	localStorage.clear();
	analyticsStore._reset();
});

describe("analyticsStore", () => {
	it("returns zero stats when no sessions tracked", () => {
		const today = analyticsStore.getTodayStats();
		expect(today.focusMs).toBe(0);
		expect(today.sessions).toBe(0);

		const week = analyticsStore.getThisWeekStats();
		expect(week.focusMs).toBe(0);
		expect(week.sessions).toBe(0);

		const month = analyticsStore.getThisMonthStats();
		expect(month.focusMs).toBe(0);
		expect(month.sessions).toBe(0);

		expect(analyticsStore.getStreak()).toBe(0);
	});

	it("tracks a single session", () => {
		analyticsStore.trackSession(25 * 60 * 1000);

		const today = analyticsStore.getTodayStats();
		expect(today.focusMs).toBe(25 * 60 * 1000);
		expect(today.sessions).toBe(1);
	});

	it("accumulates multiple sessions on same day", () => {
		analyticsStore.trackSession(25 * 60 * 1000);
		analyticsStore.trackSession(25 * 60 * 1000);

		const today = analyticsStore.getTodayStats();
		expect(today.focusMs).toBe(50 * 60 * 1000);
		expect(today.sessions).toBe(2);
	});

	it("returns correct streak for consecutive days", () => {
		const today = new Date();
		const yesterday = new Date(today);
		yesterday.setDate(yesterday.getDate() - 1);
		const twoDaysAgo = new Date(today);
		twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

		const fmt = (d: Date) =>
			`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

		const todayStr = fmt(today);
		const yesterdayStr = fmt(yesterday);
		const twoDaysStr = fmt(twoDaysAgo);

		localStorage.setItem(
			"zones-analytics",
			JSON.stringify({
				history: [
					{ date: twoDaysStr, totalFocusMs: 25 * 60 * 1000, sessionsCompleted: 1 },
					{ date: yesterdayStr, totalFocusMs: 25 * 60 * 1000, sessionsCompleted: 1 },
					{ date: todayStr, totalFocusMs: 25 * 60 * 1000, sessionsCompleted: 1 },
				],
			}),
		);

		expect(analyticsStore.getStreak()).toBe(3);
	});

	it("persists to localStorage", () => {
		analyticsStore.trackSession(10 * 60 * 1000);

		const raw = localStorage.getItem("zones-analytics");
		expect(raw).not.toBeNull();

		const parsed = JSON.parse(raw!);
		expect(parsed.history.length).toBe(1);
		expect(parsed.history[0].totalFocusMs).toBe(10 * 60 * 1000);
	});

	it("returns last 7 days with correct ordering", () => {
		analyticsStore.trackSession(15 * 60 * 1000);

		const days = analyticsStore.getLast7Days();
		expect(days.length).toBe(7);
		expect(days[days.length - 1].sessions).toBe(1);
	});

	it("notifies subscribers on trackSession", () => {
		let called = false;
		const unsub = analyticsStore.subscribe(() => {
			called = true;
		});

		analyticsStore.trackSession(5 * 60 * 1000);
		expect(called).toBe(true);
		unsub();
	});
});
