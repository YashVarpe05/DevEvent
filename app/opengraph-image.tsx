import { ImageResponse } from "next/og";

export const alt = "DevEvent — India's Developer Event Platform";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Site-wide default share card (homepage + any page without its own OG image).
export default function OgImage() {
	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "center",
					padding: "80px",
					backgroundColor: "#0A0A0B",
					backgroundImage:
						"radial-gradient(ellipse 80% 60% at 50% 0%, rgba(255,107,53,0.12), transparent)",
					fontFamily: "sans-serif",
				}}
			>
				<div style={{ display: "flex", alignItems: "baseline", marginBottom: "32px" }}>
					<div style={{ display: "flex", color: "#f5f5f7", fontSize: "44px", fontWeight: 700 }}>Dev</div>
					<div style={{ display: "flex", color: "#FF6B35", fontSize: "44px", fontWeight: 700, fontStyle: "italic" }}>Event</div>
				</div>
				<div
					style={{
						display: "flex",
						color: "#f5f5f7",
						fontSize: "68px",
						fontWeight: 700,
						lineHeight: 1.1,
						maxWidth: "1000px",
						letterSpacing: "-0.02em",
					}}
				>
					Discover hackathons, meetups &amp; workshops.
				</div>
				<div style={{ display: "flex", color: "#9b9ba3", fontSize: "30px", marginTop: "28px" }}>
					Book your spot in seconds. India&apos;s developer event platform.
				</div>
				<div style={{ display: "flex", marginTop: "44px" }}>
					<div
						style={{
							display: "flex",
							backgroundColor: "#FF6B35",
							color: "#0A0A0B",
							fontSize: "26px",
							fontWeight: 700,
							padding: "14px 36px",
							borderRadius: "10px",
						}}
					>
						devevents.dev
					</div>
				</div>
			</div>
		),
		{ ...size },
	);
}
