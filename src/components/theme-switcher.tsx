"use client";

import { useClickSound } from "@/hooks/use-click-sound";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { PixelButton, PixelBadge } from "./ui/pixel-button";
import { MoonIcon, SparkleIcon, SparkleOffIcon, SunIcon, SystemIcon } from "./icons";

type ThemeValue = "light" | "dark" | "system";

const THEMES: { value: ThemeValue; label: string; icon: React.ReactNode }[] = [
	{ value: "light", label: "Light", icon: <SunIcon size={12} /> },
	{ value: "dark", label: "Dark", icon: <MoonIcon size={12} /> },
	{ value: "system", label: "System", icon: <SystemIcon size={12} /> },
];

function IconForTheme(theme: string | undefined) {
	if (theme === "light") return <SunIcon size={14} />;
	if (theme === "dark") return <MoonIcon size={14} />;
	return <SystemIcon size={14} />;
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
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
		return undefined;
	}, [open, handleClickOutside]);

	if (!mounted) return null;

	return (
		<>
			<div
				className="hidden sm:flex items-center gap-0.5"
				role="group"
				aria-label="Theme"
			>
				{THEMES.map(({ value, label, icon }) => (
					<PixelButton
						key={value}
						variant="outline"
						size="sm"
						active={theme === value}
						icon={icon}
						onClick={() => {
							setTheme(value);
							playClick();
						}}
						aria-pressed={theme === value}
					>
						{label}
					</PixelButton>
				))}
			</div>

			<div ref={ref} className="relative sm:hidden">
				<PixelButton
					variant="outline"
					size="sm"
					icon={IconForTheme(theme)}
					onClick={() => {
						setOpen(!open);
						playClick();
					}}
					aria-label={`Theme: ${theme ?? "system"}`}
					aria-expanded={open}
					aria-haspopup="menu"
				/>
				{open && (
					<div
						role="menu"
						className="absolute right-0 top-full mt-1 z-50 flex flex-col border-2 border-(--color-border) bg-(--color-surface-elev) min-w-[140px] animate-slide-up"
						style={{ boxShadow: "4px 4px 0 0 var(--pixel)" }}
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
								className={[
									"flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-3 py-2 cursor-pointer text-left w-full",
									"transition-colors duration-75 border-b-2 border-(--color-border-subtle) last:border-b-0",
									theme === value
										? "bg-(--color-foreground) text-(--color-background)"
										: "text-(--color-muted-foreground) hover:bg-(--color-foreground)/5 hover:text-(--color-foreground)",
								].join(" ")}
							>
								{icon}
								{label}
							</button>
						))}
						<button
							type="button"
							role="menuitem"
							aria-pressed={ambientMode}
							onClick={() => {
								onToggleAmbient();
								playClick();
								setOpen(false);
							}}
							className={[
								"flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest px-3 py-2 cursor-pointer text-left w-full",
								"transition-colors duration-75",
								ambientMode
									? "bg-(--color-foreground) text-(--color-background)"
									: "text-(--color-muted-foreground) hover:bg-(--color-foreground)/5 hover:text-(--color-foreground)",
							].join(" ")}
						>
							{ambientMode ? <SparkleIcon size={12} /> : <SparkleOffIcon size={12} />}
							Ambient
							{ambientMode && <PixelBadge variant="success" className="ml-auto">on</PixelBadge>}
						</button>
					</div>
				)}
			</div>
		</>
	);
}
