export type AmbientSound =
	| "none" | "rain" | "forest" | "cafe" | "ocean" | "wind"
	| "whiteNoise" | "thunder" | "night" | "fire" | "stream" | "fan"
	| "birds" | "waterfall" | "bowl" | "blizzard" | "train" | "spaceship" | "desert" | "rainOnRoof";

type SoundState = {
	stop: () => void;
	setVolume: (v: number) => void;
	cleanup: () => void;
};

function createLFO(ctx: AudioContext, rate: number, amount: number, target: AudioParam): OscillatorNode {
	const lfo = ctx.createOscillator();
	const lfoGain = ctx.createGain();
	lfo.type = "sine";
	lfo.frequency.value = rate;
	lfoGain.gain.value = amount;
	lfo.connect(lfoGain);
	lfoGain.connect(target);
	lfo.start();
	return lfo;
}

function createReverb(ctx: AudioContext, decay: number = 1.5, wet: number = 0.3): { input: GainNode; output: GainNode } {
	const input = ctx.createGain();
	const output = ctx.createGain();
	const wetGain = ctx.createGain();
	wetGain.gain.value = wet;

	const delay1 = ctx.createDelay(2);
	delay1.delayTime.value = 0.03;
	const delay2 = ctx.createDelay(2);
	delay2.delayTime.value = 0.07;
	const delay3 = ctx.createDelay(2);
	delay3.delayTime.value = 0.12;

	const feedback1 = ctx.createGain();
	feedback1.gain.value = 0.4;
	const feedback2 = ctx.createGain();
	feedback2.gain.value = 0.3;
	const feedback3 = ctx.createGain();
	feedback3.gain.value = 0.2;

	const filter = ctx.createBiquadFilter();
	filter.type = "lowpass";
	filter.frequency.value = 4000;

	input.connect(delay1);
	delay1.connect(wetGain);
	delay1.connect(feedback1);
	feedback1.connect(delay1);
	delay1.connect(filter);

	filter.connect(delay2);
	delay2.connect(wetGain);
	delay2.connect(feedback2);
	feedback2.connect(delay2);
	delay2.connect(delay3);
	delay3.connect(wetGain);
	delay3.connect(feedback3);
	feedback3.connect(delay3);

	wetGain.connect(output);
	input.connect(output);

	return { input, output };
}

function createStereoPanner(ctx: AudioContext): StereoPannerNode {
	return ctx.createStereoPanner();
}

function createNoiseBuffer(ctx: AudioContext, duration: number, type: "white" | "pink" | "brown" = "white"): AudioBuffer {
	const len = ctx.sampleRate * duration;
	const buffer = ctx.createBuffer(2, len, ctx.sampleRate);
	const ch0 = buffer.getChannelData(0);
	const ch1 = buffer.getChannelData(1);
	let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;

	if (type === "brown") {
		for (let i = 0; i < len; i++) {
			const w = Math.random() * 2 - 1;
			b0 = (b0 + 0.02 * w) / 1.02;
			if (b0 > 1) b0 = 1;
			if (b0 < -1) b0 = -1;
			ch0[i] = b0;
			ch1[i] = b0 * (0.9 + 0.2 * Math.sin(i * 0.0001));
		}
		return buffer;
	}
	if (type === "pink") {
		for (let i = 0; i < len; i++) {
			const w = Math.random() * 2 - 1;
			b0 = 0.99886 * b0 + 0.0555179 * w;
			b1 = 0.99332 * b1 + 0.0750759 * w;
			b2 = 0.969 * b2 + 0.153852 * w;
			b3 = 0.8665 * b3 + 0.3104856 * w;
			b4 = 0.55 * b4 + 0.5329522 * w;
			b5 = -0.7616 * b5 - 0.016898 * w;
			const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + 0.5362 * w) * 0.11;
			b6 = w * 0.115926;
			ch0[i] = pink;
			ch1[i] = pink * (0.95 + 0.1 * Math.sin(i * 0.00007));
		}
		return buffer;
	}
	for (let i = 0; i < len; i++) {
		ch0[i] = Math.random() * 2 - 1;
		ch1[i] = Math.random() * 2 - 1;
	}
	return buffer;
}

class AudioManager {
	private ctx: AudioContext | null = null;
	private masterGain: GainNode | null = null;
	private state: Map<AmbientSound, SoundState> = new Map();
	private _masterVolume: number = 0.5;
	private _activeSound: AmbientSound = "none";
	private analyser: AnalyserNode | null = null;
	private animationId: number | null = null;
	private _amplitude: number = 0;

	private getContext(): AudioContext {
		if (!this.ctx) {
			const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
			this.ctx = new Ctor();
			this.masterGain = this.ctx.createGain();
			this.masterGain.gain.value = this._masterVolume;
			this.masterGain.connect(this.ctx.destination);
			this.analyser = this.ctx.createAnalyser();
			this.analyser.fftSize = 256;
			this.masterGain.connect(this.analyser);
		}
		if (this.ctx.state === "suspended") {
			this.ctx.resume();
		}
		return this.ctx;
	}

	get activeSound(): AmbientSound {
		return this._activeSound;
	}

	get amplitude(): number {
		return this._amplitude;
	}

	getVolume(): number {
		return this._masterVolume;
	}

	setVolume(vol: number) {
		this._masterVolume = Math.max(0, Math.min(1, vol));
		if (this.masterGain && this.ctx) {
			this.masterGain.gain.setTargetAtTime(this._masterVolume, this.ctx.currentTime, 0.05);
		}
		for (const s of this.state.values()) {
			s.setVolume(this._masterVolume);
		}
	}

	private startAmplitudeAnalysis() {
		if (this.animationId) return;
		const analyse = () => {
			if (!this.analyser) return;
			const data = new Uint8Array(this.analyser.frequencyBinCount);
			this.analyser.getByteTimeDomainData(data);
			let sum = 0;
			for (let i = 0; i < data.length; i++) {
				const v = (data[i] - 128) / 128;
				sum += v * v;
			}
			this._amplitude = Math.sqrt(sum / data.length);
			this.animationId = requestAnimationFrame(analyse);
		};
		analyse();
	}

	private stopAmplitudeAnalysis() {
		if (this.animationId) {
			cancelAnimationFrame(this.animationId);
			this.animationId = null;
		}
		this._amplitude = 0;
	}

	play(sound: AmbientSound) {
		this.stop();
		if (sound === "none") return;

		this._activeSound = sound;
		const ctx = this.getContext();
		const master = this.masterGain!;

		switch (sound) {
			case "rain": this.startRain(ctx, master); break;
			case "wind": this.startWind(ctx, master); break;
			case "ocean": this.startOcean(ctx, master); break;
			case "forest": this.startForest(ctx, master); break;
			case "cafe": this.startCafe(ctx, master); break;
			case "whiteNoise": this.startWhiteNoise(ctx, master); break;
			case "thunder": this.startThunder(ctx, master); break;
			case "night": this.startNight(ctx, master); break;
			case "fire": this.startFire(ctx, master); break;
			case "stream": this.startStream(ctx, master); break;
			case "fan": this.startFan(ctx, master); break;
			case "birds": this.startBirds(ctx, master); break;
			case "waterfall": this.startWaterfall(ctx, master); break;
			case "bowl": this.startBowl(ctx, master); break;
			case "blizzard": this.startBlizzard(ctx, master); break;
			case "train": this.startTrain(ctx, master); break;
			case "spaceship": this.startSpaceship(ctx, master); break;
			case "desert": this.startDesert(ctx, master); break;
			case "rainOnRoof": this.startRainOnRoof(ctx, master); break;
		}
		this.startAmplitudeAnalysis();
	}

	private registerVolume(base: number, gain: GainNode, extras: GainNode[] = []) {
		this.setVolume(this._masterVolume);
		return (v: number) => {
			gain.gain.setTargetAtTime(v * base, this.ctx?.currentTime || 0, 0.05);
			for (const e of extras) {
				e.gain.setTargetAtTime(v * e.gain.value / Math.max(0.01, this._masterVolume || 1), this.ctx?.currentTime || 0, 0.05);
			}
		};
	}

	private registerAll(gain: GainNode) {
		return (v: number) => {
			gain.gain.setTargetAtTime(v, this.ctx?.currentTime || 0, 0.05);
		};
	}

	// ── Rain ──────────────────────────────────────────────
	private startRain(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 6, "pink");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 400;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 3500;

		const band = ctx.createBiquadFilter();
		band.type = "bandpass";
		band.frequency.value = 1200;
		band.Q.value = 0.8;

		const gain = ctx.createGain();
		gain.gain.value = 0.25;

		const reverb = createReverb(ctx, 0.8, 0.25);

		src.connect(hp);
		hp.connect(lp);
		lp.connect(band);
		band.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);

		const lfo = createLFO(ctx, 0.3, 300, hp.frequency);
		const lfo2 = createLFO(ctx, 0.15, 200, band.frequency);

		const drips: { stop: () => void }[] = [];
		let dripInterval: ReturnType<typeof setInterval> | null = null;
		dripInterval = setInterval(() => {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			osc.type = "sine";
			osc.frequency.value = 2000 + Math.random() * 2000;
			g.gain.setValueAtTime(0, ctx.currentTime);
			g.gain.linearRampToValueAtTime(0.03 + Math.random() * 0.04, ctx.currentTime + 0.005);
			g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08 + Math.random() * 0.1);
			const panner = createStereoPanner(ctx);
			panner.pan.value = Math.random() * 2 - 1;
			osc.connect(g);
			g.connect(panner);
			panner.connect(dest);
			osc.start(ctx.currentTime);
			osc.stop(ctx.currentTime + 0.2);
		}, 150 + Math.random() * 300);

		src.start();

		this.state.set("rain", {
			stop: () => {
				try { src.stop(); } catch {}
				try { lfo.stop(); } catch {}
				try { lfo2.stop(); } catch {}
			},
			cleanup: () => { if (dripInterval) clearInterval(dripInterval); },
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.25, ctx.currentTime, 0.05); },
		});
	}

	// ── Wind ──────────────────────────────────────────────
	private startWind(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 6, "brown");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 500;

		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 80;

		const gain = ctx.createGain();
		gain.gain.value = 0.2;

		const reverb = createReverb(ctx, 2, 0.4);

		src.connect(lp);
		lp.connect(hp);
		hp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);

		const lfoFreq = createLFO(ctx, 0.06 + Math.random() * 0.04, 350, lp.frequency);
		const lfoGain2 = ctx.createOscillator();
		const gGain = ctx.createGain();
		lfoGain2.type = "sine";
		lfoGain2.frequency.value = 0.08 + Math.random() * 0.06;
		gGain.gain.value = 0.08;
		lfoGain2.connect(gGain);
		gGain.connect(gain.gain);
		lfoGain2.start();

		src.start();

		this.state.set("wind", {
			stop: () => {
				try { src.stop(); } catch {}
				try { lfoFreq.stop(); } catch {}
				try { lfoGain2.stop(); } catch {}
			},
			cleanup: () => {},
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.2, ctx.currentTime, 0.05); },
		});
	}

	// ── Ocean ──────────────────────────────────────────────
	private startOcean(ctx: AudioContext, dest: AudioNode) {
		const len = ctx.sampleRate * 12;
		const buffer = ctx.createBuffer(2, len, ctx.sampleRate);
		const ch0 = buffer.getChannelData(0);
		const ch1 = buffer.getChannelData(1);

		for (let i = 0; i < len; i++) {
			const t = i / ctx.sampleRate;
			const wave1 = Math.sin(t * 0.08);
			const wave2 = Math.sin(t * 0.12 + 1.3);
			const wave3 = Math.sin(t * 0.21 + 2.7);
			const envelope = 0.4 + 0.6 * (wave1 * 0.5 + wave2 * 0.3 + wave3 * 0.2 + 1) / 2;
			const noise = Math.random() * 2 - 1;
			ch0[i] = noise * envelope * 0.7;
			ch1[i] = noise * envelope * 0.7 * (0.9 + 0.2 * Math.sin(t * 0.15));
		}

		const src = ctx.createBufferSource();
		src.buffer = buffer;
		src.loop = true;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 600;

		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 80;

		const band = ctx.createBiquadFilter();
		band.type = "bandpass";
		band.frequency.value = 300;
		band.Q.value = 0.5;

		const gain = ctx.createGain();
		gain.gain.value = 0.28;

		const reverb = createReverb(ctx, 1.5, 0.3);

		src.connect(lp);
		lp.connect(band);
		band.connect(hp);
		hp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);

		const lfo = createLFO(ctx, 0.04, 200, lp.frequency);
		const lfo2 = createLFO(ctx, 0.07, 100, band.frequency);

		src.start();

		this.state.set("ocean", {
			stop: () => {
				try { src.stop(); } catch {}
				try { lfo.stop(); } catch {}
				try { lfo2.stop(); } catch {}
			},
			cleanup: () => {},
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.28, ctx.currentTime, 0.05); },
		});
	}

	// ── Forest ──────────────────────────────────────────────
	private startForest(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 6, "pink");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 800;

		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 150;

		const band = ctx.createBiquadFilter();
		band.type = "bandpass";
		band.frequency.value = 400;
		band.Q.value = 0.7;

		const gain = ctx.createGain();
		gain.gain.value = 0.15;

		const reverb = createReverb(ctx, 1.2, 0.35);

		src.connect(band);
		band.connect(lp);
		lp.connect(hp);
		hp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);

		const lfoRustle = createLFO(ctx, 0.05, 350, band.frequency);
		const lfoVol = createLFO(ctx, 0.03, 0.03, gain.gain);

		const chirpInterval = setInterval(() => {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			const freq = 1800 + Math.random() * 2500;
			osc.type = Math.random() > 0.5 ? "sine" : "triangle";
			osc.frequency.setValueAtTime(freq, ctx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(freq + 400 + Math.random() * 800, ctx.currentTime + 0.06);
			osc.frequency.exponentialRampToValueAtTime(freq - 200, ctx.currentTime + 0.12);
			g.gain.setValueAtTime(0, ctx.currentTime);
			g.gain.linearRampToValueAtTime(0.02 + Math.random() * 0.02, ctx.currentTime + 0.02);
			g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15 + Math.random() * 0.2);
			const panner = createStereoPanner(ctx);
			panner.pan.value = Math.random() * 2 - 1;
			osc.connect(g);
			g.connect(panner);
			panner.connect(dest);
			osc.start(ctx.currentTime);
			osc.stop(ctx.currentTime + 0.4);
		}, 3000 + Math.random() * 5000);

		src.start();

		this.state.set("forest", {
			stop: () => {
				try { src.stop(); } catch {}
				try { lfoRustle.stop(); } catch {}
				try { lfoVol.stop(); } catch {}
			},
			cleanup: () => { clearInterval(chirpInterval); },
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.15, ctx.currentTime, 0.05); },
		});
	}

	// ── Cafe ──────────────────────────────────────────────
	private startCafe(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 6, "pink");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 2500;

		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 200;

		const gain = ctx.createGain();
		gain.gain.value = 0.12;

		const reverb = createReverb(ctx, 0.6, 0.2);

		src.connect(hp);
		hp.connect(lp);
		lp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);

		const clutterInterval = setInterval(() => {
			const type = Math.random();
			if (type < 0.4) {
				const osc = ctx.createOscillator();
				const g = ctx.createGain();
				osc.type = "sine";
				osc.frequency.value = 800 + Math.random() * 1200;
				g.gain.setValueAtTime(0, ctx.currentTime);
				g.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.005);
				g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06 + Math.random() * 0.08);
				const panner = createStereoPanner(ctx);
				panner.pan.value = Math.random() * 2 - 1;
				osc.connect(g);
				g.connect(panner);
				panner.connect(dest);
				osc.start(ctx.currentTime);
				osc.stop(ctx.currentTime + 0.15);
			} else if (type < 0.6) {
				const noise2 = createNoiseBuffer(ctx, 0.1, "pink");
				const s = ctx.createBufferSource();
				s.buffer = noise2;
				const g = ctx.createGain();
				g.gain.value = 0.02;
				const bp = ctx.createBiquadFilter();
				bp.type = "bandpass";
				bp.frequency.value = 2000 + Math.random() * 1500;
				bp.Q.value = 2;
				s.connect(bp);
				bp.connect(g);
				g.connect(dest);
				s.start(ctx.currentTime);
				s.stop(ctx.currentTime + 0.1);
			}
		}, 500 + Math.random() * 1500);

		src.start();

		this.state.set("cafe", {
			stop: () => { try { src.stop(); } catch {} },
			cleanup: () => { clearInterval(clutterInterval); },
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.12, ctx.currentTime, 0.05); },
		});
	}

	// ── White Noise ─────────────────────────────────────────
	private startWhiteNoise(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 4, "white");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const hs = ctx.createBiquadFilter();
		hs.type = "highshelf";
		hs.frequency.value = 4000;
		hs.gain.value = 4;

		const gain = ctx.createGain();
		gain.gain.value = 0.06;

		src.connect(hs);
		hs.connect(gain);
		gain.connect(dest);

		src.start();

		this.state.set("whiteNoise", {
			stop: () => { try { src.stop(); } catch {} },
			cleanup: () => {},
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.06, ctx.currentTime, 0.05); },
		});
	}

	// ── Thunder ────────────────────────────────────────────
	private startThunder(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 8, "brown");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 150;

		const gain = ctx.createGain();
		gain.gain.value = 0.2;

		const reverb = createReverb(ctx, 3, 0.5);

		src.connect(lp);
		lp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);

		const rumbleInterval = setInterval(() => {
			const duration = 0.5 + Math.random() * 1.5;
			const start = ctx.currentTime + Math.random() * 2;
			const vol = gain.gain.value;
			gain.gain.setValueAtTime(vol * 0.5, start);
			gain.gain.linearRampToValueAtTime(vol * 2, start + 0.1);
			gain.gain.exponentialRampToValueAtTime(vol * 0.3, start + duration);

			lp.frequency.setValueAtTime(120, start);
			lp.frequency.exponentialRampToValueAtTime(60, start + 0.3);
		}, 6000 + Math.random() * 8000);

		src.start();

		this.state.set("thunder", {
			stop: () => { try { src.stop(); } catch {} },
			cleanup: () => { clearInterval(rumbleInterval); },
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.2, ctx.currentTime, 0.05); },
		});
	}

	// ── Night ──────────────────────────────────────────────
	private startNight(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 6, "brown");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 300;

		const gain = ctx.createGain();
		gain.gain.value = 0.15;

		src.connect(lp);
		lp.connect(gain);
		gain.connect(dest);

		const cricketInterval = setInterval(() => {
			for (let i = 0; i < 3 + Math.floor(Math.random() * 4); i++) {
				const osc = ctx.createOscillator();
				const g = ctx.createGain();
				osc.type = "sine";
				const baseFreq = 3200 + Math.random() * 1200;
				osc.frequency.setValueAtTime(baseFreq, ctx.currentTime + i * 0.04);
				osc.frequency.setValueAtTime(baseFreq * 1.1, ctx.currentTime + i * 0.04 + 0.02);
				g.gain.setValueAtTime(0, ctx.currentTime + i * 0.04);
				g.gain.linearRampToValueAtTime(0.015 + Math.random() * 0.01, ctx.currentTime + i * 0.04 + 0.01);
				g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.04 + 0.03);
				const panner = createStereoPanner(ctx);
				panner.pan.value = Math.random() * 2 - 1;
				osc.connect(g);
				g.connect(panner);
				panner.connect(dest);
				osc.start(ctx.currentTime + i * 0.04);
				osc.stop(ctx.currentTime + i * 0.04 + 0.05);
			}
		}, 2000 + Math.random() * 3000);

		src.start();

		this.state.set("night", {
			stop: () => { try { src.stop(); } catch {} },
			cleanup: () => { clearInterval(cricketInterval); },
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.15, ctx.currentTime, 0.05); },
		});
	}

	// ── Fire ──────────────────────────────────────────────
	private startFire(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 6, "pink");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 600;

		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 100;

		const band = ctx.createBiquadFilter();
		band.type = "bandpass";
		band.frequency.value = 350;
		band.Q.value = 0.6;

		const gain = ctx.createGain();
		gain.gain.value = 0.18;

		const reverb = createReverb(ctx, 0.8, 0.15);

		src.connect(hp);
		hp.connect(band);
		band.connect(lp);
		lp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);

		const lfo = createLFO(ctx, 0.1 + Math.random() * 0.1, 250, band.frequency);
		const lfo2 = createLFO(ctx, 0.06, 0.05, gain.gain);

		const crackleInterval = setInterval(() => {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			osc.type = "sawtooth";
			osc.frequency.value = 400 + Math.random() * 3000;
			g.gain.setValueAtTime(0, ctx.currentTime);
			g.gain.linearRampToValueAtTime(0.01 + Math.random() * 0.02, ctx.currentTime + 0.005);
			g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.02 + Math.random() * 0.04);
			const panner = createStereoPanner(ctx);
			panner.pan.value = Math.random() * 2 - 1;
			osc.connect(g);
			g.connect(panner);
			panner.connect(dest);
			osc.start(ctx.currentTime);
			osc.stop(ctx.currentTime + 0.06);
		}, 100 + Math.random() * 300);

		src.start();

		this.state.set("fire", {
			stop: () => {
				try { src.stop(); } catch {}
				try { lfo.stop(); } catch {}
				try { lfo2.stop(); } catch {}
			},
			cleanup: () => { clearInterval(crackleInterval); },
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.18, ctx.currentTime, 0.05); },
		});
	}

	// ── Stream ─────────────────────────────────────────────
	private startStream(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 6, "pink");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 600;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 3000;

		const band = ctx.createBiquadFilter();
		band.type = "bandpass";
		band.frequency.value = 1500;
		band.Q.value = 1.5;

		const gain = ctx.createGain();
		gain.gain.value = 0.2;

		const reverb = createReverb(ctx, 0.5, 0.2);

		src.connect(hp);
		hp.connect(band);
		band.connect(lp);
		lp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);

		const lfo = createLFO(ctx, 0.2 + Math.random() * 0.15, 500, band.frequency);
		const lfo2 = createLFO(ctx, 0.08, 200, lp.frequency);

		src.start();

		this.state.set("stream", {
			stop: () => {
				try { src.stop(); } catch {}
				try { lfo.stop(); } catch {}
				try { lfo2.stop(); } catch {}
			},
			cleanup: () => {},
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.2, ctx.currentTime, 0.05); },
		});
	}

	// ── Fan ────────────────────────────────────────────────
	private startFan(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 4, "brown");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 200;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 1000;

		const gain = ctx.createGain();
		gain.gain.value = 0.14;

		src.connect(hp);
		hp.connect(lp);
		lp.connect(gain);
		gain.connect(dest);

		const osc = ctx.createOscillator();
		const oscGain = ctx.createGain();
		osc.type = "sine";
		osc.frequency.value = 80 + Math.random() * 40;
		oscGain.gain.value = 0.03;
		osc.connect(oscGain);
		oscGain.connect(dest);
		osc.start();

		src.start();

		this.state.set("fan", {
			stop: () => {
				try { src.stop(); } catch {}
				try { osc.stop(); } catch {}
			},
			cleanup: () => {},
			setVolume: (v) => {
				gain.gain.setTargetAtTime(v * 0.14, ctx.currentTime, 0.05);
				oscGain.gain.setTargetAtTime(v * 0.03, ctx.currentTime, 0.05);
			},
		});
	}

	// ── Birds ──────────────────────────────────────────────
	private startBirds(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 4, "pink");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;
		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass"; lp.frequency.value = 2000;
		const hp = ctx.createBiquadFilter();
		hp.type = "highpass"; hp.frequency.value = 300;
		const gain = ctx.createGain();
		gain.gain.value = 0.1;
		src.connect(hp); hp.connect(lp); lp.connect(gain); gain.connect(dest);

		const intervals: ReturnType<typeof setInterval>[] = [];
		for (let i = 0; i < 3; i++) {
			const id = setInterval(() => {
				const osc = ctx.createOscillator();
				const g = ctx.createGain();
				osc.type = "sine";
				const base = 2000 + Math.random() * 3000;
				osc.frequency.setValueAtTime(base, ctx.currentTime);
				osc.frequency.exponentialRampToValueAtTime(base + 500 + Math.random() * 1000, ctx.currentTime + 0.04);
				osc.frequency.exponentialRampToValueAtTime(base - 300, ctx.currentTime + 0.1);
				g.gain.setValueAtTime(0, ctx.currentTime);
				g.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.01);
				g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15 + Math.random() * 0.15);
				const pan = createStereoPanner(ctx);
				pan.pan.value = Math.random() * 2 - 1;
				osc.connect(g); g.connect(pan); pan.connect(dest);
				osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.3);
			}, 800 + Math.random() * 2000 + i * 1200);
			intervals.push(id);
		}
		src.start();
		this.state.set("birds", {
			stop: () => { try { src.stop(); } catch {} },
			cleanup: () => { intervals.forEach(clearInterval); },
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.1, ctx.currentTime, 0.05); },
		});
	}

	// ── Waterfall ──────────────────────────────────────────
	private startWaterfall(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 8, "pink");
		const src = ctx.createBufferSource();
		src.buffer = noise; src.loop = true;
		const bp = ctx.createBiquadFilter();
		bp.type = "bandpass"; bp.frequency.value = 1500; bp.Q.value = 0.8;
		const hp = ctx.createBiquadFilter();
		hp.type = "highpass"; hp.frequency.value = 400;
		const gain = ctx.createGain();
		gain.gain.value = 0.22;
		const reverb = createReverb(ctx, 1.2, 0.3);
		src.connect(hp); hp.connect(bp); bp.connect(gain);
		gain.connect(reverb.input); reverb.output.connect(dest);
		const lfo = createLFO(ctx, 0.15, 400, bp.frequency);
		const lfo2 = createLFO(ctx, 0.08, 0.04, gain.gain);
		src.start();
		this.state.set("waterfall", {
			stop: () => {
				try { src.stop(); } catch {}
				try { lfo.stop(); } catch {}
				try { lfo2.stop(); } catch {}
			},
			cleanup: () => {},
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.22, ctx.currentTime, 0.05); },
		});
	}

	// ── Meditation Bowl ────────────────────────────────────
	private startBowl(ctx: AudioContext, dest: AudioNode) {
		const nodes: OscillatorNode[] = [];
		const gains: GainNode[] = [];
		const freqs = [220, 330, 440, 550, 660];
		freqs.forEach((f, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "sine";
			osc.frequency.value = f;
			const base = 0.04 - i * 0.006;
			gain.gain.setValueAtTime(0, ctx.currentTime);
			gain.gain.linearRampToValueAtTime(base, ctx.currentTime + 0.3);
			gain.gain.setValueAtTime(base, ctx.currentTime + 2);
			gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 5 + i * 2);
			const reverb = createReverb(ctx, 3, 0.5);
			osc.connect(gain); gain.connect(reverb.input); reverb.output.connect(dest);
			osc.start(); nodes.push(osc); gains.push(gain);
		});
		const strikeInterval = setInterval(() => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = "sine";
			osc.frequency.value = 220 + Math.random() * 440;
			gain.gain.setValueAtTime(0.06, ctx.currentTime);
			gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 4 + Math.random() * 2);
			const r = createReverb(ctx, 4, 0.6);
			osc.connect(gain); gain.connect(r.input); r.output.connect(dest);
			osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 6);
			nodes.push(osc);
		}, 12000 + Math.random() * 8000);

		this.state.set("bowl", {
			stop: () => { nodes.forEach(n => { try { n.stop(); } catch {} }); },
			cleanup: () => { clearInterval(strikeInterval); },
			setVolume: (v) => {
				for (let i = 0; i < gains.length; i++) {
					const base = 0.04 - i * 0.006;
					gains[i].gain.setTargetAtTime(v * base, ctx.currentTime, 0.05);
				}
			},
		});
	}

	// ── Blizzard ───────────────────────────────────────────
	private startBlizzard(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 6, "brown");
		const src = ctx.createBufferSource();
		src.buffer = noise; src.loop = true;
		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass"; lp.frequency.value = 400;
		const hp = ctx.createBiquadFilter();
		hp.type = "highpass"; hp.frequency.value = 100;
		const gain = ctx.createGain();
		gain.gain.value = 0.2;
		const reverb = createReverb(ctx, 2.5, 0.5);
		src.connect(hp); hp.connect(lp); lp.connect(gain);
		gain.connect(reverb.input); reverb.output.connect(dest);
		const lfo = createLFO(ctx, 0.12, 250, lp.frequency);
		const lfo2 = createLFO(ctx, 0.04, 0.06, gain.gain);

		const gustInterval = setInterval(() => {
			const dur = 1 + Math.random() * 3;
			const t = ctx.currentTime;
			const vol = gain.gain.value;
			gain.gain.setValueAtTime(vol * 0.7, t);
			gain.gain.linearRampToValueAtTime(vol * 1.8, t + 0.5);
			gain.gain.exponentialRampToValueAtTime(vol * 0.5, t + dur);
			lp.frequency.setValueAtTime(250, t);
			lp.frequency.exponentialRampToValueAtTime(80, t + 0.3);
		}, 4000 + Math.random() * 5000);

		src.start();
		this.state.set("blizzard", {
			stop: () => {
				try { src.stop(); } catch {}
				try { lfo.stop(); } catch {}
				try { lfo2.stop(); } catch {}
			},
			cleanup: () => { clearInterval(gustInterval); },
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.2, ctx.currentTime, 0.05); },
		});
	}

	// ── Train ──────────────────────────────────────────────
	private startTrain(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 4, "brown");
		const src = ctx.createBufferSource();
		src.buffer = noise; src.loop = true;
		const bp = ctx.createBiquadFilter();
		bp.type = "bandpass"; bp.frequency.value = 200; bp.Q.value = 0.5;
		const gain = ctx.createGain();
		gain.gain.value = 0.15;
		const chugGain = ctx.createGain();
		chugGain.gain.value = 0.08;
		const hornGain = ctx.createGain();
		hornGain.gain.value = 0.05;
		src.connect(bp); bp.connect(gain); gain.connect(dest);
		const lfo = createLFO(ctx, 2.2, 80, bp.frequency);

		const chugInterval = setInterval(() => {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			osc.type = "triangle";
			osc.frequency.value = 60 + Math.random() * 30;
			g.gain.setValueAtTime(0.08, ctx.currentTime);
			g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
			const bp2 = ctx.createBiquadFilter();
			bp2.type = "bandpass"; bp2.frequency.value = 80; bp2.Q.value = 2;
			osc.connect(bp2); bp2.connect(g); g.connect(dest);
			osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.2);
		}, 350);

		const hornInterval = setInterval(() => {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			osc.type = "sawtooth";
			osc.frequency.setValueAtTime(180, ctx.currentTime);
			osc.frequency.linearRampToValueAtTime(220, ctx.currentTime + 0.5);
			osc.frequency.linearRampToValueAtTime(200, ctx.currentTime + 1.5);
			g.gain.setValueAtTime(0, ctx.currentTime);
			g.gain.linearRampToValueAtTime(0.05, ctx.currentTime + 0.1);
			g.gain.setValueAtTime(0.05, ctx.currentTime + 1.2);
			g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 2);
			const reverb = createReverb(ctx, 1.5, 0.4);
			const dist = ctx.createWaveShaper();
			const k = 2; const curve = new Float32Array(256);
			for (let i = 0; i < 256; i++) curve[i] = Math.tanh(k * (2 * i / 255 - 1));
			dist.curve = curve;
			osc.connect(dist); dist.connect(reverb.input); reverb.output.connect(g); g.connect(dest);
			osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 2);
		}, 25000 + Math.random() * 15000);

		src.start();
		this.state.set("train", {
			stop: () => { try { src.stop(); } catch {} },
			cleanup: () => { clearInterval(chugInterval); clearInterval(hornInterval); },
			setVolume: (v) => {
				gain.gain.setTargetAtTime(v * 0.15, ctx.currentTime, 0.05);
				chugGain.gain.setTargetAtTime(v * 0.08, ctx.currentTime, 0.05);
				hornGain.gain.setTargetAtTime(v * 0.05, ctx.currentTime, 0.05);
			},
		});
	}

	// ── Spaceship ──────────────────────────────────────────
	private startSpaceship(ctx: AudioContext, dest: AudioNode) {
		const nodes: OscillatorNode[] = [];
		const gains: GainNode[] = [];
		const baseGains = [0.04, 0.032, 0.024, 0.016];
		[60, 90, 120, 180].forEach((freq, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.type = i === 0 ? "sawtooth" : "sine";
			osc.frequency.value = freq;
			gain.gain.value = baseGains[i];
			const reverb = createReverb(ctx, 3, 0.4);
			const pan = createStereoPanner(ctx);
			pan.pan.value = (i - 1.5) * 0.4;
			osc.connect(gain); gain.connect(reverb.input); reverb.output.connect(pan); pan.connect(dest);
			osc.start(); nodes.push(osc); gains.push(gain);
		});

		const lfo = createLFO(ctx, 0.05, 60, nodes[0].frequency);
		const lfo2 = createLFO(ctx, 0.03, 20, nodes[1].frequency);

		const beepInterval = setInterval(() => {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			osc.type = "sine";
			osc.frequency.setValueAtTime(400 + Math.random() * 800, ctx.currentTime);
			osc.frequency.exponentialRampToValueAtTime(200 + Math.random() * 400, ctx.currentTime + 0.3);
			g.gain.setValueAtTime(0, ctx.currentTime);
			g.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.02);
			g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4 + Math.random() * 0.3);
			const pan = createStereoPanner(ctx);
			pan.pan.value = Math.random() * 2 - 1;
			osc.connect(g); g.connect(pan); pan.connect(dest);
			osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.7);
		}, 2000 + Math.random() * 3000);

		this.state.set("spaceship", {
			stop: () => { nodes.forEach(n => { try { n.stop(); } catch {} }); },
			cleanup: () => {
				clearInterval(beepInterval);
				try { lfo.stop(); } catch {}
				try { lfo2.stop(); } catch {}
			},
			setVolume: (v) => {
				for (let i = 0; i < gains.length; i++) {
					gains[i].gain.setTargetAtTime(v * baseGains[i], ctx.currentTime, 0.05);
				}
			},
		});
	}

	// ── Desert ─────────────────────────────────────────────
	private startDesert(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 6, "brown");
		const src = ctx.createBufferSource();
		src.buffer = noise; src.loop = true;
		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass"; lp.frequency.value = 200;
		const hp = ctx.createBiquadFilter();
		hp.type = "highpass"; hp.frequency.value = 60;
		const gain = ctx.createGain();
		gain.gain.value = 0.12;
		const reverb = createReverb(ctx, 4, 0.6);
		src.connect(hp); hp.connect(lp); lp.connect(gain);
		gain.connect(reverb.input); reverb.output.connect(dest);
		const lfo = createLFO(ctx, 0.02, 100, lp.frequency);
		const lfo2 = createLFO(ctx, 0.01, 0.05, gain.gain);
		src.start();
		this.state.set("desert", {
			stop: () => {
				try { src.stop(); } catch {}
				try { lfo.stop(); } catch {}
				try { lfo2.stop(); } catch {}
			},
			cleanup: () => {},
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.12, ctx.currentTime, 0.05); },
		});
	}

	// ── Rain on Roof ───────────────────────────────────────
	private startRainOnRoof(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 6, "pink");
		const src = ctx.createBufferSource();
		src.buffer = noise; src.loop = true;
		const hp = ctx.createBiquadFilter();
		hp.type = "highpass"; hp.frequency.value = 200;
		const bp = ctx.createBiquadFilter();
		bp.type = "bandpass"; bp.frequency.value = 600; bp.Q.value = 1.5;
		const gain = ctx.createGain();
		gain.gain.value = 0.18;
		const reverb = createReverb(ctx, 0.8, 0.2);
		src.connect(hp); hp.connect(bp); bp.connect(gain);
		gain.connect(reverb.input); reverb.output.connect(dest);
		const lfo = createLFO(ctx, 0.2, 200, bp.frequency);

		const thudInterval = setInterval(() => {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			osc.type = "sine";
			osc.frequency.value = 80 + Math.random() * 120;
			g.gain.setValueAtTime(0, ctx.currentTime);
			g.gain.linearRampToValueAtTime(0.04 + Math.random() * 0.04, ctx.currentTime + 0.005);
			g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.04 + Math.random() * 0.06);
			const pan = createStereoPanner(ctx);
			pan.pan.value = Math.random() * 2 - 1;
			osc.connect(g); g.connect(pan); pan.connect(dest);
			osc.start(ctx.currentTime); osc.stop(ctx.currentTime + 0.1);
		}, 80 + Math.random() * 120);

		src.start();
		this.state.set("rainOnRoof", {
			stop: () => { try { src.stop(); } catch {} },
			cleanup: () => {
				clearInterval(thudInterval);
				try { lfo.stop(); } catch {}
			},
			setVolume: (v) => { gain.gain.setTargetAtTime(v * 0.18, ctx.currentTime, 0.05); },
		});
	}

	stop() {
		for (const s of this.state.values()) {
			s.stop();
			s.cleanup();
		}
		this.state.clear();
		this._activeSound = "none";
		this.stopAmplitudeAnalysis();
	}

	isPlaying(): boolean {
		return this._activeSound !== "none";
	}
}

export const audioManager = new AudioManager();

export function playSessionEndChime() {
	try {
		const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
		const ctx = new Ctor();
		if (ctx.state === "suspended") ctx.resume();
		const now = ctx.currentTime;
		const vol = audioManager.getVolume();

		const notes = [523.25, 659.25, 783.99, 1046.5];
		notes.forEach((freq, i) => {
			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			osc.connect(gain);
			gain.connect(ctx.destination);
			osc.type = "sine";
			osc.frequency.value = freq;
			const t = now + i * 0.12;
			gain.gain.setValueAtTime(0, t);
			gain.gain.linearRampToValueAtTime(0.1 * vol, t + 0.02);
			gain.gain.setValueAtTime(0.1 * vol, t + 0.15);
			gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
			osc.start(t);
			osc.stop(t + 0.5);
		});

		setTimeout(() => {
			try { ctx.close(); } catch {}
		}, 1500);
	} catch {}
}
