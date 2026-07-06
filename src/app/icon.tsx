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
				background: "#18181b",
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
					r="50"
					stroke="rgba(250,250,250,0.2)"
					strokeWidth="1.2"
				/>
				<ellipse
					cx="64"
					cy="64"
					rx="50"
					ry="20"
					stroke="rgba(250,250,250,0.25)"
					strokeWidth="1"
				/>
				<ellipse
					cx="64"
					cy="64"
					rx="20"
					ry="50"
					stroke="rgba(250,250,250,0.25)"
					strokeWidth="1"
				/>
				<circle cx="64" cy="64" r="30" fill="#fafafa" />
				<circle cx="64" cy="64" r="28" fill="#18181b" />
				<line
					x1="64"
					y1="37"
					x2="64"
					y2="41"
					stroke="#fafafa"
					strokeWidth="2.5"
					strokeLinecap="round"
				/>
				<line
					x1="64"
					y1="87"
					x2="64"
					y2="83"
					stroke="#fafafa"
					strokeWidth="2.5"
					strokeLinecap="round"
				/>
				<line
					x1="37"
					y1="64"
					x2="41"
					y2="64"
					stroke="#fafafa"
					strokeWidth="2.5"
					strokeLinecap="round"
				/>
				<line
					x1="87"
					y1="64"
					x2="83"
					y2="64"
					stroke="#fafafa"
					strokeWidth="2.5"
					strokeLinecap="round"
				/>
				<line
					x1="64"
					y1="64"
					x2="64"
					y2="46"
					stroke="#fafafa"
					strokeWidth="3"
					strokeLinecap="round"
				/>
				<line
					x1="64"
					y1="64"
					x2="78"
					y2="64"
					stroke="#fafafa"
					strokeWidth="2.5"
					strokeLinecap="round"
				/>
				<circle cx="64" cy="64" r="3" fill="#fafafa" />
			</svg>
		</div>,
		size,
	);
}
