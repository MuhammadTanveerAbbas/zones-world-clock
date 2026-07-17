"use client";

import { fetchLatestEpicImage, getCachedEpicImage } from "@/lib/epic-api";
import { useEffect, useState } from "react";

export function EarthBackdrop({ enabled }: { enabled: boolean }) {
	const [imageUrl, setImageUrl] = useState<string | null>(() =>
		typeof window !== "undefined" ? (getCachedEpicImage()?.url ?? null) : null,
	);

	useEffect(() => {
		if (!enabled) return;
		const cached = getCachedEpicImage();
		if (cached) setImageUrl(cached.url);
		fetchLatestEpicImage().then((img) => {
			if (img) setImageUrl(img.url);
		});
	}, [enabled]);

	if (!enabled || !imageUrl) return null;

	return (
		<div
			className="fixed inset-0 z-0 pointer-events-none opacity-[0.08]"
			aria-hidden="true"
		>
			<img
				src={imageUrl}
				alt=""
				className="w-full h-full object-cover"
				style={{ imageRendering: "auto" }}
			/>
		</div>
	);
}
