"use client";

import { audioManager, type AmbientSound } from "@/lib/audio-manager";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { OverlayPanel } from "./ui/overlay-panel";
import { SoundVisualizer } from "./sound-visualizer";
import { PixelButton } from "./ui/pixel-button";
import { VolumeIcon, VolumeMuteIcon, CloseIcon, CheckIcon, PixelRainIcon, PixelWindIcon, PixelOceanIcon, PixelForestIcon, PixelCafeIcon, PixelWhiteNoiseIcon, PixelThunderIcon, PixelNightIcon, PixelFireIcon, PixelStreamIcon, PixelFanIcon, PixelBirdIcon, PixelWaterfallIcon, PixelBowlIcon, PixelBlizzardIcon, PixelTrainIcon, PixelSpaceshipIcon, PixelDesertIcon, PixelRoofIcon } from "./icons";

type SoundCategory = "weather" | "water" | "nature" | "urban" | "ambient" | "fantasy";

const SOUNDS: { value: AmbientSound; label: string; icon: React.ReactNode; category: SoundCategory }[] = [
	{ value: "rain", label: "Rain", icon: <PixelRainIcon size={24} />, category: "weather" },
	{ value: "rainOnRoof", label: "Rain on Roof", icon: <PixelRoofIcon size={24} />, category: "weather" },
	{ value: "thunder", label: "Thunder", icon: <PixelThunderIcon size={24} />, category: "weather" },
	{ value: "blizzard", label: "Blizzard", icon: <PixelBlizzardIcon size={24} />, category: "weather" },
	{ value: "wind", label: "Wind", icon: <PixelWindIcon size={24} />, category: "weather" },
	{ value: "desert", label: "Desert Wind", icon: <PixelDesertIcon size={24} />, category: "weather" },
	{ value: "ocean", label: "Ocean", icon: <PixelOceanIcon size={24} />, category: "water" },
	{ value: "stream", label: "Stream", icon: <PixelStreamIcon size={24} />, category: "water" },
	{ value: "waterfall", label: "Waterfall", icon: <PixelWaterfallIcon size={24} />, category: "water" },
	{ value: "forest", label: "Forest", icon: <PixelForestIcon size={24} />, category: "nature" },
	{ value: "birds", label: "Birds", icon: <PixelBirdIcon size={24} />, category: "nature" },
	{ value: "night", label: "Night", icon: <PixelNightIcon size={24} />, category: "nature" },
	{ value: "fire", label: "Campfire", icon: <PixelFireIcon size={24} />, category: "nature" },
	{ value: "cafe", label: "Café", icon: <PixelCafeIcon size={24} />, category: "urban" },
	{ value: "fan", label: "Fan", icon: <PixelFanIcon size={24} />, category: "urban" },
	{ value: "train", label: "Train", icon: <PixelTrainIcon size={24} />, category: "urban" },
	{ value: "whiteNoise", label: "White Noise", icon: <PixelWhiteNoiseIcon size={24} />, category: "ambient" },
	{ value: "bowl", label: "Meditation Bowl", icon: <PixelBowlIcon size={24} />, category: "ambient" },
	{ value: "spaceship", label: "Spaceship", icon: <PixelSpaceshipIcon size={24} />, category: "fantasy" },
];

const CATEGORIES: { key: SoundCategory; label: string }[] = [
	{ key: "weather", label: "Weather" },
	{ key: "water", label: "Water" },
	{ key: "nature", label: "Nature" },
	{ key: "urban", label: "Urban" },
	{ key: "ambient", label: "Ambient" },
	{ key: "fantasy", label: "Fantasy" },
];

export function MusicPlayer({ open, onClose }: { open: boolean; onClose: () => void }) {
	const [activeSound, setActiveSound] = useState<AmbientSound>("none");
	const [volume, setVolume] = useState(() => audioManager.getVolume());
	const [amplitude, setAmplitude] = useState(0);
	const [activeCategory, setActiveCategory] = useState<SoundCategory>("weather");
	const rafRef = useRef<number | null>(null);

	useEffect(() => {
		if (!open) {
			if (rafRef.current) cancelAnimationFrame(rafRef.current);
			return;
		}
		const poll = () => {
			setAmplitude(audioManager.amplitude);
			rafRef.current = requestAnimationFrame(poll);
		};
		poll();
		return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
	}, [open]);

	const handlePlay = useCallback(
		(sound: AmbientSound) => {
			if (activeSound === sound) {
				audioManager.stop();
				setActiveSound("none");
			} else {
				audioManager.play(sound);
				setActiveSound(sound);
			}
		},
		[activeSound],
	);

	const handleVolume = useCallback((v: number) => {
		const vol = Number(v);
		setVolume(vol);
		audioManager.setVolume(vol);
	}, []);

	const filtered = useMemo(
		() => SOUNDS.filter((s) => s.category === activeCategory),
		[activeCategory],
	);

	const activeSoundMeta = useMemo(
		() => SOUNDS.find((s) => s.value === activeSound),
		[activeSound],
	);

	return (
		<OverlayPanel open={open} onClose={onClose} title="Ambient Sounds" width="lg">
			<div className="relative overflow-hidden">
				<SoundVisualizer active={activeSound !== "none"} />
				<div className="relative z-10 p-4 sm:p-5 space-y-4">
					{activeSound !== "none" && activeSoundMeta && (
						<div className="flex items-center gap-3 p-3 border border-(--color-accent) bg-(--color-accent)/[0.05] rounded-lg mb-3">
							{activeSoundMeta.icon}
							<div className="flex-1 min-w-0">
								<div className="font-mono text-[10px] uppercase tracking-widest text-(--color-foreground) font-bold">
									{activeSoundMeta.label}
								</div>
								<div className="h-1.5 border border-(--color-border) mt-1 overflow-hidden bg-(--color-muted)/30">
									<div
										className="h-full bg-(--color-foreground) transition-all duration-75"
										style={{ width: `${Math.min(100, amplitude * 500)}%` }}
									/>
								</div>
							</div>
							<span className="font-mono text-[10px] tabular-nums text-(--color-muted-foreground)">
								{Math.round(audioManager.amplitude * 100)}%
							</span>
						</div>
					)}

					<div className="flex gap-1.5 overflow-x-auto pb-1">
						{CATEGORIES.map((cat) => (
							<PixelButton
								key={cat.key}
								size="sm"
								variant="outline"
								active={activeCategory === cat.key}
								onClick={() => setActiveCategory(cat.key)}
							>
								{cat.label}
							</PixelButton>
						))}
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
						{filtered.map((s) => (
							<button
								key={s.value}
								type="button"
								onClick={() => handlePlay(s.value)}
								className={[
									"flex flex-col items-center gap-1.5 p-3 sm:p-3.5 border rounded-lg transition-all duration-75 cursor-pointer",
									activeSound === s.value
										? "border-(--color-foreground) bg-(--color-foreground) text-(--color-background)"
										: "border-(--color-border) hover:bg-(--color-foreground)/[0.04] hover:border-(--color-muted) bg-(--color-background)",
								].join(" ")}
							>
								{s.icon}
								<span className="font-mono text-[8px] uppercase tracking-widest text-center leading-tight">
									{s.label}
								</span>
								{activeSound === s.value && (
									<div className="flex items-center gap-[1.5px] h-2.5 mt-0.5">
										{Array.from({ length: 6 }).map((_, i) => {
											const a = Math.max(0.15, Math.min(1, amplitude * (2 + i * 0.8)));
											return (
												<div
													key={i}
													className="w-[2px]"
													style={{
														height: `${15 + 70 * a}%`,
														background: "currentColor",
														opacity: 0.3 + 0.7 * a,
													}}
												/>
											);
										})}
									</div>
								)}
							</button>
						))}
					</div>

					{activeSound !== "none" && (
						<div className="flex items-center gap-2 pt-1 border-t border-(--color-border)">
							<span className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground) w-6 shrink-0">
								<VolumeIcon size={12} />
							</span>
							<input
								type="range"
								min={0}
								max={1}
								step={0.05}
								value={volume}
								onChange={(e) => handleVolume(Number(e.target.value))}
								className="flex-1 h-1 accent-(--color-accent) cursor-pointer"
								aria-label="Volume"
							/>
							<span className="font-mono text-[9px] tabular-nums text-(--color-muted-foreground) w-8 text-right">
								{Math.round(volume * 100)}
							</span>
							<PixelButton
								variant="danger"
								size="xs"
								icon={<CloseIcon size={10} />}
								onClick={() => { audioManager.stop(); setActiveSound("none"); }}
							>
								stop
							</PixelButton>
						</div>
					)}
				</div>
			</div>
		</OverlayPanel>
	);
}
