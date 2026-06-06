"use client";

import { audioManager, type AmbientSound } from "@/lib/audio-manager";
import { useCallback, useEffect, useRef, useState, useMemo } from "react";
import { OverlayPanel } from "./overlay-panel";
import { SoundVisualizer } from "./sound-visualizer";

type SoundCategory = "weather" | "water" | "nature" | "urban" | "ambient" | "fantasy";

const SOUNDS: { value: AmbientSound; label: string; icon: string; category: SoundCategory }[] = [
	{ value: "rain", label: "Rain", icon: "🌧", category: "weather" },
	{ value: "rainOnRoof", label: "Rain on Roof", icon: "🏠", category: "weather" },
	{ value: "thunder", label: "Thunder", icon: "⛈", category: "weather" },
	{ value: "blizzard", label: "Blizzard", icon: "❄️", category: "weather" },
	{ value: "wind", label: "Wind", icon: "💨", category: "weather" },
	{ value: "desert", label: "Desert Wind", icon: "🏜️", category: "weather" },
	{ value: "ocean", label: "Ocean", icon: "🌊", category: "water" },
	{ value: "stream", label: "Stream", icon: "💧", category: "water" },
	{ value: "waterfall", label: "Waterfall", icon: "🏔️", category: "water" },
	{ value: "forest", label: "Forest", icon: "🌲", category: "nature" },
	{ value: "birds", label: "Birds", icon: "🐦", category: "nature" },
	{ value: "night", label: "Night", icon: "🌙", category: "nature" },
	{ value: "fire", label: "Campfire", icon: "🔥", category: "nature" },
	{ value: "cafe", label: "Café", icon: "☕", category: "urban" },
	{ value: "fan", label: "Fan", icon: "🌀", category: "urban" },
	{ value: "train", label: "Train", icon: "🚂", category: "urban" },
	{ value: "whiteNoise", label: "White Noise", icon: "📡", category: "ambient" },
	{ value: "bowl", label: "Meditation Bowl", icon: "🔔", category: "ambient" },
	{ value: "spaceship", label: "Spaceship", icon: "🚀", category: "fantasy" },
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
					{activeSound !== "none" && (
						<div className="flex items-center gap-3 p-3 rounded-xl border border-(--color-accent)/20 bg-accent/5 mb-3">
							<span className="text-2xl">{activeSoundMeta?.icon}</span>
							<div className="flex-1 min-w-0">
								<div className="font-mono text-[9px] uppercase tracking-widest text-(--color-foreground)">
									{activeSoundMeta?.label}
								</div>
								<div className="h-1.5 rounded-full bg-(--color-muted)/30 mt-1 overflow-hidden">
									<div
										className="h-full rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-75"
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
							<button
								key={cat.key}
								type="button"
								onClick={() => setActiveCategory(cat.key)}
								className={`font-mono text-[8px] uppercase tracking-widest px-2.5 py-1.5 rounded-md border transition-all shrink-0 cursor-pointer ${
									activeCategory === cat.key
										? "text-(--color-foreground) border-(--color-accent) bg-accent/10"
										: "text-(--color-muted-foreground) border-transparent hover:text-(--color-foreground) hover:border-(--color-border)"
								}`}
							>
								{cat.label}
							</button>
						))}
					</div>

					<div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
						{filtered.map((s) => (
							<button
								key={s.value}
								type="button"
								onClick={() => handlePlay(s.value)}
								className={`flex flex-col items-center gap-1.5 p-3 sm:p-3.5 rounded-xl border transition-all duration-200 cursor-pointer ${
									activeSound === s.value
										? "border-(--color-accent) bg-accent/10 shadow-sm ring-1 ring-(--color-accent)/20"
										: "border-(--color-border) hover:border-(--color-muted) hover:bg-(--color-foreground)/[0.03]"
								}`}
							>
								<span className="text-xl sm:text-2xl">{s.icon}</span>
								<span className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground) text-center leading-tight">
									{s.label}
								</span>
								{activeSound === s.value && (
									<div className="flex items-center gap-[1.5px] h-2.5 mt-0.5">
										{Array.from({ length: 6 }).map((_, i) => {
											const a = Math.max(0.15, Math.min(1, amplitude * (2 + i * 0.8)));
											return (
												<div
													key={i}
													className="w-[2px] rounded-full bg-(--color-accent)"
													style={{
														height: `${15 + 70 * a}%`,
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
						<div className="flex items-center gap-2 pt-1">
							<span className="font-mono text-[8px] uppercase tracking-widest text-(--color-muted-foreground) w-6 shrink-0">
								vol
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
							<button
								type="button"
								onClick={() => { audioManager.stop(); setActiveSound("none"); }}
								className="font-mono text-[8px] uppercase tracking-widest px-2.5 py-1.5 rounded-md border border-(--color-delta-negative) text-(--color-delta-negative) hover:bg-(--color-delta-negative)/10 transition-all cursor-pointer ml-1 shrink-0"
							>
								stop
							</button>
						</div>
					)}
				</div>
			</div>
		</OverlayPanel>
	);
}
