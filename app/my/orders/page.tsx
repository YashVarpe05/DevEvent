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
				return <CheckCircle2 className="text-emerald-500" size={16} />;
			case "refunded_full":
				return <XCircle className="text-orange-400" size={16} />;
			case "refunded_partial":
				return <XCircle className="text-amber-500" size={16} />;
			case "pending_payment":
				return <Clock className="text-amber-500" size={16} />;
			default:
				return <XCircle className="text-zinc-500" size={16} />;
		}
	};

	if (loading)
		return (
			<div className="p-8 text-center text-zinc-400">
				Loading your history...
			</div>
		);

	return (
		<main className="max-w-5xl mx-auto p-6 md:p-12 space-y-10">
			<div>
				<h1 className="text-4xl font-extrabold text-white flex items-center gap-3">
					<CreditCard className="text-primary-500" /> Order History
				</h1>
				<p className="text-zinc-500 mt-2">
					Manage your purchases and view receipts.
				</p>
			</div>

			<div className="grid gap-6">
				{orders.length === 0 ? (
					<div className="py-20 text-center border border-dashed border-zinc-800 rounded-3xl">
						<Ticket size={48} className="mx-auto text-zinc-700 mb-4" />
						<h3 className="text-xl font-bold text-zinc-300">No orders yet</h3>
						<p className="text-zinc-500 mb-6">
							Looks like you haven't bought any tickets yet.
						</p>
						<Link
							href="/events"
							className="text-primary-500 hover:text-primary-400 font-bold border-b border-primary-500 pb-1"
						>
							Browse Events
						</Link>
					</div>
				) : (
					orders.map((order) => (
						<div
							key={order._id}
							className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-8 hover:bg-zinc-900 transition-all group"
						>
							<div className="flex flex-col md:flex-row justify-between gap-6">
								<div className="space-y-4 flex-1">
									<div className="flex items-center gap-3">
										<span className="px-3 py-1 bg-zinc-800 rounded-full text-[10px] font-mono uppercase tracking-widest text-zinc-400 border border-zinc-700">
											#{order._id.substring(order._id.length - 8)}
										</span>
										<div className="flex items-center gap-1.5 px-3 py-1 bg-zinc-800 rounded-full text-xs font-bold text-white">
											{getStatusIcon(order.status)}
											{order.status.replace("_", " ")}
										</div>
									</div>

									<Link
										href={`/events/${order.eventId.slug}`}
										className="text-2xl font-bold text-white hover:text-primary-400 transition-colors block"
									>
										{order.eventId.title}
									</Link>

									<div className="space-y-2">
										{order.lineItems.map((item: any, i: number) => (
											<div
												key={i}
												className="flex justify-between items-center text-zinc-400 text-sm"
											>
												<span>
													{item.ticketNameSnapshot} × {item.quantity}
												</span>
												<span className="font-mono">
													${(item.subtotal / 100).toFixed(2)}
												</span>
											</div>
										))}
									</div>
								</div>

								<div className="flex flex-col justify-between items-start md:items-end gap-6 md:w-64 border-t md:border-t-0 md:border-l border-zinc-800 pt-6 md:pt-0 md:pl-8">
									<div className="text-right">
										<p className="text-xs text-zinc-500 uppercase tracking-wider mb-1">
											Total Paid
										</p>
										<p className="text-3xl font-black text-white">
											<span className="text-zinc-500 text-xl font-normal">
												$
											</span>
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
											className="w-full bg-white text-black hover:bg-zinc-200 font-bold py-3 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2 group-hover:scale-[1.02]"
										>
											View Tickets <ArrowRight size={18} />
										</Link>
									)}
								</div>
							</div>
						</div>
					))
				)}
			</div>
		</main>
	);
}
