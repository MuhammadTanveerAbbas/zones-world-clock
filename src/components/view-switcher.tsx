"use client";

import { useClickSound } from "@/hooks/use-click-sound";
import { type AmbientSound, audioManager } from "@/lib/audio-manager";
import type { ViewMode } from "@/lib/store";
import { pomodoroStore } from "@/lib/store-pomodoro";
import { useTheme } from "next-themes";
import {
	useCallback,
	useEffect,
	useRef,
	useState,
	useSyncExternalStore,
} from "react";
import type { ReactNode } from "react";
import {
	ChartIcon,
	ClockIcon,
	CompactIcon,
	GridIcon,
	ListIcon,
	MenuIcon,
	MoonIcon,
	PlusIcon,
	RewindIcon,
	SparkleIcon,
	SparkleOffIcon,
	SpeakerIcon,
	StackIcon,
	StopwatchIcon,
	SunIcon,
} from "./icons";
import { Logo } from "./logo";
import { PixelBadge } from "./ui/pixel-button";

const VIEWS: {
	mode: ViewMode;
	label: string;
	icon: ReactNode;
}[] = [
	{ mode: "stack", label: "Stack", icon: <StackIcon size={14} /> },
	{ mode: "scroll", label: "List", icon: <ListIcon size={14} /> },
	{ mode: "grid", label: "Grid", icon: <GridIcon size={14} /> },
	{ mode: "compact", label: "Mini", icon: <CompactIcon size={14} /> },
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
	signatureRain: "Signature Rain",
	signatureDrone: "Signature Drone",
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
	activePanel:
		| "pomodoro"
		| "sounds"
		| "scrubber"
		| "dashboard"
		| "meeting"
		| null;
	onPanelChange: (
		panel: "pomodoro" | "sounds" | "scrubber" | "dashboard" | "meeting" | null,
	) => void;
}) {
	const pomoState = usePomodoroLive();
	const pomoRunning = pomoState.phase === "running";
	const sound = audioManager.activeSound;
	const soundActive = sound !== "none";
	const soundLabel = soundActive ? (SOUND_LABELS[sound] ?? sound) : "";
	const [menuOpen, setMenuOpen] = useState(false);
	const playClick = useClickSound();

	const handleClose = useCallback(() => setMenuOpen(false), []);

	return (
		<>
			<nav
				aria-label="Main navigation"
				className="flex items-center justify-between px-3 sm:px-4 py-2 border-b-[3px] border-(--color-border) bg-(--color-surface) relative z-30"
			>
				<a
					href="/"
					className="flex items-center gap-2 no-underline text-(--color-foreground) group"
				>
					<Logo
						size={20}
						className="transition-transform duration-500 group-hover:rotate-[360deg]"
					/>
					<span className="font-sans font-bold text-sm sm:text-base uppercase tracking-tight">
						Zones
					</span>
				</a>
				<div className="flex items-center gap-2">
					{soundActive && (
						<div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 border-[2px] border-(--color-border-subtle)">
							<span className="w-1.5 h-1.5 bg-(--color-delta-positive) animate-pulse-dot shrink-0" />
							<span className="font-sans text-[9px] uppercase tracking-wide text-(--color-muted-foreground)">
								{soundLabel}
							</span>
						</div>
					)}
					<button
						type="button"
						onClick={() => setMenuOpen(!menuOpen)}
						className="neo-btn flex items-center justify-center w-9 h-9 border-[2.5px] border-(--color-border) bg-(--color-surface) shadow-[3px_3px_0_0_var(--shadow)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_var(--shadow)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
						aria-label="Open menu"
						aria-expanded={menuOpen}
					>
						<MenuIcon size={14} />
					</button>
				</div>
			</nav>

			{menuOpen && (
				<>
					<div
						className="fixed inset-0 z-40 bg-black/20 animate-fade-in"
						onClick={handleClose}
						onKeyDown={(e) => e.key === "Escape" && handleClose()}
					/>
					<MenuPanel
						current={current}
						onChange={(mode) => {
							onChange(mode);
							handleClose();
						}}
						onAddZone={() => {
							onAddZone();
							handleClose();
						}}
						ambientMode={ambientMode}
						onToggleAmbient={onToggleAmbient}
						activePanel={activePanel}
						onPanelChange={onPanelChange}
						pomoRunning={pomoRunning}
						soundActive={soundActive}
						onClose={handleClose}
					/>
				</>
			)}
		</>
	);
}

function MenuPanel({
	current,
	onChange,
	onAddZone,
	ambientMode,
	onToggleAmbient,
	activePanel,
	onPanelChange,
	pomoRunning,
	soundActive,
	onClose,
}: {
	current: ViewMode;
	onChange: (mode: ViewMode) => void;
	onAddZone: () => void;
	ambientMode: boolean;
	onToggleAmbient: () => void;
	activePanel:
		| "pomodoro"
		| "sounds"
		| "scrubber"
		| "dashboard"
		| "meeting"
		| null;
	onPanelChange: (
		panel: "pomodoro" | "sounds" | "scrubber" | "dashboard" | "meeting" | null,
	) => void;
	pomoRunning: boolean;
	soundActive: boolean;
	onClose: () => void;
}) {
	const panelRef = useRef<HTMLDivElement>(null);
	const { theme, setTheme } = useTheme();
	const playClick = useClickSound();

	useEffect(() => {
		const handleKey = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};
		document.addEventListener("keydown", handleKey);
		return () => document.removeEventListener("keydown", handleKey);
	}, [onClose]);

	return (
		<>
			<div
				className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm animate-fade-in"
				onClick={onClose}
				onKeyDown={(e) => e.key === "Escape" && onClose()}
				role="button"
				tabIndex={-1}
				aria-label="Close menu"
			/>
			<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
				<div className="w-full max-w-[320px] max-h-[80vh] border-[3px] border-(--color-border) bg-(--color-surface) shadow-[6px_6px_0_0_var(--shadow)] animate-slide-up flex flex-col overflow-hidden">
					<div className="flex items-center justify-between px-3 py-2.5 border-b-[2.5px] border-(--color-border)">
						<span className="font-sans font-bold text-xs uppercase tracking-wide text-(--color-foreground)">
							Menu
						</span>
						<button
							type="button"
							onClick={onClose}
							className="neo-btn flex items-center justify-center w-8 h-8 border-[2.5px] border-(--color-border) bg-(--color-surface) shadow-[2px_2px_0_0_var(--shadow)] hover:translate-x-[-1px] hover:translate-y-[-1px] active:translate-x-[1px] active:translate-y-[1px] active:shadow-none transition-all cursor-pointer"
							aria-label="Close menu"
						>
							<MenuIcon size={12} />
						</button>
					</div>

					<div
						ref={panelRef}
						className="flex-1 overflow-y-auto p-3 flex flex-col gap-3"
					>
						<div>
							<SectionLabel>Views</SectionLabel>
							<div className="grid grid-cols-2 gap-1.5 mt-1.5">
								{VIEWS.map(({ mode, label, icon }) => (
									<button
										key={mode}
										type="button"
										onClick={() => {
											onChange(mode);
											playClick();
										}}
										className={[
											"flex items-center gap-2 font-sans font-semibold text-[10px] uppercase tracking-wide px-3 py-2.5 cursor-pointer text-left w-full border-[2.5px] transition-colors duration-100",
											current === mode
												? "bg-(--color-foreground) text-(--color-background) border-(--color-foreground)"
												: "text-(--color-muted-foreground) border-(--color-border-subtle) hover:border-(--color-border) hover:text-(--color-foreground)",
										].join(" ")}
									>
										{icon}
										{label}
									</button>
								))}
							</div>
						</div>

						<Divider />

						<div>
							<SectionLabel>Tools</SectionLabel>
							<div className="grid grid-cols-2 gap-1.5 mt-1.5">
								<ToolButton
									label="Pomodoro"
									icon={
										pomoRunning ? (
											<StopwatchIcon size={14} />
										) : (
											<ClockIcon size={14} />
										)
									}
									active={activePanel === "pomodoro"}
									isLive={pomoRunning}
									onClick={() => {
										onPanelChange(
											activePanel === "pomodoro" ? null : "pomodoro",
										);
										playClick();
										onClose();
									}}
								/>
								<ToolButton
									label="Sounds"
									icon={<SpeakerIcon size={14} />}
									active={activePanel === "sounds"}
									isLive={soundActive}
									onClick={() => {
										onPanelChange(activePanel === "sounds" ? null : "sounds");
										playClick();
										onClose();
									}}
								/>
								<ToolButton
									label="Scrubber"
									icon={<RewindIcon size={14} />}
									active={activePanel === "scrubber"}
									onClick={() => {
										onPanelChange(
											activePanel === "scrubber" ? null : "scrubber",
										);
										playClick();
										onClose();
									}}
								/>
								<ToolButton
									label="Stats"
									icon={<ChartIcon size={14} />}
									active={activePanel === "dashboard"}
									onClick={() => {
										onPanelChange(
											activePanel === "dashboard" ? null : "dashboard",
										);
										playClick();
										onClose();
									}}
								/>
							</div>
						</div>

						<Divider />

						<div>
							<SectionLabel>Theme</SectionLabel>
							<div className="grid grid-cols-2 gap-1.5 mt-1.5">
								<button
									type="button"
									onClick={() => {
										setTheme("light");
										playClick();
										onClose();
									}}
									className={[
										"flex items-center gap-2 font-sans font-semibold text-[10px] uppercase tracking-wide px-3 py-2.5 cursor-pointer text-left w-full border-[2.5px] transition-colors duration-100",
										theme === "light"
											? "bg-(--color-foreground) text-(--color-background) border-(--color-foreground)"
											: "text-(--color-muted-foreground) border-(--color-border-subtle) hover:border-(--color-border) hover:text-(--color-foreground)",
									].join(" ")}
								>
									<SunIcon size={14} />
									Light
								</button>
								<button
									type="button"
									onClick={() => {
										setTheme("dark");
										playClick();
										onClose();
									}}
									className={[
										"flex items-center gap-2 font-sans font-semibold text-[10px] uppercase tracking-wide px-3 py-2.5 cursor-pointer text-left w-full border-[2.5px] transition-colors duration-100",
										theme === "dark"
											? "bg-(--color-foreground) text-(--color-background) border-(--color-foreground)"
											: "text-(--color-muted-foreground) border-(--color-border-subtle) hover:border-(--color-border) hover:text-(--color-foreground)",
									].join(" ")}
								>
									<MoonIcon size={14} />
									Dark
								</button>
							</div>
							<button
								type="button"
								onClick={() => {
									onToggleAmbient();
									playClick();
									onClose();
								}}
								className={[
									"mt-1.5 flex items-center gap-2 font-sans font-semibold text-[10px] uppercase tracking-wide px-3 py-2.5 cursor-pointer text-left w-full border-[2.5px] transition-colors duration-100",
									ambientMode
										? "bg-(--color-foreground) text-(--color-background) border-(--color-foreground)"
										: "text-(--color-muted-foreground) border-(--color-border-subtle) hover:border-(--color-border) hover:text-(--color-foreground)",
								].join(" ")}
							>
								{ambientMode ? (
									<SparkleIcon size={14} />
								) : (
									<SparkleOffIcon size={14} />
								)}
								Ambient
							</button>
						</div>

						<Divider />

						<button
							type="button"
							onClick={() => {
								onAddZone();
								playClick();
							}}
							className="flex items-center justify-center gap-2 font-sans font-semibold text-[10px] uppercase tracking-wide w-full px-3 py-3 cursor-pointer border-[2.5px] border-(--color-accent) bg-(--color-accent) text-(--color-accent-fg) hover:opacity-90 transition-opacity"
						>
							<PlusIcon size={14} />
							Add Timezone
						</button>
					</div>
				</div>
			</div>
		</>
	);
}

function SectionLabel({ children }: { children: ReactNode }) {
	return (
		<span className="font-sans text-[9px] uppercase tracking-wide text-(--color-muted-foreground) font-semibold">
			{children}
		</span>
	);
}

function Divider() {
	return <div className="h-[2.5px] bg-(--color-border-subtle)" />;
}

function ToolButton({
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
			<button
				type="button"
				onClick={onClick}
				className={[
					"flex items-center gap-2 font-sans font-semibold text-[10px] uppercase tracking-wide px-3 py-2.5 cursor-pointer text-left w-full border-[2.5px] transition-colors duration-100",
					active
						? "bg-(--color-foreground) text-(--color-background) border-(--color-foreground)"
						: "text-(--color-muted-foreground) border-(--color-border-subtle) hover:border-(--color-border) hover:text-(--color-foreground)",
				].join(" ")}
			>
				{icon}
				{label}
			</button>
			{isLive && (
				<PixelBadge
					variant="success"
					className="absolute top-1.5 right-1.5 !p-0 !px-1 !text-[7px] !leading-none !h-2 !min-h-0"
				>
					<span className="block w-1.5 h-1.5 bg-(--color-delta-positive) animate-pulse-dot" />
				</PixelBadge>
			)}
		</div>
	);
}
