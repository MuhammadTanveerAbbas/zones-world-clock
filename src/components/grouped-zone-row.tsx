"use client";

import type { ZoneGroup } from "@/lib/group-zones";
import { getAmbientInlineGradient, getTimeOfDay } from "@/lib/time-of-day";
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
	const deltaSign = group.offset > 0 ? "+" : "";
	const deltaStr = group.offset !== 0 ? `${deltaSign}${group.offset}h` : "";

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

	return (
		<m.div
			initial={{ opacity: 0, y: 12 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
			style={ambientGradient ? { backgroundImage: ambientGradient } : undefined}
			aria-label={`${cityNames}  ${group.timeStr}${group.period ? ` ${group.period}` : ""}${deltaStr ? `, ${deltaStr}` : ""}`}
			className={`group flex flex-col sm:flex-row sm:items-center sm:justify-between px-3 sm:px-5 md:px-8 lg:px-12 py-1 sm:py-0 border-b border-(--color-border) transition-colors flex-1 min-h-0 overflow-hidden ${
				isHomeGroup
					? "border-l-2 border-l-(--color-foreground) bg-foreground/2"
					: "border-l-2 border-l-transparent hover:bg-foreground/2"
			}`}
		>
			{/* Mobile: city name above */}
			<div
				className="sm:hidden font-mono font-bold text-(--color-foreground) tracking-wider uppercase leading-none truncate"
				style={{ fontSize: "clamp(14px, 4vw, 22px)" }}
			>
				{cityNames}
			</div>

			<div className="flex items-center justify-between sm:justify-start sm:gap-4 md:gap-5 min-w-0 flex-1 sm:flex-1">
				<div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
					{/* Flags */}
					<div className="flex items-center gap-1 sm:gap-2 shrink-0">
						{group.zones.map((zone) => (
							<span
								key={zone.id}
								className={`fi fi-${zone.countryCode} rounded`}
								aria-hidden="true"
								style={{
									fontSize:
										group.zones.length > 2
											? "clamp(2rem, 6vw, 4rem)"
											: "clamp(2.5rem, 8vw, 5rem)",
									lineHeight: 1,
								}}
							/>
						))}
					</div>
					{/* Mobile: badges */}
					<div className="flex items-center gap-1 sm:hidden">
						{isHomeGroup && (
							<span
								className="font-mono uppercase tracking-widest text-(--color-muted-foreground) border border-(--color-border) px-1 py-0.5 shrink-0"
								style={{ fontSize: "8px" }}
							>
								home
							</span>
						)}
						{deltaStr && (
							<m.span
								key={deltaStr}
								initial={{ scale: 0.9, opacity: 0 }}
								animate={{ scale: 1, opacity: 1 }}
								className={`font-mono font-bold tracking-wider ${
									group.offset > 0
										? "text-(--color-delta-positive)"
										: "text-(--color-delta-negative)"
								}`}
								style={{ fontSize: "clamp(12px, 3vw, 16px)" }}
							>
								{deltaStr}
							</m.span>
						)}
						{group.dayDelta !== 0 && (
							<span
								className={`font-mono font-bold ${
									group.dayDelta > 0
										? "text-(--color-delta-positive)"
										: "text-(--color-delta-negative)"
								}`}
								style={{ fontSize: "clamp(10px, 2.5vw, 14px)" }}
							>
								{group.dayDelta > 0 ? "+1d" : "-1d"}
							</span>
						)}
					</div>
				</div>

				{/* Mobile: time */}
				<div className="flex items-baseline gap-1 shrink-0 sm:hidden">
					<div
						className="font-mono font-bold tabular-nums tracking-wider"
						style={{ fontSize: "clamp(36px, 12vw, 64px)", lineHeight: 1 }}
					>
						{group.timeStr}
					</div>
					{group.period && (
						<span
							className="font-mono font-bold text-(--color-muted-foreground) tracking-wider"
							style={{ fontSize: "clamp(11px, 2.5vw, 16px)", lineHeight: 1 }}
						>
							{group.period}
						</span>
					)}
				</div>

				{/* Desktop: city + sublabel */}
				<div className="hidden sm:flex sm:flex-col min-w-0">
					<div
						className="font-mono font-bold text-(--color-foreground) tracking-wider uppercase leading-none truncate"
						style={{ fontSize: "clamp(14px, 4vw, 52px)" }}
					>
						{cityNames}
					</div>
					<div className="flex items-center gap-1.5 sm:gap-2 mt-0.5">
						<span
							className="font-mono text-(--color-muted-foreground) uppercase tracking-widest truncate"
							style={{ fontSize: "clamp(7px, 1.3vw, 16px)" }}
						>
							{sublabels}
						</span>
						{isHomeGroup && (
							<span
								className="font-mono uppercase tracking-widest text-(--color-muted-foreground) border border-(--color-border) px-1 sm:px-1.5 py-0.5 shrink-0"
								style={{ fontSize: "clamp(7px, 1vw, 11px)" }}
							>
								home
							</span>
						)}
					</div>
				</div>
			</div>

			{/* Desktop: delta + time */}
			<div className="hidden sm:flex items-baseline gap-1 sm:gap-2 shrink-0">
				{deltaStr && (
					<m.span
						key={deltaStr}
						initial={{ scale: 0.9, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						className={`font-mono font-bold tracking-wider ${
							group.offset > 0
								? "text-(--color-delta-positive)"
								: "text-(--color-delta-negative)"
						}`}
						style={{ fontSize: "clamp(12px, 2.5vw, 28px)" }}
					>
						{deltaStr}
					</m.span>
				)}
				{group.dayDelta !== 0 && (
					<span
						className={`font-mono font-bold ${
							group.dayDelta > 0
								? "text-(--color-delta-positive)"
								: "text-(--color-delta-negative)"
						}`}
						style={{ fontSize: "clamp(10px, 2vw, 22px)" }}
					>
						{group.dayDelta > 0 ? "+1d" : "-1d"}
					</span>
				)}
				<div
					className={`font-mono font-bold tabular-nums tracking-wider transition-opacity ${
						isScrubbing && !isHomeGroup ? "opacity-80" : ""
					}`}
					style={{ fontSize: "clamp(32px, 8vw, 100px)", lineHeight: 1 }}
				>
					{group.timeStr}
				</div>
				{group.period && (
					<span
						className="font-mono font-bold text-(--color-muted-foreground) tracking-wider"
						style={{ fontSize: "clamp(11px, 2vw, 24px)", lineHeight: 1 }}
					>
						{group.period}
					</span>
				)}
			</div>
		</m.div>
	);
}
