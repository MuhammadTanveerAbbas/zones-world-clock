"use client";

import { GroupedZoneRow } from "@/components/grouped-zone-row";
import type { ZoneGroup } from "@/lib/group-zones";

export function StackView({
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
	homeTz?: string;
}) {
	return (
		<div className="flex-1 overflow-y-auto scrollbar-hide px-3 sm:px-6 md:px-10 py-3 sm:py-5 flex flex-col gap-2 sm:gap-3">
			{groups.map((group) => (
				<GroupedZoneRow
					key={`group-${group.offset}`}
					group={group}
					homeId={homeId}
					isScrubbing={isScrubbing}
					ambientMode={ambientMode}
					displayTime={displayTime}
				/>
			))}
		</div>
	);
}
