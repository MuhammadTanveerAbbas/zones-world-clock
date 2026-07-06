"use client";

import { getAmbientInlineGradient, getTimeOfDay } from "@/lib/time-of-day";
import {
	formatDate,
	getTimezoneAbbreviation,
	getZoneTimeInfo,
	isDST,
} from "@/lib/time-utils";
import type { Zone } from "@/lib/zones";
import { Reorder } from "motion/react";
import { useMemo } from "react";
import { DstIcon } from "../icons";

export function ScrollView({
	zones,
	homeId,
	homeTz,
	displayTime,
	isScrubbing,
	use24h,
	onRemove,
	onSetHome,
	onReorder,
	ambientMode,
}: {
	zones: Zone[];
	homeId: string;
	homeTz: string;
	displayTime: Date;
	isScrubbing: boolean;
	use24h: boolean;
	onRemove: (id: string) => void;
	onSetHome: (id: string) => void;
	onReorder: (ids: string[]) => void;
	ambientMode?: boolean;
}) {
	const sorted = useMemo(() => {
		const home = zones.filter((z) => z.id === homeId);
		const others = zones.filter((z) => z.id !== homeId);
		return [...home, ...others];
	}, [zones, homeId]);

	return (
		<div className="flex-1 overflow-y-auto">
			<Reorder.Group
				axis="y"
				values={sorted.map((z) => z.id)}
				onReorder={(newIds) => onReorder(newIds)}
				className="flex flex-col gap-1.5 sm:gap-2 p-2 sm:p-4 md:p-6"
			>
				{sorted.map((zone) => {
					const isHome = zone.id === homeId;
					const { delta, deltaStr, timeStr, period, dayDelta } =
						getZoneTimeInfo(zone, homeId, homeTz, displayTime, use24h);
					const abbrev = getTimezoneAbbreviation(zone.tz, displayTime);
					const dst = isDST(zone.tz, displayTime);
					const dateStr = formatDate(displayTime, zone.tz);
					const ambientGradient = ambientMode
						? getAmbientInlineGradient(
								getTimeOfDay(displayTime, zone.tz),
								"right",
								zone.countryCode,
							)
						: undefined;

					return (
						<Reorder.Item
							key={zone.id}
							value={zone.id}
							dragListener={!isHome}
							style={
								ambientGradient
									? { backgroundImage: ambientGradient }
									: undefined
							}
							className={`group relative border border-(--color-border) rounded-lg transition-all duration-200 px-2 sm:px-5 md:px-8 py-2.5 sm:py-5 ${
								isHome
									? "border-l-4 border-l-(--color-accent) bg-(--color-accent)/[0.05]"
									: "hover:bg-(--color-foreground)/[0.02] hover:border-(--color-muted) cursor-grab active:cursor-grabbing"
							}`}
						>
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2 sm:gap-4 min-w-0 flex-1">
									<span
										className={`fi fi-${zone.countryCode} shrink-0 rounded`}
										style={{
											fontSize: "clamp(1.5rem, 4vw, 3.5rem)",
											lineHeight: 1,
										}}
									/>
									<div className="min-w-0 flex-1">
										<div className="flex items-center justify-between gap-2">
											<div className="font-mono text-base sm:text-2xl md:text-3xl font-bold text-(--color-foreground) tracking-wider uppercase leading-none truncate">
												{zone.label}
											</div>
											<div className="flex items-baseline gap-0.5 sm:gap-1 shrink-0">
												<div
													className="font-mono font-bold tabular-nums tracking-wider"
													style={{
														fontSize: "clamp(20px, 5vw, 72px)",
														lineHeight: 1,
													}}
												>
													{timeStr}
												</div>
												<div className="flex flex-col items-end">
													{period && (
														<span
															className="font-mono font-bold text-(--color-muted-foreground) tracking-wider"
															style={{
																fontSize: "clamp(8px, 1.5vw, 20px)",
																lineHeight: 1,
															}}
														>
															{period}
														</span>
													)}
													{dateStr && (
														<span className="font-mono text-[7px] sm:text-[9px] text-(--color-muted-foreground) tracking-wider mt-0.5">
															{dateStr}
														</span>
													)}
												</div>
											</div>
										</div>
									</div>
								</div>
							</div>
							<div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 sm:mt-1">
								<span className="font-mono text-[9px] sm:text-xs md:text-sm text-(--color-muted-foreground) uppercase tracking-widest truncate">
									{zone.sublabel}
								</span>
								{abbrev && (
									<span className="font-mono text-[7px] sm:text-[9px] uppercase tracking-widest text-(--color-muted-foreground) border border-(--color-border) px-1 py-0.5 rounded">
										{abbrev}
									</span>
								)}
								{dst && (
									<span className="font-mono text-[7px] sm:text-[9px] uppercase tracking-widest text-amber-500 flex items-center gap-0.5">
										<DstIcon size={10} />
										DST
									</span>
								)}
								{isHome && (
									<span className="font-mono text-[7px] sm:text-[9px] uppercase tracking-widest text-(--color-muted-foreground) border border-(--color-border) px-1 sm:px-1.5 py-0.5 rounded">
										Home
									</span>
								)}
								{deltaStr && (
									<span
										className={`font-mono text-xs sm:text-base md:text-lg font-bold tracking-wider ${
											delta > 0
												? "text-(--color-delta-positive)"
												: "text-(--color-delta-negative)"
										}`}
									>
										{deltaStr}
									</span>
								)}
								{dayDelta !== 0 && (
									<span
										className={`font-mono text-[10px] sm:text-sm font-bold ${
											dayDelta > 0
												? "text-(--color-delta-positive)"
												: "text-(--color-delta-negative)"
										}`}
									>
										{dayDelta > 0 ? "+1d" : "-1d"}
									</span>
								)}
								{!isHome && (
									<div className="flex items-center gap-1 ml-auto max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
										<button
											type="button"
											onClick={() => onSetHome(zone.id)}
											className="font-mono text-[7px] sm:text-[9px] uppercase tracking-widest border border-(--color-border) px-1 sm:px-1.5 py-0.5 rounded text-(--color-muted-foreground) hover:text-(--color-foreground) hover:border-(--color-muted) cursor-pointer transition-colors"
										>
											Set home
										</button>
										<button
											type="button"
											onClick={() => onRemove(zone.id)}
											className="font-mono text-[7px] sm:text-[9px] uppercase tracking-widest border border-(--color-border) px-1 sm:px-1.5 py-0.5 rounded text-(--color-delta-negative) hover:border-(--color-delta-negative) cursor-pointer transition-colors"
										>
											&times;
										</button>
									</div>
								)}
							</div>
						</Reorder.Item>
					);
				})}
			</Reorder.Group>
		</div>
	);
}
