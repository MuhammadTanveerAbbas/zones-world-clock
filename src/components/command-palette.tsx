"use client";

import { Command } from "cmdk";
import { useZonesStore } from "@/hooks/use-zones-store";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
	open: boolean;
	onClose: () => void;
}

export function CommandPalette({ open, onClose }: Props) {
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
				case "view-stack": setViewMode("stack"); break;
				case "view-scroll": setViewMode("scroll"); break;
				case "view-grid": setViewMode("grid"); break;
				case "view-compact": setViewMode("compact"); break;
				case "toggle-format": toggleTimeFormat(); break;
				case "toggle-dashboard": break;
			}
			onClose();
		},
		[setViewMode, toggleTimeFormat, onClose],
	);

	const handleOverlayClick = useCallback(
		(e: React.MouseEvent) => {
			if (e.target === overlayRef.current) onClose();
		},
		[onClose],
	);

	if (!open) return null;

	const currentViewLabel =
		viewMode === "stack" ? "Stack" :
		viewMode === "scroll" ? "Scroll" :
		viewMode === "grid" ? "Grid" : "Compact";

	return (
		<div
			ref={overlayRef}
			onClick={handleOverlayClick}
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
							no results found
						</Command.Empty>

						<Command.Group heading="Views">
							<Command.Item
								value="stack-view"
								onSelect={() => handleSelect("view-stack")}
								className="font-mono text-[11px] px-3 py-2 rounded-md flex items-center justify-between cursor-pointer aria-selected:bg-(--color-foreground)/[0.06]"
							>
								<span>Stack View</span>
								<span className="text-[9px] text-(--color-muted-foreground)">1</span>
							</Command.Item>
							<Command.Item
								value="scroll-view"
								onSelect={() => handleSelect("view-scroll")}
								className="font-mono text-[11px] px-3 py-2 rounded-md flex items-center justify-between cursor-pointer aria-selected:bg-(--color-foreground)/[0.06]"
							>
								<span>Scroll View</span>
								<span className="text-[9px] text-(--color-muted-foreground)">2</span>
							</Command.Item>
							<Command.Item
								value="grid-view"
								onSelect={() => handleSelect("view-grid")}
								className="font-mono text-[11px] px-3 py-2 rounded-md flex items-center justify-between cursor-pointer aria-selected:bg-(--color-foreground)/[0.06]"
							>
								<span>Grid View</span>
								<span className="text-[9px] text-(--color-muted-foreground)">3</span>
							</Command.Item>
							<Command.Item
								value="compact-view"
								onSelect={() => handleSelect("view-compact")}
								className="font-mono text-[11px] px-3 py-2 rounded-md flex items-center justify-between cursor-pointer aria-selected:bg-(--color-foreground)/[0.06]"
							>
								<span>Compact View</span>
								<span className="text-[9px] text-(--color-muted-foreground)">4</span>
							</Command.Item>
						</Command.Group>

						<Command.Group heading="Actions">
							<Command.Item
								value="toggle-format"
								onSelect={() => handleSelect("toggle-format")}
								className="font-mono text-[11px] px-3 py-2 rounded-md flex items-center justify-between cursor-pointer aria-selected:bg-(--color-foreground)/[0.06]"
							>
								<span>Toggle Time Format</span>
								<span className="text-[9px] text-(--color-muted-foreground)">T</span>
							</Command.Item>
							<Command.Item
								value="toggle-dashboard"
								onSelect={() => handleSelect("toggle-dashboard")}
								className="font-mono text-[11px] px-3 py-2 rounded-md flex items-center justify-between cursor-pointer aria-selected:bg-(--color-foreground)/[0.06]"
							>
								<span>Toggle Dashboard</span>
								<span className="text-[9px] text-(--color-muted-foreground)">D</span>
							</Command.Item>
						</Command.Group>

						<Command.Group heading="Info">
							<Command.Item
								value="current-view"
								disabled
								className="font-mono text-[10px] px-3 py-2 rounded-md text-(--color-muted-foreground) cursor-default"
							>
								Current view: {currentViewLabel}
							</Command.Item>
						</Command.Group>
					</Command.List>
				</Command>
			</div>
		</div>
	);
}
