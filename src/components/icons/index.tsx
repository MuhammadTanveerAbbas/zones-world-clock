import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & {
	size?: number;
};

function base({ size = 16, ...rest }: IconProps) {
	return {
		width: size,
		height: size,
		viewBox: "0 0 16 16",
		shapeRendering: "crispEdges" as const,
		fill: "currentColor",
		xmlns: "http://www.w3.org/2000/svg",
		"aria-hidden": true,
		...rest,
	};
}

export function StackIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="2" y="2" width="12" height="3" />
			<rect x="2" y="6.5" width="12" height="3" />
			<rect x="2" y="11" width="12" height="3" />
		</svg>
	);
}

export function ListIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="2" y="3" width="1" height="1" />
			<rect x="4" y="3" width="1" height="1" />
			<rect x="2" y="4" width="1" height="1" />
			<rect x="4" y="4" width="1" height="1" />
			<rect x="6" y="3" width="8" height="1" />
			<rect x="6" y="4" width="8" height="1" />
			<rect x="2" y="7" width="1" height="1" />
			<rect x="4" y="7" width="1" height="1" />
			<rect x="2" y="8" width="1" height="1" />
			<rect x="4" y="8" width="1" height="1" />
			<rect x="6" y="7" width="8" height="1" />
			<rect x="6" y="8" width="8" height="1" />
			<rect x="2" y="11" width="1" height="1" />
			<rect x="4" y="11" width="1" height="1" />
			<rect x="2" y="12" width="1" height="1" />
			<rect x="4" y="12" width="1" height="1" />
			<rect x="6" y="11" width="8" height="1" />
			<rect x="6" y="12" width="8" height="1" />
		</svg>
	);
}

export function GridIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="2" y="2" width="5" height="5" />
			<rect x="9" y="2" width="5" height="5" />
			<rect x="2" y="9" width="5" height="5" />
			<rect x="9" y="9" width="5" height="5" />
		</svg>
	);
}

export function CompactIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="1" y="4" width="14" height="2" />
			<rect x="3" y="8" width="10" height="1.5" />
			<rect x="1" y="11.5" width="14" height="2" />
		</svg>
	);
}

export function PlusIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="7" y="2" width="2" height="12" />
			<rect x="2" y="7" width="12" height="2" />
		</svg>
	);
}

export function CloseIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect
				x="3.5"
				y="7.25"
				width="9"
				height="1.5"
				transform="rotate(45 8 8)"
			/>
			<rect
				x="3.5"
				y="7.25"
				width="9"
				height="1.5"
				transform="rotate(-45 8 8)"
			/>
		</svg>
	);
}

export function SearchIcon(props: IconProps) {
	return (
		<svg {...base(props)} fill="none" stroke="currentColor" strokeWidth="1.5">
			<circle cx="7" cy="7" r="4" />
			<line x1="10" y1="10" x2="14" y2="14" strokeLinecap="square" />
		</svg>
	);
}

export function DownloadIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="7" y="2" width="2" height="7" />
			<path d="M5 7 L8 11 L11 7 Z" />
			<rect x="2" y="13" width="12" height="1" />
		</svg>
	);
}

export function GlobeIcon(props: IconProps) {
	return (
		<svg {...base(props)} fill="none" stroke="currentColor" strokeWidth="1">
			<rect x="2.5" y="2.5" width="11" height="11" />
			<line x1="8" y1="2.5" x2="8" y2="13.5" />
			<line x1="2.5" y1="8" x2="13.5" y2="8" />
			<line x1="4" y1="5" x2="12" y2="5" />
			<line x1="4" y1="11" x2="12" y2="11" />
		</svg>
	);
}

export function ClockIcon(props: IconProps) {
	return (
		<svg {...base(props)} fill="none" stroke="currentColor" strokeWidth="1.2">
			<rect x="2" y="2" width="12" height="12" />
			<rect x="7.5" y="2" width="1" height="1" fill="currentColor" />
			<rect x="7.5" y="13" width="1" height="1" fill="currentColor" />
			<rect x="2" y="7.5" width="1" height="1" fill="currentColor" />
			<rect x="13" y="7.5" width="1" height="1" fill="currentColor" />
			<rect x="7.5" y="5.5" width="1" height="2.5" fill="currentColor" />
			<rect x="8" y="7.5" width="2" height="1" fill="currentColor" />
		</svg>
	);
}

export function StopwatchIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="6" y="1" width="4" height="1" />
			<rect x="7" y="0" width="2" height="1" />
			<rect
				x="2"
				y="3"
				width="12"
				height="12"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<rect x="7.5" y="6" width="1" height="3" />
			<rect x="8" y="8" width="2" height="1" />
		</svg>
	);
}

export function PlayIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M3 2 L13 8 L3 14 Z" />
		</svg>
	);
}

export function PauseIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="3" y="2" width="3" height="12" />
			<rect x="10" y="2" width="3" height="12" />
		</svg>
	);
}

export function ResetIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M8 2 a5 5 0 1 0 4.5 2.8 L11 6 L14 6 L14 3 L12.5 4.5 A6 6 0 1 0 8 2 Z" />
		</svg>
	);
}

export function SkipIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="2" y="2" width="2" height="12" />
			<path d="M5 2 L13 8 L5 14 Z" />
		</svg>
	);
}

export function ChartIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="2" y="9" width="2" height="5" />
			<rect x="5" y="6" width="2" height="8" />
			<rect x="8" y="3" width="2" height="11" />
			<rect x="11" y="7" width="2" height="7" />
		</svg>
	);
}

export function SunIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="6" y="6" width="4" height="4" />
			<rect x="7" y="2" width="2" height="1" />
			<rect x="7" y="13" width="2" height="1" />
			<rect x="2" y="7" width="1" height="2" />
			<rect x="13" y="7" width="1" height="2" />
			<rect x="3" y="3" width="1" height="2" transform="rotate(-45 3.5 4)" />
			<rect x="12" y="3" width="1" height="2" transform="rotate(45 12.5 4)" />
			<rect x="3" y="11" width="1" height="2" transform="rotate(45 3.5 12)" />
			<rect
				x="12"
				y="11"
				width="1"
				height="2"
				transform="rotate(-45 12.5 12)"
			/>
		</svg>
	);
}

export function MoonIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M11 2 a6 6 0 1 0 3 9 a5 5 0 0 1 -3 -9 Z" />
		</svg>
	);
}

export function SystemIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect
				x="1.5"
				y="3"
				width="13"
				height="8"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<rect
				x="2"
				y="4"
				width="12"
				height="6"
				fill="none"
				stroke="currentColor"
				strokeWidth="0.5"
			/>
			<rect x="6" y="12" width="4" height="1" />
			<rect x="4" y="13" width="8" height="1" />
		</svg>
	);
}

export function SparkleIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M8 1 L9 6 L14 8 L9 10 L8 15 L7 10 L2 8 L7 6 Z" />
		</svg>
	);
}

export function SparkleOffIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path
				d="M8 2 L9 6 L13 8 L9 10 L8 14 L7 10 L3 8 L7 6 Z"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
			/>
		</svg>
	);
}

export function SpeakerIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M2 5 L2 11 L5 11 L9 14 L9 2 L5 5 Z" />
			<rect x="11" y="5" width="1" height="6" />
			<rect x="13" y="6" width="1" height="4" />
		</svg>
	);
}

export function RewindIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M8 2 L3 8 L8 14 Z" />
			<path d="M14 2 L9 8 L14 14 Z" />
		</svg>
	);
}

export function WarningIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M8 1 L15 14 L1 14 Z" />
		</svg>
	);
}

export function VolumeIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M2 5 L2 11 L5 11 L9 14 L9 2 L5 5 Z" />
			<rect x="11" y="6" width="1" height="4" />
			<rect x="13" y="4" width="1" height="8" />
		</svg>
	);
}

export function VolumeMuteIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M2 5 L2 11 L5 11 L9 14 L9 2 L5 5 Z" />
			<rect x="11" y="5" width="1" height="1" transform="rotate(45 11.5 5.5)" />
			<rect
				x="14"
				y="5"
				width="1"
				height="1"
				transform="rotate(-45 14.5 5.5)"
			/>
		</svg>
	);
}

export function SettingsIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path
				d="M8 1 L9 3 L11 3 L11 5 L13 6 L12 8 L13 10 L11 11 L11 13 L9 13 L8 15 L7 13 L5 13 L5 11 L3 10 L4 8 L3 6 L5 5 L5 3 L7 3 Z"
				fillRule="evenodd"
			/>
		</svg>
	);
}

export function FocusIcon(props: IconProps) {
	return (
		<svg {...base(props)} fill="none" stroke="currentColor" strokeWidth="1.5">
			<path d="M2 5 L2 2 L5 2" />
			<path d="M11 2 L14 2 L14 5" />
			<path d="M14 11 L14 14 L11 14" />
			<path d="M5 14 L2 14 L2 11" />
		</svg>
	);
}

export function ShortBreakIcon(props: IconProps) {
	return (
		<svg {...base(props)} fill="none" stroke="currentColor" strokeWidth="1">
			<rect x="2.5" y="2.5" width="11" height="11" />
			<rect x="4" y="4" width="2" height="8" fill="currentColor" />
		</svg>
	);
}

export function CustomIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M2 2 L14 2 L14 8 L9 8 L9 14 L2 14 Z" />
		</svg>
	);
}

export function CheckIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="3" y="8" width="2" height="2" transform="rotate(-45 4 9)" />
			<rect x="5" y="9" width="2" height="2" transform="rotate(-45 6 10)" />
			<rect x="7" y="8" width="2" height="2" transform="rotate(-45 8 9)" />
			<rect x="9" y="6" width="2" height="2" transform="rotate(-45 10 7)" />
			<rect x="11" y="4" width="2" height="2" transform="rotate(-45 12 5)" />
		</svg>
	);
}

export function PixelRainIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="2" y="2" width="1" height="3" />
			<rect x="5" y="3" width="1" height="3" />
			<rect x="8" y="2" width="1" height="3" />
			<rect x="11" y="3" width="1" height="3" />
			<rect x="3" y="6" width="1" height="3" />
			<rect x="6" y="6" width="1" height="3" />
			<rect x="9" y="6" width="1" height="3" />
			<rect x="12" y="6" width="1" height="3" />
			<rect x="2" y="10" width="1" height="3" />
			<rect x="5" y="10" width="1" height="3" />
			<rect x="8" y="10" width="1" height="3" />
			<rect x="11" y="10" width="1" height="3" />
		</svg>
	);
}

export function PixelWindIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="2" y="4" width="10" height="2" />
			<rect x="4" y="7" width="8" height="2" />
			<rect x="2" y="10" width="10" height="2" />
		</svg>
	);
}

export function PixelOceanIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="1" y="6" width="2" height="2" />
			<rect x="3" y="8" width="2" height="2" />
			<rect x="1" y="10" width="2" height="2" />
			<rect x="3" y="12" width="2" height="2" />
			<rect x="5" y="6" width="2" height="2" />
			<rect x="7" y="8" width="2" height="2" />
			<rect x="5" y="10" width="2" height="2" />
			<rect x="7" y="12" width="2" height="2" />
			<rect x="9" y="6" width="2" height="2" />
			<rect x="11" y="8" width="2" height="2" />
			<rect x="9" y="10" width="2" height="2" />
			<rect x="11" y="12" width="2" height="2" />
			<rect x="13" y="6" width="2" height="2" />
		</svg>
	);
}

export function PixelForestIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M5 1 L3 6 L4 6 L2 11 L4 11 L4 14 L6 14 L6 11 L8 11 L6 6 L7 6 Z" />
			<path d="M11 4 L9 9 L10 9 L8 14 L10 14 L10 15 L12 15 L12 14 L14 14 L12 9 L13 9 Z" />
		</svg>
	);
}

export function PixelCafeIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="2" y="3" width="9" height="2" />
			<rect x="3" y="5" width="9" height="9" />
			<rect x="11" y="5" width="3" height="2" />
			<rect x="11" y="6" width="2" height="2" />
			<rect x="3" y="2" width="1" height="1" />
			<rect x="4" y="1" width="1" height="1" />
			<rect x="5" y="0" width="1" height="1" />
		</svg>
	);
}

export function PixelWhiteNoiseIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="1" y="2" width="1" height="1" />
			<rect x="3" y="2" width="1" height="1" />
			<rect x="5" y="2" width="1" height="1" />
			<rect x="7" y="2" width="1" height="1" />
			<rect x="9" y="2" width="1" height="1" />
			<rect x="11" y="2" width="1" height="1" />
			<rect x="13" y="2" width="1" height="1" />
			<rect x="2" y="4" width="1" height="1" />
			<rect x="4" y="4" width="1" height="1" />
			<rect x="6" y="4" width="1" height="1" />
			<rect x="8" y="4" width="1" height="1" />
			<rect x="10" y="4" width="1" height="1" />
			<rect x="12" y="4" width="1" height="1" />
			<rect x="1" y="6" width="1" height="1" />
			<rect x="3" y="6" width="1" height="1" />
			<rect x="5" y="6" width="1" height="1" />
			<rect x="7" y="6" width="1" height="1" />
			<rect x="9" y="6" width="1" height="1" />
			<rect x="11" y="6" width="1" height="1" />
			<rect x="13" y="6" width="1" height="1" />
			<rect x="2" y="8" width="1" height="1" />
			<rect x="4" y="8" width="1" height="1" />
			<rect x="6" y="8" width="1" height="1" />
			<rect x="8" y="8" width="1" height="1" />
			<rect x="10" y="8" width="1" height="1" />
			<rect x="12" y="8" width="1" height="1" />
			<rect x="1" y="10" width="1" height="1" />
			<rect x="3" y="10" width="1" height="1" />
			<rect x="5" y="10" width="1" height="1" />
			<rect x="7" y="10" width="1" height="1" />
			<rect x="9" y="10" width="1" height="1" />
			<rect x="11" y="10" width="1" height="1" />
			<rect x="13" y="10" width="1" height="1" />
			<rect x="2" y="12" width="1" height="1" />
			<rect x="4" y="12" width="1" height="1" />
			<rect x="6" y="12" width="1" height="1" />
			<rect x="8" y="12" width="1" height="1" />
			<rect x="10" y="12" width="1" height="1" />
			<rect x="12" y="12" width="1" height="1" />
		</svg>
	);
}

export function PixelThunderIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M2 4 L4 4 L4 2 L6 2 L6 4 L8 4 L8 6 L10 6 L10 8 L12 8 L12 10 L14 10 L10 14 L10 12 L8 12 L8 10 L6 10 L6 8 L4 8 L4 6 L2 6 Z" />
		</svg>
	);
}

export function PixelNightIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M11 2 A5 5 0 1 0 14 11 A4 4 0 0 1 11 2 Z" />
			<rect x="3" y="3" width="1" height="1" />
			<rect x="5" y="6" width="1" height="1" />
			<rect x="2" y="8" width="1" height="1" />
		</svg>
	);
}

export function PixelFireIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M8 1 C 7 4 5 5 5 8 C 5 11 6 13 8 14 C 10 13 11 11 11 8 C 11 6 10 5 9 4 C 9 5 8 5 8 4 Z" />
		</svg>
	);
}

export function PixelStreamIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="6" y="1" width="4" height="1" />
			<rect x="5" y="2" width="6" height="1" />
			<rect x="4" y="3" width="8" height="1" />
			<rect x="3" y="4" width="2" height="1" />
			<rect x="11" y="4" width="2" height="1" />
			<rect x="2" y="5" width="2" height="1" />
			<rect x="12" y="5" width="2" height="1" />
			<rect x="2" y="6" width="2" height="1" />
			<rect x="12" y="6" width="2" height="1" />
			<rect x="3" y="7" width="2" height="1" />
			<rect x="11" y="7" width="2" height="1" />
			<rect x="4" y="8" width="2" height="1" />
			<rect x="10" y="8" width="2" height="1" />
			<rect x="5" y="9" width="2" height="1" />
			<rect x="9" y="9" width="2" height="1" />
			<rect x="6" y="10" width="1" height="1" />
			<rect x="9" y="10" width="1" height="1" />
			<rect x="7" y="11" width="1" height="1" />
			<rect x="8" y="11" width="1" height="1" />
			<rect x="7" y="12" width="1" height="1" />
			<rect x="8" y="12" width="1" height="1" />
		</svg>
	);
}

export function PixelFanIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="2" y="2" width="3" height="3" />
			<rect x="6" y="1" width="4" height="2" />
			<rect x="11" y="2" width="3" height="3" />
			<rect
				x="6"
				y="5"
				width="4"
				height="6"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<rect x="2" y="6" width="3" height="4" />
			<rect x="11" y="6" width="3" height="4" />
			<rect x="6" y="12" width="4" height="3" />
		</svg>
	);
}

export function PixelBirdIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M2 9 C 4 7 5 6 7 6 L11 4 L13 5 L12 7 L14 8 L12 9 L13 10 L10 10 C 8 11 5 11 3 10 Z" />
		</svg>
	);
}

export function PixelWaterfallIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M2 1 L5 1 L4 3 L7 3 L6 5 L9 5 L8 7 L11 7 L10 9 L13 9 L12 11 L14 11 L14 14 L2 14 Z" />
		</svg>
	);
}

export function PixelBowlIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M2 5 L14 5 L13 13 L3 13 Z" />
			<rect x="6" y="2" width="1" height="1" />
			<rect x="7" y="1" width="2" height="1" />
		</svg>
	);
}

export function PixelBlizzardIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M8 1 L9 3 L11 3 L10 5 L11 7 L9 7 L8 9 L7 7 L5 7 L6 5 L5 3 L7 3 Z" />
			<path d="M3 10 L4 11 L3 12 L4 13 L3 14 L2 13 L1 14 L1 12 L2 11 Z" />
			<path d="M13 10 L14 11 L13 12 L14 13 L13 14 L12 13 L11 14 L11 12 L12 11 Z" />
		</svg>
	);
}

export function PixelTrainIcon(props: IconProps) {
	return (
		<svg {...base(props)} fill="none" stroke="currentColor" strokeWidth="1">
			<rect x="3" y="2" width="10" height="10" />
			<rect x="5" y="4" width="2" height="2" fill="currentColor" />
			<rect x="9" y="4" width="2" height="2" fill="currentColor" />
			<rect x="2" y="12" width="3" height="2" fill="currentColor" />
			<rect x="11" y="12" width="3" height="2" fill="currentColor" />
			<rect x="3" y="14" width="2" height="1" fill="currentColor" />
			<rect x="11" y="14" width="2" height="1" fill="currentColor" />
		</svg>
	);
}

export function PixelSpaceshipIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path
				d="M8 1 C 10 2 11 5 11 7 L13 7 L13 9 L11 9 C 11 11 10 13 8 15 C 6 13 5 11 5 9 L3 9 L3 7 L5 7 C 5 5 6 2 8 1 Z"
				fillRule="evenodd"
			/>
		</svg>
	);
}

export function PixelDesertIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<path d="M2 10 L5 6 L8 8 L11 5 L14 10 Z" />
			<rect x="1" y="10" width="14" height="4" />
			<rect x="7" y="2" width="2" height="2" />
			<rect x="6" y="0" width="4" height="2" />
		</svg>
	);
}

export function PixelRoofIcon(props: IconProps) {
	return (
		<svg {...base(props)} fill="none" stroke="currentColor" strokeWidth="1.2">
			<path d="M1 7 L8 2 L15 7 L15 14 L1 14 Z" />
			<rect x="3" y="9" width="2" height="2" fill="currentColor" />
			<rect x="11" y="9" width="2" height="2" fill="currentColor" />
		</svg>
	);
}

export function CmdIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect
				x="4"
				y="4"
				width="8"
				height="8"
				fill="none"
				stroke="currentColor"
				strokeWidth="1.2"
			/>
			<rect x="6" y="6" width="1" height="1" />
			<rect x="9" y="6" width="1" height="1" />
			<rect x="6" y="9" width="1" height="1" />
			<rect x="9" y="9" width="1" height="1" />
		</svg>
	);
}

export function DashboardIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect x="2" y="2" width="5" height="5" />
			<rect x="9" y="2" width="5" height="5" />
			<rect x="2" y="9" width="5" height="5" />
			<rect
				x="9"
				y="9"
				width="5"
				height="5"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
			/>
		</svg>
	);
}

export function TerminalIcon(props: IconProps) {
	return (
		<svg {...base(props)}>
			<rect
				x="2"
				y="2"
				width="12"
				height="12"
				fill="none"
				stroke="currentColor"
				strokeWidth="1"
			/>
			<rect x="4" y="5" width="2" height="1" />
			<rect x="5" y="6" width="1" height="1" />
			<rect x="4" y="7" width="5" height="1" />
		</svg>
	);
}

export function DstIcon(props: IconProps) {
	return (
		<svg {...base(props)} fill="none" stroke="currentColor" strokeWidth="1.2">
			<rect x="2" y="2" width="12" height="12" />
			<rect x="7.5" y="2" width="1" height="1" fill="currentColor" />
			<rect x="7.5" y="7" width="4" height="1" fill="currentColor" />
		</svg>
	);
}
