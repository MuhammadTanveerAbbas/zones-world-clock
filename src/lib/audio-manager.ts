import { RECORDED_SOUNDS, isRecordedSound } from "./recorded-sounds";

export type AmbientSound =
	| "none"
	| "rain"
	| "forest"
	| "cafe"
	| "ocean"
	| "wind"
	| "whiteNoise"
	| "thunder"
	| "night"
	| "fire"
	| "stream"
	| "fan"
	| "birds"
	| "waterfall"
	| "bowl"
	| "blizzard"
	| "train"
	| "spaceship"
	| "desert"
	| "rainOnRoof"
	| "signatureRain"
	| "signatureDrone";

type SoundState = {
	stop: () => void;
	setVolume: (v: number) => void;
	cleanup: () => void;
};

function createLFO(
	ctx: AudioContext,
	rate: number,
	amount: number,
	target: AudioParam,
): OscillatorNode {
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

function createReverb(
	ctx: AudioContext,
	decay = 1.5,
	wet = 0.3,
): { input: GainNode; output: GainNode } {
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

function createNoiseBuffer(
	ctx: AudioContext,
	duration: number,
	type: "white" | "pink" | "brown" = "white",
): AudioBuffer {
	const len = ctx.sampleRate * duration;
	const buffer = ctx.createBuffer(2, len, ctx.sampleRate);
	const ch0 = buffer.getChannelData(0);
	const ch1 = buffer.getChannelData(1);
	let b0 = 0;
	let b1 = 0;
	let b2 = 0;
	let b3 = 0;
	let b4 = 0;
	let b5 = 0;
	let b6 = 0;

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
	private _masterVolume = 0.5;
	private _activeSound: AmbientSound = "none";
	private analyser: AnalyserNode | null = null;
	private animationId: number | null = null;
	private _amplitude = 0;

	private compressor: DynamicsCompressorNode | null = null;

	private getContext(): AudioContext {
		if (!this.ctx) {
			const Ctor =
				window.AudioContext ||
				(window as unknown as { webkitAudioContext: typeof AudioContext })
					.webkitAudioContext;
			this.ctx = new Ctor();
			this.compressor = this.ctx.createDynamicsCompressor();
			this.compressor.threshold.value = -24;
			this.compressor.knee.value = 18;
			this.compressor.ratio.value = 3;
			this.compressor.attack.value = 0.003;
			this.compressor.release.value = 0.15;
			this.masterGain = this.ctx.createGain();
			this.masterGain.gain.value = this._masterVolume;
			this.masterGain.connect(this.compressor);
			this.compressor.connect(this.ctx.destination);
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

	playClick() {
		try {
			const ctx = this.getContext();
			const vol = this._masterVolume;
			const now = ctx.currentTime;
			const dest = this.masterGain;
			if (!dest) return;

			const osc = ctx.createOscillator();
			const gain = ctx.createGain();
			const filter = ctx.createBiquadFilter();
			filter.type = "lowpass";
			filter.frequency.value = 2800;

			osc.type = "triangle";
			osc.frequency.setValueAtTime(880, now);
			osc.frequency.exponentialRampToValueAtTime(660, now + 0.025);

			gain.gain.setValueAtTime(0.0001, now);
			gain.gain.linearRampToValueAtTime(0.06 * vol, now + 0.004);
			gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.045);

			osc.connect(filter);
			filter.connect(gain);
			gain.connect(dest);
			osc.start(now);
			osc.stop(now + 0.05);
		} catch {}
	}

	playChime() {
		try {
			const ctx = this.getContext();
			const dest = this.masterGain;
			if (!dest) return;
			playChimeOnContext(ctx, this._masterVolume, dest);
		} catch {}
	}

	setVolume(vol: number) {
		this._masterVolume = Math.max(0, Math.min(1, vol));
		if (this.masterGain && this.ctx) {
			this.masterGain.gain.setTargetAtTime(
				this._masterVolume,
				this.ctx.currentTime,
				0.05,
			);
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
		const master = this.masterGain;
		if (!master) return;

		if (isRecordedSound(sound)) {
			this.playRecorded(sound, ctx, master);
			this.startAmplitudeAnalysis();
			return;
		}

		switch (sound) {
			case "rain":
				this.startRain(ctx, master);
				break;
			case "wind":
				this.startWind(ctx, master);
				break;
			case "ocean":
				this.startOcean(ctx, master);
				break;
			case "forest":
				this.startForest(ctx, master);
				break;
			case "cafe":
				this.startCafe(ctx, master);
				break;
			case "whiteNoise":
				this.startWhiteNoise(ctx, master);
				break;
			case "thunder":
				this.startThunder(ctx, master);
				break;
			case "night":
				this.startNight(ctx, master);
				break;
			case "fire":
				this.startFire(ctx, master);
				break;
			case "stream":
				this.startStream(ctx, master);
				break;
			case "fan":
				this.startFan(ctx, master);
				break;
			case "birds":
				this.startBirds(ctx, master);
				break;
			case "waterfall":
				this.startWaterfall(ctx, master);
				break;
			case "bowl":
				this.startBowl(ctx, master);
				break;
			case "blizzard":
				this.startBlizzard(ctx, master);
				break;
			case "train":
				this.startTrain(ctx, master);
				break;
			case "spaceship":
				this.startSpaceship(ctx, master);
				break;
			case "desert":
				this.startDesert(ctx, master);
				break;
			case "rainOnRoof":
				this.startRainOnRoof(ctx, master);
				break;
		}
		this.startAmplitudeAnalysis();
	}

	private playRecorded(
		sound: "signatureRain" | "signatureDrone",
		ctx: AudioContext,
		master: GainNode,
	) {
		const meta = RECORDED_SOUNDS[sound];
		const gain = ctx.createGain();
		gain.gain.value = this._masterVolume * 0.5;
		gain.connect(master);

		const audio = new Audio(meta.file);
		audio.loop = true;
		audio.crossOrigin = "anonymous";

		const source = ctx.createMediaElementSource(audio);
		source.connect(gain);

		audio.play().catch(() => {});

		this.state.set(sound, {
			stop: () => {
				audio.pause();
				audio.currentTime = 0;
				try {
					source.disconnect();
				} catch {}
			},
			cleanup: () => {
				audio.src = "";
			},
			setVolume: (v) => {
				gain.gain.setTargetAtTime(v * 0.5, ctx.currentTime, 0.05);
			},
		});
	}

	private registerVolume(
		base: number,
		gain: GainNode,
		extras: GainNode[] = [],
	) {
		this.setVolume(this._masterVolume);
		return (v: number) => {
			gain.gain.setTargetAtTime(v * base, this.ctx?.currentTime || 0, 0.05);
			for (const e of extras) {
				e.gain.setTargetAtTime(
					(v * e.gain.value) / Math.max(0.01, this._masterVolume || 1),
					this.ctx?.currentTime || 0,
					0.05,
				);
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
		// Layer 1: Dense base rain (pink noise, filtered)
		const noise1 = createNoiseBuffer(ctx, 8, "pink");
		const src1 = ctx.createBufferSource();
		src1.buffer = noise1;
		src1.loop = true;

		const hp1 = ctx.createBiquadFilter();
		hp1.type = "highpass";
		hp1.frequency.value = 500;

		const lp1 = ctx.createBiquadFilter();
		lp1.type = "lowpass";
		lp1.frequency.value = 4000;

		const gain1 = ctx.createGain();
		gain1.gain.value = 0.18;

		src1.connect(hp1);
		hp1.connect(lp1);
		lp1.connect(gain1);

		// Layer 2: Mid-range rain texture (brown noise, narrower band)
		const noise2 = createNoiseBuffer(ctx, 8, "brown");
		const src2 = ctx.createBufferSource();
		src2.buffer = noise2;
		src2.loop = true;

		const bp2 = ctx.createBiquadFilter();
		bp2.type = "bandpass";
		bp2.frequency.value = 1800;
		bp2.Q.value = 0.6;

		const gain2 = ctx.createGain();
		gain2.gain.value = 0.12;

		src2.connect(bp2);
		bp2.connect(gain2);

		// Layer 3: Low rumble (distant rain)
		const noise3 = createNoiseBuffer(ctx, 8, "brown");
		const src3 = ctx.createBufferSource();
		src3.buffer = noise3;
		src3.loop = true;

		const lp3 = ctx.createBiquadFilter();
		lp3.type = "lowpass";
		lp3.frequency.value = 200;

		const gain3 = ctx.createGain();
		gain3.gain.value = 0.06;

		src3.connect(lp3);
		lp3.connect(gain3);

		// Merge layers into reverb
		const reverb = createReverb(ctx, 1.0, 0.3);
		const mixGain = ctx.createGain();
		mixGain.gain.value = 1;

		gain1.connect(reverb.input);
		gain2.connect(reverb.input);
		gain3.connect(reverb.input);
		reverb.output.connect(mixGain);
		mixGain.connect(dest);

		// Also send a dry signal for clarity
		gain1.connect(dest);
		gain2.connect(dest);

		// LFOs for natural variation
		const lfo1 = createLFO(ctx, 0.25, 400, hp1.frequency);
		const lfo2 = createLFO(ctx, 0.15, 300, bp2.frequency);
		const lfo3 = createLFO(ctx, 0.08, 0.04, gain1.gain);

		// Realistic drip layer: multiple independent drip sources with varied timing
		const drips: { stop: () => void }[] = [];
		const createDrip = () => {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			const dripFilter = ctx.createBiquadFilter();
			dripFilter.type = "bandpass";
			dripFilter.frequency.value = 700 + Math.random() * 900;
			dripFilter.Q.value = 6 + Math.random() * 6;

			osc.type = "triangle";
			osc.frequency.value = 600 + Math.random() * 1000;

			const now = ctx.currentTime;
			g.gain.setValueAtTime(0, now);
			g.gain.linearRampToValueAtTime(
				0.012 + Math.random() * 0.018,
				now + 0.006,
			);
			g.gain.exponentialRampToValueAtTime(
				0.001,
				now + 0.08 + Math.random() * 0.14,
			);

			const panner = createStereoPanner(ctx);
			panner.pan.value = Math.random() * 2 - 1;

			osc.connect(dripFilter);
			dripFilter.connect(g);
			g.connect(panner);
			panner.connect(dest);

			osc.start(now);
			osc.stop(now + 0.25);
		};

		// Multiple drip intervals at different rates for density
		const dripInterval1 = setInterval(
			() => {
				createDrip();
				if (Math.random() > 0.4) createDrip();
			},
			150 + Math.random() * 200,
		);
		const dripInterval2 = setInterval(
			() => {
				createDrip();
			},
			300 + Math.random() * 400,
		);

		src1.start();
		src2.start();
		src3.start();

		this.state.set("rain", {
			stop: () => {
				try {
					src1.stop();
				} catch {}
				try {
					src2.stop();
				} catch {}
				try {
					src3.stop();
				} catch {}
				try {
					lfo1.stop();
				} catch {}
				try {
					lfo2.stop();
				} catch {}
				try {
					lfo3.stop();
				} catch {}
			},
			cleanup: () => {
				clearInterval(dripInterval1);
				clearInterval(dripInterval2);
			},
			setVolume: (v) => {
				gain1.gain.setTargetAtTime(v * 0.18, ctx.currentTime, 0.05);
				gain2.gain.setTargetAtTime(v * 0.12, ctx.currentTime, 0.05);
				gain3.gain.setTargetAtTime(v * 0.06, ctx.currentTime, 0.05);
			},
		});
	}

	// ── Wind ──────────────────────────────────────────────
	private startWind(ctx: AudioContext, dest: AudioNode) {
		// Layer 1: Deep wind body
		const noise1 = createNoiseBuffer(ctx, 8, "brown");
		const src1 = ctx.createBufferSource();
		src1.buffer = noise1;
		src1.loop = true;

		const lp1 = ctx.createBiquadFilter();
		lp1.type = "lowpass";
		lp1.frequency.value = 400;

		const hp1 = ctx.createBiquadFilter();
		hp1.type = "highpass";
		hp1.frequency.value = 60;

		const gain1 = ctx.createGain();
		gain1.gain.value = 0.16;

		src1.connect(lp1);
		lp1.connect(hp1);
		hp1.connect(gain1);

		// Layer 2: Mid howl (narrower band)
		const noise2 = createNoiseBuffer(ctx, 8, "pink");
		const src2 = ctx.createBufferSource();
		src2.buffer = noise2;
		src2.loop = true;

		const bp2 = ctx.createBiquadFilter();
		bp2.type = "bandpass";
		bp2.frequency.value = 300;
		bp2.Q.value = 2;

		const gain2 = ctx.createGain();
		gain2.gain.value = 0.06;

		src2.connect(bp2);
		bp2.connect(gain2);

		// Layer 3: High whistle
		const noise3 = createNoiseBuffer(ctx, 8, "white");
		const src3 = ctx.createBufferSource();
		src3.buffer = noise3;
		src3.loop = true;

		const bp3 = ctx.createBiquadFilter();
		bp3.type = "bandpass";
		bp3.frequency.value = 800;
		bp3.Q.value = 4;

		const gain3 = ctx.createGain();
		gain3.gain.value = 0.02;

		src3.connect(bp3);
		bp3.connect(gain3);

		const reverb = createReverb(ctx, 2.5, 0.45);
		const mixGain = ctx.createGain();
		mixGain.gain.value = 1;

		gain1.connect(reverb.input);
		gain2.connect(reverb.input);
		gain3.connect(reverb.input);
		reverb.output.connect(mixGain);
		mixGain.connect(dest);

		// Also direct for clarity
		gain1.connect(dest);

		const lfoFreq = createLFO(ctx, 0.06, 300, lp1.frequency);
		const lfoHowl = createLFO(ctx, 0.04, 200, bp2.frequency);
		const lfoWhistle = createLFO(ctx, 0.08, 150, bp3.frequency);
		const lfoVol = createLFO(ctx, 0.05, 0.05, gain1.gain);

		src1.start();
		src2.start();
		src3.start();

		this.state.set("wind", {
			stop: () => {
				try {
					src1.stop();
				} catch {}
				try {
					src2.stop();
				} catch {}
				try {
					src3.stop();
				} catch {}
				try {
					lfoFreq.stop();
				} catch {}
				try {
					lfoHowl.stop();
				} catch {}
				try {
					lfoWhistle.stop();
				} catch {}
				try {
					lfoVol.stop();
				} catch {}
			},
			cleanup: () => {},
			setVolume: (v) => {
				gain1.gain.setTargetAtTime(v * 0.16, ctx.currentTime, 0.05);
				gain2.gain.setTargetAtTime(v * 0.06, ctx.currentTime, 0.05);
				gain3.gain.setTargetAtTime(v * 0.02, ctx.currentTime, 0.05);
			},
		});
	}

	// ── Ocean ──────────────────────────────────────────────
	private startOcean(ctx: AudioContext, dest: AudioNode) {
		// Layer 1: Wave body (slow modulation of brown noise)
		const len = ctx.sampleRate * 14;
		const buffer = ctx.createBuffer(2, len, ctx.sampleRate);
		const ch0 = buffer.getChannelData(0);
		const ch1 = buffer.getChannelData(1);

		for (let i = 0; i < len; i++) {
			const t = i / ctx.sampleRate;
			// Multiple wave cycles at different periods
			const wave1 = Math.sin(t * 0.07);
			const wave2 = Math.sin(t * 0.11 + 1.3);
			const wave3 = Math.sin(t * 0.19 + 2.7);
			const wave4 = Math.sin(t * 0.03 + 0.5); // Very slow swell
			const envelope =
				0.35 +
				0.65 *
					((wave1 * 0.35 + wave2 * 0.25 + wave3 * 0.15 + wave4 * 0.25 + 1) / 2);
			const noise = Math.random() * 2 - 1;
			ch0[i] = noise * envelope * 0.65;
			// Slight stereo offset for width
			ch1[i] =
				noise * (envelope * 0.65 * (0.88 + 0.24 * Math.sin(t * 0.13 + 0.8)));
		}

		const src = ctx.createBufferSource();
		src.buffer = buffer;
		src.loop = true;

		// Low body
		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 500;

		// High hiss for foam/spray
		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 100;

		const hp2 = ctx.createBiquadFilter();
		hp2.type = "highpass";
		hp2.frequency.value = 2000;

		const gainHiss = ctx.createGain();
		gainHiss.gain.value = 0.06;

		const band = ctx.createBiquadFilter();
		band.type = "bandpass";
		band.frequency.value = 350;
		band.Q.value = 0.4;

		const gain = ctx.createGain();
		gain.gain.value = 0.28;

		const reverb = createReverb(ctx, 1.8, 0.35);

		src.connect(lp);
		lp.connect(band);
		band.connect(hp);
		hp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);

		// Foam layer
		src.connect(hp2);
		hp2.connect(gainHiss);
		gainHiss.connect(dest);

		const lfo = createLFO(ctx, 0.04, 200, lp.frequency);
		const lfo2 = createLFO(ctx, 0.07, 100, band.frequency);
		const lfo3 = createLFO(ctx, 0.03, 0.05, gain.gain);

		src.start();

		this.state.set("ocean", {
			stop: () => {
				try {
					src.stop();
				} catch {}
				try {
					lfo.stop();
				} catch {}
				try {
					lfo2.stop();
				} catch {}
				try {
					lfo3.stop();
				} catch {}
			},
			cleanup: () => {},
			setVolume: (v) => {
				gain.gain.setTargetAtTime(v * 0.28, ctx.currentTime, 0.05);
				gainHiss.gain.setTargetAtTime(v * 0.06, ctx.currentTime, 0.05);
			},
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

		const chirpInterval = setInterval(
			() => {
				const osc = ctx.createOscillator();
				const g = ctx.createGain();
				const freq = 1800 + Math.random() * 2500;
				osc.type = Math.random() > 0.5 ? "sine" : "triangle";
				osc.frequency.setValueAtTime(freq, ctx.currentTime);
				osc.frequency.exponentialRampToValueAtTime(
					freq + 400 + Math.random() * 800,
					ctx.currentTime + 0.06,
				);
				osc.frequency.exponentialRampToValueAtTime(
					freq - 200,
					ctx.currentTime + 0.12,
				);
				g.gain.setValueAtTime(0, ctx.currentTime);
				g.gain.linearRampToValueAtTime(
					0.02 + Math.random() * 0.02,
					ctx.currentTime + 0.02,
				);
				g.gain.exponentialRampToValueAtTime(
					0.001,
					ctx.currentTime + 0.15 + Math.random() * 0.2,
				);
				const panner = createStereoPanner(ctx);
				panner.pan.value = Math.random() * 2 - 1;
				osc.connect(g);
				g.connect(panner);
				panner.connect(dest);
				osc.start(ctx.currentTime);
				osc.stop(ctx.currentTime + 0.4);
			},
			3000 + Math.random() * 5000,
		);

		src.start();

		this.state.set("forest", {
			stop: () => {
				try {
					src.stop();
				} catch {}
				try {
					lfoRustle.stop();
				} catch {}
				try {
					lfoVol.stop();
				} catch {}
			},
			cleanup: () => {
				clearInterval(chirpInterval);
			},
			setVolume: (v) => {
				gain.gain.setTargetAtTime(v * 0.15, ctx.currentTime, 0.05);
			},
		});
	}

	// ── Cafe ──────────────────────────────────────────────
	private startCafe(ctx: AudioContext, dest: AudioNode) {
		// Base ambient murmur (filtered pink noise simulating crowd)
		const noise = createNoiseBuffer(ctx, 8, "pink");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 2000;

		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 150;

		// Formant-like filtering to simulate vocal murmur
		const formant1 = ctx.createBiquadFilter();
		formant1.type = "bandpass";
		formant1.frequency.value = 400;
		formant1.Q.value = 2;

		const formant2 = ctx.createBiquadFilter();
		formant2.type = "bandpass";
		formant2.frequency.value = 1200;
		formant2.Q.value = 1.5;

		const formant3 = ctx.createBiquadFilter();
		formant3.type = "bandpass";
		formant3.frequency.value = 2500;
		formant3.Q.value = 1;

		const gainMurmur = ctx.createGain();
		gainMurmur.gain.value = 0.08;

		const gainF1 = ctx.createGain();
		gainF1.gain.value = 0.04;
		const gainF2 = ctx.createGain();
		gainF2.gain.value = 0.03;
		const gainF3 = ctx.createGain();
		gainF3.gain.value = 0.02;

		const reverb = createReverb(ctx, 0.6, 0.2);

		src.connect(hp);
		hp.connect(lp);
		lp.connect(gainMurmur);
		gainMurmur.connect(reverb.input);

		src.connect(formant1);
		formant1.connect(gainF1);
		gainF1.connect(reverb.input);

		src.connect(formant2);
		formant2.connect(gainF2);
		gainF2.connect(reverb.input);

		src.connect(formant3);
		formant3.connect(gainF3);
		gainF3.connect(reverb.input);

		reverb.output.connect(dest);

		// Clutter: cups, plates, chairs
		const clutterInterval = setInterval(
			() => {
				const type = Math.random();
				if (type < 0.3) {
					// Cup clink (bright, short)
					const osc = ctx.createOscillator();
					const g = ctx.createGain();
					osc.type = "sine";
					osc.frequency.value = 2000 + Math.random() * 2000;
					g.gain.setValueAtTime(0, ctx.currentTime);
					g.gain.linearRampToValueAtTime(0.02, ctx.currentTime + 0.003);
					g.gain.exponentialRampToValueAtTime(
						0.001,
						ctx.currentTime + 0.04 + Math.random() * 0.04,
					);
					const panner = createStereoPanner(ctx);
					panner.pan.value = Math.random() * 2 - 1;
					osc.connect(g);
					g.connect(panner);
					panner.connect(dest);
					osc.start(ctx.currentTime);
					osc.stop(ctx.currentTime + 0.08);
				} else if (type < 0.5) {
					// Saucer/plate scrape
					const noise2 = createNoiseBuffer(ctx, 0.06, "pink");
					const s = ctx.createBufferSource();
					s.buffer = noise2;
					const g = ctx.createGain();
					g.gain.value = 0.015;
					const bp = ctx.createBiquadFilter();
					bp.type = "bandpass";
					bp.frequency.value = 1500 + Math.random() * 1500;
					bp.Q.value = 2;
					const pan = createStereoPanner(ctx);
					pan.pan.value = Math.random() * 2 - 1;
					s.connect(bp);
					bp.connect(g);
					g.connect(pan);
					pan.connect(dest);
					s.start(ctx.currentTime);
					s.stop(ctx.currentTime + 0.06);
				} else if (type < 0.7) {
					// Chair scrape
					const noise3 = createNoiseBuffer(ctx, 0.12, "brown");
					const s = ctx.createBufferSource();
					s.buffer = noise3;
					const g = ctx.createGain();
					g.gain.setValueAtTime(0, ctx.currentTime);
					g.gain.linearRampToValueAtTime(0.012, ctx.currentTime + 0.02);
					g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
					const bp = ctx.createBiquadFilter();
					bp.type = "bandpass";
					bp.frequency.value = 300 + Math.random() * 200;
					bp.Q.value = 1;
					const pan = createStereoPanner(ctx);
					pan.pan.value = Math.random() * 2 - 1;
					s.connect(bp);
					bp.connect(g);
					g.connect(pan);
					pan.connect(dest);
					s.start(ctx.currentTime);
					s.stop(ctx.currentTime + 0.12);
				} else {
					// Distant door or footstep
					const osc = ctx.createOscillator();
					const g = ctx.createGain();
					osc.type = "sine";
					osc.frequency.value = 80 + Math.random() * 60;
					g.gain.setValueAtTime(0, ctx.currentTime);
					g.gain.linearRampToValueAtTime(0.008, ctx.currentTime + 0.01);
					g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
					const pan = createStereoPanner(ctx);
					pan.pan.value = Math.random() * 2 - 1;
					osc.connect(g);
					g.connect(pan);
					pan.connect(dest);
					osc.start(ctx.currentTime);
					osc.stop(ctx.currentTime + 0.1);
				}
			},
			400 + Math.random() * 1200,
		);

		// LFOs for natural murmur variation
		const lfo1 = createLFO(ctx, 0.08, 200, formant1.frequency);
		const lfo2 = createLFO(ctx, 0.06, 150, formant2.frequency);

		src.start();

		this.state.set("cafe", {
			stop: () => {
				try {
					src.stop();
				} catch {}
				try {
					lfo1.stop();
				} catch {}
				try {
					lfo2.stop();
				} catch {}
			},
			cleanup: () => {
				clearInterval(clutterInterval);
			},
			setVolume: (v) => {
				gainMurmur.gain.setTargetAtTime(v * 0.08, ctx.currentTime, 0.05);
				gainF1.gain.setTargetAtTime(v * 0.04, ctx.currentTime, 0.05);
				gainF2.gain.setTargetAtTime(v * 0.03, ctx.currentTime, 0.05);
				gainF3.gain.setTargetAtTime(v * 0.02, ctx.currentTime, 0.05);
			},
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
			stop: () => {
				try {
					src.stop();
				} catch {}
			},
			cleanup: () => {},
			setVolume: (v) => {
				gain.gain.setTargetAtTime(v * 0.06, ctx.currentTime, 0.05);
			},
		});
	}

	// ── Thunder ────────────────────────────────────────────
	private startThunder(ctx: AudioContext, dest: AudioNode) {
		// Base rain/ambient layer
		const noise = createNoiseBuffer(ctx, 8, "brown");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 180;

		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 30;

		const gain = ctx.createGain();
		gain.gain.value = 0.15;

		const reverb = createReverb(ctx, 3.5, 0.55);

		src.connect(lp);
		lp.connect(hp);
		hp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);

		// Rain layer mixed in
		const rainNoise = createNoiseBuffer(ctx, 6, "pink");
		const rainSrc = ctx.createBufferSource();
		rainSrc.buffer = rainNoise;
		rainSrc.loop = true;
		const rainHp = ctx.createBiquadFilter();
		rainHp.type = "highpass";
		rainHp.frequency.value = 600;
		const rainLp = ctx.createBiquadFilter();
		rainLp.type = "lowpass";
		rainLp.frequency.value = 3500;
		const rainGain = ctx.createGain();
		rainGain.gain.value = 0.08;
		rainSrc.connect(rainHp);
		rainHp.connect(rainLp);
		rainLp.connect(rainGain);
		rainGain.connect(dest);
		rainSrc.start();

		const rumbleInterval = setInterval(
			() => {
				const duration = 0.8 + Math.random() * 2;
				const start = ctx.currentTime + Math.random() * 3;
				const vol = gain.gain.value;

				// Initial crack (sharp transient)
				const crackOsc = ctx.createOscillator();
				const crackGain = ctx.createGain();
				const crackFilter = ctx.createBiquadFilter();
				crackFilter.type = "lowpass";
				crackFilter.frequency.value = 300;
				crackOsc.type = "sawtooth";
				crackOsc.frequency.value = 40 + Math.random() * 60;
				crackGain.gain.setValueAtTime(0, start);
				crackGain.gain.linearRampToValueAtTime(vol * 2.5, start + 0.01);
				crackGain.gain.exponentialRampToValueAtTime(vol * 0.3, start + 0.15);
				crackOsc.connect(crackFilter);
				crackFilter.connect(crackGain);
				crackGain.connect(dest);
				crackOsc.start(start);
				crackOsc.stop(start + 0.2);

				// Rolling rumble body
				gain.gain.setValueAtTime(vol * 0.4, start);
				gain.gain.linearRampToValueAtTime(vol * 2.2, start + 0.08);
				gain.gain.exponentialRampToValueAtTime(vol * 0.6, start + 0.5);
				gain.gain.exponentialRampToValueAtTime(vol * 0.15, start + duration);

				// Low filter sweep for rumble
				lp.frequency.setValueAtTime(200, start);
				lp.frequency.exponentialRampToValueAtTime(60, start + 0.5);
				lp.frequency.exponentialRampToValueAtTime(120, start + duration);

				// Secondary echo rumble (distant)
				if (Math.random() > 0.5) {
					const echoStart = start + 0.4 + Math.random() * 0.5;
					gain.gain.setValueAtTime(vol * 0.3, echoStart);
					gain.gain.exponentialRampToValueAtTime(vol * 0.05, echoStart + 1.5);
				}
			},
			5000 + Math.random() * 10000,
		);

		src.start();

		this.state.set("thunder", {
			stop: () => {
				try {
					src.stop();
				} catch {}
				try {
					rainSrc.stop();
				} catch {}
			},
			cleanup: () => {
				clearInterval(rumbleInterval);
			},
			setVolume: (v) => {
				gain.gain.setTargetAtTime(v * 0.15, ctx.currentTime, 0.05);
				rainGain.gain.setTargetAtTime(v * 0.08, ctx.currentTime, 0.05);
			},
		});
	}

	// ── Night ──────────────────────────────────────────────
	private startNight(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 8, "brown");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 250;

		const gain = ctx.createGain();
		gain.gain.value = 0.12;

		const reverb = createReverb(ctx, 1.5, 0.3);

		src.connect(lp);
		lp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);

		// Cricket chirper with realistic trill pattern
		const cricket = (baseFreq: number, chirps: number, chirpRate: number) => {
			const now = ctx.currentTime;
			for (let i = 0; i < chirps; i++) {
				const t = now + i / chirpRate;
				const osc = ctx.createOscillator();
				const g = ctx.createGain();
				osc.type = "sine";
				// Rapid frequency modulation within each chirp
				osc.frequency.setValueAtTime(baseFreq, t);
				osc.frequency.setValueAtTime(baseFreq * 1.08, t + 0.008);
				osc.frequency.setValueAtTime(baseFreq, t + 0.016);
				osc.frequency.setValueAtTime(baseFreq * 1.05, t + 0.024);
				g.gain.setValueAtTime(0, t);
				g.gain.linearRampToValueAtTime(0.012, t + 0.003);
				g.gain.setValueAtTime(0.012, t + 0.025);
				g.gain.exponentialRampToValueAtTime(0.001, t + 0.035);
				const pan = createStereoPanner(ctx);
				pan.pan.value = Math.random() * 2 - 1;
				osc.connect(g);
				g.connect(pan);
				pan.connect(dest);
				osc.start(t);
				osc.stop(t + 0.04);
			}
		};

		const cricketInterval = setInterval(
			() => {
				// Multiple cricket voices at different frequencies
				cricket(
					3800 + Math.random() * 800,
					4 + Math.floor(Math.random() * 5),
					25,
				);
				if (Math.random() > 0.5) {
					cricket(
						4200 + Math.random() * 600,
						3 + Math.floor(Math.random() * 3),
						20,
					);
				}
			},
			1500 + Math.random() * 2500,
		);

		// Occasional distant owl
		const owlInterval = setInterval(
			() => {
				const now = ctx.currentTime;
				const base = 380 + Math.random() * 60;
				for (let i = 0; i < 2; i++) {
					const osc = ctx.createOscillator();
					const g = ctx.createGain();
					osc.type = "sine";
					osc.frequency.setValueAtTime(base, now + i * 0.8);
					osc.frequency.linearRampToValueAtTime(
						base * 0.85,
						now + i * 0.8 + 0.3,
					);
					g.gain.setValueAtTime(0, now + i * 0.8);
					g.gain.linearRampToValueAtTime(0.008, now + i * 0.8 + 0.05);
					g.gain.setValueAtTime(0.008, now + i * 0.8 + 0.25);
					g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.8 + 0.5);
					const pan = createStereoPanner(ctx);
					pan.pan.value = (Math.random() - 0.5) * 0.6;
					osc.connect(g);
					g.connect(pan);
					pan.connect(dest);
					osc.start(now + i * 0.8);
					osc.stop(now + i * 0.8 + 0.6);
				}
			},
			12000 + Math.random() * 10000,
		);

		src.start();

		this.state.set("night", {
			stop: () => {
				try {
					src.stop();
				} catch {}
			},
			cleanup: () => {
				clearInterval(cricketInterval);
				clearInterval(owlInterval);
			},
			setVolume: (v) => {
				gain.gain.setTargetAtTime(v * 0.12, ctx.currentTime, 0.05);
			},
		});
	}

	// ── Fire ──────────────────────────────────────────────
	private startFire(ctx: AudioContext, dest: AudioNode) {
		// Fire body: warm brown noise with modulation
		const noise = createNoiseBuffer(ctx, 8, "brown");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 500;

		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 80;

		const band = ctx.createBiquadFilter();
		band.type = "bandpass";
		band.frequency.value = 300;
		band.Q.value = 0.5;

		const gain = ctx.createGain();
		gain.gain.value = 0.2;

		const reverb = createReverb(ctx, 0.6, 0.12);

		src.connect(hp);
		hp.connect(band);
		band.connect(lp);
		lp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);

		const lfo = createLFO(
			ctx,
			0.12 + Math.random() * 0.08,
			200,
			band.frequency,
		);
		const lfo2 = createLFO(ctx, 0.07, 0.06, gain.gain);

		// Crackle layer: varied pops, snaps, and hisses
		const crackleInterval = setInterval(
			() => {
				const type = Math.random();
				if (type < 0.35) {
					// Sharp crackle snap
					const osc = ctx.createOscillator();
					const g = ctx.createGain();
					osc.type = "sawtooth";
					osc.frequency.value = 500 + Math.random() * 3500;
					g.gain.setValueAtTime(0, ctx.currentTime);
					g.gain.linearRampToValueAtTime(
						0.015 + Math.random() * 0.025,
						ctx.currentTime + 0.003,
					);
					g.gain.exponentialRampToValueAtTime(
						0.001,
						ctx.currentTime + 0.015 + Math.random() * 0.03,
					);
					const panner = createStereoPanner(ctx);
					panner.pan.value = Math.random() * 2 - 1;
					osc.connect(g);
					g.connect(panner);
					panner.connect(dest);
					osc.start(ctx.currentTime);
					osc.stop(ctx.currentTime + 0.05);
				} else if (type < 0.55) {
					// Low ember pop
					const osc = ctx.createOscillator();
					const g = ctx.createGain();
					osc.type = "sine";
					osc.frequency.value = 150 + Math.random() * 300;
					g.gain.setValueAtTime(0, ctx.currentTime);
					g.gain.linearRampToValueAtTime(
						0.02 + Math.random() * 0.015,
						ctx.currentTime + 0.005,
					);
					g.gain.exponentialRampToValueAtTime(
						0.001,
						ctx.currentTime + 0.04 + Math.random() * 0.06,
					);
					const panner = createStereoPanner(ctx);
					panner.pan.value = Math.random() * 2 - 1;
					osc.connect(g);
					g.connect(panner);
					panner.connect(dest);
					osc.start(ctx.currentTime);
					osc.stop(ctx.currentTime + 0.1);
				} else if (type < 0.75) {
					// Hiss (hot air escaping)
					const noise2 = createNoiseBuffer(ctx, 0.08, "white");
					const s = ctx.createBufferSource();
					s.buffer = noise2;
					const g = ctx.createGain();
					g.gain.value = 0.008 + Math.random() * 0.008;
					const bp = ctx.createBiquadFilter();
					bp.type = "bandpass";
					bp.frequency.value = 3000 + Math.random() * 2000;
					bp.Q.value = 3;
					const pan = createStereoPanner(ctx);
					pan.pan.value = Math.random() * 2 - 1;
					s.connect(bp);
					bp.connect(g);
					g.connect(pan);
					pan.connect(dest);
					s.start(ctx.currentTime);
					s.stop(ctx.currentTime + 0.08);
				} else {
					// Bright pop
					const osc = ctx.createOscillator();
					const g = ctx.createGain();
					osc.type = "triangle";
					osc.frequency.value = 2000 + Math.random() * 2000;
					g.gain.setValueAtTime(0, ctx.currentTime);
					g.gain.linearRampToValueAtTime(
						0.01 + Math.random() * 0.015,
						ctx.currentTime + 0.002,
					);
					g.gain.exponentialRampToValueAtTime(
						0.001,
						ctx.currentTime + 0.01 + Math.random() * 0.02,
					);
					const pan = createStereoPanner(ctx);
					pan.pan.value = Math.random() * 2 - 1;
					osc.connect(g);
					g.connect(pan);
					pan.connect(dest);
					osc.start(ctx.currentTime);
					osc.stop(ctx.currentTime + 0.03);
				}
			},
			60 + Math.random() * 180,
		);

		src.start();

		this.state.set("fire", {
			stop: () => {
				try {
					src.stop();
				} catch {}
				try {
					lfo.stop();
				} catch {}
				try {
					lfo2.stop();
				} catch {}
			},
			cleanup: () => {
				clearInterval(crackleInterval);
			},
			setVolume: (v) => {
				gain.gain.setTargetAtTime(v * 0.2, ctx.currentTime, 0.05);
			},
		});
	}

	// ── Stream ─────────────────────────────────────────────
	private startStream(ctx: AudioContext, dest: AudioNode) {
		// Base flow
		const noise = createNoiseBuffer(ctx, 8, "pink");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;

		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 500;

		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 3500;

		const band = ctx.createBiquadFilter();
		band.type = "bandpass";
		band.frequency.value = 1200;
		band.Q.value = 1.2;

		const gain = ctx.createGain();
		gain.gain.value = 0.18;

		const reverb = createReverb(ctx, 0.5, 0.18);

		src.connect(hp);
		hp.connect(band);
		band.connect(lp);
		lp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);
		// Dry for clarity
		gain.connect(dest);

		const lfo = createLFO(ctx, 0.18, 400, band.frequency);
		const lfo2 = createLFO(ctx, 0.08, 200, lp.frequency);
		const lfo3 = createLFO(ctx, 0.06, 0.03, gain.gain);

		// Bubble layer
		const bubbleInterval = setInterval(
			() => {
				const osc = ctx.createOscillator();
				const g = ctx.createGain();
				const filter = ctx.createBiquadFilter();
				filter.type = "bandpass";
				filter.frequency.value = 400 + Math.random() * 800;
				filter.Q.value = 5 + Math.random() * 5;
				osc.type = "sine";
				osc.frequency.value = 300 + Math.random() * 500;
				const now = ctx.currentTime;
				g.gain.setValueAtTime(0, now);
				g.gain.linearRampToValueAtTime(
					0.008 + Math.random() * 0.008,
					now + 0.004,
				);
				g.gain.exponentialRampToValueAtTime(
					0.001,
					now + 0.03 + Math.random() * 0.04,
				);
				const pan = createStereoPanner(ctx);
				pan.pan.value = Math.random() * 2 - 1;
				osc.connect(filter);
				filter.connect(g);
				g.connect(pan);
				pan.connect(dest);
				osc.start(now);
				osc.stop(now + 0.06);
			},
			120 + Math.random() * 200,
		);

		src.start();

		this.state.set("stream", {
			stop: () => {
				try {
					src.stop();
				} catch {}
				try {
					lfo.stop();
				} catch {}
				try {
					lfo2.stop();
				} catch {}
				try {
					lfo3.stop();
				} catch {}
			},
			cleanup: () => {
				clearInterval(bubbleInterval);
			},
			setVolume: (v) => {
				gain.gain.setTargetAtTime(v * 0.18, ctx.currentTime, 0.05);
			},
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
				try {
					src.stop();
				} catch {}
				try {
					osc.stop();
				} catch {}
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
		const noise = createNoiseBuffer(ctx, 6, "pink");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;
		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 1800;
		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 200;
		const gain = ctx.createGain();
		gain.gain.value = 0.06;
		const reverb = createReverb(ctx, 1.5, 0.3);
		src.connect(hp);
		hp.connect(lp);
		lp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);

		// Bird call generator with frequency modulation
		const chirp = (
			baseFreq: number,
			duration: number,
			pattern: "up" | "down" | "warble" | "trill",
		) => {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			osc.type = "sine";

			const now = ctx.currentTime;
			if (pattern === "up") {
				osc.frequency.setValueAtTime(baseFreq, now);
				osc.frequency.exponentialRampToValueAtTime(
					baseFreq * 1.4,
					now + duration * 0.3,
				);
				osc.frequency.exponentialRampToValueAtTime(
					baseFreq * 1.1,
					now + duration,
				);
			} else if (pattern === "down") {
				osc.frequency.setValueAtTime(baseFreq * 1.3, now);
				osc.frequency.exponentialRampToValueAtTime(
					baseFreq * 0.8,
					now + duration,
				);
			} else if (pattern === "warble") {
				osc.frequency.setValueAtTime(baseFreq, now);
				for (let t = 0; t < duration; t += 0.04) {
					osc.frequency.setValueAtTime(
						baseFreq * (1 + 0.15 * Math.sin(t * 30)),
						now + t,
					);
				}
			} else {
				// Trill: rapid alternation
				for (let t = 0; t < duration; t += 0.025) {
					osc.frequency.setValueAtTime(
						baseFreq * (1 + 0.2 * ((Math.floor(t / 0.025) % 2) * 2 - 1)),
						now + t,
					);
				}
			}

			g.gain.setValueAtTime(0, now);
			g.gain.linearRampToValueAtTime(0.025, now + 0.008);
			g.gain.setValueAtTime(0.025, now + duration * 0.6);
			g.gain.exponentialRampToValueAtTime(0.001, now + duration);

			const pan = createStereoPanner(ctx);
			pan.pan.value = Math.random() * 2 - 1;
			osc.connect(g);
			g.connect(pan);
			pan.connect(dest);
			osc.start(now);
			osc.stop(now + duration + 0.01);
		};

		// Multiple independent bird "voices"
		const intervals: ReturnType<typeof setInterval>[] = [];

		// Voice 1: Songbird (frequent, varied)
		intervals.push(
			setInterval(
				() => {
					const base = 2200 + Math.random() * 2000;
					const pattern = (["up", "down", "warble", "trill"] as const)[
						Math.floor(Math.random() * 4)
					];
					chirp(base, 0.1 + Math.random() * 0.2, pattern);
					// Sometimes double-chirp
					if (Math.random() > 0.5) {
						setTimeout(
							() =>
								chirp(
									base * (0.9 + Math.random() * 0.2),
									0.08 + Math.random() * 0.12,
									"up",
								),
							150 + Math.random() * 200,
						);
					}
				},
				600 + Math.random() * 1500,
			),
		);

		// Voice 2: Sparrow (short, repetitive peeps)
		intervals.push(
			setInterval(
				() => {
					const base = 3000 + Math.random() * 1500;
					for (let j = 0; j < 2 + Math.floor(Math.random() * 3); j++) {
						setTimeout(
							() => chirp(base, 0.04 + Math.random() * 0.04, "up"),
							j * (80 + Math.random() * 60),
						);
					}
				},
				1500 + Math.random() * 2500,
			),
		);

		// Voice 3: Dove-like (low, slow coo)
		intervals.push(
			setInterval(
				() => {
					const base = 800 + Math.random() * 200;
					const osc = ctx.createOscillator();
					const g = ctx.createGain();
					osc.type = "sine";
					const now = ctx.currentTime;
					osc.frequency.setValueAtTime(base, now);
					osc.frequency.linearRampToValueAtTime(base * 0.9, now + 0.3);
					osc.frequency.linearRampToValueAtTime(base, now + 0.6);
					g.gain.setValueAtTime(0, now);
					g.gain.linearRampToValueAtTime(0.015, now + 0.05);
					g.gain.setValueAtTime(0.015, now + 0.4);
					g.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
					const pan = createStereoPanner(ctx);
					pan.pan.value = Math.random() * 2 - 1;
					osc.connect(g);
					g.connect(pan);
					pan.connect(dest);
					osc.start(now);
					osc.stop(now + 0.8);
				},
				4000 + Math.random() * 4000,
			),
		);

		src.start();
		this.state.set("birds", {
			stop: () => {
				try {
					src.stop();
				} catch {}
			},
			cleanup: () => {
				intervals.forEach(clearInterval);
			},
			setVolume: (v) => {
				gain.gain.setTargetAtTime(v * 0.06, ctx.currentTime, 0.05);
			},
		});
	}

	// ── Waterfall ──────────────────────────────────────────
	private startWaterfall(ctx: AudioContext, dest: AudioNode) {
		// Layer 1: Powerful main rush
		const noise1 = createNoiseBuffer(ctx, 8, "pink");
		const src1 = ctx.createBufferSource();
		src1.buffer = noise1;
		src1.loop = true;
		const bp1 = ctx.createBiquadFilter();
		bp1.type = "bandpass";
		bp1.frequency.value = 1200;
		bp1.Q.value = 0.6;
		const hp1 = ctx.createBiquadFilter();
		hp1.type = "highpass";
		hp1.frequency.value = 300;
		const gain1 = ctx.createGain();
		gain1.gain.value = 0.22;

		// Layer 2: Low rumble of falling water
		const noise2 = createNoiseBuffer(ctx, 8, "brown");
		const src2 = ctx.createBufferSource();
		src2.buffer = noise2;
		src2.loop = true;
		const lp2 = ctx.createBiquadFilter();
		lp2.type = "lowpass";
		lp2.frequency.value = 300;
		const gain2 = ctx.createGain();
		gain2.gain.value = 0.1;

		// Layer 3: High spray/mist
		const noise3 = createNoiseBuffer(ctx, 8, "white");
		const src3 = ctx.createBufferSource();
		src3.buffer = noise3;
		src3.loop = true;
		const hp3 = ctx.createBiquadFilter();
		hp3.type = "highpass";
		hp3.frequency.value = 4000;
		const gain3 = ctx.createGain();
		gain3.gain.value = 0.03;

		const reverb = createReverb(ctx, 1.5, 0.35);
		const mixGain = ctx.createGain();
		mixGain.gain.value = 1;

		src1.connect(hp1);
		hp1.connect(bp1);
		bp1.connect(gain1);
		gain1.connect(reverb.input);

		src2.connect(lp2);
		lp2.connect(gain2);
		gain2.connect(reverb.input);

		src3.connect(hp3);
		hp3.connect(gain3);
		gain3.connect(reverb.input);

		reverb.output.connect(mixGain);
		mixGain.connect(dest);
		// Dry for clarity
		gain1.connect(dest);

		const lfo = createLFO(ctx, 0.12, 350, bp1.frequency);
		const lfo2 = createLFO(ctx, 0.06, 0.05, gain1.gain);
		const lfo3 = createLFO(ctx, 0.03, 0.04, gain2.gain);

		src1.start();
		src2.start();
		src3.start();

		this.state.set("waterfall", {
			stop: () => {
				try {
					src1.stop();
				} catch {}
				try {
					src2.stop();
				} catch {}
				try {
					src3.stop();
				} catch {}
				try {
					lfo.stop();
				} catch {}
				try {
					lfo2.stop();
				} catch {}
				try {
					lfo3.stop();
				} catch {}
			},
			cleanup: () => {},
			setVolume: (v) => {
				gain1.gain.setTargetAtTime(v * 0.22, ctx.currentTime, 0.05);
				gain2.gain.setTargetAtTime(v * 0.1, ctx.currentTime, 0.05);
				gain3.gain.setTargetAtTime(v * 0.03, ctx.currentTime, 0.05);
			},
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
			gain.gain.exponentialRampToValueAtTime(
				0.001,
				ctx.currentTime + 5 + i * 2,
			);
			const reverb = createReverb(ctx, 3, 0.5);
			osc.connect(gain);
			gain.connect(reverb.input);
			reverb.output.connect(dest);
			osc.start();
			nodes.push(osc);
			gains.push(gain);
		});
		const strikeInterval = setInterval(
			() => {
				const osc = ctx.createOscillator();
				const gain = ctx.createGain();
				osc.type = "sine";
				osc.frequency.value = 220 + Math.random() * 440;
				gain.gain.setValueAtTime(0.06, ctx.currentTime);
				gain.gain.exponentialRampToValueAtTime(
					0.001,
					ctx.currentTime + 4 + Math.random() * 2,
				);
				const r = createReverb(ctx, 4, 0.6);
				osc.connect(gain);
				gain.connect(r.input);
				r.output.connect(dest);
				osc.start(ctx.currentTime);
				osc.stop(ctx.currentTime + 6);
				nodes.push(osc);
			},
			12000 + Math.random() * 8000,
		);

		this.state.set("bowl", {
			stop: () => {
				for (const n of nodes) {
					try {
						n.stop();
					} catch {}
				}
			},
			cleanup: () => {
				clearInterval(strikeInterval);
			},
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
		src.buffer = noise;
		src.loop = true;
		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 400;
		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 100;
		const gain = ctx.createGain();
		gain.gain.value = 0.2;
		const reverb = createReverb(ctx, 2.5, 0.5);
		src.connect(hp);
		hp.connect(lp);
		lp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);
		const lfo = createLFO(ctx, 0.12, 250, lp.frequency);
		const lfo2 = createLFO(ctx, 0.04, 0.06, gain.gain);

		const gustInterval = setInterval(
			() => {
				const dur = 1 + Math.random() * 3;
				const t = ctx.currentTime;
				const vol = gain.gain.value;
				gain.gain.setValueAtTime(vol * 0.7, t);
				gain.gain.linearRampToValueAtTime(vol * 1.8, t + 0.5);
				gain.gain.exponentialRampToValueAtTime(vol * 0.5, t + dur);
				lp.frequency.setValueAtTime(250, t);
				lp.frequency.exponentialRampToValueAtTime(80, t + 0.3);
			},
			4000 + Math.random() * 5000,
		);

		src.start();
		this.state.set("blizzard", {
			stop: () => {
				try {
					src.stop();
				} catch {}
				try {
					lfo.stop();
				} catch {}
				try {
					lfo2.stop();
				} catch {}
			},
			cleanup: () => {
				clearInterval(gustInterval);
			},
			setVolume: (v) => {
				gain.gain.setTargetAtTime(v * 0.2, ctx.currentTime, 0.05);
			},
		});
	}

	// ── Train ──────────────────────────────────────────────
	private startTrain(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 4, "brown");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;
		const bp = ctx.createBiquadFilter();
		bp.type = "bandpass";
		bp.frequency.value = 200;
		bp.Q.value = 0.5;
		const gain = ctx.createGain();
		gain.gain.value = 0.15;
		const chugGain = ctx.createGain();
		chugGain.gain.value = 0.08;
		const hornGain = ctx.createGain();
		hornGain.gain.value = 0.05;
		src.connect(bp);
		bp.connect(gain);
		gain.connect(dest);
		const lfo = createLFO(ctx, 2.2, 80, bp.frequency);

		const chugInterval = setInterval(() => {
			const osc = ctx.createOscillator();
			const g = ctx.createGain();
			osc.type = "triangle";
			osc.frequency.value = 60 + Math.random() * 30;
			g.gain.setValueAtTime(0.08, ctx.currentTime);
			g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.15);
			const bp2 = ctx.createBiquadFilter();
			bp2.type = "bandpass";
			bp2.frequency.value = 80;
			bp2.Q.value = 2;
			osc.connect(bp2);
			bp2.connect(g);
			g.connect(dest);
			osc.start(ctx.currentTime);
			osc.stop(ctx.currentTime + 0.2);
		}, 350);

		const hornInterval = setInterval(
			() => {
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
				const k = 2;
				const curve = new Float32Array(256);
				for (let i = 0; i < 256; i++)
					curve[i] = Math.tanh(k * ((2 * i) / 255 - 1));
				dist.curve = curve;
				osc.connect(dist);
				dist.connect(reverb.input);
				reverb.output.connect(g);
				g.connect(dest);
				osc.start(ctx.currentTime);
				osc.stop(ctx.currentTime + 2);
			},
			25000 + Math.random() * 15000,
		);

		src.start();
		this.state.set("train", {
			stop: () => {
				try {
					src.stop();
				} catch {}
			},
			cleanup: () => {
				clearInterval(chugInterval);
				clearInterval(hornInterval);
			},
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
			osc.connect(gain);
			gain.connect(reverb.input);
			reverb.output.connect(pan);
			pan.connect(dest);
			osc.start();
			nodes.push(osc);
			gains.push(gain);
		});

		const lfo = createLFO(ctx, 0.05, 60, nodes[0].frequency);
		const lfo2 = createLFO(ctx, 0.03, 20, nodes[1].frequency);

		const beepInterval = setInterval(
			() => {
				const osc = ctx.createOscillator();
				const g = ctx.createGain();
				osc.type = "sine";
				osc.frequency.setValueAtTime(
					400 + Math.random() * 800,
					ctx.currentTime,
				);
				osc.frequency.exponentialRampToValueAtTime(
					200 + Math.random() * 400,
					ctx.currentTime + 0.3,
				);
				g.gain.setValueAtTime(0, ctx.currentTime);
				g.gain.linearRampToValueAtTime(0.03, ctx.currentTime + 0.02);
				g.gain.exponentialRampToValueAtTime(
					0.001,
					ctx.currentTime + 0.4 + Math.random() * 0.3,
				);
				const pan = createStereoPanner(ctx);
				pan.pan.value = Math.random() * 2 - 1;
				osc.connect(g);
				g.connect(pan);
				pan.connect(dest);
				osc.start(ctx.currentTime);
				osc.stop(ctx.currentTime + 0.7);
			},
			2000 + Math.random() * 3000,
		);

		this.state.set("spaceship", {
			stop: () => {
				for (const n of nodes) {
					try {
						n.stop();
					} catch {}
				}
			},
			cleanup: () => {
				clearInterval(beepInterval);
				try {
					lfo.stop();
				} catch {}
				try {
					lfo2.stop();
				} catch {}
			},
			setVolume: (v) => {
				for (let i = 0; i < gains.length; i++) {
					gains[i].gain.setTargetAtTime(
						v * baseGains[i],
						ctx.currentTime,
						0.05,
					);
				}
			},
		});
	}

	// ── Desert ─────────────────────────────────────────────
	private startDesert(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 6, "brown");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;
		const lp = ctx.createBiquadFilter();
		lp.type = "lowpass";
		lp.frequency.value = 200;
		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 60;
		const gain = ctx.createGain();
		gain.gain.value = 0.12;
		const reverb = createReverb(ctx, 4, 0.6);
		src.connect(hp);
		hp.connect(lp);
		lp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);
		const lfo = createLFO(ctx, 0.02, 100, lp.frequency);
		const lfo2 = createLFO(ctx, 0.01, 0.05, gain.gain);
		src.start();
		this.state.set("desert", {
			stop: () => {
				try {
					src.stop();
				} catch {}
				try {
					lfo.stop();
				} catch {}
				try {
					lfo2.stop();
				} catch {}
			},
			cleanup: () => {},
			setVolume: (v) => {
				gain.gain.setTargetAtTime(v * 0.12, ctx.currentTime, 0.05);
			},
		});
	}

	// ── Rain on Roof ───────────────────────────────────────
	private startRainOnRoof(ctx: AudioContext, dest: AudioNode) {
		const noise = createNoiseBuffer(ctx, 8, "pink");
		const src = ctx.createBufferSource();
		src.buffer = noise;
		src.loop = true;
		const hp = ctx.createBiquadFilter();
		hp.type = "highpass";
		hp.frequency.value = 300;
		const bp = ctx.createBiquadFilter();
		bp.type = "bandpass";
		bp.frequency.value = 700;
		bp.Q.value = 1.2;
		const gain = ctx.createGain();
		gain.gain.value = 0.15;
		const reverb = createReverb(ctx, 0.5, 0.15);
		src.connect(hp);
		hp.connect(bp);
		bp.connect(gain);
		gain.connect(reverb.input);
		reverb.output.connect(dest);
		gain.connect(dest);
		const lfo = createLFO(ctx, 0.18, 180, bp.frequency);

		// Impact layer: varied thuds, taps, and pings
		const impactInterval = setInterval(
			() => {
				const type = Math.random();
				const osc = ctx.createOscillator();
				const g = ctx.createGain();
				const pan = createStereoPanner(ctx);
				pan.pan.value = Math.random() * 2 - 1;

				if (type < 0.4) {
					// Soft thud (water hitting surface)
					osc.type = "sine";
					osc.frequency.value = 60 + Math.random() * 100;
					g.gain.setValueAtTime(0, ctx.currentTime);
					g.gain.linearRampToValueAtTime(
						0.03 + Math.random() * 0.03,
						ctx.currentTime + 0.004,
					);
					g.gain.exponentialRampToValueAtTime(
						0.001,
						ctx.currentTime + 0.03 + Math.random() * 0.04,
					);
				} else if (type < 0.7) {
					// Sharp tap
					osc.type = "triangle";
					osc.frequency.value = 200 + Math.random() * 400;
					g.gain.setValueAtTime(0, ctx.currentTime);
					g.gain.linearRampToValueAtTime(
						0.02 + Math.random() * 0.02,
						ctx.currentTime + 0.002,
					);
					g.gain.exponentialRampToValueAtTime(
						0.001,
						ctx.currentTime + 0.015 + Math.random() * 0.02,
					);
				} else {
					// Metallic ping (tin roof)
					osc.type = "sine";
					osc.frequency.value = 800 + Math.random() * 1200;
					g.gain.setValueAtTime(0, ctx.currentTime);
					g.gain.linearRampToValueAtTime(
						0.012 + Math.random() * 0.01,
						ctx.currentTime + 0.001,
					);
					g.gain.exponentialRampToValueAtTime(
						0.001,
						ctx.currentTime + 0.02 + Math.random() * 0.03,
					);
				}

				osc.connect(g);
				g.connect(pan);
				pan.connect(dest);
				osc.start(ctx.currentTime);
				osc.stop(ctx.currentTime + 0.06);
			},
			50 + Math.random() * 80,
		);

		src.start();
		this.state.set("rainOnRoof", {
			stop: () => {
				try {
					src.stop();
				} catch {}
			},
			cleanup: () => {
				clearInterval(impactInterval);
				try {
					lfo.stop();
				} catch {}
			},
			setVolume: (v) => {
				gain.gain.setTargetAtTime(v * 0.15, ctx.currentTime, 0.05);
			},
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
	audioManager.playChime();
}

function playChimeOnContext(
	ctx: AudioContext,
	vol: number,
	destination: AudioNode,
) {
	if (ctx.state === "suspended") ctx.resume();
	const now = ctx.currentTime;
	const notes = [
		{ freq: 523.25, delay: 0 },
		{ freq: 659.25, delay: 0.1 },
		{ freq: 783.99, delay: 0.2 },
		{ freq: 1046.5, delay: 0.32 },
	];

	for (const { freq, delay } of notes) {
		const osc = ctx.createOscillator();
		const gain = ctx.createGain();
		const filter = ctx.createBiquadFilter();
		filter.type = "lowpass";
		filter.frequency.value = 3200;

		osc.connect(filter);
		filter.connect(gain);
		gain.connect(destination);

		osc.type = "triangle";
		osc.frequency.value = freq;
		const t = now + delay;
		gain.gain.setValueAtTime(0.0001, t);
		gain.gain.linearRampToValueAtTime(0.09 * vol, t + 0.015);
		gain.gain.setValueAtTime(0.07 * vol, t + 0.12);
		gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.55);
		osc.start(t);
		osc.stop(t + 0.6);
	}
}
