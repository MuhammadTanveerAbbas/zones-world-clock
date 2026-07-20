"use client";

import { DstIcon } from "@/components/icons";
import type { ZoneGroup } from "@/lib/group-zones";
import { getAmbientInlineGradient, getTimeOfDay } from "@/lib/time-of-day";
import { formatDeltaHours, getDSTTransitionInfo } from "@/lib/time-utils";
import * as m from "motion/react-m";

export function GroupedZoneRow({
	group,
	homeId,
	isScrubbing,
	ambientMode,
	displayTime,
}: {
	group: ZoneGroup;
	homeId: string;
	isScrubbing: boolean;
	ambientMode?: boolean;
	displayTime?: Date;
}) {
	const isHomeGroup = group.offset === 0;
	const deltaStr = formatDeltaHours(group.offset);

	const ambientGradient =
		ambientMode && displayTime
			? getAmbientInlineGradient(
					getTimeOfDay(displayTime, group.tz),
					"right",
					group.zones[0]?.countryCode,
				)
			: undefined;

	const cityNames = group.zones.map((z) => z.label).join(", ");
	const sublabels = group.zones.map((z) => z.sublabel).join(" / ");
	const dstTransition = displayTime
		? getDSTTransitionInfo(group.tz, displayTime)
		: null;

	return (
		<m.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
			style={ambientGradient ? { backgroundImage: ambientGradient } : undefined}
			aria-label={`${cityNames}  ${group.timeStr}${group.period ? ` ${group.period}` : ""}${deltaStr ? `, ${deltaStr}` : ""}`}
			className={`flex items-center justify-between px-3 sm:px-6 py-3 sm:py-4 border-[3px] border-(--color-border) transition-all duration-150 ${
				isHomeGroup
					? "border-l-[6px] border-l-(--color-foreground) bg-(--color-surface) shadow-[6px_6px_0_0_var(--pixel)]"
					: "bg-(--color-surface) shadow-[4px_4px_0_0_var(--pixel)] hover:shadow-[6px_6px_0_0_var(--pixel)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
			}`}
		>
			<div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
				<div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
					{group.zones.map((zone) => (
						<span
							key={zone.id}
							className={`fi fi-${zone.countryCode}`}
							aria-hidden="true"
							style={{ fontSize: "clamp(1.6rem, 4vw, 2.8rem)", lineHeight: 1 }}
						/>
					))}
				</div>
				<div className="flex flex-col min-w-0">
					<div className="flex items-center gap-2">
						<span
							className="font-sans font-bold text-(--color-foreground) tracking-wide uppercase leading-none truncate"
							style={{ fontSize: "clamp(13px, 2.2vw, 22px)" }}
						>
							{isHomeGroup && <span className="home-prompt" />}
							{cityNames}
						</span>
						{isHomeGroup && (
							<span className="font-sans font-semibold uppercase tracking-wide text-(--color-muted-foreground) border-[2.5px] border-(--color-border) px-1.5 py-0.5 text-[9px] shrink-0">
								home
							</span>
						)}
					</div>
					<span
						className="font-sans text-(--color-muted-foreground) uppercase tracking-wide truncate mt-0.5"
						style={{ fontSize: "clamp(9px, 1.2vw, 13px)" }}
					>
						{sublabels}
					</span>
					<div className="flex items-center gap-1.5 mt-0.5">
						{group.abbreviation && (
							<span className="font-sans font-semibold text-[7px] sm:text-[8px] uppercase tracking-wide text-(--color-muted-foreground) border-[2.5px] border-(--color-border) px-1 py-0.5">
								{group.abbreviation}
							</span>
						)}
						{group.dst && (
							<span className="font-sans font-semibold text-[7px] sm:text-[8px] uppercase tracking-wide text-amber-500 flex items-center gap-0.5">
								<DstIcon size={10} />
								DST
							</span>
						)}
						{dstTransition && (
							<span className="font-sans font-semibold text-[7px] sm:text-[8px] uppercase tracking-wide text-amber-500 flex items-center gap-0.5">
								<DstIcon size={10} />
								{dstTransition.label}
							</span>
						)}
					</div>
				</div>
			</div>

			<div className="flex items-baseline gap-1.5 sm:gap-2 shrink-0">
				<div className="flex flex-col items-end gap-0.5">
					{deltaStr && (
						<m.span
							key={deltaStr}
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							className={`font-sans font-bold tracking-wider text-right ${
								group.offset > 0
									? "text-(--color-delta-positive)"
									: "text-(--color-delta-negative)"
							}`}
							style={{ fontSize: "clamp(10px, 1.4vw, 14px)" }}
						>
							{deltaStr}
							{group.dayDelta !== 0 && (
								<span className="ml-1">
									{group.dayDelta > 0 ? "+1d" : "-1d"}
								</span>
							)}
						</m.span>
					)}
				</div>
				<div className="flex items-baseline gap-1">
					<span
						className={`font-mono font-bold tabular-nums tracking-wider transition-opacity ${
							isScrubbing && !isHomeGroup ? "opacity-70" : ""
						}`}
						style={{ fontSize: "clamp(22px, 4vw, 42px)", lineHeight: 1 }}
					>
						{group.timeStr}
					</span>
					{group.period && (
						<span
							className="font-sans font-bold text-(--color-muted-foreground) tracking-wider"
							style={{ fontSize: "clamp(10px, 1.4vw, 14px)", lineHeight: 1 }}
						>
							{group.period}
						</span>
					)}
				</div>
			</div>
		</m.div>
	);
}
