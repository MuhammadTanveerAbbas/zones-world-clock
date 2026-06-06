import { describe, it, expect, beforeEach } from "vitest";
import { pomodoroStore } from "../store-pomodoro";

beforeEach(() => {
	localStorage.clear();
	pomodoroStore._reset();
	pomodoroStore.updateSettings({
		autoStartBreaks: false,
		autoStartFocus: false,
	});
});

describe("pomodoroStore", () => {
	it("has default state on first access", () => {
		const state = pomodoroStore.getState();
		expect(state.mode).toBe("focus");
		expect(state.phase).toBe("idle");
		expect(state.completedSessions).toBe(0);
		expect(state.sessions).toEqual([]);
	});

	it("returns formatted time for idle state", () => {
		const time = pomodoroStore.getFormattedTime();
		expect(time).toBe("25:00");
	});

	it("returns 0 progress when idle", () => {
		expect(pomodoroStore.getProgress()).toBe(0);
	});

	it("sets mode and resets phase", () => {
		pomodoroStore.setMode("shortBreak");
		const state = pomodoroStore.getState();
		expect(state.mode).toBe("shortBreak");
		expect(state.phase).toBe("idle");
	});

	it("updates settings", () => {
		pomodoroStore.updateSettings({ focusDuration: 30 * 60 });
		const state = pomodoroStore.getState();
		expect(state.settings.focusDuration).toBe(30 * 60);
	});

	it("start transitions to running phase", () => {
		pomodoroStore.start();
		const state = pomodoroStore.getState();
		expect(state.phase).toBe("running");
		expect(state.endTime).not.toBeNull();
	});

	it("pause transitions to paused phase", () => {
		pomodoroStore.start();
		pomodoroStore.pause();
		const state = pomodoroStore.getState();
		expect(state.phase).toBe("paused");
		expect(state.pausedRemaining).not.toBeNull();
	});

	it("reset returns to idle", () => {
		pomodoroStore.start();
		pomodoroStore.reset();
		const state = pomodoroStore.getState();
		expect(state.phase).toBe("idle");
		expect(state.endTime).toBeNull();
	});

	it("completeSession adds a session entry", () => {
		pomodoroStore.start();
		pomodoroStore.completeSession();
		const state = pomodoroStore.getState();
		expect(state.sessions.length).toBe(1);
		expect(state.sessions[0].mode).toBe("focus");
	});

	it("getRecentSessions returns sessions in reverse order", () => {
		pomodoroStore.start();
		pomodoroStore.completeSession();
		pomodoroStore.start();
		pomodoroStore.completeSession();

		const recent = pomodoroStore.getRecentSessions();
		expect(recent.length).toBe(2);
		expect(recent[0].completedAt).toBeGreaterThanOrEqual(recent[1].completedAt);
	});

	it("exportSessions returns valid JSON", () => {
		pomodoroStore.start();
		pomodoroStore.completeSession();

		const json = pomodoroStore.exportSessions();
		const parsed = JSON.parse(json);
		expect(Array.isArray(parsed)).toBe(true);
		expect(parsed.length).toBe(1);
	});

	it("persists state to localStorage", () => {
		pomodoroStore.start();
		pomodoroStore.completeSession();

		const raw = localStorage.getItem("zones-pomodoro");
		expect(raw).not.toBeNull();

		const parsed = JSON.parse(raw!);
		expect(parsed.sessions.length).toBe(1);
	});

	it("notifies subscribers on state change", () => {
		let called = false;
		const unsub = pomodoroStore.subscribe(() => {
			called = true;
		});

		pomodoroStore.start();
		expect(called).toBe(true);
		unsub();
	});
});
