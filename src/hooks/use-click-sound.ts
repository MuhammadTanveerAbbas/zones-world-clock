"use client";

import { useCallback, useRef } from "react";

export function useClickSound() {
	const audioCtxRef = useRef<AudioContext | null>(null);

	const playClick = useCallback(() => {
		if (!audioCtxRef.current) {
			audioCtxRef.current = new AudioContext();
		}
		const ctx = audioCtxRef.current;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.type = "sine";
		osc.frequency.value = 2200;
		gain.gain.setValueAtTime(0.08, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + 0.035);
	}, []);

	return playClick;
}
