"use client";

import { useCallback, useSyncExternalStore } from "react";
import { store, type ViewMode } from "@/lib/store";
import type { Zone } from "@/lib/zones";

export function useZonesStore() {
	const state = useSyncExternalStore(
		store.subscribe,
		store.getState,
		store.getServerState,
	);

	const setViewMode = useCallback(
		(mode: ViewMode) => store.setState({ viewMode: mode }),
		[],
	);
	const setUse24h = useCallback(
		(v: boolean) => store.setState({ use24h: v }),
		[],
	);
	const toggleTimeFormat = useCallback(
		() => store.setState({ use24h: !store.getState().use24h }),
		[],
	);
	const setHomeId = useCallback(
		(id: string) => store.setState({ homeId: id }),
		[],
	);
	const addZone = useCallback((zone: Zone) => store.addZone(zone), []);
	const removeZone = useCallback((id: string) => store.removeZone(id), []);
	const reorderZones = useCallback(
		(ids: string[]) => store.reorderZones(ids),
		[],
	);
	const toggleAmbientMode = useCallback(
		() => store.setState({ ambientMode: !store.getState().ambientMode }),
		[],
	);

	const homeZone = state.zones.find((z) => z.id === state.homeId);
	const homeTz = homeZone?.tz ?? "Asia/Karachi";

	return {
		...state,
		homeTz,
		setViewMode,
		setUse24h,
		toggleTimeFormat,
		setHomeId,
		addZone,
		removeZone,
		reorderZones,
		toggleAmbientMode,
	};
}
