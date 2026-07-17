import {
	ZONES_EXPORT_VERSION,
	type ZonesExportPayload,
	buildShareUrl,
	decodeZonesHash,
	encodeZonesPayload,
	parseZonesImport,
	zonesExportToState,
} from "./zone-export";
import { DEFAULT_ZONES, type Zone } from "./zones";

export type ViewMode = "stack" | "scroll" | "grid" | "compact";

export type WorkingHoursConfig = {
	start: number;
	end: number;
};

export type ZonesState = {
	zones: Zone[];
	homeId: string;
	viewMode: ViewMode;
	use24h: boolean;
	ambientMode: boolean;
	scanlinesEnabled: boolean;
	soundReactiveGlow: boolean;
	earthBackdrop: boolean;
	workingHours: WorkingHoursConfig;
	version?: number;
};

const STORAGE_KEY = "zones-state";
const CURRENT_VERSION = 4;

const DEFAULT_STATE: ZonesState = {
	zones: DEFAULT_ZONES,
	homeId: "faisalabad",
	viewMode: "stack",
	use24h: false,
	ambientMode: true,
	scanlinesEnabled: false,
	soundReactiveGlow: true,
	earthBackdrop: false,
	workingHours: { start: 9, end: 18 },
	version: CURRENT_VERSION,
};

type Listener = () => void;

let state: ZonesState = DEFAULT_STATE;
let initialized = false;
const listeners = new Set<Listener>();

function load(): ZonesState {
	if (typeof window === "undefined") return DEFAULT_STATE;
	try {
		const raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) return DEFAULT_STATE;
		const parsed = JSON.parse(raw) as Partial<ZonesState>;

		if (!parsed.version || parsed.version > CURRENT_VERSION) {
			return DEFAULT_STATE;
		}

		return { ...DEFAULT_STATE, ...parsed };
	} catch {
		return DEFAULT_STATE;
	}
}

function save(s: ZonesState) {
	if (typeof window === "undefined") return;
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
	} catch {
		// Storage may be unavailable in private browsing or when quota is exceeded
	}
}

function init() {
	if (initialized) return;
	initialized = true;
	state = load();
}

export const store = {
	getState(): ZonesState {
		init();
		return state;
	},

	getServerState(): ZonesState {
		return DEFAULT_STATE;
	},

	setState(partial: Partial<ZonesState>) {
		init();
		state = { ...state, ...partial };
		save(state);
		for (const listener of listeners) listener();
	},

	subscribe(listener: Listener): () => void {
		listeners.add(listener);
		return () => listeners.delete(listener);
	},

	addZone(zone: Zone) {
		const current = store.getState();
		if (current.zones.some((z) => z.id === zone.id)) return;
		store.setState({ zones: [...current.zones, zone] });
	},

	removeZone(id: string) {
		const current = store.getState();
		if (id === current.homeId) return;
		store.setState({ zones: current.zones.filter((z) => z.id !== id) });
	},

	reorderZones(ids: string[]) {
		const current = store.getState();
		const byId = new Map(current.zones.map((z) => [z.id, z]));
		const reordered = ids.map((id) => byId.get(id)).filter(Boolean) as Zone[];
		store.setState({ zones: reordered });
	},

	exportPayload(): ZonesExportPayload {
		const current = store.getState();
		return {
			version: ZONES_EXPORT_VERSION,
			exportedAt: new Date().toISOString(),
			zones: current.zones,
			homeId: current.homeId,
			viewMode: current.viewMode,
			use24h: current.use24h,
			ambientMode: current.ambientMode,
		};
	},

	exportJson(): string {
		return encodeZonesPayload(store.exportPayload());
	},

	getShareUrl(): string {
		return buildShareUrl(store.exportPayload());
	},

	importPayload(payload: ZonesExportPayload) {
		store.setState({
			...zonesExportToState(payload),
			version: CURRENT_VERSION,
		});
	},

	importJson(raw: string): { ok: true } | { ok: false; error: string } {
		const result = parseZonesImport(raw);
		if (!result.ok) return result;
		store.importPayload(result.payload);
		return { ok: true };
	},

	importFromHash(hash: string): boolean {
		const payload = decodeZonesHash(hash);
		if (!payload) return false;
		store.importPayload(payload);
		return true;
	},

	resetToDefaults() {
		store.setState({ ...DEFAULT_STATE, version: CURRENT_VERSION });
	},
};
