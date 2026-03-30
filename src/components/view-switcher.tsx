"use client";

import { useClickSound } from "@/hooks/use-click-sound";
import type { ViewMode } from "@/lib/store";
import { ThemeSwitcher } from "./theme-switcher";

const VIEWS: { mode: ViewMode; label: string; mobileLabel: string }[] = [
	{ mode: "stack", label: "Stack", mobileLabel: "Stack" },
	{ mode: "scroll", label: "Scroll", mobileLabel: "List" },
	{ mode: "grid", label: "Grid", mobileLabel: "Grid" },
	{ mode: "compact", label: "Compact", mobileLabel: "Mini" },
];

export function ViewSwitcher({
	current,
	onChange,
	onAddZone,
	ambientMode,
	onToggleAmbient,
}: {
	current: ViewMode;
	onChange: (mode: ViewMode) => void;
	onAddZone: () => void;
	ambientMode: boolean;
	onToggleAmbient: () => void;
}) {
	const playClick = useClickSound();

	return (
		<nav
			aria-label="View controls"
			className="flex items-center justify-between px-2 sm:px-6 py-2 sm:py-3.5 border-b border-(--color-border) gap-1.5 sm:gap-2 bg-(--color-background) backdrop-blur-sm"
		>
			<div
				className="flex items-center gap-0.5 sm:gap-1"
				role="tablist"
				aria-label="View modes"
			>
				{VIEWS.map(({ mode, label, mobileLabel }) => (
					<button
						key={mode}
						type="button"
						role="tab"
						aria-selected={current === mode}
						onClick={() => {
							onChange(mode);
							playClick();
						}}
						className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-widest px-1.5 sm:px-3 py-1.5 sm:py-1.5 border rounded-md transition-all duration-200 cursor-pointer shrink-0 ${
							current === mode
								? "text-(--color-foreground) border-(--color-accent) bg-accent/10 shadow-sm"
								: "text-(--color-muted-foreground) border-transparent hover:text-(--color-foreground) hover:bg-(--color-foreground)/[0.04]"
						}`}
					>
						<span className="sm:hidden">{mobileLabel}</span>
						<span className="hidden sm:inline">{label}</span>
					</button>
				))}
			</div>
			<div className="flex items-center gap-1 sm:gap-2">
				<button
					type="button"
					aria-pressed={ambientMode}
					onClick={() => {
						onToggleAmbient();
						playClick();
					}}
					className={`font-mono text-[9px] sm:text-[10px] uppercase tracking-widest px-1.5 sm:px-2.5 py-1.5 sm:py-1.5 border rounded-md transition-all duration-200 cursor-pointer hidden sm:block ${
						ambientMode
							? "text-(--color-foreground) border-(--color-accent) bg-accent/10 shadow-sm"
							: "text-(--color-muted-foreground) border-transparent hover:text-(--color-foreground) hover:bg-(--color-foreground)/[0.04]"
					}`}
				>
					ambient
				</button>
				<ThemeSwitcher
					ambientMode={ambientMode}
					onToggleAmbient={onToggleAmbient}
				/>
				<button
					type="button"
					aria-label="Add timezone"
					onClick={() => {
						onAddZone();
						playClick();
					}}
					className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest px-2 sm:px-3 py-1.5 sm:py-1.5 border border-(--color-accent) text-(--color-accent) hover:bg-(--color-accent) hover:text-white cursor-pointer transition-all duration-200 shrink-0 rounded-md shadow-sm hover:shadow-md"
				>
					+
				</button>
			</div>
		</nav>
	);
}
