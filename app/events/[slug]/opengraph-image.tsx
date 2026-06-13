import { ImageResponse } from "next/og";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import "@/database/organizer-profile.model";

export const alt = "Event details";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Branded share card for event links — what WhatsApp / X / LinkedIn render.
export default async function OgImage({ params }: { params: Promise<{ slug: string }> }) {
	const { slug } = await params;

	await connectDB();
	const event = await Event.findOne({
		slug,
		deletedAt: null,
		status: "published",
		visibility: { $in: ["public", "unlisted"] },
	})
		.populate({ path: "organizerProfileId", select: "displayName" })
		.lean();

	const title = event?.title || "Event not found";
	const host =
		(event?.organizerProfileId as { displayName?: string } | null)?.displayName ||
		"DevEvent";
	const cover = event?.coverImageUrl;

	const dateStr = event
		? new Date(event.startAt).toLocaleDateString("en-US", {
				weekday: "short",
				month: "short",
				day: "numeric",
				year: "numeric",
				timeZone: event.timezone || "UTC",
			})
		: "";
	const locationStr = event
		? event.eventType === "online"
			? "Online event"
			: [event.location?.city, event.location?.country].filter(Boolean).join(", ") ||
				"In-person event"
		: "";
	const priceLabel = event
		? event.isPaid
			? `${event.currency === "INR" ? "₹" : event.currency === "EUR" ? "€" : event.currency === "GBP" ? "£" : "$"}${event.basePrice ?? ""}`
			: "Free"
		: "";

	return new ImageResponse(
		(
			<div
				style={{
					width: "100%",
					height: "100%",
					display: "flex",
					flexDirection: "column",
					justifyContent: "flex-end",
					backgroundColor: "#0a0a0b",
					position: "relative",
					fontFamily: "sans-serif",
				}}
			>
				{cover ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={cover}
						alt=""
						width={1200}
						height={630}
						style={{
							position: "absolute",
							top: 0,
							left: 0,
							width: "1200px",
							height: "630px",
							objectFit: "cover",
							opacity: 0.35,
						}}
					/>
				) : null}
				<div
					style={{
						position: "absolute",
						top: 0,
						left: 0,
						width: "1200px",
						height: "630px",
						background:
							"linear-gradient(to bottom, rgba(10,10,11,0.2) 0%, rgba(10,10,11,0.85) 75%, rgba(10,10,11,0.98) 100%)",
						display: "flex",
					}}
				/>

				<div
					style={{
						display: "flex",
						flexDirection: "column",
						padding: "64px 72px",
						position: "relative",
					}}
				>
					<div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "28px" }}>
						<div
							style={{
								display: "flex",
								backgroundColor: "#ff6b35",
								color: "#0a0a0b",
								fontSize: "26px",
								fontWeight: 700,
								padding: "8px 24px",
								borderRadius: "8px",
							}}
						>
							{priceLabel}
						</div>
						<div style={{ display: "flex", color: "#9b9ba3", fontSize: "28px" }}>
							{dateStr}
							{locationStr ? ` · ${locationStr}` : ""}
						</div>
					</div>

					<div
						style={{
							display: "flex",
							color: "#f5f5f7",
							fontSize: title.length > 60 ? "56px" : "68px",
							fontWeight: 700,
							lineHeight: 1.1,
							maxWidth: "1000px",
						}}
					>
						{title.length > 90 ? `${title.slice(0, 88)}…` : title}
					</div>

					<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "36px" }}>
						<div style={{ display: "flex", color: "#9b9ba3", fontSize: "30px" }}>
							Hosted by {host}
						</div>
						<div style={{ display: "flex", alignItems: "baseline" }}>
							<div style={{ display: "flex", color: "#f5f5f7", fontSize: "34px", fontWeight: 700 }}>Dev</div>
							<div style={{ display: "flex", color: "#ff6b35", fontSize: "34px", fontWeight: 700, fontStyle: "italic" }}>Event</div>
						</div>
					</div>
				</div>
			</div>
		),
		{ ...size },
	);
}
