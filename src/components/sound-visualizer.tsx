"use client";

import { audioManager } from "@/lib/audio-manager";
import { useEffect, useRef } from "react";

type Particle = {
	x: number;
	y: number;
	vx: number;
	vy: number;
	size: number;
	life: number;
	maxLife: number;
	hue: number;
};

const PARTICLE_COUNT = 80;
const COLORS = [
	"59, 130, 246",
	"168, 85, 247",
	"34, 197, 94",
	"251, 146, 60",
	"236, 72, 153",
];

export function SoundVisualizer({ active }: { active: boolean }) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const particlesRef = useRef<Particle[]>([]);
	const rafRef = useRef<number>(0);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas || !active) return;
		const ctx = canvas.getContext("2d");
		if (!ctx) return;

		let w = (canvas.width = canvas.offsetWidth * devicePixelRatio);
		let h = (canvas.height = canvas.offsetHeight * devicePixelRatio);
		ctx.scale(devicePixelRatio, devicePixelRatio);
		const cssW = canvas.offsetWidth;
		const cssH = canvas.offsetHeight;

		const resize = () => {
			w = canvas.width = canvas.offsetWidth * devicePixelRatio;
			h = canvas.height = canvas.offsetHeight * devicePixelRatio;
		};
		window.addEventListener("resize", resize);

		const particles: Particle[] = [];
		for (let i = 0; i < PARTICLE_COUNT; i++) {
			particles.push({
				x: Math.random() * cssW,
				y: Math.random() * cssH,
				vx: (Math.random() - 0.5) * 0.5,
				vy: -Math.random() * 0.8 - 0.2,
				size: 1 + Math.random() * 2.5,
				life: Math.random(),
				maxLife: 2 + Math.random() * 4,
				hue: Math.floor(Math.random() * COLORS.length),
			});
		}
		particlesRef.current = particles;

		let lastTime = performance.now();

		const draw = (now: number) => {
			const dt = Math.min((now - lastTime) / 1000, 0.05);
			lastTime = now;

			const amp = audioManager.amplitude;
			const intensity = Math.min(1, amp * 6);

			ctx.clearRect(0, 0, cssW, cssH);

			for (const p of particles) {
				p.life += dt;
				if (p.life > p.maxLife) {
					p.x = Math.random() * cssW;
					p.y = cssH + 5;
					p.vx = (Math.random() - 0.5) * 0.8;
					p.vy = -(0.5 + Math.random() * 1.5 + intensity * 2);
					p.life = 0;
					p.maxLife = 1.5 + Math.random() * 4;
					p.size = 1 + Math.random() * 2 + intensity * 3;
				}

				const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
				const angle = Math.atan2(p.vy, p.vx);
				const wave = Math.sin(now * 0.002 + p.x * 0.01) * intensity * 0.5;
				p.vx += Math.cos(angle + 1.5) * 0.01 + wave * 0.02;
				p.vy += Math.sin(angle + 1.5) * 0.01 - intensity * 0.03;

				const maxSpeed = 1.5 + intensity * 2;
				if (speed > maxSpeed) {
					p.vx = (p.vx / speed) * maxSpeed;
					p.vy = (p.vy / speed) * maxSpeed;
				}

				p.x += p.vx;
				p.y += p.vy;

				const progress = p.life / p.maxLife;
				const alpha = Math.max(0, 0.7 * (1 - progress) * (0.5 + intensity * 0.5));
				const color = COLORS[p.hue % COLORS.length];
				const glow = intensity * 8;

				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size + glow * 0.3, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(${color}, ${alpha * 0.1})`;
				ctx.fill();

				ctx.beginPath();
				ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
				ctx.fillStyle = `rgba(${color}, ${alpha})`;
				ctx.fill();

				if (intensity > 0.3 && p.size > 2) {
					ctx.beginPath();
					ctx.moveTo(p.x, p.y);
					ctx.lineTo(p.x - p.vx * 8 * intensity, p.y - p.vy * 8 * intensity);
					ctx.strokeStyle = `rgba(${color}, ${alpha * 0.3})`;
					ctx.lineWidth = 0.5;
					ctx.stroke();
				}
			}

			rafRef.current = requestAnimationFrame(draw);
		};
		rafRef.current = requestAnimationFrame(draw);

		return () => {
			cancelAnimationFrame(rafRef.current);
			window.removeEventListener("resize", resize);
		};
	}, [active]);

	if (!active) return null;

	return (
		<canvas
			ref={canvasRef}
			className="absolute inset-0 w-full h-full pointer-events-none z-0"
			aria-hidden="true"
		/>
	);
}
