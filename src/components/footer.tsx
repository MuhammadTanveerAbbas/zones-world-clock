"use client";

import {
	SocialGitHubIcon,
	SocialLinkedInIcon,
	SocialWebsiteIcon,
	SocialXIcon,
} from "./icons";

type SocialLink = {
	href: string;
	label: string;
	icon: React.ReactElement;
};

const LINKS: SocialLink[] = [
	{
		href: "https://linkedin.com/in/muhammadtanveerabbas",
		label: "LinkedIn",
		icon: <SocialLinkedInIcon size={12} />,
	},
	{
		href: "https://github.com/muhammadtanveerabbas",
		label: "GitHub",
		icon: <SocialGitHubIcon size={12} />,
	},
	{
		href: "https://muhammadtanveerabbas.vercel.app",
		label: "Website",
		icon: <SocialWebsiteIcon size={12} />,
	},
	{
		href: "https://x.com/m_tanveerabbas",
		label: "X",
		icon: <SocialXIcon size={12} />,
	},
] as const;

type FooterLogoProps = {
	className?: string;
};

function FooterLogo({ className }: FooterLogoProps) {
	return (
		<svg
			width={20}
			height={20}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			aria-hidden="true"
			className={className}
		>
			<circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
			<ellipse
				cx="12"
				cy="12"
				rx="9"
				ry="3"
				stroke="currentColor"
				strokeWidth="1.5"
				opacity="0.5"
			/>
			<ellipse
				cx="12"
				cy="12"
				rx="3"
				ry="9"
				stroke="currentColor"
				strokeWidth="1.5"
				opacity="0.5"
			/>
			<line
				x1="12"
				y1="4"
				x2="12"
				y2="8"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
			<line
				x1="12"
				y1="16"
				x2="12"
				y2="20"
				stroke="currentColor"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
			<circle cx="12" cy="12" r="2.5" fill="currentColor" />
		</svg>
	);
}

export function Footer() {
	return (
		<footer className="border-t-[3px] border-(--color-border) bg-(--color-surface) px-3 sm:px-4 py-3 shrink-0 flex items-center justify-between">
			<a
				href="/"
				className="flex items-center gap-2 no-underline text-(--color-foreground) group"
			>
				<FooterLogo className="transition-transform duration-500 group-hover:rotate-[360deg]" />
				<span className="font-sans font-bold text-[10px] sm:text-xs uppercase tracking-tight">
					Zones
				</span>
			</a>
			<div className="flex items-center gap-1.5 sm:gap-2 ml-auto">
				{LINKS.map((link) => (
					<a
						key={link.label}
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={link.label}
						className="neo-btn flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 border-[2.5px] border-(--color-border) bg-(--color-surface) shadow-[3px_3px_0_0_var(--shadow)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_var(--shadow)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer"
					>
						{link.icon}
						<span className="sr-only">{link.label}</span>
					</a>
				))}
			</div>
		</footer>
	);
}
