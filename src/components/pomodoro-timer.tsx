"use client";

import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { usePomodoro } from "@/hooks/use-pomodoro";
import {
	type PomodoroMode,
	type PomodoroSettings,
	pomodoroStore,
} from "@/lib/store-pomodoro";
import { useCallback, useEffect, useState } from "react";
import {
	CustomIcon,
	FocusIcon,
	PauseIcon,
	PlayIcon,
	ResetIcon,
	SettingsIcon,
	ShortBreakIcon,
	SkipIcon,
	StopwatchIcon,
} from "./icons";
import { OverlayPanel } from "./ui/overlay-panel";
import { PixelBadge, PixelButton } from "./ui/pixel-button";

const MODES = [
	{ value: "focus" as const, label: "Focus", icon: <FocusIcon size={11} /> },
	{
		value: "shortBreak" as const,
		label: "Short",
		icon: <ShortBreakIcon size={11} />,
	},
	{
		value: "longBreak" as const,
		label: "Long",
		icon: <StopwatchIcon size={11} />,
	},
	{ value: "custom" as const, label: "Custom", icon: <CustomIcon size={11} /> },
];

function durationFor(mode: PomodoroMode, settings: PomodoroSettings): number {
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

function formatPomodoroTime(): string {
	const remainingMs = pomodoroStore.getRemaining();
	const totalSec = Math.max(0, Math.ceil(remainingMs / 1000));
	const min = Math.floor(totalSec / 60);
	const sec = totalSec % 60;
	return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
}

function computeProgress(
	settings: PomodoroSettings,
	mode: PomodoroMode,
): number {
	const total = durationFor(mode, settings) * 1000;
	if (total <= 0) return 0;
	const remaining = pomodoroStore.getRemaining();
	return Math.max(0, Math.min(1, 1 - remaining / total));
}

export function PomodoroTimer({
	open,
	onClose,
}: { open: boolean; onClose: () => void }) {
	const {
		mode,
		phase,
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

	useEffect(() => {
		if (phase !== "running") return;
		const id = setInterval(() => {
			if (pomodoroStore.getRemaining() <= 100) {
				completeSession();
			}
		}, 250);
		return () => clearInterval(id);
	}, [phase, completeSession]);

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

	const displayTime = formatPomodoroTime();
	const progress = computeProgress(settings, mode);

	const circumference = 2 * Math.PI * 54;
	const offset = circumference * (1 - progress);

	const statusLabel =
		phase === "running"
			? mode === "focus"
				? "Focus"
				: "Break"
			: phase === "paused"
				? "Paused"
				: "Ready";

	return (
		<OverlayPanel
			open={open}
			onClose={onClose}
			title="Pomodoro Timer"
			width="sm"
		>
			<div className="p-5 sm:p-6 flex flex-col items-center gap-4">
				<div className="relative flex items-center justify-center">
					<svg
						width="140"
						height="140"
						viewBox="0 0 120 120"
						className="transform -rotate-90"
						aria-hidden="true"
					>
						<title>Timer progress</title>
						<rect
							x="2"
							y="2"
							width="116"
							height="116"
							fill="none"
							stroke="var(--border)"
							strokeWidth="2"
							shapeRendering="crispEdges"
						/>
						<circle
							cx="60"
							cy="60"
							r="54"
							fill="none"
							stroke="var(--fg)"
							strokeWidth="3"
							strokeLinecap="square"
							strokeDasharray={circumference}
							strokeDashoffset={offset}
							style={{ transition: "stroke-dashoffset 0.25s steps(8, end)" }}
						/>
					</svg>
					<div className="absolute flex flex-col items-center">
						<span className="font-mono text-3xl sm:text-4xl font-bold tabular-nums text-(--color-foreground) tracking-wider">
							{displayTime}
						</span>
						<PixelBadge variant="muted" className="mt-1.5">
							{statusLabel}
						</PixelBadge>
					</div>
				</div>

				<div className="flex items-center justify-center gap-1.5 sm:gap-2 flex-wrap">
					{MODES.map((m) => (
						<PixelButton
							key={m.value}
							size="sm"
							variant="outline"
							active={mode === m.value}
							icon={m.icon}
							onClick={() => {
								setMode(m.value);
								reset();
							}}
						>
							{m.label}
						</PixelButton>
					))}
				</div>

				<div className="flex items-center justify-center gap-2 sm:gap-2.5">
					<PixelButton
						variant="primary"
						size="md"
						icon={
							phase === "running" ? (
								<PauseIcon size={12} />
							) : (
								<PlayIcon size={12} />
							)
						}
						onClick={handleToggle}
					>
						{phase === "running"
							? "Pause"
							: phase === "paused"
								? "Resume"
								: "Start"}
					</PixelButton>
					{phase !== "idle" && (
						<PixelButton
							variant="outline"
							size="md"
							icon={<ResetIcon size={12} />}
							onClick={reset}
						>
							Reset
						</PixelButton>
					)}
					{phase === "running" && (
						<PixelButton
							variant="danger"
							size="md"
							icon={<SkipIcon size={12} />}
							onClick={completeSession}
						>
							Skip
						</PixelButton>
					)}
				</div>

				{completedSessions > 0 && (
					<div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-widest text-(--color-muted-foreground)">
						<PixelBadge variant="success">{completedSessions}</PixelBadge>
						<span>Sessions completed</span>
					</div>
				)}

				<button
					type="button"
					onClick={() => setShowSettings(!showSettings)}
					className="font-mono text-[9px] uppercase tracking-widest text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors duration-75 cursor-pointer flex items-center gap-1.5"
				>
					<SettingsIcon size={10} />
					{showSettings ? "hide settings" : "settings"}
				</button>

				{showSettings && (
					<div className="w-full space-y-2 sm:space-y-3 p-3 border-2 border-(--color-border) bg-(--color-surface)">
						<div className="grid grid-cols-2 gap-2 sm:gap-3">
							{[
								{
									key: "focusDuration" as const,
									label: "Focus",
									value: settings.focusDuration / 60,
								},
								{
									key: "shortBreakDuration" as const,
									label: "Short Break",
									value: settings.shortBreakDuration / 60,
								},
								{
									key: "longBreakDuration" as const,
									label: "Long Break",
									value: settings.longBreakDuration / 60,
								},
								{
									key: "customDuration" as const,
									label: "Custom",
									value: settings.customDuration / 60,
								},
							].map(({ key, label, value }) => (
								<div key={key} className="flex flex-col gap-0.5">
									<span className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground)">
										{label}
									</span>
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
						<SettingToggle
							label="Auto-start breaks"
							checked={settings.autoStartBreaks}
							onChange={(v) => updateSettings({ autoStartBreaks: v })}
						/>
						<SettingToggle
							label="Auto-start focus"
							checked={settings.autoStartFocus}
							onChange={(v) => updateSettings({ autoStartFocus: v })}
						/>
						<SettingToggle
							label="Sound"
							checked={settings.soundEnabled}
							onChange={(v) => updateSettings({ soundEnabled: v })}
						/>
					</div>
				)}
			</div>
		</OverlayPanel>
	);
}

function SettingToggle({
	label,
	checked,
	onChange,
}: {
	label: string;
	checked: boolean;
	onChange: (v: boolean) => void;
}) {
	return (
		<div className="flex items-center justify-between">
			<span className="font-mono text-[9px] uppercase tracking-widest text-(--color-muted-foreground)">
				{label}
			</span>
			<button
				type="button"
				role="switch"
				aria-checked={checked}
				onClick={() => onChange(!checked)}
				className={[
					"relative w-9 h-4 border-2 transition-colors duration-75 cursor-pointer",
					checked
						? "border-(--color-foreground) bg-(--color-foreground)"
						: "border-(--color-border) bg-transparent",
				].join(" ")}
			>
				<span
					className={[
						"absolute top-0.5 w-2.5 h-2.5 transition-[left] duration-100",
						checked
							? "left-[18px] bg-(--color-background)"
							: "left-0.5 bg-(--color-muted-foreground)",
					].join(" ")}
				/>
			</button>
		</div>
	);
}
