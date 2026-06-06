"use client";

import { usePomodoro } from "@/hooks/use-pomodoro";
import { pomodoroStore } from "@/lib/store-pomodoro";
import { useCallback, useEffect, useRef, useState } from "react";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { OverlayPanel } from "./overlay-panel";

const MODES = [
	{ value: "focus" as const, label: "Focus" },
	{ value: "shortBreak" as const, label: "Short" },
	{ value: "longBreak" as const, label: "Long" },
	{ value: "custom" as const, label: "Custom" },
];

export function PomodoroTimer({ open, onClose }: { open: boolean; onClose: () => void }) {
	const {
		mode,
		phase,
		formattedTime,
		progress,
		completedSessions,
		settings,
		start,
		pause,
		resume,
		reset,
		setMode,
		completeSession,
		updateSettings,
	} = usePomodoro();

	const [showSettings, setShowSettings] = useState(false);
	const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
	const [localTime, setLocalTime] = useState(formattedTime);
	const [localProgress, setLocalProgress] = useState(progress);
	const completeRef = useRef(completeSession);
	completeRef.current = completeSession;

	useEffect(() => {
		if (phase === "running") {
			const tick = () => {
				const t = pomodoroStore.getFormattedTime();
				const p = pomodoroStore.getProgress();
				setLocalTime(t);
				setLocalProgress(p);
				if (pomodoroStore.getRemaining() <= 100) {
					completeRef.current();
				}
			};
			tick();
			intervalRef.current = setInterval(tick, 200);
			return () => {
				if (intervalRef.current) clearInterval(intervalRef.current);
			};
		} else {
			setLocalTime(formattedTime);
			setLocalProgress(progress);
		}
	}, [phase, formattedTime, progress]);

	const handleToggle = useCallback(() => {
		if (phase === "idle" || phase === "completed") {
			start();
		} else if (phase === "running") {
			pause();
		} else if (phase === "paused") {
			resume();
		}
	}, [phase, start, pause, resume]);

	useKeyboardShortcuts({
		" ": { fn: handleToggle, preventDefault: open },
		r: { fn: reset, preventDefault: open },
	});

	const circumference = 2 * Math.PI * 54;
	const offset = circumference * (1 - localProgress);

	return (
		<OverlayPanel open={open} onClose={onClose} title="Pomodoro Timer" width="sm">
			<div className="p-5 sm:p-6 flex flex-col items-center gap-4">
				<div className="relative flex items-center justify-center">
					<svg width="140" height="140" viewBox="0 0 120 120" className="transform -rotate-90">
						<circle cx="60" cy="60" r="54" fill="none" stroke="var(--border)" strokeWidth="4" />
						<circle
							cx="60"
							cy="60"
							r="54"
							fill="none"
							stroke="var(--fg)"
							strokeWidth="4"
							strokeLinecap="round"
							strokeDasharray={circumference}
							strokeDashoffset={offset}
							className="transition-all duration-300 ease-linear"
						/>
					</svg>
					<div className="absolute flex flex-col items-center">
						<span className="font-mono text-3xl sm:text-4xl font-bold tabular-nums text-(--color-foreground)">
							{localTime}
						</span>
						<span className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground) mt-0.5">
							{phase === "running" ? (mode === "focus" ? "focus" : "break") : phase === "paused" ? "paused" : "ready"}
						</span>
					</div>
				</div>

				<div className="flex items-center justify-center gap-1.5 sm:gap-2">
					{MODES.map((m) => (
						<button
							key={m.value}
							type="button"
							onClick={() => { setMode(m.value); reset(); }}
							className={`font-mono text-[9px] uppercase tracking-widest px-2 py-1 rounded-md border transition-all duration-150 cursor-pointer ${
								mode === m.value
									? "text-(--color-foreground) border-(--color-accent) bg-accent/10"
									: "text-(--color-muted-foreground) border-transparent hover:text-(--color-foreground) hover:border-(--color-border)"
							}`}
						>
							{m.label}
						</button>
					))}
				</div>

				<div className="flex items-center justify-center gap-2 sm:gap-3">
					<button
						type="button"
						onClick={handleToggle}
						className="font-mono text-[10px] uppercase tracking-widest px-4 py-1.5 rounded-md border border-(--color-accent) text-(--color-accent) hover:bg-(--color-accent) hover:text-white transition-all duration-200 cursor-pointer"
					>
						{phase === "running" ? "pause" : phase === "paused" ? "resume" : "start"}
					</button>
					{phase !== "idle" && (
						<button
							type="button"
							onClick={reset}
							className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-(--color-border) text-(--color-muted-foreground) hover:text-(--color-foreground) hover:border-(--color-muted) transition-all duration-200 cursor-pointer"
						>
							reset
						</button>
					)}
					{phase === "running" && (
						<button
							type="button"
							onClick={completeSession}
							className="font-mono text-[10px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-(--color-border) text-(--color-delta-negative) hover:text-(--color-delta-negative) hover:border-(--color-delta-negative) transition-all duration-200 cursor-pointer"
						>
							skip
						</button>
					)}
				</div>

				{completedSessions > 0 && (
					<div className="text-center font-mono text-[9px] uppercase tracking-widest text-(--color-muted-foreground)">
						{completedSessions} session{completedSessions !== 1 ? "s" : ""} completed
					</div>
				)}

				<div className="flex items-center justify-center">
					<button
						type="button"
						onClick={() => setShowSettings(!showSettings)}
						className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors cursor-pointer"
					>
						{showSettings ? "hide settings" : "settings"}
					</button>
				</div>

				{showSettings && (
					<div className="w-full space-y-2 sm:space-y-3 p-3 border border-(--color-border) rounded-lg bg-(--color-foreground)/[0.02]">
						<div className="grid grid-cols-2 gap-2 sm:gap-3">
							{([
								{ key: "focusDuration" as const, label: "Focus", value: settings.focusDuration / 60 },
								{ key: "shortBreakDuration" as const, label: "Short Break", value: settings.shortBreakDuration / 60 },
								{ key: "longBreakDuration" as const, label: "Long Break", value: settings.longBreakDuration / 60 },
								{ key: "customDuration" as const, label: "Custom", value: settings.customDuration / 60 },
							]).map(({ key, label, value }) => (
								<div key={key} className="flex flex-col gap-0.5">
									<label className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground)">
										{label}
									</label>
									<div className="flex items-center gap-1.5">
										<input
											type="range"
											min={1}
											max={120}
											value={value}
											onChange={(e) => {
												const minutes = Number(e.target.value);
												updateSettings({ [key]: minutes * 60 });
											}}
											className="flex-1 h-1 accent-(--color-accent) cursor-pointer"
											aria-label={`${label} duration in minutes`}
										/>
										<span className="font-mono text-[10px] tabular-nums text-(--color-muted-foreground) w-8 text-right">
											{value}m
										</span>
									</div>
								</div>
							))}
						</div>
						<div className="flex items-center justify-between">
							<label className="font-mono text-[9px] uppercase tracking-widest text-(--color-muted-foreground)">Auto-start breaks</label>
							<button type="button" role="switch" aria-checked={settings.autoStartBreaks}
								onClick={() => updateSettings({ autoStartBreaks: !settings.autoStartBreaks })}
								className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${settings.autoStartBreaks ? "bg-(--color-accent)" : "bg-(--color-muted)"}`}
							>
								<span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${settings.autoStartBreaks ? "translate-x-4" : "translate-x-0"}`} />
							</button>
						</div>
						<div className="flex items-center justify-between">
							<label className="font-mono text-[9px] uppercase tracking-widest text-(--color-muted-foreground)">Auto-start focus</label>
							<button type="button" role="switch" aria-checked={settings.autoStartFocus}
								onClick={() => updateSettings({ autoStartFocus: !settings.autoStartFocus })}
								className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${settings.autoStartFocus ? "bg-(--color-accent)" : "bg-(--color-muted)"}`}
							>
								<span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${settings.autoStartFocus ? "translate-x-4" : "translate-x-0"}`} />
							</button>
						</div>
						<div className="flex items-center justify-between">
							<label className="font-mono text-[9px] uppercase tracking-widest text-(--color-muted-foreground)">Sound</label>
							<button type="button" role="switch" aria-checked={settings.soundEnabled}
								onClick={() => updateSettings({ soundEnabled: !settings.soundEnabled })}
								className={`relative w-8 h-4 rounded-full transition-colors cursor-pointer ${settings.soundEnabled ? "bg-(--color-accent)" : "bg-(--color-muted)"}`}
							>
								<span className={`absolute top-0.5 left-0.5 w-3 h-3 rounded-full bg-white transition-transform ${settings.soundEnabled ? "translate-x-4" : "translate-x-0"}`} />
							</button>
						</div>
					</div>
				)}
			</div>
		</OverlayPanel>
	);
}
