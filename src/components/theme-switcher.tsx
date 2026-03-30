"use client";

import { useClickSound } from "@/hooks/use-click-sound";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";

const THEMES = [
	{ value: "light", label: "Light", icon: "\u2600" },
	{ value: "dark", label: "Dark", icon: "\u25CF" },
	{ value: "system", label: "System", icon: "\u25D1" },
];

function getIcon(theme: string | undefined) {
	if (theme === "light") return "\u2600";
	if (theme === "dark") return "\u25CF";
	return "\u25D1";
}

export function ThemeSwitcher({
	ambientMode,
	onToggleAmbient,
}: {
	ambientMode: boolean;
	onToggleAmbient: () => void;
}) {
	const { theme, setTheme } = useTheme();
	const playClick = useClickSound();
	const [mounted, setMounted] = useState(false);
	const [open, setOpen] = useState(false);
	const ref = useRef<HTMLDivElement>(null);

	useEffect(() => setMounted(true), []);

	const handleClickOutside = useCallback((e: MouseEvent) => {
		if (ref.current && !ref.current.contains(e.target as Node)) {
			setOpen(false);
		}
	}, []);

	useEffect(() => {
		if (open) {
			document.addEventListener("mousedown", handleClickOutside);
			return () =>
				document.removeEventListener("mousedown", handleClickOutside);
		}
		return undefined;
	}, [open, handleClickOutside]);

	if (!mounted) return null;

	return (
		<>
			<div
				className="hidden sm:flex items-center gap-1"
				role="group"
				aria-label="Theme"
			>
				{THEMES.map(({ value, label }) => (
					<button
						key={value}
						type="button"
						aria-pressed={theme === value}
						onClick={() => {
							setTheme(value);
							playClick();
						}}
						className={`font-mono text-[10px] uppercase tracking-widest px-2.5 py-1.5 border rounded-md transition-all duration-200 cursor-pointer ${
							theme === value
								? "text-(--color-foreground) border-(--color-accent) bg-accent/10 shadow-sm"
								: "text-(--color-muted-foreground) border-transparent hover:text-(--color-foreground) hover:bg-(--color-foreground)/[0.04]"
						}`}
					>
						{label}
					</button>
				))}
			</div>

			<div ref={ref} className="relative sm:hidden">
				<button
					type="button"
					aria-label={`Theme: ${theme ?? "system"}`}
					aria-expanded={open}
					aria-haspopup="menu"
					onClick={() => {
						setOpen(!open);
						playClick();
					}}
					className="flex items-center justify-center w-9 h-9 border border-(--color-border) rounded-md text-(--color-foreground) transition-all duration-200 cursor-pointer hover:bg-accent/10 hover:border-(--color-accent)"
					style={{ fontSize: "16px" }}
				>
					{getIcon(theme)}
				</button>
				{open && (
					<div
						role="menu"
						className="absolute right-0 top-full mt-1 z-50 flex flex-col border border-(--color-border) bg-(--color-background) rounded-lg shadow-xl min-w-[120px] overflow-hidden"
					>
						{THEMES.map(({ value, label, icon }) => (
							<button
								key={value}
								type="button"
								role="menuitem"
								aria-pressed={theme === value}
								onClick={() => {
									setTheme(value);
									playClick();
									setOpen(false);
								}}
								className={`flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-3 py-2.5 transition-all duration-150 cursor-pointer text-left ${
									theme === value
										? "text-(--color-foreground) bg-accent/10"
										: "text-(--color-muted-foreground) hover:text-(--color-foreground) hover:bg-(--color-foreground)/[0.04]"
								}`}
							>
								<span aria-hidden="true" style={{ fontSize: "14px" }}>
									{icon}
								</span>
								{label}
							</button>
						))}
						<div className="border-t border-(--color-border)" />
						<button
							type="button"
							role="menuitem"
							aria-pressed={ambientMode}
							onClick={() => {
								onToggleAmbient();
								playClick();
								setOpen(false);
							}}
							className={`flex items-center gap-2 font-mono text-[11px] uppercase tracking-widest px-3 py-2.5 transition-all duration-150 cursor-pointer text-left ${
								ambientMode
									? "text-(--color-foreground) bg-accent/10"
									: "text-(--color-muted-foreground) hover:text-(--color-foreground) hover:bg-(--color-foreground)/[0.04]"
							}`}
						>
							<span aria-hidden="true" style={{ fontSize: "14px" }}>
								{ambientMode ? "\u2728" : "\u25CB"}
							</span>
							Ambient
						</button>
					</div>
				)}
			</div>
		</>
	);
}
