"use client";

import {
	DEFAULT_WORKING_HOURS,
	type HourSegment,
	findBestOverlapWindow,
	formatOverlapTime,
	getWorkingHourSegments,
} from "@/lib/meeting-overlap";
import type { Zone } from "@/lib/zones";
import { useMemo } from "react";
import { OverlayPanel } from "./ui/overlay-panel";

const SEGMENT_COLORS: Record<HourSegment, string> = {
	core: "bg-(--color-delta-positive)/60",
	edge: "bg-(--color-delta-positive)/25",
	off: "bg-(--color-muted)/30",
};

export function BusinessHoursHeatmap({
	zones,
	referenceDate,
	workingHours = DEFAULT_WORKING_HOURS,
}: {
	zones: Zone[];
	referenceDate: Date;
	workingHours?: { start: number; end: number };
}) {
	return (
		<div className="space-y-2">
			{zones.map((zone) => {
				const segments = getWorkingHourSegments(
					zone.tz,
					referenceDate,
					workingHours,
				);
				return (
					<div key={zone.id} className="flex items-center gap-2">
						<span className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground) w-16 truncate shrink-0">
							{zone.label}
						</span>
						<div
							className="flex flex-1 gap-px h-3"
							role="img"
							aria-label={`Working hours heatmap for ${zone.label}`}
						>
							{segments.map((seg, i) => (
								<div
									key={`${zone.id}-h-${i}`}
									className={`flex-1 ${SEGMENT_COLORS[seg]}`}
									title={`${i}:00 — ${seg}`}
								/>
							))}
						</div>
					</div>
				);
			})}
			<div className="flex items-center gap-3 font-mono text-[7px] uppercase tracking-widest text-(--color-muted-foreground)">
				<span className="flex items-center gap-1">
					<span className="w-2 h-2 bg-(--color-delta-positive)/60" />
					Core
				</span>
				<span className="flex items-center gap-1">
					<span className="w-2 h-2 bg-(--color-delta-positive)/25" />
					Edge
				</span>
				<span className="flex items-center gap-1">
					<span className="w-2 h-2 bg-(--color-muted)/30" />
					Off
				</span>
			</div>
		</div>
	);
}

export function MeetingFinder({
	open,
	onClose,
	zones,
	homeTz,
	referenceDate,
	use24h,
	workingHours,
}: {
	open: boolean;
	onClose: () => void;
	zones: Zone[];
	homeTz: string;
	referenceDate: Date;
	use24h: boolean;
	workingHours: { start: number; end: number };
}) {
	const overlap = useMemo(
		() => findBestOverlapWindow(zones, referenceDate, workingHours),
		[zones, referenceDate, workingHours],
	);

	const timelineSegments = useMemo(() => {
		if (!overlap) return null;
		const slots = 48;
		return Array.from({ length: slots }, (_, i) => {
			const min = i * 30;
			const inWindow = min >= overlap.startMinutes && min < overlap.endMinutes;
			return inWindow ? "overlap" : "off";
		});
	}, [overlap]);

	return (
		<OverlayPanel
			open={open}
			onClose={onClose}
			title="Meeting Time Finder"
			width="lg"
		>
			<div className="p-4 sm:p-5 space-y-4">
				<p className="font-mono text-[9px] uppercase tracking-widest text-(--color-muted-foreground)">
					Working hours: {workingHours.start}:00 – {workingHours.end}:00 per
					zone
				</p>

				{overlap ? (
					<div className="space-y-3">
						<div className="p-3 border border-(--color-border) bg-(--color-delta-positive)/5">
							<p className="font-mono text-[10px] uppercase tracking-widest text-(--color-foreground) font-bold">
								Best overlap window
							</p>
							<p className="font-mono text-sm tabular-nums mt-1 text-(--color-foreground)">
								{formatOverlapTime(
									overlap.startMinutes,
									homeTz,
									referenceDate,
									use24h,
								)}{" "}
								–{" "}
								{formatOverlapTime(
									overlap.endMinutes,
									homeTz,
									referenceDate,
									use24h,
								)}{" "}
								({Math.floor(overlap.durationMinutes / 60)}h{" "}
								{overlap.durationMinutes % 60}m)
							</p>
						</div>

						{timelineSegments && (
							<div className="space-y-1">
								<span className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground)">
									24h timeline (home reference)
								</span>
								<div
									className="flex gap-px h-4"
									role="img"
									aria-label="Overlap timeline"
								>
									{timelineSegments.map((seg, i) => (
										<div
											key={`tl-${i}`}
											className={`flex-1 ${
												seg === "overlap"
													? "bg-(--color-delta-positive)"
													: "bg-(--color-muted)/25"
											}`}
										/>
									))}
								</div>
							</div>
						)}
					</div>
				) : (
					<p className="font-mono text-[10px] text-(--color-muted-foreground)">
						No overlapping working-hours window found for all {zones.length}{" "}
						zones today. Try adjusting working hours or fewer zones.
					</p>
				)}

				<div className="border-t border-(--color-border) pt-3">
					<p className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground) mb-2">
						Per-zone heatmap
					</p>
					<BusinessHoursHeatmap
						zones={zones}
						referenceDate={referenceDate}
						workingHours={workingHours}
					/>
				</div>
			</div>
		</OverlayPanel>
	);
}
