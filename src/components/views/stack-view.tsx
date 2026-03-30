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
		<div className="flex-1 flex flex-col min-h-0">
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
