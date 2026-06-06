import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
	return {
		name: "Zones World Clock",
		short_name: "Zones",
		description: "A premium timezone dashboard with Pomodoro timer, ambient sounds, and productivity analytics.",
		start_url: "/",
		display: "standalone",
		background_color: "#18181b",
		theme_color: "#18181b",
		orientation: "portrait-primary",
		categories: ["productivity", "utilities"],
		icons: [
			{
				src: "/favicon.svg",
				sizes: "any",
				type: "image/svg+xml",
			},
			{
				src: "/icon",
				sizes: "32x32",
				type: "image/png",
			},
			{
				src: "/icon-192",
				sizes: "192x192",
				type: "image/png",
			},
			{
				src: "/icon-512",
				sizes: "512x512",
				type: "image/png",
				purpose: "any",
			},
			{
				src: "/icon-maskable",
				sizes: "512x512",
				type: "image/png",
				purpose: "maskable",
			},
		],
		screenshots: [],
	};
}
