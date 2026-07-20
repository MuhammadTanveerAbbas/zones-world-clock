"use client";

import { CommandPalette } from "@/components/command-palette";
import { ErrorBoundary } from "@/components/error-boundary";
import { Footer } from "@/components/footer";
import { GlobeIcon } from "@/components/icons";
import { ViewSwitcher } from "@/components/view-switcher";
import { CompactView } from "@/components/views/compact-view";
import { GridView } from "@/components/views/grid-view";
import { ScrollView } from "@/components/views/scroll-view";
import { StackView } from "@/components/views/stack-view";
import { ZoneSearch } from "@/components/zone-search";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { useWorldClock } from "@/hooks/use-world-clock";
import { useZonesStore } from "@/hooks/use-zones-store";
import { groupZones } from "@/lib/group-zones";
import { store } from "@/lib/store";
import {
	AnimatePresence,
	LazyMotion,
	domAnimation,
	motion,
} from "motion/react";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useMemo, useState } from "react";

const PomodoroTimer = dynamic(
	() =>
		import("@/components/pomodoro-timer").then((m) => ({
			default: m.PomodoroTimer,
		})),
	{ ssr: false },
);
const MusicPlayer = dynamic(
	() =>
		import("@/components/music-player").then((m) => ({
			default: m.MusicPlayer,
		})),
	{ ssr: false },
);
const Dashboard = dynamic(
	() =>
		import("@/components/dashboard").then((m) => ({ default: m.Dashboard })),
	{ ssr: false },
);
const TimeScrubber = dynamic(
	() =>
		import("@/components/time-scrubber").then((m) => ({
			default: m.TimeScrubber,
		})),
	{ ssr: false },
);
const MeetingFinder = dynamic(
	() =>
		import("@/components/meeting-finder").then((m) => ({
			default: m.MeetingFinder,
		})),
	{ ssr: false },
);
const ZoneSharePanel = dynamic(
	() =>
		import("@/components/zone-share-panel").then((m) => ({
			default: m.ZoneSharePanel,
		})),
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
		workingHours,
	} = useZonesStore();

	const [activePanel, setActivePanel] = useState<
		"pomodoro" | "sounds" | "scrubber" | "dashboard" | "meeting" | null
	>(null);
	const [showSearch, setShowSearch] = useState(false);
	const [showCommandPalette, setShowCommandPalette] = useState(false);
	const [showSharePanel, setShowSharePanel] = useState(false);

	useEffect(() => {
		if (typeof window === "undefined" || !window.location.hash) return;
		if (store.importFromHash(window.location.hash)) {
			window.history.replaceState(null, "", window.location.pathname);
		}
	}, []);

	const closePanel = useCallback(() => setActivePanel(null), []);

	const toggleDashboard = useCallback(() => {
		setActivePanel((p) => (p === "dashboard" ? null : "dashboard"));
	}, []);

	useKeyboardShortcuts({
		a: { fn: () => setShowSearch(true) },
		t: { fn: toggleTimeFormat },
		d: { fn: toggleDashboard },
		p: {
			fn: () => setActivePanel((p) => (p === "pomodoro" ? null : "pomodoro")),
		},
		s: { fn: () => setActivePanel((p) => (p === "sounds" ? null : "sounds")) },
		m: {
			fn: () => setActivePanel((p) => (p === "meeting" ? null : "meeting")),
		},
		"1": { fn: () => setViewMode("stack") },
		"2": { fn: () => setViewMode("scroll") },
		"3": { fn: () => setViewMode("grid") },
		"4": { fn: () => setViewMode("compact") },
		"mod+k": { fn: () => setShowCommandPalette((v) => !v) },
		e: { fn: () => setShowSharePanel((v) => !v) },
		escape: {
			fn: () => {
				setShowSearch(false);
				setShowCommandPalette(false);
				setShowSharePanel(false);
				setActivePanel(null);
			},
			preventDefault: false,
		},
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
		<div className="flex flex-col h-dvh">
			<ViewSwitcher
				current={viewMode}
				onChange={setViewMode}
				onAddZone={() => setShowSearch(true)}
				ambientMode={ambientMode}
				onToggleAmbient={toggleAmbientMode}
				activePanel={activePanel}
				onPanelChange={setActivePanel}
			/>
			<div className="flex-1 min-h-0 overflow-y-auto">
				<LazyMotion features={domAnimation}>
					<main className="flex flex-col">
						<ErrorBoundary>
							<AnimatePresence mode="wait">
								{zones.length === 0 ? (
									<motion.div
										key="empty"
										initial={{ opacity: 0, y: 8 }}
										animate={{ opacity: 1, y: 0 }}
										exit={{ opacity: 0, y: -8 }}
										transition={{ duration: 0.2 }}
										className="flex-1 flex flex-col items-center justify-center p-8 text-(--color-muted-foreground) font-sans text-[10px] uppercase tracking-wide gap-3 min-h-[50vh]"
									>
										<GlobeIcon size={32} className="text-(--color-muted)" />
										<span>No time zones yet</span>
										<button
											type="button"
											onClick={() => setShowSearch(true)}
											className="neo-btn font-sans font-semibold text-[9px] uppercase tracking-wide px-3 py-1.5 border-[3px] border-(--color-accent) text-(--color-accent) hover:bg-(--color-accent) hover:text-white transition-all duration-100 cursor-pointer"
										>
											Add a time zone
										</button>
									</motion.div>
								) : (
									<motion.div
										key={viewMode}
										initial={{ opacity: 0, x: 12 }}
										animate={{ opacity: 1, x: 0 }}
										exit={{ opacity: 0, x: -12 }}
										transition={{ duration: 0.15 }}
										className="flex flex-col"
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
			</div>

			<Footer />

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
			<ErrorBoundary>
				<MeetingFinder
					open={activePanel === "meeting"}
					onClose={closePanel}
					zones={zones}
					homeTz={homeTz}
					referenceDate={displayTime}
					use24h={use24h}
					workingHours={workingHours}
				/>
			</ErrorBoundary>

			<ErrorBoundary>
				<ZoneSharePanel
					open={showSharePanel}
					onClose={() => setShowSharePanel(false)}
				/>
			</ErrorBoundary>

			{showSearch && (
				<ZoneSearch
					onAdd={handleAddZone}
					onClose={() => setShowSearch(false)}
					existingIds={existingIds}
				/>
			)}
			<CommandPalette
				open={showCommandPalette}
				onClose={() => setShowCommandPalette(false)}
				onToggleDashboard={toggleDashboard}
				onOpenShare={() => setShowSharePanel(true)}
			/>
		</div>
	);
}
