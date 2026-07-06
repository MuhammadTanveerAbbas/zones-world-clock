"use client";

import { audioManager } from "@/lib/audio-manager";
import { useCallback } from "react";

export function useClickSound() {
	const playClick = useCallback(() => {
		audioManager.playClick();
	}, []);

	return playClick;
}
