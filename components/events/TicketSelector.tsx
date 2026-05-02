"use client";

import React, { useEffect, useState } from "react";
import { Plus, Minus, ArrowRight, Loader2 } from "lucide-react";

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

		const platformFeeAmount = Math.round(totalPrice * feeRate) + feeFixed;
		setPricing({
			subtotal: totalPrice,
			platformFeeAmount,
			totalBuyerPayable: totalPrice + platformFeeAmount,
		});
	}, [totalPrice]);

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

			const referralCode = localStorage.getItem(`event_ref_${eventId}`) || undefined;

			const res = await fetch(`/api/checkout/create-session`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ eventId, items: selectedItems, idempotencyKey, ...(referralCode && { referralCode }) }),
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
				<Loader2 className="animate-spin text-zinc-500" />
			</div>
		);

	if (tickets.length === 0)
		return (
			<p className="text-zinc-500 italic text-center py-4">
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
							className={`p-3 rounded-lg border ${qty > 0 ? "border-primary-500 bg-primary-500/5" : "border-zinc-800 bg-zinc-900/50"} transition-all`}
						>
							<div className="flex justify-between items-start mb-2">
								<div>
									<h4 className="font-semibold text-white">{ticket.name}</h4>
									<p className="text-sm text-zinc-400">
										${(ticket.price / 100).toFixed(2)}{" "}
										{(ticket.currency || currency).toUpperCase()}
									</p>
								</div>
								<div className="flex items-center gap-3 bg-zinc-800 px-2 py-1 rounded-lg">
									<button
										onClick={() => updateQuantity(ticket._id, -1, 10)}
										disabled={qty === 0 || isSoldOut}
										className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
									>
										<Minus size={14} />
									</button>
									<span className="text-sm font-bold min-w-[1.2rem] text-center text-white">
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
										className="p-1 text-zinc-400 hover:text-white disabled:opacity-30"
									>
										<Plus size={14} />
									</button>
								</div>
							</div>
							{isSoldOut && (
								<p className="text-[10px] text-red-500 font-bold uppercase tracking-wider">
									Sold Out
								</p>
							)}
						</div>
					);
				})}
			</div>

			{error && (
				<p className="text-xs text-red-500 bg-red-500/10 p-2 rounded border border-red-500/20">
					{error}
				</p>
			)}

			<button
				onClick={handleCheckout}
				disabled={totalItems === 0 || isCheckingOut}
				className="w-full bg-primary-600 hover:bg-primary-500 disabled:opacity-50 disabled:bg-zinc-800 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 group"
			>
				{isCheckingOut ? (
					<Loader2 className="animate-spin w-5 h-5" />
				) : (
					<>
						<span>Proceed to Checkout</span>
						<ArrowRight
							size={18}
							className="group-hover:translate-x-1 transition-transform"
						/>
					</>
				)}
			</button>

			{totalItems > 0 && (
				<div className="text-center pt-2">
					<p className="text-sm text-zinc-400">
						Subtotal:{" "}
						<span className="text-white font-bold">
							${(totalPrice / 100).toFixed(2)}
						</span>
					</p>
					{pricing && (
						<>
							<p className="text-xs text-zinc-500 mt-1">
								Platform fee: ${(pricing.platformFeeAmount / 100).toFixed(2)}
							</p>
							<p className="text-sm text-zinc-300 mt-1">
								Total payable:{" "}
								<span className="text-white font-bold">
									${(pricing.totalBuyerPayable / 100).toFixed(2)}
								</span>
							</p>
						</>
					)}
				</div>
			)}
		</div>
	);
}
