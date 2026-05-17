"use client";

import React from "react";

interface PaymentMethodSelectorProps {
	selectedMethod: "razorpay" | "stripe";
	onSelect: (method: "razorpay" | "stripe") => void;
	currency: string;
}

export default function PaymentMethodSelector({
	selectedMethod,
	onSelect,
	currency,
}: PaymentMethodSelectorProps) {
	return (
		<div style={{ display: "flex", gap: "10px", marginBottom: "8px" }}>
			{/* Razorpay Card */}
			<button
				type="button"
				onClick={() => onSelect("razorpay")}
				style={{
					flex: 1,
					padding: "14px 16px",
					borderRadius: "var(--radius-md, 8px)",
					border: selectedMethod === "razorpay"
						? "1px solid #FF6B35"
						: "1px solid var(--border-dim)",
					backgroundColor: selectedMethod === "razorpay"
						? "rgba(255,107,53,0.06)"
						: "var(--bg-overlay)",
					cursor: "pointer",
					textAlign: "left",
					transition: "all 150ms ease",
					position: "relative",
				}}
			>
				{/* Recommended badge */}
				<span
					style={{
						position: "absolute",
						top: "-8px",
						right: "10px",
						backgroundColor: "#FF6B35",
						color: "#fff",
						fontSize: "9px",
						fontWeight: 700,
						letterSpacing: "0.08em",
						textTransform: "uppercase",
						padding: "2px 8px",
						borderRadius: "4px",
						lineHeight: "16px",
					}}
				>
					RECOMMENDED
				</span>
				<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
					<span
						style={{
							fontSize: "14px",
							fontWeight: 700,
							color: selectedMethod === "razorpay" ? "#FF6B35" : "var(--text-primary)",
							fontFamily: "var(--font-display)",
						}}
					>
						UPI / Cards
					</span>
				</div>
				<p
					style={{
						fontSize: "11px",
						color: "var(--text-muted)",
						margin: 0,
						fontFamily: "var(--font-mono)",
						letterSpacing: "0.02em",
					}}
				>
					GPay · PhonePe · Paytm · Cards
				</p>
			</button>

			{/* Stripe Card */}
			<button
				type="button"
				onClick={() => onSelect("stripe")}
				style={{
					flex: 1,
					padding: "14px 16px",
					borderRadius: "var(--radius-md, 8px)",
					border: selectedMethod === "stripe"
						? "1px solid #FF6B35"
						: "1px solid var(--border-dim)",
					backgroundColor: selectedMethod === "stripe"
						? "rgba(255,107,53,0.06)"
						: "var(--bg-overlay)",
					cursor: "pointer",
					textAlign: "left",
					transition: "all 150ms ease",
				}}
			>
				<div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
					<span
						style={{
							fontSize: "14px",
							fontWeight: 700,
							color: selectedMethod === "stripe" ? "#FF6B35" : "var(--text-primary)",
							fontFamily: "var(--font-display)",
						}}
					>
						International Card
					</span>
				</div>
				<p
					style={{
						fontSize: "11px",
						color: "var(--text-muted)",
						margin: 0,
						fontFamily: "var(--font-mono)",
						letterSpacing: "0.02em",
					}}
				>
					Visa · Mastercard · Amex
				</p>
			</button>
		</div>
	);
}
