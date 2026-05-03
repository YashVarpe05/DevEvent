"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
			<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
				<Loader2 className="w-12 h-12 text-primary-500 animate-spin" />
				<p className="text-zinc-400 animate-pulse">Confirming your order...</p>
			</div>
		);
	}

	if (status === "error") {
		return (
			<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4 text-center px-4">
				<div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center text-red-500">
					<Ticket size={32} />
				</div>
				<h1 className="text-2xl font-bold text-white">Oops! Something went wrong.</h1>
				<p className="text-zinc-400 max-w-md">
					We couldn't verify your checkout session. If you believe this is an error, please contact support.
				</p>
				<Link href="/" className="text-primary-400 hover:underline">Return to Home</Link>
			</div>
		);
	}

	return (
		<div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8 text-center px-4 animate-in fade-in zoom-in duration-500">
			<div className="relative">
				<div className="absolute inset-0 bg-primary-500 blur-3xl opacity-20 rounded-full" />
				<div className="relative w-24 h-24 bg-primary-500/10 rounded-full flex items-center justify-center text-primary-500 shadow-2xl shadow-primary-500/20 border border-primary-500/20">
					<CheckCircle2 size={56} />
				</div>
			</div>
			
			<div className="space-y-2">
				<h1 className="text-4xl font-extrabold text-white tracking-tight">Payment Successful!</h1>
				<p className="text-zinc-400 text-lg">Your tickets are being issued and will arrive in your account shortly.</p>
			</div>

			<div className="flex flex-col sm:flex-row gap-4 w-full max-w-sm">
				<Link 
					href={`/my/registrations`}
					className="flex-1 bg-white text-black hover:bg-zinc-200 font-bold py-4 px-6 rounded-2xl transition-colors flex items-center justify-center gap-2"
				>
					View My Tickets <ArrowRight size={20} />
				</Link>
			</div>

			<p className="text-xs text-zinc-500 font-mono uppercase tracking-widest pt-8">
				Order ID: {orderId?.substring(0, 12)}...
			</p>
		</div>
	);
}

export default function CheckoutSuccessPage() {
	return (
		<main className="min-h-screen bg-black flex items-center justify-center">
			<Suspense fallback={<Loader2 className="animate-spin text-zinc-500" />}>
				<SuccessContent />
			</Suspense>
		</main>
	);
}
