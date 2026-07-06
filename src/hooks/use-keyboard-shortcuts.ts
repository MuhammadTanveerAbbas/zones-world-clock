"use client";

import { useEffect } from "react";

type ShortcutMap = Record<
	string,
	{
		fn: () => void;
		preventDefault?: boolean;
	}
>;

export function useKeyboardShortcuts(shortcuts: ShortcutMap) {
	useEffect(() => {
		function handleKeyDown(e: KeyboardEvent) {
			const target = e.target as HTMLElement;
			if (
				target.tagName === "INPUT" ||
				target.tagName === "TEXTAREA" ||
				target.isContentEditable
			) {
				return;
			}

			const key = e.key.toLowerCase();
			const mod = e.metaKey || e.ctrlKey;
			const keyCombo = mod ? `mod+${key}` : key;

			const shortcut = shortcuts[keyCombo] || shortcuts[key];
			if (shortcut) {
				if (shortcut.preventDefault !== false) {
					e.preventDefault();
				}
				shortcut.fn();
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [shortcuts]);
}
