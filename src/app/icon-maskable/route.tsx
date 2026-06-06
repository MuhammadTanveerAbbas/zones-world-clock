import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "#18181b",
			}}
		>
			<svg width="380" height="380" viewBox="0 0 128 128" fill="none" xmlns="http://www.w3.org/2000/svg">
				<defs>
					<linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stop-color="#fafafa"/>
						<stop offset="100%" stop-color="#a1a1aa"/>
					</linearGradient>
				</defs>
				<g transform="translate(8,8) scale(0.875)">
					<circle cx="64" cy="64" r="50" stroke="rgba(250,250,250,0.2)" strokeWidth="1.5" />
					<ellipse cx="64" cy="64" rx="50" ry="20" stroke="rgba(250,250,250,0.25)" strokeWidth="1.2" />
					<ellipse cx="64" cy="64" rx="20" ry="50" stroke="rgba(250,250,250,0.25)" strokeWidth="1.2" />
					<ellipse cx="64" cy="64" rx="50" ry="12" stroke="rgba(250,250,250,0.12)" strokeWidth="0.8" />
					<ellipse cx="64" cy="64" rx="12" ry="50" stroke="rgba(250,250,250,0.12)" strokeWidth="0.8" />
					<circle cx="64" cy="64" r="30" fill="url(#g)" />
					<circle cx="64" cy="64" r="28" fill="#18181b" />
					<circle cx="64" cy="64" r="27" stroke="rgba(250,250,250,0.08)" strokeWidth="0.5" />
					<line x1="64" y1="37" x2="64" y2="41" stroke="url(#g)" strokeWidth="2.5" strokeLinecap="round" />
					<line x1="64" y1="87" x2="64" y2="83" stroke="url(#g)" strokeWidth="2.5" strokeLinecap="round" />
					<line x1="37" y1="64" x2="41" y2="64" stroke="url(#g)" strokeWidth="2.5" strokeLinecap="round" />
					<line x1="87" y1="64" x2="83" y2="64" stroke="url(#g)" strokeWidth="2.5" strokeLinecap="round" />
					<line x1="64" y1="64" x2="64" y2="46" stroke="url(#g)" strokeWidth="3" strokeLinecap="round" />
					<line x1="64" y1="64" x2="78" y2="64" stroke="url(#g)" strokeWidth="2.5" strokeLinecap="round" />
					<circle cx="64" cy="64" r="3.5" fill="url(#g)" />
					<circle cx="64" cy="64" r="1.5" fill="#18181b" />
				</g>
			</svg>
		</div>,
		{ width: 512, height: 512, headers: { "content-type": "image/png" } },
	);
}
