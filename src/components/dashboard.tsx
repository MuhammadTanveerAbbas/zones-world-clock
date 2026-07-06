"use client";

import { analyticsStore } from "@/lib/store-analytics";
import { type PomodoroSession, pomodoroStore } from "@/lib/store-pomodoro";
import { useCallback, useState, useSyncExternalStore } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { OverlayPanel } from "./ui/overlay-panel";

function formatMinutes(ms: number): string {
	const min = Math.round(ms / 60000);
	if (min < 60) return `${min}m`;
	const h = Math.floor(min / 60);
	const m = min % 60;
	return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

function getDayLabel(dateStr: string): string {
	const d = new Date(dateStr);
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (dateStr === today.toISOString().slice(0, 10)) return "Today";
	if (dateStr === yesterday.toISOString().slice(0, 10)) return "Yesterday";
	return d.toLocaleDateString("en-US", { weekday: "short" });
}

function formatSessionTime(ts: number): string {
	const d = new Date(ts);
	const today = new Date();
	const yesterday = new Date(today);
	yesterday.setDate(yesterday.getDate() - 1);

	if (d.toDateString() === today.toDateString()) {
		return d.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
		});
	}
	if (d.toDateString() === yesterday.toDateString()) {
		return `Yesterday ${d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}`;
	}
	return d.toLocaleDateString("en-US", {
		month: "short",
		day: "numeric",
		hour: "2-digit",
		minute: "2-digit",
	});
}

function sessionLabel(mode: PomodoroSession["mode"]): string {
	switch (mode) {
		case "focus":
			return "Focus";
		case "shortBreak":
			return "Short break";
		case "longBreak":
			return "Long break";
		case "custom":
			return "Custom";
	}
}

function formatDuration(sec: number): string {
	if (sec < 60) return `${sec}s`;
	const min = Math.round(sec / 60);
	if (min < 60) return `${min}m`;
	const h = Math.floor(min / 60);
	const m = min % 60;
	return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function Dashboard({
	open,
	onClose,
}: { open: boolean; onClose: () => void }) {
	const [showSessions, setShowSessions] = useState(false);

	useSyncExternalStore(
		analyticsStore.subscribe,
		analyticsStore.getState,
		analyticsStore.getServerState,
	);
	useSyncExternalStore(
		pomodoroStore.subscribe,
		pomodoroStore.getState,
		pomodoroStore.getServerState,
	);

	const todayStats = analyticsStore.getTodayStats();
	const weekStats = analyticsStore.getThisWeekStats();
	const monthStats = analyticsStore.getThisMonthStats();
	const streak = analyticsStore.getStreak();
	const last7Days = analyticsStore.getLast7Days();
	const recentSessions = pomodoroStore.getRecentSessions(50);

	const chartData = last7Days.map((d) => ({
		day: getDayLabel(d.date),
		focus: Math.round(d.focusMs / 60000),
		sessions: d.sessions,
	}));

	const handleExport = useCallback(() => {
		const data = pomodoroStore.exportSessions();
		const blob = new Blob([data], { type: "application/json" });
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `zones-sessions-${new Date().toISOString().slice(0, 10)}.json`;
		a.click();
		URL.revokeObjectURL(url);
	}, []);

	return (
		<OverlayPanel open={open} onClose={onClose} title="Dashboard" width="lg">
			<div className="p-4 sm:p-5 space-y-4">
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
					<div className="flex flex-col items-center p-2 sm:p-3 rounded-lg border border-(--color-border) bg-(--color-foreground)/[0.02]">
						<span className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground)">
							Today
						</span>
						<span className="font-mono text-sm sm:text-base font-bold tabular-nums mt-0.5 text-(--color-foreground)">
							{formatMinutes(todayStats.focusMs)}
						</span>
						<span className="font-mono text-[8px] text-(--color-muted-foreground)">
							{todayStats.sessions} session
							{todayStats.sessions !== 1 ? "s" : ""}
						</span>
					</div>
					<div className="flex flex-col items-center p-2 sm:p-3 rounded-lg border border-(--color-border) bg-(--color-foreground)/[0.02]">
						<span className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground)">
							This week
						</span>
						<span className="font-mono text-sm sm:text-base font-bold tabular-nums mt-0.5 text-(--color-foreground)">
							{formatMinutes(weekStats.focusMs)}
						</span>
						<span className="font-mono text-[8px] text-(--color-muted-foreground)">
							{weekStats.sessions} session{weekStats.sessions !== 1 ? "s" : ""}
						</span>
					</div>
					<div className="flex flex-col items-center p-2 sm:p-3 rounded-lg border border-(--color-border) bg-(--color-foreground)/[0.02]">
						<span className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground)">
							This month
						</span>
						<span className="font-mono text-sm sm:text-base font-bold tabular-nums mt-0.5 text-(--color-foreground)">
							{formatMinutes(monthStats.focusMs)}
						</span>
						<span className="font-mono text-[8px] text-(--color-muted-foreground)">
							{monthStats.sessions} session
							{monthStats.sessions !== 1 ? "s" : ""}
						</span>
					</div>
					<div className="flex flex-col items-center p-2 sm:p-3 rounded-lg border border-(--color-border) bg-(--color-foreground)/[0.02]">
						<span className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground)">
							Streak
						</span>
						<span className="font-mono text-sm sm:text-base font-bold tabular-nums mt-0.5 text-(--color-foreground)">
							{streak}d
						</span>
						<span className="font-mono text-[8px] text-(--color-muted-foreground)">
							Days
						</span>
					</div>
				</div>

				{chartData.some((d) => d.focus > 0) && (
					<div className="h-28 sm:h-32">
						<ResponsiveContainer width="100%" height="100%">
							<BarChart
								data={chartData}
								margin={{ top: 4, right: 4, bottom: 0, left: 0 }}
							>
								<XAxis
									dataKey="day"
									tick={{
										fontSize: 9,
										fontFamily: "var(--font-mono)",
										fill: "var(--muted-fg)",
									}}
									axisLine={false}
									tickLine={false}
								/>
								<Tooltip
									contentStyle={{
										background: "var(--bg)",
										border: "1px solid var(--border)",
										borderRadius: "8px",
										fontSize: "10px",
										fontFamily: "var(--font-mono)",
									}}
									labelStyle={{ color: "var(--fg)" }}
								/>
								<Bar
									dataKey="focus"
									fill="var(--fg)"
									radius={[3, 3, 0, 0]}
									maxBarSize={32}
									opacity={0.8}
								/>
							</BarChart>
						</ResponsiveContainer>
					</div>
				)}

				<div className="flex items-center justify-between border-t border-(--color-border) pt-3">
					<button
						type="button"
						onClick={() => setShowSessions(!showSessions)}
						className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors cursor-pointer"
					>
						{showSessions
							? "Hide session history"
							: `Session history (${recentSessions.length})`}
					</button>
					{recentSessions.length > 0 && (
						<button
							type="button"
							onClick={handleExport}
							className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors cursor-pointer"
						>
							Export JSON
						</button>
					)}
				</div>

				{showSessions && recentSessions.length > 0 && (
					<div className="max-h-40 overflow-y-auto space-y-0.5">
						{recentSessions.map((s) => (
							<div
								key={s.id}
								className="flex items-center justify-between font-mono text-[9px] px-2 py-1 rounded hover:bg-(--color-foreground)/[0.03]"
							>
								<div className="flex items-center gap-2">
									<div
										className={`w-1.5 h-1.5 ${s.mode === "focus" ? "bg-(--color-delta-positive)" : "bg-(--color-muted)"}`}
									/>
									<span className="text-(--color-foreground)">
										{sessionLabel(s.mode)}
									</span>
									<span className="text-(--color-muted-foreground)">
										{formatSessionTime(s.completedAt)}
									</span>
								</div>
								<span className="tabular-nums text-(--color-muted-foreground)">
									{formatDuration(s.duration)}
								</span>
							</div>
						))}
					</div>
				)}
				{showSessions && recentSessions.length === 0 && (
					<div className="font-mono text-[9px] text-(--color-muted-foreground) text-center py-2">
						No sessions yet. Complete a Pomodoro to see them here.
					</div>
				)}
			</div>
		</OverlayPanel>
	);
}
