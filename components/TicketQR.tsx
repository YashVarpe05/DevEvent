"use client";

import React, { useEffect, useState } from "react";
import QRCode from "qrcode";

type TicketQRProps = {
	ticketCode: string;
	size?: number;
};

// Renders a real scannable QR encoding the ticket code. Falls back to a
// monospace code if generation fails (offline / blocked).
export default function TicketQR({ ticketCode, size = 180 }: TicketQRProps) {
	const [dataUrl, setDataUrl] = useState<string | null>(null);

	useEffect(() => {
		let cancelled = false;
		QRCode.toDataURL(ticketCode, {
			width: size,
			margin: 1,
			errorCorrectionLevel: "M",
			color: { dark: "#000000", light: "#EDEAE1" },
		})
			.then((url) => {
				if (!cancelled) setDataUrl(url);
			})
			.catch((error) => {
				console.error("QR generation failed:", error);
			});
		return () => {
			cancelled = true;
		};
	}, [ticketCode, size]);

	if (!dataUrl) {
		return (
			<div
				style={{
					width: size,
					height: size,
					background: "#EDEAE1",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
					fontFamily: "var(--font-mono)",
					fontSize: "14px",
					color: "#000",
					padding: "12px",
					textAlign: "center",
					wordBreak: "break-all",
				}}
			>
				{ticketCode}
			</div>
		);
	}

	return (
		// eslint-disable-next-line @next/next/no-img-element
		<img
			src={dataUrl}
			alt={`QR code for ticket ${ticketCode}`}
			width={size}
			height={size}
			style={{ display: "block" }}
		/>
	);
}
