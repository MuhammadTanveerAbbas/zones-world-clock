"use client";

import dynamic from "next/dynamic";
import { ViewSwitcher } from "@/components/view-switcher";
import { CompactView } from "@/components/views/compact-view";
import { GridView } from "@/components/views/grid-view";
import { ScrollView } from "@/components/views/scroll-view";
import { StackView } from "@/components/views/stack-view";
import { ZoneSearch } from "@/components/zone-search";
import { CommandPalette } from "@/components/command-palette";
import { ErrorBoundary } from "@/components/error-boundary";
import { useWorldClock } from "@/hooks/use-world-clock";
import { useZonesStore } from "@/hooks/use-zones-store";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { groupZones } from "@/lib/group-zones";
import { LazyMotion, domAnimation, AnimatePresence, motion } from "motion/react";
import { useCallback, useMemo, useState } from "react";

const PomodoroTimer = dynamic(
	() => import("@/components/pomodoro-timer").then((m) => ({ default: m.PomodoroTimer })),
	{ ssr: false },
);
const MusicPlayer = dynamic(
	() => import("@/components/music-player").then((m) => ({ default: m.MusicPlayer })),
	{ ssr: false },
);
const Dashboard = dynamic(
	() => import("@/components/dashboard").then((m) => ({ default: m.Dashboard })),
	{ ssr: false },
);
const TimeScrubber = dynamic(
	() => import("@/components/time-scrubber").then((m) => ({ default: m.TimeScrubber })),
	{ ssr: false },
);

export default function Home() {
	const {
		displayTime,
		scrubberMinutes,
		setScrubberMinutes,
		isScrubbing,
		resetScrubber,
	} = useWorldClock();

	const {
		zones,
		homeId,
		homeTz,
		viewMode,
		use24h,
		setViewMode,
		toggleTimeFormat,
		addZone,
		removeZone,
		reorderZones,
		setHomeId,
		ambientMode,
		toggleAmbientMode,
	} = useZonesStore();

	const [activePanel, setActivePanel] = useState<"pomodoro" | "sounds" | "scrubber" | "dashboard" | null>(null);
	const [showSearch, setShowSearch] = useState(false);
	const [showCommandPalette, setShowCommandPalette] = useState(false);

	const closePanel = useCallback(() => setActivePanel(null), []);

	useKeyboardShortcuts({
		a: { fn: () => setShowSearch(true) },
		t: { fn: toggleTimeFormat },
		d: { fn: () => setActivePanel((p) => p === "dashboard" ? null : "dashboard") },
		p: { fn: () => setActivePanel((p) => p === "pomodoro" ? null : "pomodoro") },
		s: { fn: () => setActivePanel((p) => p === "sounds" ? null : "sounds") },
		"1": { fn: () => setViewMode("stack") },
		"2": { fn: () => setViewMode("scroll") },
		"3": { fn: () => setViewMode("grid") },
		"4": { fn: () => setViewMode("compact") },
		"mod+k": { fn: () => setShowCommandPalette((v) => !v) },
		escape: { fn: () => { setShowSearch(false); setShowCommandPalette(false); setActivePanel(null); }, preventDefault: false },
	});

	const groups = useMemo(
		() => groupZones(zones, homeId, homeTz, displayTime, use24h),
		[zones, homeId, homeTz, displayTime, use24h],
	);

	const existingIds = useMemo(() => new Set(zones.map((z) => z.id)), [zones]);

	const handleAddZone = useCallback(
		(zone: Parameters<typeof addZone>[0]) => {
			addZone(zone);
		},
		[addZone],
	);

	return (
		<div className="flex flex-col" style={{ height: "100dvh" }}>
			<ViewSwitcher
				current={viewMode}
				onChange={setViewMode}
				onAddZone={() => setShowSearch(true)}
				ambientMode={ambientMode}
				onToggleAmbient={toggleAmbientMode}
				activePanel={activePanel}
				onPanelChange={setActivePanel}
			/>
			<LazyMotion features={domAnimation}>
				<main className="flex-1 flex flex-col min-h-0">
					<ErrorBoundary>
						<AnimatePresence mode="wait">
							{zones.length === 0 ? (
								<motion.div
									key="empty"
									initial={{ opacity: 0, y: 8 }}
									animate={{ opacity: 1, y: 0 }}
									exit={{ opacity: 0, y: -8 }}
									transition={{ duration: 0.2 }}
									className="flex-1 flex flex-col items-center justify-center p-8 text-(--color-muted-foreground) font-mono text-[10px] uppercase tracking-widest gap-3"
								>
									<span className="text-4xl">🌍</span>
									<span>no time zones yet</span>
									<button
										type="button"
										onClick={() => setShowSearch(true)}
										className="font-mono text-[9px] uppercase tracking-widest px-3 py-1.5 rounded-md border border-(--color-accent) text-(--color-accent) hover:bg-(--color-accent) hover:text-white transition-all duration-200 cursor-pointer"
									>
										add a time zone
									</button>
								</motion.div>
							) : (
								<motion.div
									key={viewMode}
									initial={{ opacity: 0, x: 12 }}
									animate={{ opacity: 1, x: 0 }}
									exit={{ opacity: 0, x: -12 }}
									transition={{ duration: 0.15 }}
									className="flex-1 flex flex-col min-h-0"
								>
									{viewMode === "stack" && (
										<StackView
											groups={groups}
											homeId={homeId}
											isScrubbing={isScrubbing}
											ambientMode={ambientMode}
											displayTime={displayTime}
											homeTz={homeTz}
										/>
									)}
									{viewMode === "scroll" && (
										<ScrollView
											zones={zones}
											homeId={homeId}
											homeTz={homeTz}
											displayTime={displayTime}
											isScrubbing={isScrubbing}
											use24h={use24h}
											onRemove={removeZone}
											onSetHome={setHomeId}
											onReorder={reorderZones}
											ambientMode={ambientMode}
										/>
									)}
									{viewMode === "grid" && (
										<GridView
											zones={zones}
											homeId={homeId}
											homeTz={homeTz}
											displayTime={displayTime}
											isScrubbing={isScrubbing}
											use24h={use24h}
											onRemove={removeZone}
											onSetHome={setHomeId}
											ambientMode={ambientMode}
										/>
									)}
									{viewMode === "compact" && (
										<CompactView
											groups={groups}
											homeId={homeId}
											isScrubbing={isScrubbing}
											ambientMode={ambientMode}
											displayTime={displayTime}
										/>
									)}
								</motion.div>
							)}
						</AnimatePresence>
					</ErrorBoundary>
				</main>
			</LazyMotion>

			<ErrorBoundary>
				<PomodoroTimer open={activePanel === "pomodoro"} onClose={closePanel} />
			</ErrorBoundary>
			<ErrorBoundary>
				<MusicPlayer open={activePanel === "sounds"} onClose={closePanel} />
			</ErrorBoundary>
			<ErrorBoundary>
				<Dashboard open={activePanel === "dashboard"} onClose={closePanel} />
			</ErrorBoundary>
			<ErrorBoundary>
				<TimeScrubber
					open={activePanel === "scrubber"}
					onClose={closePanel}
					scrubberMinutes={scrubberMinutes}
					setScrubberMinutes={setScrubberMinutes}
					resetScrubber={resetScrubber}
					isScrubbing={isScrubbing}
					use24h={use24h}
					toggleTimeFormat={toggleTimeFormat}
				/>
			</ErrorBoundary>

			{showSearch && (
				<ZoneSearch
					onAdd={handleAddZone}
					onClose={() => setShowSearch(false)}
					existingIds={existingIds}
				/>
			)}
			<footer className="border-t border-(--color-border) px-3 sm:px-4 py-1.5 sm:py-2 flex items-center justify-between shrink-0 bg-(--color-background)">
				<span className="font-mono text-[7px] sm:text-[8px] uppercase tracking-widest text-(--color-muted-foreground)">
					Made by{" "}
					<a href="https://themvpguy.vercel.app/" target="_blank" rel="noopener noreferrer"
						className="hover:text-(--color-accent) transition-colors"
					>
						Muhammad Tanveer Abbas
					</a>
				</span>
				<div className="flex items-center gap-2 sm:gap-3">
					<a href="https://x.com/m_tanveerabbas" target="_blank" rel="noopener noreferrer"
						aria-label="X (Twitter)"
						className="font-mono text-[7px] sm:text-[8px] uppercase tracking-widest text-(--color-muted-foreground) hover:text-(--color-accent) transition-colors"
					>
						X
					</a>
					<a href="https://linkedin.com/in/muhammadtanveerabbas" target="_blank" rel="noopener noreferrer"
						aria-label="LinkedIn"
						className="font-mono text-[7px] sm:text-[8px] uppercase tracking-widest text-(--color-muted-foreground) hover:text-(--color-accent) transition-colors"
					>
						LinkedIn
					</a>
					<a href="https://github.com/muhammadtanveerabbas" target="_blank" rel="noopener noreferrer"
						aria-label="GitHub"
						className="font-mono text-[7px] sm:text-[8px] uppercase tracking-widest text-(--color-muted-foreground) hover:text-(--color-accent) transition-colors"
					>
						GitHub
					</a>
				</div>
			</footer>
			<CommandPalette open={showCommandPalette} onClose={() => setShowCommandPalette(false)} />
		</div>
	);
}
