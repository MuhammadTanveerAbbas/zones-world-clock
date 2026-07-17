import type { Transition, Variants } from "motion/react";

/** Shared spring physics for all overlay panels */
export const OVERLAY_SPRING = {
	type: "spring" as const,
	stiffness: 500,
	damping: 38,
	mass: 0.85,
};

export const BACKDROP_TRANSITION: Transition = {
	duration: 0.12,
	ease: "easeOut",
};

export const BACKDROP_STAGGER_MS = 40;

export const overlayPanelVariants: Variants = {
	hiddenMobile: { y: "100%", opacity: 0, scale: 1 },
	hiddenDesktop: { y: 0, opacity: 0, scale: 0.97 },
	visible: { y: 0, opacity: 1, scale: 1 },
	exitMobile: { y: "100%", opacity: 0, scale: 1 },
	exitDesktop: { y: 0, opacity: 0, scale: 0.97 },
};

export const dropdownVariants: Variants = {
	hidden: { opacity: 0, y: -6, scale: 0.97 },
	visible: { opacity: 1, y: 0, scale: 1 },
	exit: { opacity: 0, y: -6, scale: 0.97 },
};

export const DROPDOWN_TRANSITION: Transition = {
	...OVERLAY_SPRING,
};
