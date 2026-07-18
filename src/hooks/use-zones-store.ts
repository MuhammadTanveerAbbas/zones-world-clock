"use client";

import { type ViewMode, store } from "@/lib/store";
import type { Zone } from "@/lib/zones";
import { useCallback, useSyncExternalStore } from "react";

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
	const toggleSoundReactiveGlow = useCallback(
		() =>
			store.setState({
				soundReactiveGlow: !store.getState().soundReactiveGlow,
			}),
		[],
	);
	const toggleEarthBackdrop = useCallback(
		() =>
			store.setState({
				earthBackdrop: !store.getState().earthBackdrop,
			}),
		[],
	);
	const setWorkingHours = useCallback(
		(hours: { start: number; end: number }) =>
			store.setState({ workingHours: hours }),
		[],
	);
	const exportZonesJson = useCallback(() => store.exportJson(), []);
	const getZonesShareUrl = useCallback(() => store.getShareUrl(), []);
	const importZonesJson = useCallback(
		(raw: string) => store.importJson(raw),
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
		toggleSoundReactiveGlow,
		toggleEarthBackdrop,
		setWorkingHours,
		exportZonesJson,
		getZonesShareUrl,
		importZonesJson,
	};
}
