import { GitHubIcon, LinkedInIcon, XIcon } from "./icons";
import { Logo } from "./logo";

const SOCIAL_LINKS = [
	{
		icon: <XIcon size={14} />,
		href: "https://x.com/m_tanveerabbas",
		ariaLabel: "X (Twitter)",
	},
	{
		icon: <LinkedInIcon size={14} />,
		href: "https://linkedin.com/in/muhammadtanveerabbas",
		ariaLabel: "LinkedIn",
	},
	{
		icon: <GitHubIcon size={14} />,
		href: "https://github.com/muhammadtanveerabbas",
		ariaLabel: "GitHub",
	},
] as const;

const iconLinkClassName =
	"flex items-center justify-center w-8 h-8 border-[2.5px] border-(--color-border) text-(--color-muted-foreground) hover:bg-(--color-foreground) hover:text-(--color-background) hover:border-(--color-foreground) transition-[background-color,border-color,color] duration-100 neo-btn";

export function SiteFooter() {
	return (
		<footer className="border-t-[3px] border-(--color-border) bg-(--color-surface)">
			<div className="px-3 sm:px-5 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-3">
				<a
					href="/"
					className="flex items-center gap-2 no-underline text-(--color-foreground) shrink-0 group"
				>
					<Logo
						size={18}
						className="transition-transform duration-500 group-hover:rotate-[360deg]"
					/>
					<span className="font-sans font-bold text-[10px] uppercase tracking-tight">
						Zones
					</span>
				</a>

				<div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
					<nav aria-label="Social links" className="flex items-center gap-1.5">
						{SOCIAL_LINKS.map(({ icon, href, ariaLabel }) => (
							<a
								key={ariaLabel}
								href={href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={ariaLabel}
								className={iconLinkClassName}
							>
								{icon}
							</a>
						))}
					</nav>
					<a
						href="https://themvpguy.vercel.app/"
						target="_blank"
						rel="noopener noreferrer"
						className="font-sans font-semibold text-[9px] sm:text-[10px] uppercase tracking-wide text-(--color-muted-foreground) hover:text-(--color-foreground) transition-colors shrink-0"
					>
						The MVP Guy
					</a>
				</div>
			</div>
		</footer>
	);
}
