"use client";

import React, { useEffect, useState } from "react";
import { Plus, Minus, ArrowRight, Loader2 } from "lucide-react";

function getCurrencySymbol(currency: string): string {
  const symbols: Record<string, string> = {
    INR: "₹",
    USD: "$",
    EUR: "€",
    GBP: "£",
  }
  return symbols[currency?.toUpperCase()] 
    ?? currency?.toUpperCase() ?? "$"
}

interface TicketSelectorProps {
	eventId: string;
	currency: string;
}

interface TicketOption {
	_id: string;
	name: string;
	price: number;
	currency?: string;
	quantitySold: number;
	quantityTotal: number;
}

interface PricingBreakdown {
	subtotal: number;
	discountAmount: number;
	platformFeeAmount: number;
	totalBuyerPayable: number;
}

export default function TicketSelector({
	eventId,
	currency,
}: TicketSelectorProps) {
	const [tickets, setTickets] = useState<TicketOption[]>([]);
	const [selection, setSelection] = useState<Record<string, number>>({});
	const [loading, setLoading] = useState(true);
	const [isCheckingOut, setIsCheckingOut] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [pricing, setPricing] = useState<PricingBreakdown | null>(null);

	const [promoCodeInput, setPromoCodeInput] = useState("");
	const [appliedPromo, setAppliedPromo] = useState<string | null>(null);
	const [promoDiscount, setPromoDiscount] = useState<{
		type: "percentage" | "fixed";
		value: number;
	} | null>(null);
	const [promoError, setPromoError] = useState<string | null>(null);
	const [isValidatingPromo, setIsValidatingPromo] = useState(false);

	useEffect(() => {
		const fetchTickets = async () => {
			try {
				const res = await fetch(`/api/events/${eventId}/tickets`);
				const data = await res.json();
				if (data.tickets) {
					setTickets(data.tickets);
				}
			} catch (err) {
				console.error("Fetch tickets error:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchTickets();
	}, [eventId]);

	const updateQuantity = (id: string, delta: number, max: number) => {
		setSelection((prev) => {
			const current = prev[id] || 0;
			const next = Math.max(0, Math.min(max, current + delta));
			return { ...prev, [id]: next };
		});
	};

	const totalItems = Object.values(selection).reduce((a, b) => a + b, 0);
	const totalPrice = tickets.reduce(
		(acc, t) => acc + t.price * (selection[t._id] || 0),
		0,
	);

	useEffect(() => {
		const feeRate = Number(
			process.env.NEXT_PUBLIC_PLATFORM_FEE_PREVIEW_RATE ?? "0.05",
		);
		const feeFixed = Number(
			process.env.NEXT_PUBLIC_PLATFORM_FEE_PREVIEW_FIXED_MINOR ?? "50",
		);
		if (totalPrice <= 0) {
			setPricing(null);
			return;
		}

		let discountAmount = 0;
		if (promoDiscount) {
			if (promoDiscount.type === "percentage") {
				discountAmount = Math.round(totalPrice * (promoDiscount.value / 100));
			} else {
				discountAmount = promoDiscount.value;
			}
		}
		discountAmount = Math.min(discountAmount, totalPrice);
		const discountedSubtotal = Math.max(0, totalPrice - discountAmount);

		const platformFeeAmount =
			discountedSubtotal > 0
				? Math.round(discountedSubtotal * feeRate) + feeFixed
				: 0;
		setPricing({
			subtotal: totalPrice,
			discountAmount,
			platformFeeAmount,
			totalBuyerPayable: discountedSubtotal + platformFeeAmount,
		});
	}, [totalPrice, promoDiscount]);

	const handleApplyPromo = async () => {
		if (!promoCodeInput.trim()) return;
		setIsValidatingPromo(true);
		setPromoError(null);
		try {
			const res = await fetch("/api/checkout/validate-promo", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ eventId, code: promoCodeInput }),
			});
			const data = await res.json();
			if (!res.ok)
				throw new Error(data.error || "Failed to validate promo code");
			setPromoDiscount(data.discount);
			setAppliedPromo(promoCodeInput.toUpperCase());
			setPromoCodeInput("");
		} catch (err: any) {
			setPromoError(err.message);
			setPromoDiscount(null);
			setAppliedPromo(null);
		} finally {
			setIsValidatingPromo(false);
		}
	};

	const handleRemovePromo = () => {
		setAppliedPromo(null);
		setPromoDiscount(null);
		setPromoCodeInput("");
		setPromoError(null);
	};

	const handleCheckout = async () => {
		if (totalItems === 0) return;

		setIsCheckingOut(true);
		setError(null);

		try {
			const selectedItems = Object.entries(selection)
				.filter(([, qty]) => qty > 0)
				.map(([id, qty]) => ({ ticketTypeId: id, quantity: qty }));

			const idempotencyKey = (
				globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`
			).toString();

			const referralCode =
				localStorage.getItem(`event_ref_${eventId}`) || undefined;

			const payload: any = {
				eventId,
				items: selectedItems,
				idempotencyKey,
			};
			if (referralCode) payload.referralCode = referralCode;
			if (appliedPromo) payload.promoCode = appliedPromo;

			const res = await fetch(`/api/checkout/create-session`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			const data = await res.json();
			if (!res.ok) throw new Error(data.error || "Checkout failed");

			if (data.url) {
				window.location.href = data.url;
			}
		} catch (err: unknown) {
			setError(err instanceof Error ? err.message : "Checkout failed");
			setIsCheckingOut(false);
		}
	};

	if (loading)
		return (
			<div className="flex justify-center p-4">
				<Loader2 className="animate-spin text-[var(--gold)]" />
			</div>
		);

	if (tickets.length === 0)
		return (
			<p style={{ color: "var(--text-muted)", fontStyle: "italic", textAlign: "center", padding: "16px 0", fontSize: "14px" }}>
				No tickets available.
			</p>
		);

	return (
		<div className="space-y-4">
			<div className="space-y-2 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
				{tickets.map((ticket) => {
					const qty = selection[ticket._id] || 0;
					const isSoldOut = ticket.quantitySold >= ticket.quantityTotal;

					return (
						<div
							key={ticket._id}
							className="transition-all"
							style={{
								padding: "12px",
								borderRadius: "var(--radius-md, 8px)",
								border: qty > 0 ? "1px solid var(--border-gold)" : "1px solid var(--border-dim)",
								backgroundColor: qty > 0 ? "var(--gold-subtle)" : "var(--bg-overlay)",
							}}
						>
							<div className="flex justify-between items-start mb-2">
								<div>
									<h4 style={{ fontFamily: "var(--font-display)", fontWeight: 600, color: "var(--text-primary)", fontSize: "15px" }}>{ticket.name}</h4>
									<p style={{ fontFamily: "var(--font-mono)", fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
										{getCurrencySymbol(ticket.currency || currency)}{(ticket.price / 100).toFixed(2)}
									</p>
								</div>
								<div className="flex items-center gap-3 px-2 py-1" style={{ backgroundColor: "rgba(18,18,20,0.5)", borderRadius: "var(--radius-sm, 6px)", border: "1px solid var(--border-dim)" }}>
									<button
										onClick={() => updateQuantity(ticket._id, -1, 10)}
										disabled={qty === 0 || isSoldOut}
										className="p-1 hover:text-[var(--gold)] transition-colors disabled:opacity-30 text-[var(--text-muted)]"
									>
										<Minus size={14} />
									</button>
									<span style={{ fontFamily: "var(--font-mono)", fontSize: "14px", fontWeight: 700, minWidth: "1.2rem", textAlign: "center", color: "var(--text-primary)" }}>
										{isSoldOut ? 0 : qty}
									</span>
									<button
										onClick={() =>
											updateQuantity(
												ticket._id,
												1,
												Math.min(
													10,
													ticket.quantityTotal - ticket.quantitySold,
												),
											)
										}
										disabled={isSoldOut || qty >= 10}
										className="p-1 hover:text-[var(--gold)] transition-colors disabled:opacity-30 text-[var(--text-muted)]"
									>
										<Plus size={14} />
									</button>
								</div>
							</div>
							{isSoldOut && (
								<p style={{ fontSize: "10px", color: "#EF4444", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}>
									Sold Out
								</p>
							)}
						</div>
					);
				})}
			</div>

			{totalItems > 0 && (
				<div style={{ paddingTop: "16px", borderTop: "1px solid var(--border-dim)" }}>
					{appliedPromo ? (
						<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", padding: "12px", borderRadius: "var(--radius-sm, 6px)" }}>
							<div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#10B981" }}>
								<span style={{ fontWeight: 600, textTransform: "uppercase", fontSize: "13px", letterSpacing: "0.05em" }}>{appliedPromo}</span>
								<span style={{ fontSize: "13px" }}>applied</span>
							</div>
							<button
								onClick={handleRemovePromo}
								className="hover:text-white transition-colors"
								style={{ fontSize: "13px", color: "var(--text-muted)" }}
							>
								Remove
							</button>
						</div>
					) : (
						<div>
							<div className="flex gap-2">
								<input
									type="text"
									placeholder="Promo Code"
									value={promoCodeInput}
									onChange={(e) => setPromoCodeInput(e.target.value)}
									className="flex-1 focus:outline-none transition-colors"
									style={{
										backgroundColor: "var(--bg-overlay)",
										border: "1px solid var(--border-dim)",
										borderRadius: "var(--radius-sm, 6px)",
										padding: "8px 16px",
										color: "var(--text-primary)",
										fontSize: "14px",
										fontFamily: "var(--font-mono)"
									}}
								/>
								<button
									onClick={handleApplyPromo}
									disabled={!promoCodeInput.trim() || isValidatingPromo}
									className="hover:opacity-80 transition-opacity disabled:opacity-50 flex items-center justify-center min-w-[80px]"
									style={{
										backgroundColor: "var(--bg-surface)",
										border: "1px solid var(--border-dim)",
										borderRadius: "var(--radius-sm, 6px)",
										color: "var(--text-primary)",
										fontWeight: 600,
										padding: "8px 16px",
										fontSize: "13px",
										letterSpacing: "0.05em",
										textTransform: "uppercase"
									}}
								>
									{isValidatingPromo ? (
										<Loader2 className="animate-spin w-4 h-4" />
									) : (
										"Apply"
									)}
								</button>
							</div>
							{promoError && (
								<p style={{ color: "#EF4444", fontSize: "12px", marginTop: "8px", marginLeft: "4px" }}>{promoError}</p>
							)}
						</div>
					)}
				</div>
			)}

			{error && (
				<p style={{ fontSize: "12px", color: "#EF4444", backgroundColor: "rgba(239,68,68,0.1)", padding: "8px", borderRadius: "4px", border: "1px solid rgba(239,68,68,0.2)" }}>
					{error}
				</p>
			)}

			<button
				onClick={handleCheckout}
				disabled={totalItems === 0 || isCheckingOut}
				className="w-full flex items-center justify-center gap-2 group hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
				style={{
					backgroundColor: 'var(--gold)',
					color: 'var(--bg-void)',
					fontFamily: 'var(--font-mono)',
					fontSize: '13px',
					fontWeight: 600,
					textTransform: 'uppercase',
					letterSpacing: '0.05em',
					padding: '16px 24px',
					borderRadius: 'var(--radius-sm, 6px)',
					border: 'none',
					transition: 'all 0.2s ease',
					marginTop: "8px"
				}}
			>
				{isCheckingOut ? (
					<Loader2 className="animate-spin w-5 h-5" />
				) : (
					<>
						<span>Proceed to Checkout</span>
						<ArrowRight
							size={16}
							className="group-hover:translate-x-1 transition-transform"
						/>
					</>
				)}
			</button>

			{totalItems > 0 && (
				<div style={{ textAlign: "center", paddingTop: "8px" }}>
					<p style={{ fontSize: "13px", color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
						Subtotal:{" "}
						<span style={{ color: "var(--text-primary)", fontWeight: 700 }}>
							{getCurrencySymbol(currency)}{(totalPrice / 100).toFixed(2)}
						</span>
					</p>
					{pricing && (
						<>
							{pricing.discountAmount > 0 && (
								<p style={{ fontSize: "13px", color: "#10B981", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
									Discount:{" "}
									<span style={{ fontWeight: 700 }}>
										-{getCurrencySymbol(currency)}{(pricing.discountAmount / 100).toFixed(2)}
									</span>
								</p>
							)}
							<p style={{ fontSize: "12px", color: "var(--text-muted)", marginTop: "4px" }}>
								Platform fee: {getCurrencySymbol(currency)}{(pricing.platformFeeAmount / 100).toFixed(2)}
							</p>
							<p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px", fontFamily: "var(--font-mono)" }}>
								Total payable:{" "}
								<span style={{ color: "var(--gold)", fontWeight: 700 }}>
									{getCurrencySymbol(currency)}{(pricing.totalBuyerPayable / 100).toFixed(2)}
								</span>
							</p>
						</>
					)}
				</div>
			)}
		</div>
	);
}
