const NASA_API_KEY = process.env.NEXT_PUBLIC_NASA_API_KEY?.trim() || "DEMO_KEY";
const EPIC_CACHE_KEY = "zones-epic-cache";
const CACHE_TTL_MS = 3_600_000;

export type EpicImage = {
	url: string;
	date: string;
	imageName: string;
};

type EpicApiItem = {
	image: string;
	date: string;
};

type EpicCache = {
	fetchedAt: number;
	image: EpicImage;
};

function buildImageUrl(item: EpicApiItem): string {
	const d = new Date(item.date);
	const y = d.getUTCFullYear();
	const m = String(d.getUTCMonth() + 1).padStart(2, "0");
	const day = String(d.getUTCDate()).padStart(2, "0");
	return `https://api.nasa.gov/EPIC/archive/natural/${y}/${m}/${day}/png/${item.image}.png?api_key=${NASA_API_KEY}`;
}

function readCache(): EpicCache | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = localStorage.getItem(EPIC_CACHE_KEY);
		if (!raw) return null;
		const parsed = JSON.parse(raw) as EpicCache;
		if (Date.now() - parsed.fetchedAt > CACHE_TTL_MS) return null;
		return parsed;
	} catch {
		return null;
	}
}

function writeCache(image: EpicImage) {
	if (typeof window === "undefined") return;
	try {
		const cache: EpicCache = { fetchedAt: Date.now(), image };
		localStorage.setItem(EPIC_CACHE_KEY, JSON.stringify(cache));
	} catch {}
}

export function getCachedEpicImage(): EpicImage | null {
	return readCache()?.image ?? null;
}

export async function fetchLatestEpicImage(): Promise<EpicImage | null> {
	const cached = readCache();
	if (cached) return cached.image;

	try {
		const res = await fetch(
			`https://api.nasa.gov/EPIC/api/natural?api_key=${NASA_API_KEY}`,
		);
		if (!res.ok) return getCachedEpicImage();
		const data = (await res.json()) as EpicApiItem[];
		if (!data.length) return getCachedEpicImage();

		const latest = data[0];
		const image: EpicImage = {
			url: buildImageUrl(latest),
			date: latest.date,
			imageName: latest.image,
		};
		writeCache(image);
		return image;
	} catch {
		return getCachedEpicImage();
	}
}
