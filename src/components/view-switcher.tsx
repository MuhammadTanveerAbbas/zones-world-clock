"use client";

import { type AmbientSound, audioManager } from "@/lib/audio-manager";
import type { ViewMode } from "@/lib/store";
import { pomodoroStore } from "@/lib/store-pomodoro";
import { useSyncExternalStore } from "react";
import type { ReactNode } from "react";
import {
	ChartIcon,
	ClockIcon,
	CompactIcon,
	GridIcon,
	ListIcon,
	PlusIcon,
	RewindIcon,
	SpeakerIcon,
	StackIcon,
	StopwatchIcon,
} from "./icons";
import { ThemeSwitcher } from "./theme-switcher";
import { PixelBadge, PixelButton } from "./ui/pixel-button";

const VIEWS: {
	mode: ViewMode;
	label: string;
	icon: ReactNode;
}[] = [
	{
		mode: "stack",
		label: "Stack",
		icon: <StackIcon size={12} />,
	},
	{
		mode: "scroll",
		label: "List",
		icon: <ListIcon size={12} />,
	},
	{
		mode: "grid",
		label: "Grid",
		icon: <GridIcon size={12} />,
	},
	{
		mode: "compact",
		label: "Mini",
		icon: <CompactIcon size={12} />,
	},
];

function usePomodoroLive() {
	return useSyncExternalStore(
		pomodoroStore.subscribe,
		pomodoroStore.getState,
		pomodoroStore.getServerState,
	);
}

const SOUND_LABELS: Record<AmbientSound, string> = {
	none: "None",
	rain: "Rain",
	forest: "Forest",
	cafe: "Cafe",
	ocean: "Ocean",
	wind: "Wind",
	whiteNoise: "White Noise",
	thunder: "Thunder",
	night: "Night",
	fire: "Campfire",
	stream: "Stream",
	fan: "Fan",
	birds: "Birds",
	waterfall: "Waterfall",
	bowl: "Bowl",
	blizzard: "Blizzard",
	train: "Train",
	spaceship: "Spaceship",
	desert: "Desert",
	rainOnRoof: "Rain on Roof",
};

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
	onPanelChange: (
		panel: "pomodoro" | "sounds" | "scrubber" | "dashboard" | null,
	) => void;
}) {
	const pomoState = usePomodoroLive();
	const pomoRunning = pomoState.phase === "running";
	const sound = audioManager.activeSound;
	const soundActive = sound !== "none";
	const soundLabel = soundActive ? (SOUND_LABELS[sound] ?? sound) : "";

	return (
		<>
			<nav
				aria-label="View controls"
				className="flex items-center justify-between px-2 sm:px-3 py-1.5 sm:py-2 border-b-2 border-(--color-border) gap-1 bg-(--color-surface) relative z-30"
			>
				<div
					className="flex items-center gap-0.5 sm:gap-1"
					role="tablist"
					aria-label="View modes"
				>
					{VIEWS.map(({ mode, label, icon }) => (
						<PixelButton
							key={mode}
							variant="outline"
							size="sm"
							active={current === mode}
							icon={icon}
							onClick={() => onChange(mode)}
							role="tab"
							aria-selected={current === mode}
							aria-label={label}
						>
							{label}
						</PixelButton>
					))}
				</div>

				<div className="flex items-center gap-1 sm:gap-1.5">
					<ToolbarButton
						label="Pomodoro"
						icon={
							pomoRunning ? (
								<StopwatchIcon size={12} />
							) : (
								<ClockIcon size={12} />
							)
						}
						active={activePanel === "pomodoro"}
						isLive={pomoRunning}
						onClick={() =>
							onPanelChange(activePanel === "pomodoro" ? null : "pomodoro")
						}
					/>
					<ToolbarButton
						label="Sounds"
						icon={<SpeakerIcon size={12} />}
						active={activePanel === "sounds"}
						isLive={soundActive}
						onClick={() =>
							onPanelChange(activePanel === "sounds" ? null : "sounds")
						}
					/>
					<ToolbarButton
						label="Scrubber"
						icon={<RewindIcon size={12} />}
						active={activePanel === "scrubber"}
						onClick={() =>
							onPanelChange(activePanel === "scrubber" ? null : "scrubber")
						}
					/>
					<ToolbarButton
						label="Stats"
						icon={<ChartIcon size={12} />}
						active={activePanel === "dashboard"}
						onClick={() =>
							onPanelChange(activePanel === "dashboard" ? null : "dashboard")
						}
					/>

					<div className="w-px h-4 bg-(--color-border) mx-0.5 sm:mx-1 hidden sm:block" />

					<ThemeSwitcher
						ambientMode={ambientMode}
						onToggleAmbient={onToggleAmbient}
					/>
					<PixelButton
						variant="primary"
						size="sm"
						icon={<PlusIcon size={12} />}
						onClick={onAddZone}
						aria-label="Add timezone"
					>
						<span className="hidden sm:inline">Add</span>
					</PixelButton>
				</div>
			</nav>
			{soundActive && soundLabel && (
				<div className="flex items-center justify-center gap-2 px-3 py-1 bg-(--color-surface) border-b-2 border-(--color-border) relative z-20">
					<span className="w-1.5 h-1.5 bg-(--color-delta-positive) animate-pulse-dot shrink-0" />
					<span className="font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-(--color-muted-foreground)">
						Playing:{" "}
						<span className="text-(--color-foreground)">{soundLabel}</span>
					</span>
				</div>
			)}
		</>
	);
}

function ToolbarButton({
	label,
	icon,
	active,
	isLive,
	onClick,
}: {
	label: string;
	icon: ReactNode;
	active: boolean;
	isLive?: boolean;
	onClick: () => void;
}) {
	return (
		<div className="relative">
			<PixelButton
				variant="outline"
				size="sm"
				active={active}
				icon={icon}
				onClick={onClick}
				aria-label={label}
			>
				<span className="hidden sm:inline">{label}</span>
			</PixelButton>
			{isLive && (
				<PixelBadge
					variant="success"
					className="absolute -top-1 -right-1 !p-0 !px-1 !text-[7px] !leading-none !h-2 !min-h-0"
				>
					<span className="block w-1.5 h-1.5 bg-(--color-delta-positive) animate-pulse-dot" />
				</PixelBadge>
			)}
		</div>
	);
}
