"use client";

import { useCallback, useRef } from "react";
import { audioManager } from "@/lib/audio-manager";

export function useClickSound() {
	const audioCtxRef = useRef<AudioContext | null>(null);

	const playClick = useCallback(() => {
		try {
			if (!audioCtxRef.current) {
				const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
				audioCtxRef.current = new Ctor();
			}
			const ctx = audioCtxRef.current;
			if (ctx.state === "suspended") ctx.resume();
			const vol = audioManager.getVolume();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.type = "sine";
			osc.frequency.value = 2200;
			gain.gain.setValueAtTime(0.08 * vol, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.035);
			osc.start(ctx.currentTime);
			osc.stop(ctx.currentTime + 0.035);
		} catch {}
	}, []);

	return playClick;
}
