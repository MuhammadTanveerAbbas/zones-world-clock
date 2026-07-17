export type RecordedSoundId = "signatureRain" | "signatureDrone";

export type SoundLicense = {
	type: "CC0" | "CC-BY";
	attribution?: string;
};

export const RECORDED_SOUNDS: Record<
	RecordedSoundId,
	{ label: string; file: string; license: SoundLicense }
> = {
	signatureRain: {
		label: "Signature Rain",
		file: "/audio/signature-rain.ogg",
		license: {
			type: "CC0",
			attribution: "Ambient loop — CC0 (Zones)",
		},
	},
	signatureDrone: {
		label: "Signature Drone",
		file: "/audio/signature-drone.ogg",
		license: {
			type: "CC0",
			attribution: "Ambient drone — CC0 (Zones)",
		},
	},
};

export function isRecordedSound(sound: string): sound is RecordedSoundId {
	return sound === "signatureRain" || sound === "signatureDrone";
}
