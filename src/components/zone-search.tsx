"use client";

import { formatTime } from "@/lib/time-utils";
import { searchTimezones } from "@/lib/tz-metadata";
import type { Zone } from "@/lib/zones";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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
			className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-black/70 backdrop-blur-md animate-fade-in"
			onClick={(e) => {
				if (e.target === e.currentTarget) onClose();
			}}
		>
			<div className="w-full max-w-lg mx-4 border border-(--color-border) bg-(--color-background) rounded-xl shadow-2xl overflow-hidden animate-slide-up">
				<div className="p-5 border-b border-(--color-border) bg-(--color-foreground)/[0.02]">
					<input
						ref={inputRef}
						type="text"
						value={query}
						onChange={(e) => setQuery(e.target.value)}
						placeholder="Search city or country..."
						aria-label="Search timezones"
						className="w-full bg-transparent font-mono text-lg text-(--color-foreground) placeholder:text-(--color-muted-foreground) outline-none tracking-wider uppercase focus:placeholder:text-(--color-accent)"
					/>
				</div>
				<div
					className="max-h-[50vh] overflow-y-auto"
					role="listbox"
					aria-label="Timezone results"
				>
					{debouncedQuery && results.length === 0 && (
						<div className="p-4 text-center font-mono text-sm text-(--color-muted-foreground)">
							No timezones found
						</div>
					)}
					{!debouncedQuery && (
						<div className="p-4 text-center font-mono text-sm text-(--color-muted-foreground)">
							Start typing to search
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
								disabled={alreadyAdded}
								className={`w-full flex items-center justify-between px-5 py-3.5 border-b border-(--color-border-subtle) transition-all duration-150 ${
									alreadyAdded
										? "opacity-40 cursor-not-allowed"
										: selectedIndex === i
											? "bg-(--color-accent)/[0.08] border-(--color-accent)/30 cursor-pointer"
											: "hover:bg-(--color-accent)/[0.06] hover:border-(--color-accent)/20 cursor-pointer"
								}`}
							>
								<div className="flex items-center gap-3 min-w-0">
									{r.countryCode !== "un" && (
										<span
											className={`fi fi-${r.countryCode} shrink-0 rounded`}
											style={{ fontSize: "1.5rem", lineHeight: 1 }}
											aria-hidden="true"
										/>
									)}
									<div className="min-w-0 flex flex-col text-left">
										<span className="font-mono text-base font-bold text-(--color-foreground) truncate tracking-wider uppercase">
											{r.city}
										</span>
										<span className="font-mono text-[10px] text-(--color-muted-foreground) truncate uppercase tracking-widest">
											{r.countryName ? `${r.countryName} · ` : ""}
											{r.region} · {r.tz}
										</span>
									</div>
								</div>
								<div className="flex items-center gap-2 shrink-0">
									<span className="font-mono text-lg font-bold tabular-nums tracking-wider">
										{formatTime(now, r.tz, false)}
									</span>
									{alreadyAdded && (
										<span className="font-mono text-[9px] uppercase tracking-widest text-(--color-muted-foreground) border border-(--color-border) px-1.5 py-0.5">
											added
										</span>
									)}
								</div>
							</button>
						);
					})}
				</div>
				<div className="p-4 border-t border-(--color-border) flex justify-between items-center bg-(--color-foreground)/[0.02]">
					<span className="font-mono text-[10px] uppercase tracking-widest text-(--color-muted-foreground)">
						{results.length > 0 ? `↑↓ navigate · enter add · ` : ""}esc to close
					</span>
					<button
						type="button"
						onClick={onClose}
						aria-label="Close search"
						className="font-mono text-[10px] uppercase tracking-widest border border-(--color-border) px-3 py-1.5 rounded-md text-(--color-muted-foreground) hover:text-(--color-foreground) hover:border-(--color-accent) hover:bg-accent/10 cursor-pointer transition-all duration-200"
					>
						close
					</button>
				</div>
			</div>
		</div>
	);
}
