import { getTimezoneOffset, toZonedTime } from "date-fns-tz";

/** Solar declination in degrees for a given UTC date */
export function getSolarDeclination(date: Date): number {
	const start = new Date(Date.UTC(date.getUTCFullYear(), 0, 0));
	const dayOfYear = Math.floor((date.getTime() - start.getTime()) / 86_400_000);
	return 23.44 * Math.sin((2 * Math.PI * (dayOfYear - 81)) / 365);
}

export function getApproxLongitude(tz: string, date: Date): number {
	const offsetMs = getTimezoneOffset(tz, date);
	return (offsetMs / 3_600_000) * 15;
}

const TZ_LATITUDE: Record<string, number> = {
	"Asia/Kolkata": 28.6,
	"Asia/Kathmandu": 27.7,
	"Asia/Tehran": 35.7,
	"Asia/Kabul": 34.5,
	"Asia/Yangon": 16.8,
	"Pacific/Chatham": -43.9,
	"America/St_Johns": 47.6,
	"Pacific/Marquesas": -9.0,
	"Europe/London": 51.5,
	"America/New_York": 40.7,
	"Asia/Tokyo": 35.7,
	"Australia/Sydney": -33.9,
	"Australia/Adelaide": -34.9,
	"Australia/Darwin": -12.5,
};

export function getApproxLatitude(tz: string): number {
	return TZ_LATITUDE[tz] ?? 40;
}

/**
 * Returns true when the sun is below the horizon at the given location/time.
 * Uses a simplified solar elevation formula (accurate enough for UI glyphs).
 */
export function isLocationDark(tz: string, date: Date): boolean {
	const lat = getApproxLatitude(tz);
	const lon = getApproxLongitude(tz, date);
	const dec = getSolarDeclination(date);

	const utcHours =
		date.getUTCHours() +
		date.getUTCMinutes() / 60 +
		date.getUTCSeconds() / 3600;
	const hourAngle = 15 * (utcHours - 12) + lon;

	const latRad = (lat * Math.PI) / 180;
	const decRad = (dec * Math.PI) / 180;
	const haRad = (hourAngle * Math.PI) / 180;

	const sinElevation =
		Math.sin(latRad) * Math.sin(decRad) +
		Math.cos(latRad) * Math.cos(decRad) * Math.cos(haRad);

	return sinElevation < -0.1;
}

/** Build an SVG path for the day/night terminator across a world map */
export function getTerminatorPath(
	width: number,
	height: number,
	date: Date,
): string {
	const dec = getSolarDeclination(date);
	const points: string[] = [];

	for (let x = 0; x <= width; x += 4) {
		const lon = (x / width) * 360 - 180;
		const utcHours =
			date.getUTCHours() +
			date.getUTCMinutes() / 60 +
			date.getUTCSeconds() / 3600;
		const hourAngle = 15 * (utcHours - 12) + lon;

		const decRad = (dec * Math.PI) / 180;
		const haRad = (hourAngle * Math.PI) / 180;

		const tanLat = -Math.cos(haRad) / Math.tan(decRad || 0.001);
		const lat = (Math.atan(tanLat) * 180) / Math.PI;
		const clampedLat = Math.max(-85, Math.min(85, lat));
		const y = height / 2 - (clampedLat / 90) * (height / 2);
		points.push(`${x === 0 ? "M" : "L"}${x},${y.toFixed(1)}`);
	}

	return points.join(" ");
}

export function getLocalHourForGlyph(tz: string, date: Date): number {
	const zoned = toZonedTime(date, tz);
	return zoned.getHours() + zoned.getMinutes() / 60;
}
