"use client";

import { isLocationDark } from "@/lib/solar-terminator";
import { MoonIcon, SunIcon } from "./icons";

export function DayNightGlyph({
	tz,
	date,
	size = 10,
}: {
	tz: string;
	date: Date;
	size?: number;
}) {
	const isDark = isLocationDark(tz, date);

	return (
		<span
			className="inline-flex items-center text-(--color-muted-foreground)"
			aria-label={isDark ? "Night" : "Day"}
			title={isDark ? "Night" : "Day"}
		>
			{isDark ? <MoonIcon size={size} /> : <SunIcon size={size} />}
		</span>
	);
}
