import type { ViewMode, ZonesState } from "./store";
import type { Zone } from "./zones";

export const ZONES_EXPORT_VERSION = 1;
export const ZONES_HASH_PREFIX = "zones=";

export type ZonesExportPayload = {
	version: typeof ZONES_EXPORT_VERSION;
	exportedAt: string;
	zones: Zone[];
	homeId: string;
	viewMode?: ViewMode;
	use24h?: boolean;
	ambientMode?: boolean;
};

function isZone(value: unknown): value is Zone {
	if (!value || typeof value !== "object") return false;
	const z = value as Partial<Zone>;
	return (
		typeof z.id === "string" &&
		typeof z.label === "string" &&
		typeof z.sublabel === "string" &&
		typeof z.countryCode === "string" &&
		typeof z.tz === "string" &&
		z.id.length > 0 &&
		z.tz.includes("/")
	);
}

export function validateZonesExport(data: unknown): ZonesExportPayload | null {
	if (!data || typeof data !== "object") return null;
	const payload = data as Partial<ZonesExportPayload>;
	if (payload.version !== ZONES_EXPORT_VERSION) return null;
	if (!Array.isArray(payload.zones) || payload.zones.length === 0) return null;
	if (!payload.zones.every(isZone)) return null;
	if (typeof payload.homeId !== "string") return null;
	if (!payload.zones.some((z) => z.id === payload.homeId)) return null;

	const ids = new Set(payload.zones.map((z) => z.id));
	if (ids.size !== payload.zones.length) return null;

	return {
		version: ZONES_EXPORT_VERSION,
		exportedAt:
			typeof payload.exportedAt === "string"
				? payload.exportedAt
				: new Date().toISOString(),
		zones: payload.zones,
		homeId: payload.homeId,
		viewMode: payload.viewMode,
		use24h: payload.use24h,
		ambientMode: payload.ambientMode,
	};
}

export function encodeZonesPayload(payload: ZonesExportPayload): string {
	return JSON.stringify(payload);
}

export function decodeZonesPayload(raw: string): ZonesExportPayload | null {
	try {
		return validateZonesExport(JSON.parse(raw));
	} catch {
		return null;
	}
}

function toBase64Url(value: string): string {
	const bytes = new TextEncoder().encode(value);
	let binary = "";
	for (const byte of bytes) {
		binary += String.fromCharCode(byte);
	}
	return btoa(binary)
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=+$/, "");
}

function fromBase64Url(value: string): string {
	const padded = value.replace(/-/g, "+").replace(/_/g, "/");
	const padLen = (4 - (padded.length % 4)) % 4;
	const base64 = padded + "=".repeat(padLen);
	const binary = atob(base64);
	const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
	return new TextDecoder().decode(bytes);
}

export function encodeZonesHash(payload: ZonesExportPayload): string {
	return `${ZONES_HASH_PREFIX}${toBase64Url(encodeZonesPayload(payload))}`;
}

export function decodeZonesHash(hash: string): ZonesExportPayload | null {
	const trimmed = hash.startsWith("#") ? hash.slice(1) : hash;
	if (!trimmed.startsWith(ZONES_HASH_PREFIX)) return null;
	return decodeZonesPayload(
		fromBase64Url(trimmed.slice(ZONES_HASH_PREFIX.length)),
	);
}

export function buildShareUrl(payload: ZonesExportPayload): string {
	if (typeof window === "undefined") return "";
	const base = `${window.location.origin}${window.location.pathname}`;
	return `${base}#${encodeZonesHash(payload)}`;
}

export type ZonesImportResult =
	| { ok: true; payload: ZonesExportPayload }
	| { ok: false; error: string };

export function parseZonesImport(raw: string): ZonesImportResult {
	const trimmed = raw.trim();
	if (!trimmed) {
		return { ok: false, error: "Paste a JSON export or share link first." };
	}

	if (trimmed.includes(ZONES_HASH_PREFIX)) {
		const hashStart = trimmed.indexOf("#");
		const hash = hashStart >= 0 ? trimmed.slice(hashStart) : `#${trimmed}`;
		const fromHash = decodeZonesHash(hash);
		if (fromHash) return { ok: true, payload: fromHash };
	}

	const fromJson = decodeZonesPayload(trimmed);
	if (fromJson) return { ok: true, payload: fromJson };

	return {
		ok: false,
		error: "Invalid export. Check the JSON format or share link.",
	};
}

export function zonesExportToState(
	payload: ZonesExportPayload,
): Partial<ZonesState> {
	const partial: Partial<ZonesState> = {
		zones: payload.zones,
		homeId: payload.homeId,
	};
	if (payload.viewMode) partial.viewMode = payload.viewMode;
	if (typeof payload.use24h === "boolean") partial.use24h = payload.use24h;
	if (typeof payload.ambientMode === "boolean") {
		partial.ambientMode = payload.ambientMode;
	}
	return partial;
}
