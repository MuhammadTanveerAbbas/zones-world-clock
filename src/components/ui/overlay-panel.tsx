"use client";

import { useZonesStore } from "@/hooks/use-zones-store";
import { audioManager } from "@/lib/audio-manager";
import {
	BACKDROP_STAGGER_MS,
	BACKDROP_TRANSITION,
	OVERLAY_SPRING,
	overlayPanelVariants,
} from "@/lib/motion-tokens";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
	type ReactNode,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import { CloseIcon } from "../icons";

interface Props {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	width?: "sm" | "md" | "lg";
	footer?: ReactNode;
}

const WIDTH_CLASSES = {
	sm: "sm:max-w-sm",
	md: "sm:max-w-md",
	lg: "sm:max-w-2xl",
};

function useIsMobile() {
	const [isMobile, setIsMobile] = useState(false);
	useEffect(() => {
		const mq = window.matchMedia("(max-width: 639px)");
		setIsMobile(mq.matches);
		const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, []);
	return isMobile;
}

export function OverlayPanel({
	open,
	onClose,
	title,
	children,
	width = "md",
	footer,
}: Props) {
	const panelRef = useRef<HTMLDivElement>(null);
	const prevFocusRef = useRef<HTMLElement | null>(null);
	const reducedMotion = useReducedMotion();
	const isMobile = useIsMobile();
	const { soundReactiveGlow } = useZonesStore();
	const [glowOffset, setGlowOffset] = useState(0);

	useEffect(() => {
		if (open) {
			prevFocusRef.current = document.activeElement as HTMLElement;
			const t = setTimeout(() => panelRef.current?.focus(), 50);
			return () => clearTimeout(t);
		}
		prevFocusRef.current?.focus();
	}, [open]);

	useEffect(() => {
		if (!open || reducedMotion || !soundReactiveGlow) return;
		if (audioManager.activeSound === "none") return;
		let raf: number;
		const poll = () => {
			const amp = audioManager.amplitude;
			setGlowOffset(Math.round(amp * 20) / 10);
			raf = requestAnimationFrame(poll);
		};
		raf = requestAnimationFrame(poll);
		return () => cancelAnimationFrame(raf);
	}, [open, reducedMotion, soundReactiveGlow]);

	const handleKey = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		},
		[onClose],
	);

	const hiddenVariant = isMobile ? "hiddenMobile" : "hiddenDesktop";
	const exitVariant = isMobile ? "exitMobile" : "exitDesktop";
	const shadowStyle =
		soundReactiveGlow && !reducedMotion && audioManager.activeSound !== "none"
			? {
					boxShadow: `${6 + glowOffset}px ${6 + glowOffset}px 0 0 var(--pixel)`,
				}
			: undefined;

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					key="overlay-backdrop"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={BACKDROP_TRANSITION}
					className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/55 backdrop-blur-sm"
					onClick={(e) => {
						if (e.target === e.currentTarget) onClose();
					}}
				>
					<motion.div
						ref={panelRef}
						tabIndex={-1}
						// biome-ignore lint/a11y/useSemanticElements: motion.div required for spring animation
						role="dialog"
						aria-modal="true"
						aria-label={title}
						variants={overlayPanelVariants}
						initial={hiddenVariant}
						animate="visible"
						exit={exitVariant}
						transition={{
							...OVERLAY_SPRING,
							delay: reducedMotion ? 0 : BACKDROP_STAGGER_MS / 1000,
						}}
						className={[
							"relative w-full",
							"bg-(--color-surface-elev) text-(--color-foreground)",
							"border-2 border-(--color-border)",
							"sm:shadow-[6px_6px_0_0_var(--pixel)]",
							"max-h-[92vh] sm:max-h-[85vh] flex flex-col",
							WIDTH_CLASSES[width],
						].join(" ")}
						style={{ borderRadius: 0, ...shadowStyle }}
						onKeyDown={handleKey}
					>
						<div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-b-2 border-(--color-border) shrink-0 bg-(--color-surface)">
							<span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-(--color-foreground)">
								{title}
							</span>
							<button
								type="button"
								onClick={onClose}
								aria-label="Close"
								className="pixel-btn inline-flex items-center gap-1 font-mono text-[9px] uppercase tracking-widest px-2 py-1 border-2 border-(--color-border) text-(--color-muted-foreground) hover:text-(--color-foreground) hover:bg-(--color-foreground)/5 transition-colors duration-75 cursor-pointer"
							>
								<CloseIcon size={10} />
								<span>esc</span>
							</button>
						</div>
						<div className="flex-1 overflow-y-auto overscroll-contain">
							{children}
						</div>
						{footer && (
							<div className="border-t-2 border-(--color-border) px-4 sm:px-5 py-2.5 bg-(--color-surface) shrink-0">
								{footer}
							</div>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
