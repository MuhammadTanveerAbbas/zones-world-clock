"use client";

import { formatTime } from "@/lib/time-utils";
import { searchTimezones } from "@/lib/tz-metadata";
import type { Zone } from "@/lib/zones";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { CloseIcon, SearchIcon } from "./icons";
import { PixelButton } from "./ui/pixel-button";

function useDebounce(value: string, delay: number): string {
	const [debounced, setDebounced] = useState(value);
	useEffect(() => {
		const id = setTimeout(() => setDebounced(value), delay);
		return () => clearTimeout(id);
	}, [value, delay]);
	return debounced;
}

export function ZoneSearch({
	onAdd,
	onClose,
	existingIds,
}: {
	onAdd: (zone: Zone) => void;
	onClose: () => void;
	existingIds: Set<string>;
}) {
	const [query, setQuery] = useState("");
	const inputRef = useRef<HTMLInputElement>(null);
	const debouncedQuery = useDebounce(query, 150);
	const [now, setNow] = useState(() => new Date());
	const [selectedIndex, setSelectedIndex] = useState(-1);

	useEffect(() => {
		const id = setInterval(() => setNow(new Date()), 60000);
		return () => clearInterval(id);
	}, []);

	const results = useMemo(() => searchTimezones(debouncedQuery), [debouncedQuery]);

	useEffect(() => {
		inputRef.current?.focus();
	}, []);

	useEffect(() => {
		setSelectedIndex(-1);
	}, [debouncedQuery]);

	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key === "Escape") {
				onClose();
				return;
			}
			if (e.target instanceof HTMLInputElement) {
				if (e.key === "ArrowDown") {
					e.preventDefault();
					setSelectedIndex((prev) => Math.min(prev + 1, results.length - 1));
				}
				if (e.key === "ArrowUp") {
					e.preventDefault();
					setSelectedIndex((prev) => Math.max(prev - 1, -1));
				}
				if (e.key === "Enter" && selectedIndex >= 0 && selectedIndex < results.length) {
					e.preventDefault();
					handleAdd(results[selectedIndex]);
				}
			}
		}
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [onClose, results, selectedIndex]);

	const handleAdd = useCallback(
		(r: (typeof results)[0]) => {
			const id = r.tz.toLowerCase().replace(/\//g, "-");
			if (existingIds.has(id)) return;
			onAdd({
				id,
				label: r.city,
				sublabel: r.region,
				countryCode: r.countryCode,
				tz: r.tz,
			});
		},
		[onAdd, existingIds],
	);

	return (
		<div
			role="dialog"
			aria-modal="true"
			aria-label="Add timezone"
			className="fixed inset-0 z-50 flex items-start justify-center pt-[12vh] sm:pt-[15vh] bg-black/70 backdrop-blur-md animate-fade-in"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div
				className="w-full max-w-lg mx-3 sm:mx-4 border-2 border-(--color-border) bg-(--color-surface-elev) animate-slide-up"
				style={{ boxShadow: "6px 6px 0 0 var(--pixel)" }}
			>
				<div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-5 border-b-2 border-(--color-border) bg-(--color-surface)">
					<SearchIcon size={18} className="text-(--color-muted-foreground) shrink-0" />
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search city or country..."
						aria-label="Search timezones"
						className="flex-1 bg-transparent font-mono text-base sm:text-lg text-(--color-foreground) placeholder:text-(--color-muted-foreground) outline-none tracking-wider uppercase"
					/>
					<PixelButton
						variant="ghost"
						size="sm"
						icon={<CloseIcon size={12} />}
						onClick={onClose}
						aria-label="Close search"
						className="sm:hidden"
					>
						<span className="sr-only">Close</span>
					</PixelButton>
				</div>
				<div
					className="max-h-[50vh] sm:max-h-[55vh] overflow-y-auto"
					role="listbox"
					aria-label="Timezone results"
				>
					{debouncedQuery && results.length === 0 && (
						<div className="p-6 text-center font-mono text-sm text-(--color-muted-foreground)">
							no timezones found
						</div>
					)}
					{!debouncedQuery && (
						<div className="p-6 text-center font-mono text-sm text-(--color-muted-foreground) flex flex-col items-center gap-2">
							<SearchIcon size={20} className="text-(--color-muted-foreground)" />
							<span>start typing to search</span>
						</div>
					)}
					{results.map((r, i) => {
						const id = r.tz.toLowerCase().replace(/\//g, "-");
						const alreadyAdded = existingIds.has(id);

						return (
							<button
								key={r.tz}
								type="button"
								role="option"
								aria-selected={selectedIndex === i}
								onClick={() => handleAdd(r)}
								onMouseEnter={() => setSelectedIndex(i)}
								disabled={alreadyAdded}
								className={[
									"w-full flex items-center justify-between px-4 sm:px-5 py-3 sm:py-3.5 border-b-2 border-(--color-border-subtle) last:border-b-0",
									"transition-colors duration-75 text-left",
									alreadyAdded
										? "opacity-40 cursor-not-allowed"
										: selectedIndex === i
											? "bg-(--color-foreground) text-(--color-background) cursor-pointer"
											: "hover:bg-(--color-foreground)/5 cursor-pointer",
								].join(" ")}
							>
								<div className="flex items-center gap-3 min-w-0">
									{r.countryCode !== "un" ? (
										<span
											className={`fi fi-${r.countryCode} shrink-0`}
											style={{ fontSize: "1.4rem", lineHeight: 1 }}
											aria-hidden="true"
										/>
									) : (
										<span
											className="w-6 h-6 border-2 border-current shrink-0 inline-block"
											aria-hidden="true"
										/>
									)}
									<div className="min-w-0 flex flex-col text-left">
										<span className="font-mono text-sm sm:text-base font-bold tracking-wider uppercase truncate">
											{r.city}
										</span>
										<span className={[
											"font-mono text-[9px] sm:text-[10px] truncate uppercase tracking-widest",
											selectedIndex === i ? "opacity-70" : "text-(--color-muted-foreground)",
										].join(" ")}>
											{r.countryName ? `${r.countryName} · ` : ""}
											{r.region} · {r.tz}
										</span>
									</div>
								</div>
								<div className="flex items-center gap-2 shrink-0">
									<span className="font-mono text-base sm:text-lg font-bold tabular-nums tracking-wider">
										{formatTime(now, r.tz, false)}
									</span>
									{alreadyAdded && (
										<span className="font-mono text-[8px] uppercase tracking-widest border-2 border-current px-1.5 py-0.5">
											added
										</span>
									)}
								</div>
							</button>
						);
					})}
				</div>
				<div className="p-3 sm:p-4 border-t-2 border-(--color-border) flex justify-between items-center bg-(--color-surface)">
					<span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-(--color-muted-foreground)">
						{results.length > 0 ? "↑↓ navigate · enter add · " : ""}esc to close
					</span>
					<PixelButton
						variant="outline"
						size="sm"
						onClick={onClose}
						aria-label="Close search"
						className="hidden sm:inline-flex"
					>
						close
					</PixelButton>
				</div>
			</div>
		</div>
	);
}
