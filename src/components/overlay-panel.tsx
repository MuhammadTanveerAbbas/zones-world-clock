"use client";

import { motion, AnimatePresence } from "motion/react";
import { useCallback, useEffect, useRef, type ReactNode } from "react";

interface Props {
	open: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
	width?: "sm" | "md" | "lg";
}

export function OverlayPanel({ open, onClose, title, children, width = "md" }: Props) {
	const panelRef = useRef<HTMLDivElement>(null);
	const prevFocusRef = useRef<HTMLElement | null>(null);

	useEffect(() => {
		if (open) {
			prevFocusRef.current = document.activeElement as HTMLElement;
			setTimeout(() => panelRef.current?.focus(), 50);
		} else {
			prevFocusRef.current?.focus();
		}
	}, [open]);

	const maxW = width === "sm" ? "max-w-sm" : width === "lg" ? "max-w-2xl" : "max-w-lg";

	return (
		<AnimatePresence>
			{open && (
				<motion.div
					key="overlay"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					transition={{ duration: 0.15 }}
					className="fixed inset-0 z-40 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm"
					onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
				>
					<motion.div
						ref={panelRef}
						tabIndex={-1}
						role="dialog"
						aria-modal="true"
						aria-label={title}
						initial={{ y: "100%", opacity: 0 }}
						animate={{ y: 0, opacity: 1 }}
						exit={{ y: "100%", opacity: 0 }}
						transition={{ type: "spring", stiffness: 400, damping: 35, mass: 0.9 }}
						className={`
							w-full sm:rounded-2xl sm:border sm:border-(--color-border) sm:shadow-2xl
							bg-(--color-background) sm:max-h-[85vh] max-h-[92vh] flex flex-col
							${maxW}
							sm:mb-0 rounded-t-2xl sm:rounded-b-2xl
							sm:[&:not(:focus-visible)]:outline-none
						`}
						onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}
					>
						<div className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-(--color-border) shrink-0">
							<span className="font-mono text-[10px] sm:text-[11px] uppercase tracking-widest text-(--color-foreground)">
								{title}
							</span>
							<div className="flex items-center gap-2">
								<button
									type="button"
									onClick={onClose}
									className="font-mono text-[9px] uppercase tracking-widest px-2 py-1 rounded-md border border-(--color-border) text-(--color-muted-foreground) hover:text-(--color-foreground) hover:border-(--color-muted) transition-all cursor-pointer"
									aria-label="Close"
								>
									esc
								</button>
							</div>
						</div>
						<div className="flex-1 overflow-y-auto overscroll-contain">
							{children}
						</div>
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
}
