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
		<main className="min-h-screen bg-black text-white px-4 py-20">
			<div className="mx-auto max-w-2xl rounded-3xl border border-zinc-800 bg-zinc-950 p-8 text-center">
				<div className="mb-6 flex justify-center">
					{state === "paid" ? (
						<CheckCircle2 className="h-16 w-16 text-emerald-500" />
					) : state === "loading" || state === "processing" ? (
						<Loader2 className="h-16 w-16 animate-spin text-zinc-400" />
					) : (
						<Ticket className="h-16 w-16 text-amber-400" />
					)}
				</div>
				<h1 className="text-3xl font-bold">{title}</h1>
				<p className="mt-3 text-zinc-400">
					{state === "paid"
						? "Your tickets are confirmed and available in your account."
						: "Webhook confirmation may take a few moments. Refresh if needed."}
				</p>

				<div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
					<Link
						href="/my/orders"
						className="rounded-xl border border-zinc-700 px-5 py-3 text-sm font-semibold hover:bg-zinc-900"
					>
						View my orders
					</Link>
					<Link
						href="/my/registrations"
						className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
					>
						View my tickets
					</Link>
				</div>

				<p className="mt-6 text-xs text-zinc-500">Order: {orderId}</p>
				{sessionId && (
					<p className="text-xs text-zinc-600">Session: {sessionId}</p>
				)}
			</div>
		</main>
	);
}
