"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, Ticket } from "lucide-react";

type OrderState = "loading" | "paid" | "processing" | "failed" | "missing";

export default function OrderConfirmationPage() {
	const params = useParams();
	const searchParams = useSearchParams();
	const orderId = params.id as string;
	const [state, setState] = useState<OrderState>("loading");
	const sessionId = searchParams.get("session_id");

	useEffect(() => {
		let cancelled = false;
		let attempts = 0;
		let timer: ReturnType<typeof setTimeout> | null = null;

		const checkOrder = async () => {
			attempts += 1;
			try {
				const response = await fetch(`/api/orders/${orderId}`);
				if (!response.ok) {
					if (!cancelled) {
						setState("missing");
					}
					return;
				}

				const data = await response.json();
				const status = data.order?.status;
				if (status === "paid") {
					if (!cancelled) {
						setState("paid");
					}
					return;
				}
				if (
					["pending_payment", "payment_processing"].includes(status) &&
					attempts < 10
				) {
					if (!cancelled) {
						setState("processing");
						timer = setTimeout(checkOrder, 1500);
					}
					return;
				}

				if (!cancelled) {
					setState(status === "payment_failed" ? "failed" : "processing");
				}
			} catch {
				if (!cancelled) {
					setState("failed");
				}
			}
		};

		checkOrder();
		return () => {
			cancelled = true;
			if (timer) {
				clearTimeout(timer);
			}
		};
	}, [orderId]);

	const title = useMemo(() => {
		if (state === "paid") return "Payment successful";
		if (state === "processing") return "Processing payment";
		if (state === "failed") return "Payment not completed";
		if (state === "missing") return "Order not found";
		return "Checking payment status";
	}, [state]);

	return (
		<main style={{ minHeight: "100dvh", background: "var(--bg-base)", color: "var(--text-primary)", padding: "80px 16px" }}>
			<div 
				style={{ 
					margin: "0 auto", 
					maxWidth: "600px", 
					background: "var(--bg-surface)", 
					border: "1px solid var(--border-dim)", 
					borderRadius: "var(--radius-xl)", 
					padding: "48px 32px", 
					textAlign: "center",
					boxShadow: "0 20px 40px -20px rgba(0,0,0,0.5)"
				}}
			>
				<div style={{ marginBottom: "24px", display: "flex", justifyContent: "center" }}>
					{state === "paid" ? (
						<CheckCircle2 style={{ width: "64px", height: "64px", color: "var(--green)" }} />
					) : state === "loading" || state === "processing" ? (
						<Loader2 style={{ width: "64px", height: "64px", color: "var(--text-muted)", animation: "spin 1s linear infinite" }} />
					) : (
						<Ticket style={{ width: "64px", height: "64px", color: "var(--gold)" }} />
					)}
				</div>
				
				<h1 style={{ fontFamily: "var(--font-display)", fontSize: "28px", fontWeight: 700, color: "var(--text-primary)" }}>
					{title}
				</h1>
				
				<p style={{ marginTop: "12px", color: "var(--text-secondary)", fontSize: "15px", lineHeight: 1.5 }}>
					{state === "paid"
						? "Your tickets are confirmed and available in your account."
						: "Webhook confirmation may take a few moments. Refresh if needed."}
				</p>

				<div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "12px", alignItems: "center" }}>
					<div style={{ display: "flex", flexDirection: "row", gap: "12px", width: "100%", justifyContent: "center", flexWrap: "wrap" }}>
						<Link
							href="/my/orders"
							style={{
								padding: "12px 24px",
								border: "1px solid var(--border)",
								borderRadius: "var(--radius-lg)",
								fontSize: "13px",
								fontWeight: 600,
								color: "var(--text-secondary)",
								textDecoration: "none",
								transition: "all 160ms ease"
							}}
							className="hover:text-white hover:border-white"
						>
							View my orders
						</Link>
						<Link
							href="/my/registrations"
							style={{
								padding: "12px 24px",
								background: "var(--text-primary)",
								color: "var(--bg-base)",
								borderRadius: "var(--radius-lg)",
								fontSize: "13px",
								fontWeight: 700,
								textDecoration: "none",
								transition: "all 160ms ease"
							}}
							className="hover:opacity-90"
						>
							View my tickets
						</Link>
					</div>
				</div>

				<div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid var(--border-dim)" }}>
					<p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
						Order: {orderId}
					</p>
					{sessionId && (
						<p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", marginTop: "4px" }}>
							Session: {sessionId}
						</p>
					)}
				</div>
			</div>
		</main>
	);
}
