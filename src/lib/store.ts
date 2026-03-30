import { DEFAULT_ZONES, type Zone } from "./zones";

export type ViewMode = "stack" | "scroll" | "grid" | "compact";

export type ZonesState = {
	zones: Zone[];
	homeId: string;
	viewMode: ViewMode;
	use24h: boolean;
	ambientMode: boolean;
	version?: number;
};

const STORAGE_KEY = "zones-state";
const CURRENT_VERSION = 3;

const DEFAULT_STATE: ZonesState = {
	zones: DEFAULT_ZONES,
	homeId: "faisalabad",
	viewMode: "stack",
	use24h: false,
	ambientMode: true,
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

		// Check version and reset if outdated
		if (!parsed.version || parsed.version < CURRENT_VERSION) {
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
};
