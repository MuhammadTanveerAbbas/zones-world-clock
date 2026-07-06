"use client";

import { AnimatePresence, motion } from "motion/react";
import { type ReactNode, useCallback, useEffect, useRef } from "react";
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

	useEffect(() => {
		if (open) {
			prevFocusRef.current = document.activeElement as HTMLElement;
			const t = setTimeout(() => panelRef.current?.focus(), 50);
			return () => clearTimeout(t);
		}
		prevFocusRef.current?.focus();
	}, [open]);

	const handleKey = useCallback(
		(e: React.KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		},
		[onClose],
	);

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					key="overlay-backdrop"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.12 }}
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
						initial={{ y: "100%", opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: "100%", opacity: 0 }}
						transition={{
							type: "spring",
							stiffness: 500,
							damping: 38,
							mass: 0.85,
						}}
						className={[
							"relative w-full",
							"bg-(--color-surface-elev) text-(--color-foreground)",
							"border-2 border-(--color-border)",
							"sm:shadow-[6px_6px_0_0_var(--pixel)]",
							"max-h-[92vh] sm:max-h-[85vh] flex flex-col",
							WIDTH_CLASSES[width],
						].join(" ")}
						style={{ borderRadius: 0 }}
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
