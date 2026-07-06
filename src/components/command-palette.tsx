"use client";

import { useZonesStore } from "@/hooks/use-zones-store";
import { Command } from "cmdk";
import { useCallback, useEffect, useRef, useState } from "react";
import {
	ClockIcon,
	CmdIcon,
	CompactIcon,
	DashboardIcon,
	DownloadIcon,
	GridIcon,
	ListIcon,
	StackIcon,
} from "./icons";

interface Props {
	open: boolean;
	onClose: () => void;
	onToggleDashboard?: () => void;
	onOpenShare?: () => void;
}

export function CommandPalette({
	open,
	onClose,
	onToggleDashboard,
	onOpenShare,
}: Props) {
	const { viewMode, setViewMode, toggleTimeFormat } = useZonesStore();
	const [query, setQuery] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const overlayRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (open) {
			setTimeout(() => inputRef.current?.focus(), 50);
		}
	}, [open]);

	useEffect(() => {
		if (!open) return;
		function onKey(e: KeyboardEvent) {
			if (e.key === "Escape") onClose();
		}
		window.addEventListener("keydown", onKey);
		return () => window.removeEventListener("keydown", onKey);
	}, [open, onClose]);

	const handleSelect = useCallback(
		(action: string) => {
			switch (action) {
				case "view-stack":
					setViewMode("stack");
					break;
				case "view-scroll":
					setViewMode("scroll");
					break;
				case "view-grid":
					setViewMode("grid");
					break;
				case "view-compact":
					setViewMode("compact");
					break;
				case "toggle-format":
					toggleTimeFormat();
					break;
				case "toggle-dashboard":
					onToggleDashboard?.();
					break;
				case "export-zones":
					onOpenShare?.();
					break;
			}
			onClose();
		},
		[setViewMode, toggleTimeFormat, onToggleDashboard, onOpenShare, onClose],
	);

	const handleOverlayClick = useCallback(
		(e: React.MouseEvent) => {
			if (e.target === overlayRef.current) onClose();
		},
		[onClose],
	);

	if (!open) return null;

	const currentViewLabel =
		viewMode === "stack"
			? "Stack"
			: viewMode === "scroll"
				? "Scroll"
				: viewMode === "grid"
					? "Grid"
					: "Compact";

	return (
		<div
			ref={overlayRef}
			onClick={handleOverlayClick}
			onKeyDown={(e) => {
				if (e.key === "Escape") onClose();
			}}
			role="presentation"
			className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/50 backdrop-blur-sm"
		>
			<div className="w-full max-w-md mx-4">
				<Command
					label="Command menu"
					className="border border-(--color-border) rounded-xl bg-(--color-background) shadow-2xl overflow-hidden"
				>
					<Command.Input
						ref={inputRef}
						value={query}
						onValueChange={setQuery}
						placeholder="Type a command..."
						className="w-full px-4 py-3 font-mono text-sm bg-transparent text-(--color-foreground) placeholder:text-(--color-muted-foreground) border-b border-(--color-border) outline-none"
					/>
					<Command.List className="max-h-64 overflow-y-auto p-2">
						<Command.Empty className="py-6 text-center font-mono text-[10px] text-(--color-muted-foreground)">
							No results found
						</Command.Empty>

						<Command.Group heading="Views">
							<Command.Item
								value="stack-view"
								onSelect={() => handleSelect("view-stack")}
								className="font-mono text-[11px] px-3 py-2 flex items-center justify-between cursor-pointer aria-selected:bg-(--color-foreground)/[0.06]"
							>
								<div className="flex items-center gap-2">
									<StackIcon size={14} />
									<span>Stack View</span>
								</div>
								<span className="text-[9px] text-(--color-muted-foreground)">
									1
								</span>
							</Command.Item>
							<Command.Item
								value="scroll-view"
								onSelect={() => handleSelect("view-scroll")}
								className="font-mono text-[11px] px-3 py-2 flex items-center justify-between cursor-pointer aria-selected:bg-(--color-foreground)/[0.06]"
							>
								<div className="flex items-center gap-2">
									<ListIcon size={14} />
									<span>Scroll View</span>
								</div>
								<span className="text-[9px] text-(--color-muted-foreground)">
									2
								</span>
							</Command.Item>
							<Command.Item
								value="grid-view"
								onSelect={() => handleSelect("view-grid")}
								className="font-mono text-[11px] px-3 py-2 flex items-center justify-between cursor-pointer aria-selected:bg-(--color-foreground)/[0.06]"
							>
								<div className="flex items-center gap-2">
									<GridIcon size={14} />
									<span>Grid View</span>
								</div>
								<span className="text-[9px] text-(--color-muted-foreground)">
									3
								</span>
							</Command.Item>
							<Command.Item
								value="compact-view"
								onSelect={() => handleSelect("view-compact")}
								className="font-mono text-[11px] px-3 py-2 flex items-center justify-between cursor-pointer aria-selected:bg-(--color-foreground)/[0.06]"
							>
								<div className="flex items-center gap-2">
									<CompactIcon size={14} />
									<span>Compact View</span>
								</div>
								<span className="text-[9px] text-(--color-muted-foreground)">
									4
								</span>
							</Command.Item>
						</Command.Group>

						<Command.Group heading="Actions">
							<Command.Item
								value="toggle-format"
								onSelect={() => handleSelect("toggle-format")}
								className="font-mono text-[11px] px-3 py-2 flex items-center justify-between cursor-pointer aria-selected:bg-(--color-foreground)/[0.06]"
							>
								<div className="flex items-center gap-2">
									<ClockIcon size={14} />
									<span>Toggle Time Format</span>
								</div>
								<span className="text-[9px] text-(--color-muted-foreground)">
									T
								</span>
							</Command.Item>
							<Command.Item
								value="toggle-dashboard"
								onSelect={() => handleSelect("toggle-dashboard")}
								className="font-mono text-[11px] px-3 py-2 flex items-center justify-between cursor-pointer aria-selected:bg-(--color-foreground)/[0.06]"
							>
								<div className="flex items-center gap-2">
									<DashboardIcon size={14} />
									<span>Toggle Dashboard</span>
								</div>
								<span className="text-[9px] text-(--color-muted-foreground)">
									D
								</span>
							</Command.Item>
							<Command.Item
								value="export-zones"
								onSelect={() => handleSelect("export-zones")}
								className="font-mono text-[11px] px-3 py-2 flex items-center justify-between cursor-pointer aria-selected:bg-(--color-foreground)/[0.06]"
							>
								<div className="flex items-center gap-2">
									<DownloadIcon size={14} />
									<span>Export / Import Zones</span>
								</div>
								<span className="text-[9px] text-(--color-muted-foreground)">
									E
								</span>
							</Command.Item>
						</Command.Group>

						<Command.Group heading="Info">
							<Command.Item
								value="current-view"
								disabled
								className="font-mono text-[10px] px-3 py-2 text-(--color-muted-foreground) cursor-default"
							>
								<div className="flex items-center gap-2">
									<CmdIcon size={14} />
									<span>Current view: {currentViewLabel}</span>
								</div>
							</Command.Item>
						</Command.Group>
					</Command.List>
				</Command>
			</div>
		</div>
	);
}
