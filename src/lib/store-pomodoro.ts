import { formatInTimeZone } from "date-fns-tz";

export type PomodoroMode = "focus" | "shortBreak" | "longBreak" | "custom";

export type PomodoroPhase = "idle" | "running" | "paused" | "completed";

export type PomodoroSettings = {
	focusDuration: number;
	shortBreakDuration: number;
	longBreakDuration: number;
	longBreakInterval: number;
	customDuration: number;
	autoStartBreaks: boolean;
	autoStartFocus: boolean;
	notificationsEnabled: boolean;
	soundEnabled: boolean;
};

export type PomodoroSession = {
	id: string;
	mode: PomodoroMode;
	startedAt: number;
	completedAt: number;
	duration: number;
};

export type PomodoroState = {
	mode: PomodoroMode;
	phase: PomodoroPhase;
	endTime: number | null;
	pausedRemaining: number | null;
	completedSessions: number;
	currentSessionStart: number | null;
	settings: PomodoroSettings;
	sessions: PomodoroSession[];
	version?: number;
};

const STORAGE_KEY = "zones-pomodoro";
const CURRENT_VERSION = 1;

export const DEFAULT_SETTINGS: PomodoroSettings = {
	focusDuration: 25 * 60,
	shortBreakDuration: 5 * 60,
	longBreakDuration: 15 * 60,
	longBreakInterval: 4,
	customDuration: 30 * 60,
	autoStartBreaks: true,
	autoStartFocus: true,
	notificationsEnabled: true,
	soundEnabled: true,
};

export const DEFAULT_POMODORO_STATE: PomodoroState = {
	mode: "focus",
	phase: "idle",
	endTime: null,
	pausedRemaining: null,
	completedSessions: 0,
	currentSessionStart: null,
	settings: { ...DEFAULT_SETTINGS },
	sessions: [],
	version: CURRENT_VERSION,
};

type Listener = () => void;

let state: PomodoroState = { ...DEFAULT_POMODORO_STATE };
let initialized = false;
const listeners = new Set<Listener>();

function load(): PomodoroState {
	if (typeof window === "undefined") return { ...DEFAULT_POMODORO_STATE };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { ...DEFAULT_POMODORO_STATE };
		const parsed = JSON.parse(raw) as Partial<PomodoroState>;
		if (!parsed.version || parsed.version < CURRENT_VERSION) {
			return { ...DEFAULT_POMODORO_STATE };
		}
		return { ...DEFAULT_POMODORO_STATE, ...parsed, settings: { ...DEFAULT_SETTINGS, ...parsed.settings } };
	} catch {
		return { ...DEFAULT_POMODORO_STATE };
	}
}

function save(s: PomodoroState) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
	} catch {}
}

function init() {
	if (initialized) return;
	initialized = true;
	state = load();
}

function getCurrentDuration(state: PomodoroState): number {
	const { mode, settings } = state;
	switch (mode) {
		case "focus":
			return settings.focusDuration;
		case "shortBreak":
			return settings.shortBreakDuration;
		case "longBreak":
			return settings.longBreakDuration;
		case "custom":
			return settings.customDuration;
	}
}

function notify() {
	for (const listener of listeners) listener();
}

export function requestNotificationPermission() {
	if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "default") {
		Notification.requestPermission();
	}
}

export function sendCompletionNotification(mode: PomodoroMode) {
	if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
		const titles: Record<PomodoroMode, string> = {
			focus: "Focus session complete!",
			shortBreak: "Short break over!",
			longBreak: "Long break over!",
			custom: "Custom session complete!",
		};
		new Notification(titles[mode], {
			body: mode === "focus" ? "Time for a break." : "Ready to focus?",
			icon: "/favicon.svg",
		});
	}
}

let pomodoroServerSnapshot: PomodoroState | null = null;

export const pomodoroStore = {
	getState(): PomodoroState {
		init();
		return state;
	},

	getServerState(): PomodoroState {
		if (!pomodoroServerSnapshot) {
			pomodoroServerSnapshot = { ...DEFAULT_POMODORO_STATE };
		}
		return pomodoroServerSnapshot;
	},

	subscribe(listener: Listener): () => void {
		listeners.add(listener);
		return () => listeners.delete(listener);
	},

	setState(partial: Partial<PomodoroState>) {
		init();
		state = { ...state, ...partial };
		save(state);
		notify();
	},

	getRemaining(): number {
		init();
		const durationMs = getCurrentDuration(state) * 1000;
		if (state.phase === "idle") return durationMs;
		if (state.phase === "paused" && state.pausedRemaining !== null) return state.pausedRemaining;
		if (state.phase === "running" && state.endTime !== null) {
			return Math.max(0, state.endTime - Date.now());
		}
		return durationMs;
	},

	getProgress(): number {
		const total = getCurrentDuration(state) * 1000;
		const remaining = this.getRemaining();
		return total > 0 ? 1 - remaining / total : 0;
	},

	getFormattedTime(): string {
		const remainingMs = this.getRemaining();
		const totalSec = Math.ceil(remainingMs / 1000);
		const min = Math.floor(totalSec / 60);
		const sec = totalSec % 60;
		return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
	},

	setMode(mode: PomodoroMode) {
		this.setState({ mode, phase: "idle", endTime: null, pausedRemaining: null });
	},

	start() {
		init();
		if (state.phase === "running") return;
		requestNotificationPermission();
		const duration = state.phase === "paused" && state.pausedRemaining !== null
			? state.pausedRemaining
			: getCurrentDuration(state) * 1000;
		const now = Date.now();
		this.setState({
			phase: "running",
			endTime: now + duration,
			pausedRemaining: null,
			currentSessionStart: state.phase === "idle" ? now : state.currentSessionStart,
		});
	},

	pause() {
		init();
		if (state.phase !== "running" || state.endTime === null) return;
		const remaining = Math.max(0, state.endTime - Date.now());
		this.setState({ phase: "paused", pausedRemaining: remaining, endTime: null });
	},

	resume() {
		this.start();
	},

	reset() {
		this.setState({ phase: "idle", endTime: null, pausedRemaining: null, currentSessionStart: null });
	},

	skip() {
		this.completeSession();
	},

	completeSession() {
		init();
		const now = Date.now();
		const session: PomodoroSession = {
			id: `pomo-${now}-${Math.random().toString(36).slice(2, 6)}`,
			mode: state.mode,
			startedAt: state.currentSessionStart || now,
			completedAt: now,
			duration: state.mode === "focus" ? state.settings.focusDuration : getCurrentDuration(state),
		};
		const newCompleted = state.mode === "focus" ? state.completedSessions + 1 : state.completedSessions;
		const allSessions = [...state.sessions, session];

		if (state.settings.notificationsEnabled) {
			sendCompletionNotification(state.mode);
		}

		this.setState({
			phase: "idle",
			endTime: null,
			pausedRemaining: null,
			currentSessionStart: null,
			completedSessions: newCompleted,
			sessions: allSessions.slice(-500),
		});

		if (state.settings.autoStartBreaks || state.settings.autoStartFocus) {
			const nextMode = this.getNextMode(state.mode, newCompleted);
			this.setState({ mode: nextMode });
			const shouldAuto = nextMode === "focus" ? state.settings.autoStartFocus : state.settings.autoStartBreaks;
			if (shouldAuto) {
				setTimeout(() => {
					init();
					const duration = getCurrentDuration(state) * 1000;
					const n = Date.now();
					state = { ...state, phase: "running", endTime: n + duration, currentSessionStart: n };
					save(state);
					notify();
				}, 500);
			}
		}
	},

	getNextMode(currentMode: PomodoroMode, completedCount: number): PomodoroMode {
		if (currentMode === "focus") {
			return completedCount % state.settings.longBreakInterval === 0 ? "longBreak" : "shortBreak";
		}
		return "focus";
	},

	updateSettings(partial: Partial<PomodoroSettings>) {
		init();
		const newSettings = { ...state.settings, ...partial };
		this.setState({ settings: newSettings });
	},

	getRecentSessions(count = 50): PomodoroSession[] {
		init();
		return state.sessions.slice(-count).reverse();
	},

	exportSessions(): string {
		init();
		return JSON.stringify(state.sessions, null, 2);
	},

	_reset() {
		state = { ...DEFAULT_POMODORO_STATE };
		initialized = false;
		listeners.clear();
	},
};
