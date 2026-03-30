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
	icons: {
		icon: [
			{ url: "/icon", type: "image/png", sizes: "32x32" },
			{ url: "/favicon.svg", type: "image/svg+xml" },
		],
		apple: [{ url: "/apple-icon", sizes: "180x180", type: "image/png" }],
	},
};

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en" suppressHydrationWarning>
			<body
				className={`${GeistSans.variable} ${GeistMono.variable} font-sans antialiased bg-(--color-background) text-(--color-foreground)`}
			>
				<ThemeProvider>{children}</ThemeProvider>
			</body>
		</html>
	);
}
