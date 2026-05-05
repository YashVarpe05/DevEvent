"use client";

import { useEffect, useState } from "react";
import {
	DollarSign,
	ExternalLink as ExternalLinkIcon,
	TrendingUp,
	CreditCard,
	Clock,
	Activity,
	Building,
	ArrowDownRight,
} from "lucide-react";

interface EarningsStat {
	grossSales: number;
	platformFees: number;
	estimatedNet: number;
	refunds: number;
	availableBalance: number;
	chargesEnabled: boolean;
	payoutsEnabled: boolean;
	stripeOnboardingComplete: boolean;
}

export default function PayoutsDashboard() {
	const [stats, setStats] = useState<EarningsStat | null>(null);
	const [loading, setLoading] = useState(true);
	const [onboardingUrl, setOnboardingUrl] = useState<string | null>(null);

	useEffect(() => {
		const fetchStats = async () => {
			try {
				const res = await fetch("/api/organizer/stripe/earnings");
				const data = await res.json();
				if (data.stats) setStats(data.stats);

				// Also fetch Connect link in case they haven't finished
				const connectRes = await fetch("/api/organizer/stripe/connect", {
					method: "POST",
				});
				const connectData = await connectRes.json();
				if (connectData.url) setOnboardingUrl(connectData.url);
			} catch (err) {
				console.error("Fetch earnings error:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchStats();
	}, []);

	if (loading)
		return (
			<div className="p-8 text-center text-zinc-400">
				Loading payout details...
			</div>
		);

	return (
		<main className="max-w-6xl mx-auto p-6 md:p-12 space-y-12">
			<div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
				<div className="space-y-4">
					<h1 className="text-5xl font-black text-white tracking-tighter flex items-center gap-4">
						<div className="w-12 h-12 bg-emerald-500/20 rounded-2xl flex items-center justify-center text-emerald-500 shadow-xl shadow-emerald-500/20 border border-emerald-500/10">
							<DollarSign size={32} />
						</div>
						Earnings
					</h1>
					<p className="text-zinc-500 max-w-sm text-lg font-medium leading-relaxed">
						Track your event revenue and manage payouts through Stripe Connect.
					</p>
				</div>

				{onboardingUrl && (
					<a
						href={onboardingUrl}
						className="group bg-white text-black hover:bg-zinc-200 font-bold py-4 px-8 rounded-2xl transition-all shadow-2xl flex items-center gap-3 active:scale-95"
					>
						Go to Stripe Dashboard{" "}
						<ExternalLinkIcon
							size={20}
							className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
						/>
					</a>
				)}
			</div>

			{/* Stats Grid */}
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
				{[
					{
						label: "Total Sales",
						value: `$${((stats?.grossSales || 0) / 100).toFixed(2)}`,
						icon: <TrendingUp className="text-emerald-400" size={24} />,
						sub: "Gross across all events",
					},
					{
						label: "Platform Fees",
						value: `$${((stats?.platformFees || 0) / 100).toFixed(2)}`,
						icon: <Building className="text-zinc-400" size={24} />,
						sub: "Paid to DevEvent",
					},
					{
						label: "Net Earnings",
						value: `$${((stats?.estimatedNet || 0) / 100).toFixed(2)}`,
						icon: <Activity className="text-blue-400" size={24} />,
						sub: "Your total revenue",
					},
					{
						label: "Available",
						value:
							stats?.availableBalance === -1
								? "Login to Stripe"
								: `$${((stats?.availableBalance || 0) / 100).toFixed(2)}`,
						icon: <Clock className="text-amber-400" size={24} />,
						sub: "Ready for payout",
					},
				].map((card, i) => (
					<div
						key={i}
						className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 space-y-6 shadow-sm border-b-4 border-b-zinc-800/50"
					>
						<div className="flex justify-between items-center bg-zinc-800/50 w-12 h-12 rounded-2xl p-3">
							{card.icon}
						</div>
						<div>
							<p className="text-zinc-500 font-bold uppercase tracking-widest text-[10px] mb-1">
								{card.label}
							</p>
							<h4 className="text-3xl font-black text-white tracking-tight">
								{card.value}
							</h4>
							<p className="text-zinc-600 text-xs mt-2">{card.sub}</p>
						</div>
					</div>
				))}
			</div>

			<div className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-8 text-center space-y-4">
				<CreditCard size={40} className="mx-auto text-zinc-700" />
				<h3 className="text-xl font-bold text-zinc-400">Payout History</h3>
				<p className="text-zinc-600 max-w-md mx-auto text-sm">
					Detailed payout logs and bank transfer status are available directly
					in your Stripe Express dashboard. Payment processing can take 2-5
					business days depending on your bank.
				</p>
			</div>
		</main>
	);
}
