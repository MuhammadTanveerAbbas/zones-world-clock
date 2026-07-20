"use client";

import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonVariant = "primary" | "ghost" | "outline" | "danger";
type ButtonSize = "xs" | "sm" | "md";

type PixelButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
	variant?: ButtonVariant;
	size?: ButtonSize;
	active?: boolean;
	icon?: ReactNode;
	trailingIcon?: ReactNode;
	fullWidth?: boolean;
};

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
	primary:
		"bg-(--color-accent) text-(--color-accent-fg) border-(--color-accent) hover:brightness-110",
	ghost:
		"bg-transparent text-(--color-muted-foreground) border-transparent hover:bg-(--color-foreground)/[0.05] hover:text-(--color-foreground)",
	outline:
		"bg-(--color-surface) text-(--color-foreground) border-(--color-border) hover:bg-(--color-surface-elev)",
	danger:
		"bg-(--color-surface) text-(--color-delta-negative) border-(--color-border) hover:bg-(--color-delta-negative)/10 hover:border-(--color-delta-negative)",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
	xs: "text-[9px] px-1.5 py-0.5",
	sm: "text-[10px] px-2 py-1",
	md: "text-[11px] px-2.5 py-1.5",
};

const ACTIVE_CLASSES =
	"bg-(--color-foreground) text-(--color-background) border-(--color-foreground)";

export function PixelButton({
	variant = "outline",
	size = "sm",
	active = false,
	icon,
	trailingIcon,
	fullWidth = false,
	children,
	className = "",
	...rest
}: PixelButtonProps) {
	const variantClass = active ? ACTIVE_CLASSES : VARIANT_CLASSES[variant];
	const sizeClass = SIZE_CLASSES[size];

	return (
		<button
			type="button"
			{...rest}
			className={[
				"neo-btn inline-flex items-center justify-center gap-1 sm:gap-1.5",
				"font-sans font-semibold uppercase tracking-wide border-[2.5px]",
				"rounded-none cursor-pointer select-none",
				"disabled:opacity-40 disabled:cursor-not-allowed",
				"transition-[transform,filter,background-color,border-color,color] duration-100",
				sizeClass,
				variantClass,
				fullWidth ? "w-full" : "",
				className,
			].join(" ")}
		>
			{icon && <span className="inline-flex shrink-0">{icon}</span>}
			{children && <span className="truncate">{children}</span>}
			{trailingIcon && (
				<span className="inline-flex shrink-0">{trailingIcon}</span>
			)}
		</button>
	);
}

type BadgeProps = {
	children: ReactNode;
	variant?: "default" | "success" | "danger" | "muted";
	className?: string;
};

export function PixelBadge({
	children,
	variant = "default",
	className = "",
}: BadgeProps) {
	const colorClass = {
		default:
			"text-(--color-foreground) border-(--color-border) bg-(--color-surface)",
		success:
			"text-(--color-delta-positive) border-(--color-delta-positive) bg-(--color-delta-positive)/10",
		danger:
			"text-(--color-delta-negative) border-(--color-delta-negative) bg-(--color-delta-negative)/10",
		muted:
			"text-(--color-muted-foreground) border-(--color-border) bg-transparent",
	}[variant];

	return (
		<span
			className={[
				"inline-flex items-center gap-1 px-1.5 py-0.5",
				"font-sans font-semibold uppercase tracking-wide text-[8px] sm:text-[9px]",
				"border-[2.5px]",
				colorClass,
				className,
			].join(" ")}
		>
			{children}
		</span>
	);
}
