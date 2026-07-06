const SOCIAL_LINKS = [
	{
		label: "X",
		href: "https://x.com/m_tanveerabbas",
		ariaLabel: "X (Twitter)",
	},
	{
		label: "LinkedIn",
		href: "https://linkedin.com/in/muhammadtanveerabbas",
		ariaLabel: "LinkedIn",
	},
	{
		label: "GitHub",
		href: "https://github.com/muhammadtanveerabbas",
		ariaLabel: "GitHub",
	},
] as const;

const linkClassName =
	"font-mono text-[9px] sm:text-[10px] uppercase tracking-widest px-2.5 py-1 border-2 border-(--color-border) text-(--color-muted-foreground) hover:bg-(--color-foreground) hover:text-(--color-background) hover:border-(--color-foreground) transition-[background-color,border-color,color] duration-75";

export function SiteFooter() {
	return (
		<footer className="border-t-2 border-(--color-border) px-4 sm:px-5 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0 bg-(--color-surface)">
			<span className="font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-(--color-muted-foreground) text-center sm:text-left">
				Made by{" "}
				<a
					href="https://themvpguy.vercel.app/"
					target="_blank"
					rel="noopener noreferrer"
					className="text-(--color-foreground) hover:text-(--color-accent) transition-colors underline-offset-2 hover:underline"
				>
					Muhammad Tanveer Abbas
				</a>
			</span>
			<nav
				aria-label="Social links"
				className="flex items-center gap-1.5 sm:gap-2"
			>
				{SOCIAL_LINKS.map(({ label, href, ariaLabel }) => (
					<a
						key={label}
						href={href}
						target="_blank"
						rel="noopener noreferrer"
						aria-label={ariaLabel}
						className={linkClassName}
					>
						{label}
					</a>
				))}
			</nav>
		</footer>
	);
}
