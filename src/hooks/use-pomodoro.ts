"use client";

import { useSyncExternalStore, useCallback } from "react";
import { pomodoroStore, type PomodoroMode, type PomodoroSettings } from "@/lib/store-pomodoro";
import { analyticsStore } from "@/lib/store-analytics";
import { playSessionEndChime } from "@/lib/audio-manager";

export function usePomodoro() {
	const state = useSyncExternalStore(
		pomodoroStore.subscribe,
		pomodoroStore.getState,
		pomodoroStore.getServerState,
	);

	const start = useCallback(() => pomodoroStore.start(), []);
	const pause = useCallback(() => pomodoroStore.pause(), []);
	const resume = useCallback(() => pomodoroStore.resume(), []);
	const reset = useCallback(() => pomodoroStore.reset(), []);
	const setMode = useCallback((mode: PomodoroMode) => pomodoroStore.setMode(mode), []);
	const updateSettings = useCallback(
		(s: Partial<PomodoroSettings>) => pomodoroStore.updateSettings(s),
		[],
	);

	const completeSession = useCallback(() => {
		const currentState = pomodoroStore.getState();
		if (currentState.mode === "focus" && currentState.currentSessionStart) {
			const durationMs = Date.now() - currentState.currentSessionStart;
			analyticsStore.trackSession(durationMs);
		}
		if (currentState.settings.soundEnabled) {
			playSessionEndChime();
		}
		pomodoroStore.completeSession();
	}, []);

	return {
		...state,
		remaining: pomodoroStore.getRemaining(),
		progress: pomodoroStore.getProgress(),
		formattedTime: pomodoroStore.getFormattedTime(),
		start,
		pause,
		resume,
		reset,
		setMode,
		completeSession,
		updateSettings,
	};
}
