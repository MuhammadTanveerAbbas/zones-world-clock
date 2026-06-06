"use client";

import { useEffect } from "react";

export function PWARegister() {
	useEffect(() => {
		if ("serviceWorker" in navigator) {
			window.addEventListener("load", () => {
				if ("requestIdleCallback" in window) {
					requestIdleCallback(() => {
						navigator.serviceWorker
							.register("/sw.js", { updateViaCache: "none" })
							.catch(() => {});
					});
				} else {
					setTimeout(() => {
						navigator.serviceWorker
							.register("/sw.js", { updateViaCache: "none" })
							.catch(() => {});
					}, 2000);
				}
			});
		}
	}, []);

	return null;
}
