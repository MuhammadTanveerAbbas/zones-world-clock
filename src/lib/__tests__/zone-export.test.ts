import {
	ZONES_EXPORT_VERSION,
	buildShareUrl,
	decodeZonesHash,
	encodeZonesHash,
	encodeZonesPayload,
	parseZonesImport,
	validateZonesExport,
	type ZonesExportPayload,
} from "@/lib/zone-export";
import { DEFAULT_ZONES } from "@/lib/zones";
import { describe, expect, it } from "vitest";

const samplePayload: ZonesExportPayload = {
	version: ZONES_EXPORT_VERSION,
	exportedAt: "2026-07-06T00:00:00.000Z",
	zones: DEFAULT_ZONES.slice(0, 3),
	homeId: "faisalabad",
	viewMode: "stack" as const,
	use24h: true,
	ambientMode: false,
};

describe("zone-export", () => {
	it("validates a correct export payload", () => {
		expect(validateZonesExport(samplePayload)).toEqual(samplePayload);
	});

	it("rejects invalid payloads", () => {
		expect(validateZonesExport(null)).toBeNull();
		expect(
			validateZonesExport({ version: 2, zones: [], homeId: "x" }),
		).toBeNull();
		expect(
			validateZonesExport({
				...samplePayload,
				homeId: "missing",
			}),
		).toBeNull();
	});

	it("round-trips through JSON", () => {
		const json = encodeZonesPayload(samplePayload);
		const result = parseZonesImport(json);
		expect(result.ok).toBe(true);
		if (result.ok) {
			expect(result.payload.zones).toHaveLength(3);
			expect(result.payload.homeId).toBe("faisalabad");
		}
	});

	it("round-trips through share hash", () => {
		const hash = encodeZonesHash(samplePayload);
		const decoded = decodeZonesHash(`#${hash}`);
		expect(decoded?.zones).toHaveLength(3);
		expect(decoded?.homeId).toBe("faisalabad");
	});

	it("parses full share URLs", () => {
		const url = buildShareUrl(samplePayload);
		const result = parseZonesImport(url);
		expect(result.ok).toBe(true);
	});

	it("returns helpful errors for bad imports", () => {
		const result = parseZonesImport("{ not valid json");
		expect(result.ok).toBe(false);
		if (!result.ok) {
			expect(result.error.length).toBeGreaterThan(0);
		}
	});
});
