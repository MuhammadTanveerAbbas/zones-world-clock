"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useWebHaptics } from "web-haptics/react";
import { motion, useSpring, useTransform } from "motion/react";
import { OverlayPanel } from "./ui/overlay-panel";
import { audioManager } from "@/lib/audio-manager";
import { PixelButton } from "./ui/pixel-button";
import { RewindIcon, ResetIcon } from "./icons";

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
		try {
			if (!audioCtxRef.current) {
				const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
				audioCtxRef.current = new Ctor();
			}
			const ctx = audioCtxRef.current;
			if (ctx.state === "suspended") ctx.resume();
			const vol = audioManager.getVolume();
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.type = "sine";
			osc.frequency.value = 1800;
			gain.gain.setValueAtTime(0.07 * vol, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04);
			osc.start(ctx.currentTime);
			osc.stop(ctx.currentTime + 0.04);
		} catch {}
	}, []);

	return playTick;
}

export function TimeScrubber({
	open,
	onClose,
	scrubberMinutes,
	setScrubberMinutes,
	resetScrubber,
	isScrubbing,
	use24h,
	toggleTimeFormat,
}: {
	open: boolean;
	onClose: () => void;
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

	const thumbRaw = useSpring(progress * 100, { stiffness: 400, damping: 30, mass: 0.8 });
	const thumbLeft = useTransform(thumbRaw, (v) => `${v}%`);

	useEffect(() => { thumbRaw.set(progress * 100); }, [progress, thumbRaw]);

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

	function handlePointerUp() { isDragging.current = false; }

	function handlePointerLeave() {
		if (!isDragging.current) { setHoverLineIndex(null); setIsHovering(false); }
	}

	return (
		<OverlayPanel open={open} onClose={onClose} title="Time Travel" width="lg">
			<div className="p-4 sm:p-6">
				<div className="relative flex items-center justify-between mb-3 sm:mb-4 h-7 sm:h-8">
					<PixelButton
						size="sm"
						variant="outline"
						onClick={() => { toggleTimeFormat(); trigger("light"); playTick(); }}
						aria-label="Toggle 24 hour format"
					>
						{use24h ? "24H" : "AM/PM"}
					</PixelButton>
					<span
						className={[
							"absolute left-1/2 -translate-x-1/2 font-mono tracking-widest uppercase",
							"text-(--color-foreground) tabular-nums",
							isScrubbing ? "text-base sm:text-lg" : "text-sm sm:text-base",
						].join(" ")}
					>
						{isScrubbing ? `${sign}${offsetHours.toFixed(offsetHours % 1 === 0 ? 0 : 1)}H` : "NOW"}
					</span>
					<PixelButton
						size="sm"
						variant={isScrubbing ? "outline" : "ghost"}
						icon={<ResetIcon size={10} />}
						onClick={() => { resetScrubber(); trigger("light"); playTick(); }}
						aria-hidden={!isScrubbing}
						tabIndex={isScrubbing ? 0 : -1}
						className={!isScrubbing ? "invisible pointer-events-none" : ""}
					>
						reset
					</PixelButton>
				</div>

				<div
					ref={containerRef}
					className="relative h-12 sm:h-14 cursor-ew-resize select-none touch-none"
					onPointerDown={handlePointerDown}
					onPointerMove={handlePointerMove}
					onPointerUp={handlePointerUp}
					onPointerLeave={handlePointerLeave}
					onDoubleClick={() => { resetScrubber(); trigger("medium"); playTick(); }}
				>
					<motion.div
						className="absolute top-0 pointer-events-none z-0"
						style={{ left: thumbLeft, x: "-50%" }}
						animate={{ height: isHovering ? "120%" : "100%", width: isHovering ? 5 : 3 }}
						transition={{ type: "spring", stiffness: 500, damping: 30 }}
					>
						<div className="w-full h-full bg-(--color-foreground)" />
					</motion.div>

					<div className="absolute inset-0 flex items-end justify-between px-0 z-10">
						{Array.from({ length: TOTAL_LINES }).map((_, i) => {
							const isMajor = i % 12 === 0;
							const isMid = i % 6 === 0 && !isMajor;
							const baseHeight = isMajor ? BASE_HEIGHT_MAJOR : isMid ? BASE_HEIGHT_MID : BASE_HEIGHT_MINOR;

							let magnetFactor = 0;
							if (hoverLineIndex !== null) {
								const dist = Math.abs(i - hoverLineIndex);
								if (dist < MAGNET_RADIUS) {
									magnetFactor = 1 - dist / MAGNET_RADIUS;
									magnetFactor = magnetFactor * magnetFactor;
								}
							}
							const height = baseHeight + magnetFactor * (MAX_HEIGHT - baseHeight);
							const opacity = 0.06 + magnetFactor * 0.5;

							return (
								<div key={`line-${i}`} className="flex flex-col items-center" style={{ width: "1px" }}>
									<div
										style={{
											width: "1px",
											height: `${height}px`,
											background: `color-mix(in srgb, var(--fg) ${Math.round(opacity * 100)}%, transparent)`,
											transition: "height 0.18s steps(4, end), background 0.12s steps(2, end)",
										}}
									/>
								</div>
							);
						})}
					</div>

					<div className="absolute bottom-0 pointer-events-none" style={{ left: "50%", transform: "translateX(-50%)" }}>
						<div className="w-px h-3 bg-(--color-muted)" />
					</div>

					<div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-3 pointer-events-none">
						<RewindIcon size={12} className="text-(--color-muted-foreground) opacity-60" />
					</div>
				</div>

				<div className="mt-3 sm:mt-4 flex items-center justify-center gap-3 font-mono text-[8px] sm:text-[9px] uppercase tracking-widest text-(--color-muted-foreground)">
					<span>-12H</span>
					<div className="flex-1 h-px bg-(--color-border)" />
					<span>NOW</span>
					<div className="flex-1 h-px bg-(--color-border)" />
					<span>+12H</span>
				</div>
			</div>
		</OverlayPanel>
	);
}
