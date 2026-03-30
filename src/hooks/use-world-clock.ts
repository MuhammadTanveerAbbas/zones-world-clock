"use client";

import { useCallback, useEffect, useState } from "react";

export function useWorldClock() {
	const [now, setNow] = useState<Date>(new Date());
	const [scrubberMinutes, setScrubberMinutes] = useState(0);

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 1000);
		return () => clearInterval(id);
	}, []);

	const isScrubbing = scrubberMinutes !== 0;
	const baseTime = isScrubbing
		? new Date(Math.round(now.getTime() / (30 * 60_000)) * (30 * 60_000))
		: now;
	const displayTime = new Date(baseTime.getTime() + scrubberMinutes * 60_000);
	const resetScrubber = useCallback(() => setScrubberMinutes(0), []);

	return {
		now,
		displayTime,
		scrubberMinutes,
		setScrubberMinutes,
		isScrubbing,
		resetScrubber,
	};
}
