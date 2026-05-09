"use client";

import { useEffect, useState } from "react";
import {
	Ticket,
	Clock,
	CheckCircle2,
	XCircle,
	CreditCard,
	ArrowRight,
} from "lucide-react";
import Link from "next/link";

interface Order {
	_id: string;
	status: string;
	currency: string;
	amountTotal: number;
	createdAt: string;
	lineItems: Array<{
		ticketNameSnapshot: string;
		quantity: number;
		subtotal: number;
	}>;
	pricingSnapshot?: {
		platformFeeAmount: number;
	};
	eventId: {
		_id: string;
		title: string;
		slug: string;
	};
}

export default function MyOrdersPage() {
	const [orders, setOrders] = useState<any[]>([]);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const fetchOrders = async () => {
			try {
				const res = await fetch("/api/my/orders");
				const data = await res.json();
				if (data.orders) setOrders(data.orders);
			} catch (err) {
				console.error("Fetch orders error:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchOrders();
	}, []);

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "paid":
				return <CheckCircle2 style={{ color: "var(--green)" }} size={14} />;
			case "refunded_full":
				return <XCircle style={{ color: "var(--red)" }} size={14} />;
			case "refunded_partial":
				return <XCircle style={{ color: "var(--gold)" }} size={14} />;
			case "pending_payment":
				return <Clock style={{ color: "var(--gold)" }} size={14} />;
			default:
				return <XCircle style={{ color: "var(--text-muted)" }} size={14} />;
		}
	};

	if (loading)
		return (
			<div style={{ padding: "48px", textAlign: "center", color: "var(--text-muted)", minHeight: "100dvh", background: "var(--bg-base)" }}>
				Loading your history...
			</div>
		);

	return (
		<main style={{ background: "var(--bg-base)", minHeight: "100dvh", padding: "40px 24px" }}>
			<div style={{ maxWidth: "900px", margin: "0 auto" }}>
				<div>
					<span className="text-label">My Account</span>
					<h1
						style={{
							fontFamily: "var(--font-display)",
							fontSize: "clamp(24px, 3vw, 36px)",
							fontWeight: 600,
							color: "var(--text-primary)",
							display: "flex",
							alignItems: "center",
							gap: "12px",
							marginTop: "6px",
							marginBottom: "4px",
						}}
					>
						<CreditCard style={{ color: "var(--gold)", width: "28px", height: "28px" }} />
						Order{" "}
						<em style={{ color: "var(--gold)", fontStyle: "italic" }}>History</em>
					</h1>
					<p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
						Your purchases and receipts
					</p>
				</div>

				<div style={{ marginTop: "32px", display: "grid", gap: "16px" }}>
					{orders.length === 0 ? (
						<div
							style={{
								padding: "60px 24px",
								textAlign: "center",
								background: "var(--bg-surface)",
								border: "1px solid var(--border-dim)",
								borderRadius: "var(--radius-lg)",
							}}
						>
							<Ticket size={36} style={{ margin: "0 auto", color: "var(--text-muted)", marginBottom: "12px" }} />
							<h3 style={{ fontFamily: "var(--font-display)", fontSize: "18px", color: "var(--text-primary)" }}>
								No orders yet
							</h3>
							<p style={{ color: "var(--text-muted)", fontSize: "14px", marginTop: "6px", marginBottom: "20px" }}>
								Looks like you haven't bought any tickets yet.
							</p>
							<Link
								href="/events"
								style={{
									color: "var(--gold)",
									fontWeight: 600,
									fontSize: "14px",
									textDecoration: "none",
									borderBottom: "1px solid var(--gold)",
									paddingBottom: "2px",
								}}
							>
								Browse Events
							</Link>
						</div>
					) : (
						orders.map((order) => (
							<div
								key={order._id}
								style={{
									background: "var(--bg-surface)",
									border: "1px solid var(--border-dim)",
									borderRadius: "var(--radius-lg)",
									padding: "24px",
									transition: "all 200ms ease",
								}}
								className="group hover:translate-y-[-1px]"
							>
								<div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
									<div style={{ flex: 1 }}>
										{/* Order ID + Status */}
										<div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
											<span
												style={{
													fontFamily: "var(--font-mono)",
													fontSize: "10px",
													textTransform: "uppercase",
													letterSpacing: "0.08em",
													color: "var(--text-muted)",
													border: "1px solid var(--border-dim)",
													padding: "2px 8px",
													borderRadius: "var(--radius-sm)",
												}}
											>
												#{order._id.substring(order._id.length - 8)}
											</span>
											<span
												style={{
													display: "inline-flex",
													alignItems: "center",
													gap: "4px",
													fontFamily: "var(--font-mono)",
													fontSize: "10px",
													fontWeight: 600,
													textTransform: "uppercase",
													letterSpacing: "0.06em",
													color: "var(--text-primary)",
													background: "var(--bg-elevated)",
													border: "1px solid var(--border-dim)",
													padding: "2px 8px",
													borderRadius: "var(--radius-sm)",
												}}
											>
												{getStatusIcon(order.status)}
												{order.status.replace("_", " ")}
											</span>
										</div>

										{/* Event title */}
										<Link
											href={`/events/${order.eventId.slug}`}
											style={{
												fontFamily: "var(--font-display)",
												fontSize: "18px",
												fontWeight: 600,
												color: "var(--text-primary)",
												textDecoration: "none",
												display: "block",
												marginTop: "8px",
												transition: "color 160ms ease",
											}}
											className="hover:!text-gold"
										>
											{order.eventId.title}
										</Link>

										{/* Line items */}
										<div style={{ marginTop: "12px" }}>
											{order.lineItems.map((item: any, i: number) => (
												<div
													key={i}
													style={{
														display: "flex",
														justifyContent: "space-between",
														alignItems: "center",
														color: "var(--text-muted)",
														fontSize: "13px",
														padding: "4px 0",
													}}
												>
													<span style={{ fontFamily: "var(--font-body)" }}>
														{item.ticketNameSnapshot} × {item.quantity}
													</span>
													<span style={{ fontFamily: "var(--font-mono)" }}>
														${(item.subtotal / 100).toFixed(2)}
													</span>
												</div>
											))}
										</div>
									</div>

									{/* Total + action */}
									<div
										style={{
											display: "flex",
											justifyContent: "space-between",
											alignItems: "center",
											borderTop: "1px solid var(--border-dim)",
											paddingTop: "16px",
										}}
									>
										<div>
											<p style={{ fontFamily: "var(--font-body)", fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.12em", color: "var(--text-muted)", marginBottom: "2px" }}>
												Total Paid
											</p>
											<p style={{ fontFamily: "var(--font-mono)", fontSize: "22px", fontWeight: 700, color: "var(--text-primary)" }}>
												<span style={{ color: "var(--text-muted)", fontSize: "16px", fontWeight: 400 }}>$</span>
												{(
													(order.lineItems.reduce(
														(acc: number, item: any) =>
															acc + (item.subtotal || 0),
														0,
													) +
														(order.pricingSnapshot?.platformFeeAmount || 0)) /
													100
												).toFixed(2)}
											</p>
										</div>

										{order.status === "paid" && (
											<Link
												href={`/my/registrations`}
												style={{
													display: "inline-flex",
													alignItems: "center",
													gap: "6px",
													background: "var(--gold)",
													color: "var(--text-inverse)",
													fontWeight: 600,
													fontSize: "13px",
													padding: "10px 20px",
													borderRadius: "var(--radius-md)",
													textDecoration: "none",
													transition: "background 160ms ease",
												}}
											>
												View Tickets <ArrowRight size={15} />
											</Link>
										)}
									</div>
								</div>
							</div>
						))
					)}
				</div>
			</div>
		</main>
	);
}
