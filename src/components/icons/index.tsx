import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
	size?: number;
};

function base({ size = 16, ...rest }: IconProps) {
	return {
		width: size,
		height: size,
		viewBox: "0 0 24 24" as const,
		fill: "none" as const,
		stroke: "currentColor",
		strokeWidth: 2.5,
		strokeLinecap: "square" as const,
		strokeLinejoin: "miter" as const,
		xmlns: "http://www.w3.org/2000/svg",
		"aria-hidden": true,
		...rest,
	};
}

export function StackIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="3" y="3" width="18" height="4" fill="currentColor" />
			<rect x="3" y="10" width="18" height="4" fill="currentColor" />
			<rect x="3" y="17" width="18" height="4" fill="currentColor" />
		</svg>
	);
}

export function ListIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<circle cx="5" cy="5" r="1.5" fill="currentColor" />
			<line x1="10" y1="5" x2="21" y2="5" />
			<circle cx="5" cy="12" r="1.5" fill="currentColor" />
			<line x1="10" y1="12" x2="21" y2="12" />
			<circle cx="5" cy="19" r="1.5" fill="currentColor" />
			<line x1="10" y1="19" x2="21" y2="19" />
		</svg>
	);
}

export function GridIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="3" y="3" width="8" height="8" fill="currentColor" />
			<rect x="13" y="3" width="8" height="8" fill="currentColor" />
			<rect x="3" y="13" width="8" height="8" fill="currentColor" />
			<rect x="13" y="13" width="8" height="8" fill="currentColor" />
		</svg>
	);
}

export function CompactIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<line x1="3" y1="6" x2="21" y2="6" />
			<line x1="6" y1="12" x2="18" y2="12" />
			<line x1="3" y1="18" x2="21" y2="18" />
		</svg>
	);
}

export function PlusIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<line x1="12" y1="4" x2="12" y2="20" />
			<line x1="4" y1="12" x2="20" y2="12" />
		</svg>
	);
}

export function CloseIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<line x1="5" y1="5" x2="19" y2="19" />
			<line x1="19" y1="5" x2="5" y2="19" />
		</svg>
	);
}

export function SearchIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<circle cx="10" cy="10" r="7" />
			<line x1="15.5" y1="15.5" x2="21" y2="21" />
		</svg>
	);
}

export function DownloadIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<line x1="12" y1="3" x2="12" y2="15" />
			<polyline points="7,11 12,16 17,11" />
			<line x1="4" y1="21" x2="20" y2="21" />
		</svg>
	);
}

export function GlobeIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<circle cx="12" cy="12" r="9" />
			<ellipse cx="12" cy="12" rx="4" ry="9" />
			<line x1="3" y1="12" x2="21" y2="12" />
		</svg>
	);
}

export function ClockIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<circle cx="12" cy="12" r="9" />
			<polyline points="12,6 12,12 16,14" />
		</svg>
	);
}

export function StopwatchIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<circle cx="12" cy="13" r="8" />
			<line x1="12" y1="9" x2="12" y2="13" />
			<line x1="12" y1="13" x2="15" y2="13" />
			<line x1="10" y1="2" x2="14" y2="2" />
			<line x1="12" y1="2" x2="12" y2="5" />
		</svg>
	);
}

export function PlayIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<polygon points="6,4 20,12 6,20" fill="currentColor" />
		</svg>
	);
}

export function PauseIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="6" y="4" width="4" height="16" fill="currentColor" />
			<rect x="14" y="4" width="4" height="16" fill="currentColor" />
		</svg>
	);
}

export function ResetIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M4 12 A8 8 0 1 1 6 18" />
			<polyline points="2,10 4,14 8,12" />
		</svg>
	);
}

export function SkipIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="4" y="4" width="3" height="16" fill="currentColor" />
			<polygon points="10,4 21,12 10,20" fill="currentColor" />
		</svg>
	);
}

export function ChartIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="3" y="14" width="4" height="7" fill="currentColor" />
			<rect x="10" y="8" width="4" height="13" fill="currentColor" />
			<rect x="17" y="3" width="4" height="18" fill="currentColor" />
		</svg>
	);
}

export function SunIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<circle cx="12" cy="12" r="4" />
			<line x1="12" y1="2" x2="12" y2="5" />
			<line x1="12" y1="19" x2="12" y2="22" />
			<line x1="2" y1="12" x2="5" y2="12" />
			<line x1="19" y1="12" x2="22" y2="12" />
			<line x1="4.93" y1="4.93" x2="6.76" y2="6.76" />
			<line x1="17.24" y1="17.24" x2="19.07" y2="19.07" />
			<line x1="4.93" y1="19.07" x2="6.76" y2="17.24" />
			<line x1="17.24" y1="6.76" x2="19.07" y2="4.93" />
		</svg>
	);
}

export function MoonIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
		</svg>
	);
}

export function SystemIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="2" y="3" width="20" height="12" rx="0" />
			<line x1="8" y1="18" x2="16" y2="18" />
			<line x1="12" y1="15" x2="12" y2="18" />
		</svg>
	);
}

export function SparkleIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path
				d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z"
				fill="currentColor"
			/>
		</svg>
	);
}

export function SparkleOffIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M12 2 L13.5 9 L20 10.5 L13.5 12 L12 19 L10.5 12 L4 10.5 L10.5 9 Z" />
		</svg>
	);
}

export function SpeakerIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<polygon points="3,8 3,16 8,16 14,20 14,4 8,8" fill="currentColor" />
			<path d="M17 8 A4 4 0 0 1 17 16" />
		</svg>
	);
}

export function RewindIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<polygon points="12,4 3,12 12,20" fill="currentColor" />
			<polygon points="21,4 12,12 21,20" fill="currentColor" />
		</svg>
	);
}

export function WarningIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M12 3 L22 21 L2 21 Z" />
			<line x1="12" y1="10" x2="12" y2="14" />
			<rect x="11" y="16" width="2" height="2" fill="currentColor" />
		</svg>
	);
}

export function VolumeIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<polygon points="3,8 3,16 8,16 14,20 14,4 8,8" fill="currentColor" />
			<path d="M17 8 A4 4 0 0 1 17 16" />
		</svg>
	);
}

export function VolumeMuteIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<polygon points="3,8 3,16 8,16 14,20 14,4 8,8" fill="currentColor" />
			<line x1="17" y1="9" x2="23" y2="15" />
			<line x1="23" y1="9" x2="17" y2="15" />
		</svg>
	);
}

export function SettingsIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<circle cx="12" cy="12" r="3" />
			<path d="M12 1 L12 4 M12 20 L12 23 M1 12 L4 12 M20 12 L23 12 M4.22 4.22 L6.34 6.34 M17.66 17.66 L19.78 19.78 M4.22 19.78 L6.34 17.66 M17.66 6.34 L19.78 4.22" />
		</svg>
	);
}

export function FocusIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M3 7 L3 3 L7 3" />
			<path d="M17 3 L21 3 L21 7" />
			<path d="M21 17 L21 21 L17 21" />
			<path d="M7 21 L3 21 L3 17" />
		</svg>
	);
}

export function ShortBreakIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="4" y="4" width="16" height="16" />
			<path d="M8 8 L8 16 M8 12 L12 12 M12 10 L12 16 M12 16 L16 16 M16 8 L16 16" />
		</svg>
	);
}

export function CustomIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="3" y="3" width="18" height="12" />
			<polyline points="3,15 8,15 8,21 3,21" />
		</svg>
	);
}

export function CheckIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<polyline points="4,12 9,18 20,5" />
		</svg>
	);
}

export function CmdIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="4" y="4" width="16" height="16" />
			<circle cx="9" cy="9" r="1" fill="currentColor" />
			<circle cx="15" cy="9" r="1" fill="currentColor" />
			<circle cx="9" cy="15" r="1" fill="currentColor" />
			<circle cx="15" cy="15" r="1" fill="currentColor" />
		</svg>
	);
}

export function DashboardIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="3" y="3" width="8" height="8" fill="currentColor" />
			<rect x="13" y="3" width="8" height="8" fill="currentColor" />
			<rect x="3" y="13" width="8" height="8" />
			<rect x="13" y="13" width="8" height="8" fill="currentColor" />
		</svg>
	);
}

export function DstIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<circle cx="12" cy="12" r="9" />
			<polyline points="12,6 12,12 16,14" />
		</svg>
	);
}

export function PixelRainIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M4 4 L8 12 M12 4 L16 12 M8 8 L12 16 M16 8 L20 16" />
			<line x1="2" y1="18" x2="22" y2="18" />
			<line x1="4" y1="21" x2="20" y2="21" />
		</svg>
	);
}

export function PixelWindIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M3 8 L13 8 A3 3 0 1 1 11 14" />
			<path d="M6 4 L17 4 A2 2 0 1 1 16 8" />
			<path d="M2 14 L10 14 A2 2 0 1 0 8 18" />
		</svg>
	);
}

export function PixelOceanIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M2 10 C5 7 7 13 10 10 C13 7 15 13 22 10" />
			<path d="M2 15 C5 12 7 18 10 15 C13 12 15 18 22 15" />
		</svg>
	);
}

export function PixelForestIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<polygon
				points="8,3 3,12 6,12 2,20 14,20 10,12 13,12"
				fill="currentColor"
			/>
			<rect x="7" y="20" width="2" height="3" fill="currentColor" />
		</svg>
	);
}

export function PixelCafeIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M4 6 L18 6 L16 18 L6 18 Z" />
			<path d="M18 9 L21 9 A2 2 0 0 1 21 13 L18 13" />
			<path d="M7 3 C7 3 8 1 9 3" />
		</svg>
	);
}

export function PixelWhiteNoiseIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<line x1="3" y1="4" x2="3" y2="20" />
			<line x1="7" y1="4" x2="7" y2="20" />
			<line x1="11" y1="4" x2="11" y2="20" />
			<line x1="15" y1="4" x2="15" y2="20" />
			<line x1="19" y1="4" x2="19" y2="20" />
		</svg>
	);
}

export function PixelThunderIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path
				d="M6 3 L3 13 L10 13 L8 21 L18 10 L11 10 L14 3 Z"
				fill="currentColor"
			/>
		</svg>
	);
}

export function PixelNightIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
			<circle cx="18" cy="5" r="1" fill="currentColor" />
			<circle cx="20" cy="9" r="0.5" fill="currentColor" />
		</svg>
	);
}

export function PixelFireIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path
				d="M12 2 C9 7 6 9 6 14 A6 6 0 0 0 18 14 C18 9 15 7 12 2 Z"
				fill="currentColor"
			/>
			<path
				d="M12 10 C11 12 10 13 10 16 A2 2 0 0 0 14 16 C14 13 13 12 12 10 Z"
				fill="var(--bg, #fff)"
			/>
		</svg>
	);
}

export function PixelStreamIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M8 2 L12 6 L8 10 L12 14 L8 18 L12 22" />
			<path d="M14 2 L18 6 L14 10 L18 14 L14 18" />
		</svg>
	);
}

export function PixelFanIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<circle cx="12" cy="12" r="9" />
			<circle cx="12" cy="12" r="2" fill="currentColor" />
			<line x1="12" y1="3" x2="12" y2="10" />
			<line x1="12" y1="14" x2="12" y2="21" />
			<line x1="3" y1="12" x2="10" y2="12" />
			<line x1="14" y1="12" x2="21" y2="12" />
		</svg>
	);
}

export function PixelBirdIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M3 14 C6 10 9 8 12 8 C15 8 18 10 21 8" />
			<path d="M3 14 C3 14 5 12 7 14" />
			<circle cx="18" cy="8" r="1.5" fill="currentColor" />
		</svg>
	);
}

export function PixelWaterfallIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M4 2 L4 8 C4 8 8 10 8 14 C8 18 12 18 12 18" />
			<path d="M12 2 L12 6 C12 6 16 8 16 12 C16 16 20 16 20 18" />
			<line x1="2" y1="20" x2="22" y2="20" />
		</svg>
	);
}

export function PixelBowlIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M4 8 L20 8 L18 18 L6 18 Z" />
			<path d="M10 5 A2 2 0 0 1 14 5" />
		</svg>
	);
}

export function PixelBlizzardIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M12 2 L12 22" />
			<path d="M2 12 L22 12" />
			<path d="M5 5 L19 19" />
			<path d="M19 5 L5 19" />
			<circle cx="12" cy="12" r="2" fill="currentColor" />
		</svg>
	);
}

export function PixelTrainIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="4" y="4" width="16" height="12" />
			<rect x="7" y="7" width="3" height="3" fill="var(--bg, #fff)" />
			<rect x="14" y="7" width="3" height="3" fill="var(--bg, #fff)" />
			<circle cx="8" cy="19" r="1.5" fill="currentColor" />
			<circle cx="16" cy="19" r="1.5" fill="currentColor" />
			<line x1="8" y1="16" x2="8" y2="17.5" />
			<line x1="16" y1="16" x2="16" y2="17.5" />
		</svg>
	);
}

export function PixelSpaceshipIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path
				d="M12 2 L16 10 L20 12 L16 14 L16 20 L8 20 L8 14 L4 12 L8 10 Z"
				fill="currentColor"
			/>
			<rect x="10" y="14" width="4" height="4" fill="var(--bg, #fff)" />
		</svg>
	);
}

export function PixelDesertIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M2 16 L8 8 L12 12 L22 6" />
			<line x1="1" y1="20" x2="23" y2="20" />
			<circle cx="18" cy="4" r="2" fill="currentColor" />
		</svg>
	);
}

export function PixelRoofIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<polyline points="2,12 12,4 22,12" />
			<rect x="5" y="12" width="14" height="10" />
			<rect x="9" y="15" width="6" height="7" fill="var(--bg, #fff)" />
		</svg>
	);
}

export function MenuIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<line x1="4" y1="6" x2="20" y2="6" />
			<line x1="4" y1="12" x2="20" y2="12" />
			<line x1="4" y1="18" x2="20" y2="18" />
		</svg>
	);
}

export function XIcon(props: IconProps) {
	return (
		<svg {...base(props)} viewBox="0 0 24 24">
			<path
				d="M4 4 L10 12 L4 20 L6 20 L11 13.5 L15 20 L20 20 L14 12 L20 4 L18 4 L13 10.5 L9 4 Z"
				fill="currentColor"
				stroke="none"
			/>
		</svg>
	);
}

export function LinkedInIcon(props: IconProps) {
	return (
		<svg {...base(props)} viewBox="0 0 24 24">
			<rect
				x="3"
				y="3"
				width="18"
				height="18"
				rx="2"
				strokeWidth="2"
				fill="none"
			/>
			<line x1="8" y1="11" x2="8" y2="17" />
			<line x1="8" y1="8" x2="8" y2="8.01" strokeWidth="3" />
			<line x1="12" y1="17" x2="12" y2="11" />
			<path
				d="M12 11 C12 9 13.5 8 15 8 C16.5 8 18 9 18 11 L18 17"
				fill="none"
			/>
		</svg>
	);
}

export function GitHubIcon(props: IconProps) {
	return (
		<svg {...base(props)} viewBox="0 0 24 24">
			<path
				d="M12 2 C6.477 2 2 6.477 2 12 C2 16.42 4.87 20.17 8.84 21.5 C9.34 21.58 9.5 21.27 9.5 21 C9.5 20.77 9.5 20.14 9.5 19.31 C6.73 19.91 6.14 17.97 6.14 17.97 C5.68 16.81 5.03 16.5 5.03 16.5 C4.12 15.88 5.1 15.9 5.1 15.9 C6.1 15.97 6.63 16.93 6.63 16.93 C7.5 18.45 8.97 18 9.54 17.76 C9.63 17.11 9.89 16.67 10.17 16.42 C7.95 16.17 5.62 15.31 5.62 11.5 C5.62 10.39 6 9.5 6.65 8.79 C6.55 8.54 6.2 7.5 6.75 6.15 C6.75 6.15 7.59 5.88 9.5 7.17 C10.29 6.95 11.15 6.84 12 6.84 C12.85 6.84 13.71 6.95 14.5 7.17 C16.41 5.88 17.25 6.15 17.25 6.15 C17.8 7.5 17.45 8.54 17.35 8.79 C18 9.5 18.38 10.39 18.38 11.5 C18.38 15.32 16.04 16.16 13.81 16.41 C14.17 16.72 14.5 17.33 14.5 18.26 C14.5 19.6 14.5 20.68 14.5 21 C14.5 21.27 14.66 21.59 15.17 21.5 C19.14 20.16 22 16.42 22 12 C22 6.477 17.523 2 12 2 Z"
				fill="currentColor"
				stroke="none"
			/>
		</svg>
	);
}
