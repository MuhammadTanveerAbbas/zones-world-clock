const CACHE_NAME = "zones-clock-v1";
const STATIC_ASSETS = [
	"/",
	"/favicon.svg",
	"/manifest.json",
];

self.addEventListener("install", (event) => {
	event.waitUntil(
		caches.open(CACHE_NAME).then((cache) => {
			return cache.addAll(STATIC_ASSETS);
		}),
	);
	self.skipWaiting();
});

self.addEventListener("activate", (event) => {
	event.waitUntil(
		caches.keys().then((keys) => {
			return Promise.all(
				keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)),
			);
		}),
	);
	self.clients.claim();
});

self.addEventListener("fetch", (event) => {
	if (event.request.mode === "navigate") {
		event.respondWith(
			fetch(event.request).catch(() => caches.match("/")),
		);
		return;
	}

	event.respondWith(
		caches.match(event.request).then((cached) => {
			const fetchPromise = fetch(event.request).then((response) => {
				if (response && response.status === 200) {
					const clone = response.clone();
					caches.open(CACHE_NAME).then((cache) => {
						cache.put(event.request, clone);
					});
				}
				return response;
			}).catch(() => cached);
			return cached || fetchPromise;
		}),
	);
});
