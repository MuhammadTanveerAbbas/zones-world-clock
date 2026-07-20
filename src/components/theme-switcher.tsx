"use client";

import { useClickSound } from "@/hooks/use-click-sound";
import { useTheme } from "next-themes";
import { useCallback, useEffect, useRef, useState } from "react";
import { MoonIcon, SparkleIcon, SparkleOffIcon, SunIcon } from "./icons";
import { PixelButton } from "./ui/pixel-button";

type ThemeValue = "light" | "dark";

const THEMES: { value: ThemeValue; label: string; icon: React.ReactNode }[] = [
	{ value: "light", label: "Light", icon: <SunIcon size={12} /> },
	{ value: "dark", label: "Dark", icon: <MoonIcon size={12} /> },
];

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
			<div className="hidden sm:flex items-center gap-0.5" aria-label="Theme">
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
					icon={
						theme === "light" ? <SunIcon size={12} /> : <MoonIcon size={12} />
					}
					onClick={() => {
						setOpen(!open);
						playClick();
					}}
					aria-label={`Theme: ${theme ?? "dark"}`}
					aria-expanded={open}
					aria-haspopup="menu"
				/>
				{open && (
					<div
						role="menu"
						className="absolute right-0 top-full mt-1 z-50 flex flex-col border-[2.5px] border-(--color-border) bg-(--color-surface-elev) min-w-[140px] animate-slide-up"
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
									"flex items-center gap-2 font-sans font-semibold text-[10px] uppercase tracking-wide px-3 py-2 cursor-pointer text-left w-full",
									"transition-colors duration-100 border-b-[2.5px] border-(--color-border-subtle) last:border-b-0",
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
								"flex items-center gap-2 font-sans font-semibold text-[10px] uppercase tracking-wide px-3 py-2 cursor-pointer text-left w-full",
								"transition-colors duration-100",
								ambientMode
									? "bg-(--color-foreground) text-(--color-background)"
									: "text-(--color-muted-foreground) hover:bg-(--color-foreground)/5 hover:text-(--color-foreground)",
							].join(" ")}
						>
							{ambientMode ? (
								<SparkleIcon size={12} />
							) : (
								<SparkleOffIcon size={12} />
							)}
							Ambient
						</button>
					</div>
				)}
			</div>
		</>
	);
}
