"use client";

import { motion, useSpring, useTransform } from "motion/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWebHaptics } from "web-haptics/react";
import { ResetIcon } from "./icons";
import { PixelButton } from "./ui/pixel-button";

const TOTAL_LINES = 97;
const MIN = -720;
const MAX = 720;
const MAGNET_RADIUS = 4;
const BASE_HEIGHT_MAJOR = 22;
const BASE_HEIGHT_MID = 15;
const BASE_HEIGHT_MINOR = 9;
const MAX_HEIGHT = 38;
const STEP = 30;

export function TimeScrubber({
	scrubberMinutes,
	setScrubberMinutes,
	resetScrubber,
	isScrubbing,
	use24h,
	toggleTimeFormat,
}: {
	scrubberMinutes: number;
	setScrubberMinutes: (v: number) => void;
	resetScrubber: () => void;
	isScrubbing: boolean;
	use24h: boolean;
	toggleTimeFormat: () => void;
}) {
	const { trigger } = useWebHaptics();
	const lastSnap = useRef(scrubberMinutes);
	const containerRef = useRef<HTMLDivElement>(null);
	const isDragging = useRef(false);
	const [hoverLineIndex, setHoverLineIndex] = useState<number | null>(null);
	const [isHovering, setIsHovering] = useState(false);

	const offsetHours = scrubberMinutes / 60;
	const sign = offsetHours > 0 ? "+" : "";
	const direction =
		offsetHours > 0 ? "AHEAD" : offsetHours < 0 ? "BEHIND" : "CURRENT";
	const offsetLabel = `${sign}${Number.isInteger(offsetHours) ? offsetHours : offsetHours.toFixed(1)}H`;
	const progress = (scrubberMinutes - MIN) / (MAX - MIN);

	const thumbRaw = useSpring(progress * 100, {
		stiffness: 320,
		damping: 26,
		mass: 0.7,
	});
	const thumbLeft = useTransform(thumbRaw, (v) => `${v}%`);

	const centerPct = 50;
	const thumbPct = progress * 100;
	const fillLeft = Math.min(centerPct, thumbPct);
	const fillWidth = Math.abs(thumbPct - centerPct);

	useEffect(() => {
		thumbRaw.set(progress * 100);
	}, [progress, thumbRaw]);

	useEffect(() => {
		if (scrubberMinutes !== lastSnap.current) {
			lastSnap.current = scrubberMinutes;
			trigger("selection");
		}
	}, [scrubberMinutes, trigger]);

	const getMinutesFromPointer = useCallback((clientX: number) => {
		if (!containerRef.current) return 0;
		const rect = containerRef.current.getBoundingClientRect();
		const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		return Math.round((MIN + ratio * (MAX - MIN)) / STEP) * STEP;
	}, []);

	const getLineIndexFromPointer = useCallback((clientX: number) => {
		if (!containerRef.current) return null;
		const rect = containerRef.current.getBoundingClientRect();
		const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		return ratio * (TOTAL_LINES - 1);
	}, []);

	function handlePointerDown(e: React.PointerEvent<HTMLDivElement>) {
		isDragging.current = true;
		e.currentTarget.setPointerCapture(e.pointerId);
		setScrubberMinutes(getMinutesFromPointer(e.clientX));
		setHoverLineIndex(getLineIndexFromPointer(e.clientX));
		setIsHovering(true);
	}

	function handlePointerMove(e: React.PointerEvent<HTMLDivElement>) {
		setHoverLineIndex(getLineIndexFromPointer(e.clientX));
		setIsHovering(true);
		if (!isDragging.current) return;
		setScrubberMinutes(getMinutesFromPointer(e.clientX));
	}

	function handlePointerUp(e: React.PointerEvent<HTMLDivElement>) {
		isDragging.current = false;
		if (e.currentTarget.hasPointerCapture(e.pointerId)) {
			e.currentTarget.releasePointerCapture(e.pointerId);
		}
	}

	function handlePointerLeave() {
		if (!isDragging.current) {
			setHoverLineIndex(null);
			setIsHovering(false);
		}
	}

	function handleKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
		if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
			e.preventDefault();
			const delta = e.key === "ArrowLeft" ? -STEP : STEP;
			setScrubberMinutes(Math.max(MIN, Math.min(MAX, scrubberMinutes + delta)));
			trigger("light");
		} else if (e.key === "Home") {
			e.preventDefault();
			setScrubberMinutes(0);
			trigger("light");
		}
	}

	return (
		<div className="shrink-0 sticky bottom-0 z-30 border-t-[3px] border-(--color-border) bg-(--color-surface) shadow-[0_-4px_0_0_var(--shadow)] px-3 sm:px-6 pt-2.5 sm:pt-4 pb-2.5 sm:pb-4">
			{/* Controls row */}
			<div className="flex items-center justify-between gap-2 mb-2.5 sm:mb-3">
				<PixelButton
					size="sm"
					variant="outline"
					onClick={() => {
						toggleTimeFormat();
						trigger("light");
					}}
					aria-label="Toggle 24 hour format"
					className="shrink-0"
				>
					{use24h ? "24H" : "AM/PM"}
				</PixelButton>

				<div className="flex flex-col items-center leading-none min-w-0 px-1">
					<span className="font-mono font-bold text-[13px] sm:text-base tracking-wider tabular-nums text-(--color-foreground) truncate">
						{isScrubbing ? offsetLabel : "NOW"}
					</span>
					<span className="mt-1 font-sans text-[7px] sm:text-[8px] font-semibold uppercase tracking-[0.2em] text-(--color-muted-foreground)">
						{isScrubbing ? direction : "LIVE"}
					</span>
				</div>

				<PixelButton
					size="sm"
					variant={isScrubbing ? "outline" : "ghost"}
					icon={<ResetIcon size={10} />}
					onClick={() => {
						resetScrubber();
						trigger("light");
					}}
					aria-label="Reset time"
					aria-hidden={!isScrubbing}
					tabIndex={isScrubbing ? 0 : -1}
					className={`shrink-0 ${!isScrubbing ? "invisible pointer-events-none" : ""}`}
				>
					reset
				</PixelButton>
			</div>

			{/* Scrubber track */}
			<div
				ref={containerRef}
				role="slider"
				tabIndex={0}
				aria-label="Time travel"
				aria-valuemin={MIN}
				aria-valuemax={MAX}
				aria-valuenow={scrubberMinutes}
				aria-valuetext={isScrubbing ? offsetLabel : "Now"}
				className="relative h-12 sm:h-14 cursor-ew-resize select-none touch-none rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-(--color-accent) focus-visible:ring-offset-2 focus-visible:ring-offset-(--color-surface) mb-2 sm:mb-3"
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerCancel={handlePointerUp}
				onPointerLeave={handlePointerLeave}
				onKeyDown={handleKeyDown}
				onDoubleClick={() => {
					resetScrubber();
					trigger("medium");
				}}
			>
				{/* Baseline */}
				<div className="absolute bottom-0 inset-x-0 h-[2px] bg-(--color-border)/45" />

				{/* Offset fill from center (now) */}
				<div
					className="absolute bottom-0 h-[2px] bg-(--color-accent) transition-[left,width] duration-75"
					style={{ left: `${fillLeft}%`, width: `${fillWidth}%` }}
				/>

				{/* Center "now" marker */}
				<div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-full w-[1px] bg-(--color-border)/70" />
				<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 rotate-45 bg-(--color-foreground)" />

				{/* Ticks */}
				<div className="absolute inset-0 flex items-end justify-between px-0.5 pointer-events-none">
					{Array.from({ length: TOTAL_LINES }).map((_, i) => {
						const isMajor = i % 12 === 0;
						const isMid = i % 6 === 0 && !isMajor;
						const baseHeight = isMajor
							? BASE_HEIGHT_MAJOR
							: isMid
								? BASE_HEIGHT_MID
								: BASE_HEIGHT_MINOR;

						let magnetFactor = 0;
						if (hoverLineIndex !== null) {
							const dist = Math.abs(i - hoverLineIndex);
							if (dist < MAGNET_RADIUS) {
								const t = 1 - dist / MAGNET_RADIUS;
								magnetFactor = t * t;
							}
						}
						const height =
							baseHeight + magnetFactor * (MAX_HEIGHT - baseHeight);
						const opacity = (isMajor ? 0.32 : 0.14) + magnetFactor * 0.55;

						return (
							<div
								key={`line-${i}`}
								className="flex flex-col items-center"
								style={{ width: "1px" }}
							>
								<div
									style={{
										width: "1px",
										height: `${height}px`,
										background: `color-mix(in srgb, var(--color-foreground) ${Math.round(
											opacity * 100,
										)}%, transparent)`,
										transition: "height 120ms ease, background 100ms ease",
									}}
								/>
							</div>
						);
					})}
				</div>

				{/* Draggable thumb */}
				<motion.div
					className="absolute top-0 bottom-0 pointer-events-none z-20"
					style={{ left: thumbLeft, x: "-50%" }}
					animate={{ scaleX: isHovering || isScrubbing ? 1 : 0.6 }}
					transition={{ type: "spring", stiffness: 400, damping: 28 }}
				>
					<div className="relative h-full w-[2px] bg-(--color-accent)">
						<div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rotate-45 bg-(--color-accent) border-2 border-(--color-border) shadow-[2px_2px_0_0_var(--shadow)]" />
					</div>
				</motion.div>
			</div>

			{/* Range labels */}
			<div className="flex items-center justify-between gap-2 font-sans font-semibold text-[7px] sm:text-[8px] uppercase tracking-widest text-(--color-muted-foreground)">
				<span className="shrink-0">-12H</span>
				<div className="flex-1 h-[1px] bg-(--color-border)/50" />
				<span className="shrink-0 text-(--color-foreground) font-bold">
					NOW
				</span>
				<div className="flex-1 h-[1px] bg-(--color-border)/50" />
				<span className="shrink-0">+12H</span>
			</div>
		</div>
	);
}
