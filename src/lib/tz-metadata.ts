import { getCountryName } from "./tz-country-names";

const TZ_COUNTRY_MAP: Record<string, string> = {
	"Africa/Abidjan": "ci",
	"Africa/Accra": "gh",
	"Africa/Addis_Ababa": "et",
	"Africa/Algiers": "dz",
	"Africa/Cairo": "eg",
	"Africa/Casablanca": "ma",
	"Africa/Dar_es_Salaam": "tz",
	"Africa/Johannesburg": "za",
	"Africa/Lagos": "ng",
	"Africa/Nairobi": "ke",
	"Africa/Khartoum": "sd",
	"Africa/Kinshasa": "cd",
	"Africa/Libreville": "ga",
	"Africa/Luanda": "ao",
	"Africa/Lusaka": "zm",
	"Africa/Maputo": "mz",
	"Africa/Mogadishu": "so",
	"Africa/Monrovia": "lr",
	"Africa/Tripoli": "ly",
	"Africa/Tunis": "tn",
	"Africa/Windhoek": "na",
	"America/Anchorage": "us",
	"America/Argentina/Buenos_Aires": "ar",
	"America/Bogota": "co",
	"America/Caracas": "ve",
	"America/Chicago": "us",
	"America/Costa_Rica": "cr",
	"America/Denver": "us",
	"America/Edmonton": "ca",
	"America/Guatemala": "gt",
	"America/Guayaquil": "ec",
	"America/Halifax": "ca",
	"America/Havana": "cu",
	"America/La_Paz": "bo",
	"America/Lima": "pe",
	"America/Los_Angeles": "us",
	"America/Managua": "ni",
	"America/Manaus": "br",
	"America/Mexico_City": "mx",
	"America/Montevideo": "uy",
	"America/New_York": "us",
	"America/Panama": "pa",
	"America/Phoenix": "us",
	"America/Santiago": "cl",
	"America/Sao_Paulo": "br",
	"America/St_Johns": "ca",
	"America/Tegucigalpa": "hn",
	"America/Toronto": "ca",
	"America/Vancouver": "ca",
	"America/Asuncion": "py",
	"America/Barbados": "bb",
	"America/Belize": "bz",
	"America/Cayenne": "gf",
	"America/Curacao": "cw",
	"America/El_Salvador": "sv",
	"America/Godthab": "gl",
	"America/Grand_Turk": "tc",
	"America/Jamaica": "jm",
	"America/Martinique": "mq",
	"America/Nassau": "bs",
	"America/Paramaribo": "sr",
	"America/Port-au-Prince": "ht",
	"America/Port_of_Spain": "tt",
	"America/Puerto_Rico": "pr",
	"America/Santo_Domingo": "do",
	"America/Tijuana": "mx",
	"America/Winnipeg": "ca",
	"Asia/Almaty": "kz",
	"Asia/Baghdad": "iq",
	"Asia/Bangkok": "th",
	"Asia/Beirut": "lb",
	"Asia/Calcutta": "in",
	"Asia/Colombo": "lk",
	"Asia/Dhaka": "bd",
	"Asia/Dubai": "ae",
	"Asia/Ho_Chi_Minh": "vn",
	"Asia/Hong_Kong": "hk",
	"Asia/Istanbul": "tr",
	"Asia/Jakarta": "id",
	"Asia/Jerusalem": "il",
	"Asia/Kabul": "af",
	"Asia/Karachi": "pk",
	"Asia/Kathmandu": "np",
	"Asia/Kolkata": "in",
	"Asia/Kuala_Lumpur": "my",
	"Asia/Kuwait": "kw",
	"Asia/Manila": "ph",
	"Asia/Muscat": "om",
	"Asia/Novosibirsk": "ru",
	"Asia/Riyadh": "sa",
	"Asia/Seoul": "kr",
	"Asia/Shanghai": "cn",
	"Asia/Singapore": "sg",
	"Asia/Taipei": "tw",
	"Asia/Tehran": "ir",
	"Asia/Tokyo": "jp",
	"Asia/Vladivostok": "ru",
	"Asia/Amman": "jo",
	"Asia/Ashgabat": "tm",
	"Asia/Baku": "az",
	"Asia/Bishkek": "kg",
	"Asia/Brunei": "bn",
	"Asia/Chongqing": "cn",
	"Asia/Damascus": "sy",
	"Asia/Dili": "tl",
	"Asia/Gaza": "ps",
	"Asia/Macau": "mo",
	"Asia/Makassar": "id",
	"Asia/Nicosia": "cy",
	"Asia/Phnom_Penh": "kh",
	"Asia/Pyongyang": "kp",
	"Asia/Qatar": "qa",
	"Asia/Samarkand": "uz",
	"Asia/Tashkent": "uz",
	"Asia/Tbilisi": "ge",
	"Asia/Thimphu": "bt",
	"Asia/Ulaanbaatar": "mn",
	"Asia/Vientiane": "la",
	"Asia/Yangon": "mm",
	"Asia/Yekaterinburg": "ru",
	"Asia/Yerevan": "am",
	"Atlantic/Reykjavik": "is",
	"Australia/Adelaide": "au",
	"Australia/Brisbane": "au",
	"Australia/Darwin": "au",
	"Australia/Melbourne": "au",
	"Australia/Perth": "au",
	"Australia/Sydney": "au",
	"Europe/Amsterdam": "nl",
	"Europe/Athens": "gr",
	"Europe/Belgrade": "rs",
	"Europe/Berlin": "de",
	"Europe/Brussels": "be",
	"Europe/Bucharest": "ro",
	"Europe/Budapest": "hu",
	"Europe/Copenhagen": "dk",
	"Europe/Dublin": "ie",
	"Europe/Helsinki": "fi",
	"Europe/Kiev": "ua",
	"Europe/Lisbon": "pt",
	"Europe/London": "gb",
	"Europe/Madrid": "es",
	"Europe/Moscow": "ru",
	"Europe/Oslo": "no",
	"Europe/Paris": "fr",
	"Europe/Prague": "cz",
	"Europe/Rome": "it",
	"Europe/Stockholm": "se",
	"Europe/Vienna": "at",
	"Europe/Vilnius": "lt",
	"Europe/Warsaw": "pl",
	"Europe/Bratislava": "sk",
	"Europe/Chisinau": "md",
	"Europe/Ljubljana": "si",
	"Europe/Luxembourg": "lu",
	"Europe/Malta": "mt",
	"Europe/Minsk": "by",
	"Europe/Riga": "lv",
	"Europe/Tallinn": "ee",
	"Europe/Tirane": "al",
	"Europe/Zagreb": "hr",
	"Europe/Zurich": "ch",
	"Pacific/Auckland": "nz",
	"Pacific/Fiji": "fj",
	"Pacific/Guam": "gu",
	"Pacific/Honolulu": "us",
	"Pacific/Chatham": "nz",
	"Pacific/Noumea": "nc",
	"Pacific/Pago_Pago": "as",
	"Pacific/Port_Moresby": "pg",
	"Pacific/Tongatapu": "to",
	"Indian/Maldives": "mv",
	"Indian/Mauritius": "mu",
};

export function getCountryCode(tz: string): string {
	if (TZ_COUNTRY_MAP[tz]) return TZ_COUNTRY_MAP[tz];

	const parts = tz.split("/");
	if (parts.length < 2) return "un";

	for (const [key, code] of Object.entries(TZ_COUNTRY_MAP)) {
		if (key.endsWith(`/${parts[parts.length - 1]}`)) return code;
	}

	return "un";
}

export function getCityName(tz: string): string {
	const parts = tz.split("/");
	const city = parts[parts.length - 1];
	return city.replace(/_/g, " ");
}

export function getRegionName(tz: string): string {
	const parts = tz.split("/");
	if (parts.length >= 3) return parts[1].replace(/_/g, " ");
	return parts[0];
}

export type TzSearchResult = {
	tz: string;
	city: string;
	region: string;
	countryCode: string;
	countryName: string;
};

let cachedTimezones: TzSearchResult[] | null = null;

function getAllTimezones(): TzSearchResult[] {
	if (cachedTimezones) return cachedTimezones;
	const allTz = Intl.supportedValuesOf("timeZone");
	cachedTimezones = allTz.map((tz) => {
		const countryCode = getCountryCode(tz);
		return {
			tz,
			city: getCityName(tz),
			region: getRegionName(tz),
			countryCode,
			countryName: getCountryName(countryCode),
		};
	});
	return cachedTimezones;
}

export function searchTimezones(query: string): TzSearchResult[] {
	if (!query.trim()) return [];

	const q = query.toLowerCase();
	return getAllTimezones()
		.filter(
			(r) =>
				r.city.toLowerCase().includes(q) ||
				r.region.toLowerCase().includes(q) ||
				r.tz.toLowerCase().includes(q) ||
				r.countryName.includes(q),
		)
		.slice(0, 20);
}
