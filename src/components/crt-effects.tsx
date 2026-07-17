"use client";

import { useZonesStore } from "@/hooks/use-zones-store";
import { useTheme } from "next-themes";
import { useEffect } from "react";

export function CrtEffects() {
	const { scanlinesEnabled } = useZonesStore();
	const { resolvedTheme } = useTheme();

	useEffect(() => {
		const html = document.documentElement;
		const isTerminal = resolvedTheme === "terminal";
		html.classList.toggle("scanlines", true);
		html.classList.toggle("scanlines-enabled", isTerminal || scanlinesEnabled);
		html.classList.toggle("terminal", isTerminal);
		return () => {
			html.classList.remove("scanlines", "scanlines-enabled", "terminal");
		};
	}, [scanlinesEnabled, resolvedTheme]);

	return null;
}
