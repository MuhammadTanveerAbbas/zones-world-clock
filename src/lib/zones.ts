export type Zone = {
	id: string;
	label: string;
	sublabel: string;
	countryCode: string;
	tz: string;
};

export const DEFAULT_ZONES: Zone[] = [
	{
		id: "faisalabad",
		label: "Faisalabad",
		sublabel: "Punjab, Pakistan",
		countryCode: "pk",
		tz: "Asia/Karachi",
	},
	{
		id: "new_york",
		label: "New York",
		sublabel: "United States",
		countryCode: "us",
		tz: "America/New_York",
	},
	{
		id: "london",
		label: "London",
		sublabel: "United Kingdom",
		countryCode: "gb",
		tz: "Europe/London",
	},
	{
		id: "paris",
		label: "Paris",
		sublabel: "France",
		countryCode: "fr",
		tz: "Europe/Paris",
	},
	{
		id: "dubai",
		label: "Dubai",
		sublabel: "UAE",
		countryCode: "ae",
		tz: "Asia/Dubai",
	},
	{
		id: "tokyo",
		label: "Tokyo",
		sublabel: "Japan",
		countryCode: "jp",
		tz: "Asia/Tokyo",
	},
	{
		id: "singapore",
		label: "Singapore",
		sublabel: "Singapore",
		countryCode: "sg",
		tz: "Asia/Singapore",
	},
	{
		id: "sydney",
		label: "Sydney",
		sublabel: "Australia",
		countryCode: "au",
		tz: "Australia/Sydney",
	},
];
