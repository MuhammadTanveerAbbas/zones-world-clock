import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
	return new ImageResponse(
		<div
			style={{
				width: "100%",
				height: "100%",
				display: "flex",
				alignItems: "center",
				justifyContent: "center",
				background: "#0a0a0a",
				borderRadius: "20%",
			}}
		>
			<svg
				width="28"
				height="28"
				viewBox="0 0 128 128"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle
					cx="64"
					cy="64"
					r="48"
					stroke="#fafafa"
					strokeWidth="3"
					fill="none"
					opacity="0.3"
				/>
				<ellipse
					cx="64"
					cy="64"
					rx="48"
					ry="24"
					stroke="#fafafa"
					strokeWidth="2"
					fill="none"
					opacity="0.3"
				/>
				<ellipse
					cx="64"
					cy="64"
					rx="24"
					ry="48"
					stroke="#fafafa"
					strokeWidth="2"
					fill="none"
					opacity="0.3"
				/>
				<line
					x1="16"
					y1="64"
					x2="112"
					y2="64"
					stroke="#fafafa"
					strokeWidth="2"
					opacity="0.3"
				/>
				<circle cx="64" cy="64" r="32" fill="#fafafa" />
				<circle cx="64" cy="64" r="30" fill="#0a0a0a" />
				<circle cx="64" cy="38" r="2.5" fill="#fafafa" />
				<circle cx="64" cy="90" r="2.5" fill="#fafafa" />
				<circle cx="90" cy="64" r="2.5" fill="#fafafa" />
				<circle cx="38" cy="64" r="2.5" fill="#fafafa" />
				<line
					x1="64"
					y1="64"
					x2="64"
					y2="48"
					stroke="#fafafa"
					strokeWidth="4"
					strokeLinecap="round"
				/>
				<line
					x1="64"
					y1="64"
					x2="78"
					y2="64"
					stroke="#fafafa"
					strokeWidth="3.5"
					strokeLinecap="round"
				/>
				<circle cx="64" cy="64" r="4" fill="#fafafa" />
			</svg>
		</div>,
		{
			...size,
		},
	);
}
