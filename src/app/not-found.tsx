import { GlobeIcon } from "@/components/icons";
import Link from "next/link";

export default function NotFound() {
	return (
		<div className="flex flex-col items-center justify-center min-h-screen p-8 bg-(--color-background)">
			<div className="flex flex-col items-center gap-6 text-center">
				<div className="border-[3px] border-(--color-border) p-6 bg-(--color-surface) shadow-[6px_6px_0_var(--shadow)]">
					<GlobeIcon size={48} className="text-(--color-muted-foreground)" />
				</div>
				<div className="flex flex-col gap-2">
					<h1 className="font-mono text-4xl font-bold tracking-tight text-(--color-foreground)">
						404
					</h1>
					<p className="font-sans text-sm text-(--color-muted-foreground) max-w-sm">
						This timezone doesn&apos;t exist. Maybe the clock reset?
					</p>
				</div>
				<Link
					href="/"
					className="neo-btn font-sans font-semibold text-[10px] uppercase tracking-wide px-4 py-2 border-[3px] border-(--color-accent) text-(--color-accent) hover:bg-(--color-accent) hover:text-white transition-all duration-100 inline-block"
				>
					Back to Home
				</Link>
			</div>
		</div>
	);
}
