"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWebHaptics } from "web-haptics/react";
import { motion, useSpring, useTransform } from "motion/react";

const TOTAL_LINES = 97;
const MIN = -720;
const MAX = 720;
const MAGNET_RADIUS = 4;
const BASE_HEIGHT_MAJOR = 24;
const BASE_HEIGHT_MID = 16;
const BASE_HEIGHT_MINOR = 10;
const MAX_HEIGHT = 44;

function useScrubSound() {
	const audioCtxRef = useRef<AudioContext | null>(null);

	const playTick = useCallback(() => {
		if (!audioCtxRef.current) {
			audioCtxRef.current = new AudioContext();
		}
		const ctx = audioCtxRef.current;
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		osc.connect(gain);
		gain.connect(ctx.destination);
		osc.type = "sine";
		osc.frequency.value = 1800;
		gain.gain.setValueAtTime(0.07, ctx.currentTime);
		gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
		osc.start(ctx.currentTime);
		osc.stop(ctx.currentTime + 0.04);
	}, []);

	return playTick;
}

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
	const playTick = useScrubSound();
	const lastSnap = useRef(scrubberMinutes);
	const containerRef = useRef<HTMLDivElement>(null);
	const isDragging = useRef(false);
	const [hoverLineIndex, setHoverLineIndex] = useState<number | null>(null);
	const [isHovering, setIsHovering] = useState(false);

	const offsetHours = scrubberMinutes / 60;
	const sign = offsetHours >= 0 ? "+" : "";
	const progress = (scrubberMinutes - MIN) / (MAX - MIN);

	const thumbRaw = useSpring(progress * 100, {
		stiffness: 400,
		damping: 30,
		mass: 0.8,
	});
	const thumbLeft = useTransform(thumbRaw, (v) => `${v}%`);

	useEffect(() => {
		thumbRaw.set(progress * 100);
	}, [progress, thumbRaw]);

	useEffect(() => {
		if (scrubberMinutes !== lastSnap.current) {
			lastSnap.current = scrubberMinutes;
			trigger("selection");
			playTick();
		}
	}, [scrubberMinutes, trigger, playTick]);

	function getMinutesFromPointer(clientX: number) {
		if (!containerRef.current) return 0;
		const rect = containerRef.current.getBoundingClientRect();
		const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		const raw = MIN + ratio * (MAX - MIN);
		return Math.round(raw / 30) * 30;
	}

	function getLineIndexFromPointer(clientX: number) {
		if (!containerRef.current) return null;
		const rect = containerRef.current.getBoundingClientRect();
		const ratio = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
		return ratio * (TOTAL_LINES - 1);
	}

	function handlePointerDown(e: React.PointerEvent) {
		isDragging.current = true;
		(e.target as HTMLElement).setPointerCapture(e.pointerId);
		setScrubberMinutes(getMinutesFromPointer(e.clientX));
		setHoverLineIndex(getLineIndexFromPointer(e.clientX));
		setIsHovering(true);
	}

	function handlePointerMove(e: React.PointerEvent) {
		const idx = getLineIndexFromPointer(e.clientX);
		setHoverLineIndex(idx);
		setIsHovering(true);
		if (!isDragging.current) return;
		setScrubberMinutes(getMinutesFromPointer(e.clientX));
	}

	function handlePointerUp() {
		isDragging.current = false;
	}

	function handlePointerLeave() {
		if (!isDragging.current) {
			setHoverLineIndex(null);
			setIsHovering(false);
		}
	}

	return (
		<div className="border-t border-(--color-border) px-2 sm:px-6 py-3 sm:py-5 md:px-10 md:py-6 bg-(--color-background) backdrop-blur-sm shadow-[0_-2px_8px_rgba(0,0,0,0.04)]">
			<div className="relative flex items-center justify-between mb-2 sm:mb-3 h-6 sm:h-7">
				<div className="flex items-center gap-1.5 sm:gap-3">
					<span className="font-mono text-[8px] sm:text-[10px] uppercase tracking-widest text-(--color-muted-foreground) hidden sm:inline">
						time travel
					</span>
					<button
						type="button"
						onClick={() => {
							toggleTimeFormat();
							trigger("light");
							playTick();
						}}
						className="font-mono text-[8px] sm:text-[10px] uppercase tracking-widest border px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all duration-200 text-(--color-muted-foreground) border-(--color-border) hover:text-(--color-foreground) hover:border-(--color-accent) hover:bg-accent/10 cursor-pointer"
					>
						{use24h ? "24H" : "AM/PM"}
					</button>
				</div>
				<span className="absolute left-1/2 -translate-x-1/2 font-mono text-sm sm:text-base text-(--color-foreground) uppercase">
					{isScrubbing
						? `${sign}${offsetHours.toFixed(offsetHours % 1 === 0 ? 0 : 1)}H`
						: "NOW"}
				</span>
				<div className="flex items-center gap-1.5 sm:gap-3">
					<button
						type="button"
						onClick={() => {
							resetScrubber();
							trigger("light");
							playTick();
						}}
						className={`font-mono text-[8px] sm:text-[10px] uppercase tracking-widest border px-1.5 sm:px-2.5 py-0.5 sm:py-1 rounded-md transition-all duration-200 ${
							isScrubbing
								? "text-(--color-muted-foreground) border-(--color-border) hover:text-(--color-foreground) hover:border-(--color-accent) hover:bg-accent/10 cursor-pointer"
								: "text-transparent border-transparent pointer-events-none"
						}`}
						aria-hidden={!isScrubbing}
						tabIndex={isScrubbing ? 0 : -1}
					>
						reset
					</button>
					<span className="font-mono text-[8px] sm:text-[10px] uppercase tracking-widest text-(--color-muted-foreground) hidden sm:inline">
						drag to scrub
					</span>
				</div>
			</div>

			<div
				ref={containerRef}
				className="relative h-10 sm:h-12 cursor-ew-resize select-none touch-none"
				onPointerDown={handlePointerDown}
				onPointerMove={handlePointerMove}
				onPointerUp={handlePointerUp}
				onPointerLeave={handlePointerLeave}
				onDoubleClick={() => {
					resetScrubber();
					trigger("medium");
					playTick();
				}}
			>
				<motion.div
					className="absolute top-0 pointer-events-none z-0"
					style={{
						left: thumbLeft,
						x: "-50%",
					}}
					animate={{
						height: isHovering ? "120%" : "100%",
						width: isHovering ? 5 : 3,
					}}
					transition={{ type: "spring", stiffness: 500, damping: 30 }}
				>
					<div className="w-full h-full bg-(--color-foreground) rounded-full shadow-[0_0_8px_var(--color-foreground)/30]" />
				</motion.div>

				<div className="absolute inset-0 flex items-end justify-between px-0 z-10">
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
								magnetFactor = 1 - dist / MAGNET_RADIUS;
								magnetFactor = magnetFactor * magnetFactor;
							}
						}

						const height =
							baseHeight + magnetFactor * (MAX_HEIGHT - baseHeight);
						const opacity = 0.06 + magnetFactor * 0.5;

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
										background: `color-mix(in srgb, var(--fg) ${Math.round(opacity * 100)}%, transparent)`,
										transition:
											"height 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), background 0.15s ease",
									}}
								/>
							</div>
						);
					})}
				</div>

				<div
					className="absolute bottom-0 pointer-events-none"
					style={{
						left: "50%",
						transform: "translateX(-50%)",
					}}
				>
					<div className="w-px h-3 bg-(--color-muted)" />
				</div>
			</div>
		</div>
	);
}
