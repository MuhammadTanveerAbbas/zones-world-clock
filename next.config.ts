import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	reactStrictMode: true,
	poweredByHeader: false,
	compress: true,

	experimental: {
		optimizePackageImports: ["motion", "date-fns-tz"],
	},
};

export default nextConfig;
