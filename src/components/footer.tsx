"use client";

import { GitHubIcon, GlobeIcon, LinkedInIcon, XIcon } from "./icons";
import { Logo } from "./logo";

const LINKS = [
	{
		href: "https://linkedin.com/in/muhammadtanveerabbas",
		label: "LinkedIn",
		icon: <LinkedInIcon size={14} />,
	},
	{
		href: "https://github.com/muhammadtanveerabbas",
		label: "GitHub",
		icon: <GitHubIcon size={14} />,
	},
	{
		href: "https://x.com/m_tanveerabbas",
		label: "X",
		icon: <XIcon size={14} />,
	},
	{
		href: "https://themvpguy.vercel.app",
		label: "Website",
		icon: <GlobeIcon size={14} />,
	},
] as const;

export function Footer() {
	return (
		<footer className="border-t-[3px] border-(--color-border) bg-(--color-surface) px-3 sm:px-4 py-2.5 flex items-center justify-between shrink-0">
			<a
				href="/"
				className="flex items-center gap-1.5 no-underline text-(--color-foreground) group"
			>
				<Logo
					size={16}
					className="transition-transform duration-500 group-hover:rotate-[360deg]"
				/>
				<span className="font-sans font-bold text-[10px] sm:text-xs uppercase tracking-tight">
					Zones
				</span>
			</a>
			<div className="flex items-center gap-1.5 sm:gap-2">
				{LINKS.map((link) => (
					<a
						key={link.label}
						href={link.href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={link.label}
						className="neo-btn flex items-center justify-center w-8 h-8 sm:w-9 sm:h-9 border-[2.5px] border-(--color-border) bg-(--color-surface) shadow-[3px_3px_0_0_var(--shadow)] hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0_0_var(--shadow)] active:translate-x-[2px] active:translate-y-[2px] active:shadow-none transition-all cursor-pointer text-(--color-foreground)"
					>
						{link.icon}
					</a>
				))}
			</div>
		</footer>
	);
}
