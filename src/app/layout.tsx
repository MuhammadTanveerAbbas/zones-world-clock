import { PWARegister } from "@/components/pwa-register";
import { ThemeProvider } from "@/components/theme-provider";
import { GeistMono } from "geist/font/mono";
import { GeistSans } from "geist/font/sans";
import type { Metadata } from "next";
import "flag-icons/css/flag-icons.min.css";
import "./globals.css";

export const metadata: Metadata = {
	title: "Zones World Clock",
	description:
		"A personal timezone dashboard for tracking time across the world.",
	manifest: "/manifest.json",
	icons: {
		icon: [
			{ url: "/icon", type: "image/png", sizes: "32x32" },
			{ url: "/favicon.svg", type: "image/svg+xml" },
			{ url: "/icon-192", sizes: "192x192", type: "image/png" },
			{ url: "/icon-512", sizes: "512x512", type: "image/png" },
		],
		apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
	},
	appleWebApp: {
		capable: true,
		statusBarStyle: "default",
		title: "Zones",
	},
	other: {
		"mobile-web-app-capable": "yes",
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<meta
					name="theme-color"
					content="#0a0a0a"
					media="(prefers-color-scheme: dark)"
				/>
				<meta
					name="theme-color"
					content="#fafafa"
					media="(prefers-color-scheme: light)"
				/>
				<link rel="manifest" href="/manifest.json" />
			</head>
			<body
				className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-(--color-background) text-(--color-foreground)`}
			>
				<ThemeProvider>
					{children}
					<PWARegister />
				</ThemeProvider>
			</body>
		</html>
	);
}
