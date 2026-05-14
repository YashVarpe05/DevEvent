"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Ticket, ArrowRight, Loader2 } from "lucide-react";
import Link from "next/link";

function SuccessContent() {
	const searchParams = useSearchParams();
	const orderId = searchParams.get("order_id");
	const sessionId = searchParams.get("session_id");
	const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

	useEffect(() => {
		if (sessionId) {
			// In a real app, we might poll an API to confirm the order is "paid" 
			// though webhooks typically handle the backend magic.
			setStatus("success");
		} else {
			setStatus("error");
		}
	}, [sessionId]);

	if (status === "loading") {
		return (
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px" }}>
				<Loader2 style={{ width: "48px", height: "48px", color: "var(--gold)", animation: "spin 1s linear infinite" }} />
				<p style={{ color: "var(--text-muted)", fontSize: "14px", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}>
					Confirming your order...
				</p>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "16px", textAlign: "center", padding: "0 16px" }}>
				<div style={{ width: "64px", height: "64px", background: "rgba(204,70,70,0.08)", border: "1px solid rgba(204,70,70,0.25)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--red)" }}>
					<Ticket style={{ width: "32px", height: "32px" }} />
				</div>
				<h1 style={{ fontFamily: "var(--font-display)", fontSize: "24px", fontWeight: 700, color: "var(--text-primary)" }}>
					Oops! Something went wrong.
				</h1>
				<p style={{ color: "var(--text-muted)", maxWidth: "400px", fontSize: "14px", lineHeight: 1.5 }}>
					We couldn't verify your checkout session. If you believe this is an error, please contact support.
				</p>
				<Link href="/" style={{ color: "var(--gold)", fontSize: "14px", marginTop: "8px", textDecoration: "none" }} className="hover:underline">
					Return to Home
				</Link>
			</div>
		);
	}

	return (
		<div className="animate-in fade-in zoom-in duration-500" style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "60vh", gap: "32px", textAlign: "center", padding: "0 16px" }}>
			<div style={{ position: "relative" }}>
				<div style={{ position: "absolute", inset: 0, background: "var(--green)", filter: "blur(40px)", opacity: 0.15, borderRadius: "50%" }} />
				<div style={{ position: "relative", width: "96px", height: "96px", background: "rgba(42,157,111,0.08)", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--green)", border: "1px solid rgba(42,157,111,0.25)" }}>
					<CheckCircle2 style={{ width: "48px", height: "48px" }} />
				</div>
			</div>
			
			<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
				<h1 style={{ fontFamily: "var(--font-display)", fontSize: "clamp(28px, 4vw, 36px)", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
					Payment Successful!
				</h1>
				<p style={{ color: "var(--text-secondary)", fontSize: "16px" }}>
					Your tickets are being issued and will arrive in your account shortly.
				</p>
			</div>

			<div style={{ width: "100%", maxWidth: "320px", marginTop: "16px" }}>
				<Link 
					href={`/my/registrations`}
					style={{
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						gap: "8px",
						width: "100%",
						background: "var(--text-primary)",
						color: "var(--bg-base)",
						fontFamily: "var(--font-mono)",
						fontWeight: 700,
						fontSize: "14px",
						textTransform: "uppercase",
						letterSpacing: "0.05em",
						padding: "16px",
						borderRadius: "var(--radius-lg)",
						textDecoration: "none",
						transition: "all 200ms ease",
					}}
					className="hover:opacity-90"
				>
					View My Tickets <ArrowRight style={{ width: "18px", height: "18px" }} />
				</Link>
			</div>

			<p style={{ fontSize: "11px", color: "var(--text-muted)", fontFamily: "var(--font-mono)", textTransform: "uppercase", letterSpacing: "0.1em", paddingTop: "32px" }}>
				Order ID: {orderId?.substring(0, 12)}...
			</p>
		</div>
	);
}

export default function CheckoutSuccessPage() {
	return (
		<main style={{ minHeight: "100dvh", background: "var(--bg-base)", display: "flex", alignItems: "center", justifyContent: "center" }}>
			<Suspense fallback={<Loader2 style={{ width: "24px", height: "24px", color: "var(--text-muted)", animation: "spin 1s linear infinite" }} />}>
				<SuccessContent />
			</Suspense>
		</main>
	);
}
