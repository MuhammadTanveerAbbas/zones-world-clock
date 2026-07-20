"use client";

import { DstIcon } from "@/components/icons";
import { getAmbientInlineGradient, getTimeOfDay } from "@/lib/time-of-day";
import { getTimezoneAbbreviation, getZoneTimeInfo } from "@/lib/time-utils";
import type { Zone } from "@/lib/zones";
import * as m from "motion/react-m";
import { useMemo } from "react";

export function GridView({
	zones,
	homeId,
	homeTz,
	displayTime,
	isScrubbing,
	use24h,
	onRemove,
	onSetHome,
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
	ambientMode?: boolean;
}) {
	const sorted = useMemo(() => {
		const home = zones.filter((z) => z.id === homeId);
		const others = zones.filter((z) => z.id !== homeId);
		return [...home, ...others];
	}, [zones, homeId]);

	return (
		<div className="p-2 sm:p-4 md:p-6">
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
				{sorted.map((zone, i) => {
					const isHome = zone.id === homeId;
					const { delta, deltaStr, timeStr, period, dayDelta, dstTransition } =
						getZoneTimeInfo(zone, homeId, homeTz, displayTime, use24h);
					const abbrev = getTimezoneAbbreviation(zone.tz, displayTime);
					const ambientGradient = ambientMode
						? getAmbientInlineGradient(
								getTimeOfDay(displayTime, zone.tz),
								"bottom",
								zone.countryCode,
							)
						: undefined;

					return (
						<m.div
							key={zone.id}
							initial={{ opacity: 0, scale: 0.95 }}
							animate={{ opacity: 1, scale: 1 }}
							transition={{ delay: i * 0.05 }}
							style={
								ambientGradient
									? { backgroundImage: ambientGradient }
									: undefined
							}
							className={`group relative flex flex-col gap-2 sm:gap-4 p-2.5 sm:p-5 md:p-6 border-[3px] border-(--color-border) transition-all duration-150 ${
								isHome
									? "sm:col-span-2 border-l-[6px] border-l-(--color-accent) bg-(--color-surface) shadow-[6px_6px_0_0_var(--pixel)]"
									: "bg-(--color-surface) shadow-[4px_4px_0_0_var(--pixel)] hover:shadow-[6px_6px_0_0_var(--pixel)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
							}`}
						>
							{!isHome && (
								<div className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 flex items-center gap-0.5 sm:gap-1 max-sm:opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
									<button
										type="button"
										onClick={() => onSetHome(zone.id)}
										className="font-sans font-semibold text-[7px] sm:text-[8px] uppercase tracking-wide border-[2.5px] border-(--color-border) px-1 sm:px-1.5 py-0.5 text-(--color-muted-foreground) hover:text-(--color-foreground) hover:border-(--color-muted) cursor-pointer transition-colors"
									>
										Set home
									</button>
									<button
										type="button"
										onClick={() => onRemove(zone.id)}
										className="font-sans font-semibold text-[7px] sm:text-[8px] uppercase tracking-wide border-[2.5px] border-(--color-border) px-1 sm:px-1.5 py-0.5 text-(--color-delta-negative) hover:border-(--color-delta-negative) cursor-pointer transition-colors"
									>
										&times;
									</button>
								</div>
							)}
							<div className="flex items-center gap-2 sm:gap-3">
								<span
									className={`fi fi-${zone.countryCode} shrink-0`}
									style={{
										fontSize: isHome
											? "clamp(1.8rem, 5vw, 3.5rem)"
											: "clamp(1.3rem, 4vw, 2.5rem)",
										lineHeight: 1,
									}}
								/>
								<div className="min-w-0 flex flex-col">
									<div className="font-sans text-base sm:text-xl md:text-2xl font-bold text-(--color-foreground) truncate tracking-wide uppercase leading-none">
										{isHome && <span className="home-prompt" />}
										{zone.label}
									</div>
									<div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
										<span className="font-sans text-[9px] sm:text-xs text-(--color-muted-foreground) truncate uppercase tracking-wide">
											{zone.sublabel}
										</span>
										{abbrev && (
											<span className="font-sans font-semibold text-[7px] sm:text-[8px] uppercase tracking-wide text-(--color-muted-foreground) border-[2.5px] border-(--color-border) px-1 py-0.5">
												{abbrev}
											</span>
										)}
										{dstTransition && (
											<span className="font-sans font-semibold text-[7px] sm:text-[8px] uppercase tracking-wide text-amber-500 flex items-center gap-0.5">
												<DstIcon size={10} />
												{dstTransition.label}
											</span>
										)}
										{isHome && (
											<span className="font-sans font-semibold text-[7px] sm:text-[8px] uppercase tracking-wide text-(--color-muted-foreground) border-[2.5px] border-(--color-border) px-1 py-0.5">
												Home
											</span>
										)}
									</div>
								</div>
								{deltaStr && (
									<span
										className={`ml-auto font-sans text-sm sm:text-lg font-bold tracking-wider ${
											delta > 0
												? "text-(--color-delta-positive)"
												: "text-(--color-delta-negative)"
										}`}
									>
										{deltaStr}
									</span>
								)}
							</div>
							<div className="flex items-baseline gap-1 sm:gap-1.5">
								<div
									className="font-mono font-bold tabular-nums tracking-wider"
									style={{
										fontSize: isHome
											? "clamp(32px, 6vw, 80px)"
											: "clamp(28px, 4vw, 60px)",
										lineHeight: 1,
									}}
								>
									{timeStr}
								</div>
								{period && (
									<span
										className="font-sans font-bold text-(--color-muted-foreground) tracking-wider"
										style={{
											fontSize: isHome
												? "clamp(12px, 2vw, 24px)"
												: "clamp(10px, 1.5vw, 18px)",
											lineHeight: 1,
										}}
									>
										{period}
									</span>
								)}
								{dayDelta !== 0 && (
									<span
										className={`font-sans text-xs sm:text-sm font-bold ml-1 ${
											dayDelta > 0
												? "text-(--color-delta-positive)"
												: "text-(--color-delta-negative)"
										}`}
									>
										{dayDelta > 0 ? "+1d" : "-1d"}
									</span>
								)}
							</div>
						</m.div>
					);
				})}
			</div>
		</div>
	);
}
