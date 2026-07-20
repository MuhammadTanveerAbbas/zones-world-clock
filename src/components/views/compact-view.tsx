"use client";

import type { ZoneGroup } from "@/lib/group-zones";
import { getAmbientInlineGradient, getTimeOfDay } from "@/lib/time-of-day";
import { formatDeltaHours } from "@/lib/time-utils";
import * as m from "motion/react-m";

export function CompactView({
	groups,
	homeId,
	isScrubbing,
	ambientMode,
	displayTime,
}: {
	groups: ZoneGroup[];
	homeId: string;
	isScrubbing: boolean;
	ambientMode?: boolean;
	displayTime?: Date;
}) {
	return (
		<div className="p-2 sm:p-6 md:p-10">
			<div className="flex flex-col gap-2 sm:gap-3 w-full">
				{groups.map((group, i) => {
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

					return (
						<m.div
							key={`compact-${group.offset}`}
							initial={{ opacity: 0, y: 8 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ delay: i * 0.06 }}
							style={
								ambientGradient
									? { backgroundImage: ambientGradient }
									: undefined
							}
							className={`flex items-center justify-between gap-2 sm:gap-3 px-3 sm:px-5 py-2.5 sm:py-4 border-[3px] border-(--color-border) transition-all duration-150 ${
								isHomeGroup
									? "border-l-[6px] border-l-accent bg-(--color-surface) shadow-[6px_6px_0_0_var(--pixel)]"
									: "bg-(--color-surface) shadow-[4px_4px_0_0_var(--pixel)] hover:shadow-[6px_6px_0_0_var(--pixel)] hover:translate-x-[-2px] hover:translate-y-[-2px]"
							}`}
						>
							<div className="flex items-center gap-1.5 sm:gap-3 min-w-0 flex-1">
								<div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
									{group.zones.map((zone) => (
										<span
											key={zone.id}
											className={`fi fi-${zone.countryCode}`}
											style={{
												fontSize: "clamp(1rem, 3vw, 1.8rem)",
												lineHeight: 1,
											}}
										/>
									))}
								</div>
								<div className="flex flex-col min-w-0">
									<span className="font-sans text-xs sm:text-sm font-bold tracking-wide uppercase text-(--color-foreground) leading-none truncate">
										{group.zones.map((z) => z.label).join(", ")}
									</span>
									{deltaStr && (
										<span
											className={`font-sans text-[9px] sm:text-xs font-bold tracking-wider ${
												group.offset > 0
													? "text-(--color-delta-positive)"
													: "text-(--color-delta-negative)"
											}`}
										>
											{deltaStr}
										</span>
									)}
								</div>
							</div>
							<div className="flex items-baseline gap-0.5 sm:gap-1 shrink-0">
								<span
									className="font-mono text-lg sm:text-2xl font-bold tabular-nums tracking-wider"
									style={{ lineHeight: 1 }}
								>
									{group.timeStr}
								</span>
								{group.period && (
									<span className="font-sans text-[9px] sm:text-xs font-bold text-(--color-muted-foreground) tracking-wider">
										{group.period}
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
