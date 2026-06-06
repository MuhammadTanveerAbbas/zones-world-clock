"use client";

import { useClickSound } from "@/hooks/use-click-sound";
import type { ViewMode } from "@/lib/store";
import { ThemeSwitcher } from "./theme-switcher";
import { useState, useEffect, useRef } from "react";
import { audioManager, type AmbientSound } from "@/lib/audio-manager";
import { pomodoroStore } from "@/lib/store-pomodoro";

const VIEWS: { mode: ViewMode; label: string; shortLabel: string }[] = [
	{ mode: "stack", label: "Stack", shortLabel: "St" },
	{ mode: "scroll", label: "List", shortLabel: "Li" },
	{ mode: "grid", label: "Grid", shortLabel: "Gr" },
	{ mode: "compact", label: "Mini", shortLabel: "Mi" },
];

export function ViewSwitcher({
	current,
	onChange,
	onAddZone,
	ambientMode,
	onToggleAmbient,
	activePanel,
	onPanelChange,
}: {
	current: ViewMode;
	onChange: (mode: ViewMode) => void;
	onAddZone: () => void;
	ambientMode: boolean;
	onToggleAmbient: () => void;
	activePanel: "pomodoro" | "sounds" | "scrubber" | "dashboard" | null;
	onPanelChange: (panel: "pomodoro" | "sounds" | "scrubber" | "dashboard" | null) => void;
}) {
	const playClick = useClickSound();
	const [pomodoroActive, setPomodoroActive] = useState(false);
	const [soundActive, setSoundActive] = useState(false);
	const [activeSoundLabel, setActiveSoundLabel] = useState("");
	const nowPlayingRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const unsubPomo = pomodoroStore.subscribe(() => {
			setPomodoroActive(pomodoroStore.getState().phase === "running");
		});
		return unsubPomo;
	}, []);

	useEffect(() => {
		const id = setInterval(() => {
			const isPlaying = audioManager.isPlaying();
			setSoundActive(isPlaying);
			if (isPlaying) {
				const sound = audioManager.activeSound;
				const labels: Record<string, string> = {
					rain: "Rain", forest: "Forest", cafe: "Café", ocean: "Ocean",
					wind: "Wind", whiteNoise: "White Noise", thunder: "Thunder",
					night: "Night", fire: "Campfire", stream: "Stream", fan: "Fan",
					birds: "Birds", waterfall: "Waterfall", bowl: "Meditation Bowl",
					blizzard: "Blizzard", train: "Train", spaceship: "Spaceship",
					desert: "Desert Wind", rainOnRoof: "Rain on Roof",
				};
				setActiveSoundLabel(labels[sound] || sound);
			} else {
				setActiveSoundLabel("");
			}
		}, 500);
		return () => clearInterval(id);
	}, []);

	return (
		<>
			<nav
				aria-label="View controls"
				className="flex items-center justify-between px-2 sm:px-4 py-1.5 sm:py-2 border-b border-(--color-border) gap-1 bg-(--color-background)"
			>
				<div className="flex items-center gap-0.5 sm:gap-1" role="tablist" aria-label="View modes">
					{VIEWS.map(({ mode, label, shortLabel }) => (
						<button
							key={mode}
							type="button"
							role="tab"
							aria-selected={current === mode}
							onClick={() => { onChange(mode); playClick(); }}
							className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-widest px-1.5 sm:px-2.5 py-1 sm:py-1.5 border rounded-md transition-all duration-200 cursor-pointer shrink-0 ${
								current === mode
									? "text-(--color-foreground) border-(--color-accent) bg-accent/10 shadow-sm"
									: "text-(--color-muted-foreground) border-transparent hover:text-(--color-foreground) hover:bg-(--color-foreground)/[0.04]"
							}`}
						>
							<span className="sm:hidden">{shortLabel}</span>
							<span className="hidden sm:inline">{label}</span>
						</button>
					))}
				</div>

				<div className="flex items-center gap-1 sm:gap-1.5">
					<ToolbarButton
						label="Pomodoro"
						shortLabel="Po"
						icon={pomodoroActive ? "⏱" : "⏲"}
						active={activePanel === "pomodoro"}
						isLive={pomodoroActive}
						onClick={() => onPanelChange(activePanel === "pomodoro" ? null : "pomodoro")}
					/>
					<ToolbarButton
						label="Sounds"
						shortLabel="So"
						icon="🔊"
						active={activePanel === "sounds"}
						isLive={soundActive}
						onClick={() => onPanelChange(activePanel === "sounds" ? null : "sounds")}
					/>
					<ToolbarButton
						label="Scrubber"
						shortLabel="Sc"
						icon="⏪"
						active={activePanel === "scrubber"}
						onClick={() => onPanelChange(activePanel === "scrubber" ? null : "scrubber")}
					/>
					<ToolbarButton
						label="Stats"
						shortLabel="Da"
						icon="📊"
						active={activePanel === "dashboard"}
						onClick={() => onPanelChange(activePanel === "dashboard" ? null : "dashboard")}
					/>

					<div className="w-px h-4 bg-(--color-border) mx-1 hidden sm:block" />

					<ThemeSwitcher ambientMode={ambientMode} onToggleAmbient={onToggleAmbient} />
					<button
						type="button"
						aria-label="Add timezone"
						onClick={() => { onAddZone(); playClick(); }}
						className="font-mono text-[11px] sm:text-[13px] px-1.5 sm:px-2.5 py-1 sm:py-1.5 border border-(--color-accent) text-(--color-accent) hover:bg-(--color-accent) hover:text-white cursor-pointer transition-all duration-200 shrink-0 rounded-md"
					>
						+
					</button>
				</div>
			</nav>
			{soundActive && activeSoundLabel && (
				<div
					ref={nowPlayingRef}
					className="flex items-center justify-center gap-1.5 px-3 py-1 bg-(--color-accent)/5 border-b border-(--color-border)/50"
				>
					<span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse-soft shrink-0" />
					<span className="font-mono text-[7px] sm:text-[8px] uppercase tracking-widest text-(--color-muted-foreground)">
						playing: <span className="text-(--color-foreground)">{activeSoundLabel}</span>
					</span>
				</div>
			)}
		</>
	);
}

function ToolbarButton({
	label,
	shortLabel,
	icon,
	active,
	isLive,
	onClick,
}: {
	label: string;
	shortLabel: string;
	icon: string;
	active: boolean;
	isLive?: boolean;
	onClick: () => void;
}) {
	return (
		<button
			type="button"
			aria-label={label}
			onClick={onClick}
			className={`relative flex items-center gap-1 sm:gap-1.5 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest px-1.5 sm:px-2.5 py-1 sm:py-1.5 border rounded-md transition-all duration-200 cursor-pointer shrink-0 ${
				active
					? "text-(--color-foreground) border-(--color-accent) bg-accent/10 shadow-sm"
					: "text-(--color-muted-foreground) border-transparent hover:text-(--color-foreground) hover:bg-(--color-foreground)/[0.04]"
			}`}
		>
			{isLive && (
				<span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
			)}
			<span className="text-[11px] sm:text-[13px]">{icon}</span>
			<span className="hidden sm:inline">{label}</span>
		</button>
	);
}
