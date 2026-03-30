"use client";

import { TimeScrubber } from "@/components/time-scrubber";
import { ViewSwitcher } from "@/components/view-switcher";
import { CompactView } from "@/components/views/compact-view";
import { GridView } from "@/components/views/grid-view";
import { ScrollView } from "@/components/views/scroll-view";
import { StackView } from "@/components/views/stack-view";
import { ZoneSearch } from "@/components/zone-search";
import { useWorldClock } from "@/hooks/use-world-clock";
import { useZonesStore } from "@/hooks/use-zones-store";
import { groupZones } from "@/lib/group-zones";
import { LazyMotion, domAnimation } from "motion/react";
import { useCallback, useMemo, useState } from "react";

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

	const [showSearch, setShowSearch] = useState(false);

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
			/>
			<LazyMotion features={domAnimation}>
				<main className="flex-1 flex flex-col min-h-0">
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
							homeTz={homeTz}
						/>
					)}
				</main>
			</LazyMotion>
			<TimeScrubber
				scrubberMinutes={scrubberMinutes}
				setScrubberMinutes={setScrubberMinutes}
				resetScrubber={resetScrubber}
				isScrubbing={isScrubbing}
				use24h={use24h}
				toggleTimeFormat={toggleTimeFormat}
			/>
			<footer className="border-t border-(--color-border) px-2 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-1.5 sm:gap-2 shrink-0 bg-foreground/2">
				<span className="font-mono text-[8px] sm:text-[10px] uppercase tracking-widest text-(--color-muted-foreground) text-center sm:text-left">
					Made by{" "}
					<a
						href="https://themvpguy.vercel.app/"
						target="_blank"
						rel="noopener noreferrer"
						className="hover:text-(--color-accent) transition-colors duration-200"
					>
						Muhammad Tanveer Abbas
					</a>
				</span>
				<div className="flex items-center gap-2 sm:gap-3">
					<a
						href="https://x.com/m_tanveerabbas"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="X (Twitter)"
						className="font-mono text-[8px] sm:text-[10px] uppercase tracking-widest text-(--color-muted-foreground) hover:text-(--color-accent) transition-colors duration-200"
					>
						X
					</a>
					<a
						href="https://linkedin.com/in/muhammadtanveerabbas"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="LinkedIn"
						className="font-mono text-[8px] sm:text-[10px] uppercase tracking-widest text-(--color-muted-foreground) hover:text-(--color-accent) transition-colors duration-200"
					>
						LinkedIn
					</a>
					<a
						href="https://github.com/muhammadtanveerabbas"
						target="_blank"
						rel="noopener noreferrer"
						aria-label="GitHub"
						className="font-mono text-[8px] sm:text-[10px] uppercase tracking-widest text-(--color-muted-foreground) hover:text-(--color-accent) transition-colors duration-200"
					>
						GitHub
					</a>
				</div>
			</footer>
			{showSearch && (
				<ZoneSearch
					onAdd={handleAddZone}
					onClose={() => setShowSearch(false)}
					existingIds={existingIds}
				/>
			)}
		</div>
	);
}
