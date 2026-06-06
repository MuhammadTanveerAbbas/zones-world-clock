export type AnalyticsDay = {
	date: string;
	totalFocusMs: number;
	sessionsCompleted: number;
};

export type AnalyticsState = {
	history: AnalyticsDay[];
};

const STORAGE_KEY = "zones-analytics";

const DEFAULT_ANALYTICS_STATE: AnalyticsState = {
	history: [],
};

type Listener = () => void;

let state: AnalyticsState = { ...DEFAULT_ANALYTICS_STATE };
let initialized = false;
const listeners = new Set<Listener>();

function load(): AnalyticsState {
	if (typeof window === "undefined") return { ...DEFAULT_ANALYTICS_STATE };
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return { ...DEFAULT_ANALYTICS_STATE };
		return JSON.parse(raw) as AnalyticsState;
	} catch {
		return { ...DEFAULT_ANALYTICS_STATE };
	}
}

function save(s: AnalyticsState) {
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

function todayStr(): string {
	const d = new Date();
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function notify() {
	for (const listener of listeners) listener();
}

let analyticsServerSnapshot: AnalyticsState | null = null;

export const analyticsStore = {
	getState(): AnalyticsState {
		init();
		return state;
	},

	getServerState(): AnalyticsState {
		if (!analyticsServerSnapshot) {
			analyticsServerSnapshot = { ...DEFAULT_ANALYTICS_STATE };
		}
		return analyticsServerSnapshot;
	},

	subscribe(listener: Listener): () => void {
		listeners.add(listener);
		return () => listeners.delete(listener);
	},

	trackSession(durationMs: number) {
		init();
		const today = todayStr();
		const existing = state.history.find((d) => d.date === today);
		const newHistory = existing
			? state.history.map((d) =>
					d.date === today
						? { ...d, totalFocusMs: d.totalFocusMs + durationMs, sessionsCompleted: d.sessionsCompleted + 1 }
						: d,
				)
			: [...state.history, { date: today, totalFocusMs: durationMs, sessionsCompleted: 1 }];

		const cutoff = new Date();
		cutoff.setDate(cutoff.getDate() - 90);
		const cutoffStr = `${cutoff.getFullYear()}-${String(cutoff.getMonth() + 1).padStart(2, "0")}-${String(cutoff.getDate()).padStart(2, "0")}`;
		const pruned = newHistory.filter((d) => d.date >= cutoffStr);

		state = { ...state, history: pruned };
		save(state);
		notify();
	},

	getTodayStats(): { focusMs: number; sessions: number } {
		init();
		const today = todayStr();
		const day = state.history.find((d) => d.date === today);
		return {
			focusMs: day?.totalFocusMs ?? 0,
			sessions: day?.sessionsCompleted ?? 0,
		};
	},

	getThisWeekStats(): { focusMs: number; sessions: number } {
		init();
		const now = new Date();
		const dayOfWeek = now.getDay();
		const monday = new Date(now);
		monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
		const mondayStr = `${monday.getFullYear()}-${String(monday.getMonth() + 1).padStart(2, "0")}-${String(monday.getDate()).padStart(2, "0")}`;

		let focusMs = 0;
		let sessions = 0;
		for (const day of state.history) {
			if (day.date >= mondayStr) {
				focusMs += day.totalFocusMs;
				sessions += day.sessionsCompleted;
			}
		}
		return { focusMs, sessions };
	},

	getThisMonthStats(): { focusMs: number; sessions: number } {
		init();
		const now = new Date();
		const monthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

		let focusMs = 0;
		let sessions = 0;
		for (const day of state.history) {
			if (day.date.startsWith(monthStr)) {
				focusMs += day.totalFocusMs;
				sessions += day.sessionsCompleted;
			}
		}
		return { focusMs, sessions };
	},

	getStreak(): number {
		init();
		let streak = 0;
		const today = new Date();
		for (let i = 0; i < 365; i++) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
			if (state.history.some((h) => h.date === dateStr && h.sessionsCompleted > 0)) {
				streak++;
			} else if (i > 0) {
				break;
			}
		}
		return streak;
	},

	getLast7Days(): { date: string; focusMs: number; sessions: number }[] {
		init();
		const result: { date: string; focusMs: number; sessions: number }[] = [];
		const today = new Date();
		for (let i = 6; i >= 0; i--) {
			const d = new Date(today);
			d.setDate(d.getDate() - i);
			const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
			const day = state.history.find((h) => h.date === dateStr);
			result.push({
				date: dateStr,
				focusMs: day?.totalFocusMs ?? 0,
				sessions: day?.sessionsCompleted ?? 0,
			});
		}
		return result;
	},

	_reset() {
		state = { ...DEFAULT_ANALYTICS_STATE };
		initialized = false;
		listeners.clear();
	},
};
