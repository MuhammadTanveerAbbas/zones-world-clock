"use client";

import { groupZones } from "@/lib/group-zones";
import type { Zone } from "@/lib/zones";
import { useMemo } from "react";
import { GroupedZoneRow } from "./grouped-zone-row";

export function ZoneStack({
	zones,
	homeId,
	homeTz,
	displayTime,
	isScrubbing,
	use24h,
}: {
	zones: Zone[];
	homeId: string;
	homeTz: string;
	displayTime: Date;
	isScrubbing: boolean;
	use24h: boolean;
}) {
	const groups = useMemo(
		() => groupZones(zones, homeId, homeTz, displayTime, use24h),
		[zones, homeId, homeTz, displayTime, use24h],
	);

	return (
		<div className="flex-1 flex flex-col min-h-0">
			{groups.map((group) => (
				<GroupedZoneRow
					key={`group-${group.offset}`}
					group={group}
					homeId={homeId}
					isScrubbing={isScrubbing}
				/>
			))}
		</div>
	);
}
