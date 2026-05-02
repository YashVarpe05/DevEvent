"use client";

import { useState } from "react";
import { Plus, Trash2, Copy, BarChart3, Loader2 } from "lucide-react";
import { createReferral, deleteReferral } from "@/lib/actions/referral.actions";

interface ReferralManagerProps {
	eventId: string;
	eventSlug: string;
	organizerId: string;
	initialReferrals: any[];
}

export default function ReferralManager({ eventId, eventSlug, organizerId, initialReferrals }: ReferralManagerProps) {
	const [referrals, setReferrals] = useState(initialReferrals);
	const [isCreating, setIsCreating] = useState(false);
	const [code, setCode] = useState("");
	const [name, setName] = useState("");
	const [error, setError] = useState("");

	const handleCreate = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setIsCreating(true);

		try {
			const res = await createReferral({ eventId, organizerId, code, name });
			if (res.success && res.data) {
				setReferrals([res.data, ...referrals]);
				setCode("");
				setName("");
			} else {
				setError(res.error || "Failed to create referral");
			}
		} catch (err: any) {
			setError(err.message || "Something went wrong");
		} finally {
			setIsCreating(false);
		}
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this referral link?")) return;
		try {
			await deleteReferral(id, eventId);
			setReferrals(referrals.filter(r => r._id !== id));
		} catch (err) {
			console.error("Delete failed", err);
		}
	};

	const copyLink = (refCode: string) => {
		const url = `${window.location.origin}/events/${eventSlug}?ref=${refCode}`;
		navigator.clipboard.writeText(url);
		alert("Referral link copied to clipboard!");
	};

	return (
		<div className="space-y-8">
			{/* Create Referral Form */}
			<div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
				<h2 className="text-xl font-bold mb-4 flex items-center gap-2">
					<Plus className="text-primary-600" />
					Create New Referral Link
				</h2>
				<form onSubmit={handleCreate} className="space-y-4">
					<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
						<div className="space-y-1">
							<label className="text-sm font-medium text-zinc-700">Campaign Name</label>
							<input
								type="text"
								required
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
								placeholder="e.g. Summer Promo"
							/>
						</div>
						<div className="space-y-1">
							<label className="text-sm font-medium text-zinc-700">Referral Code</label>
							<input
								type="text"
								required
								value={code}
								onChange={(e) => setCode(e.target.value)}
								className="w-full px-4 py-2 border border-zinc-200 rounded-xl focus:ring-2 focus:ring-primary-500 outline-none"
								placeholder="e.g. SUMMER2024"
							/>
						</div>
					</div>
					{error && <p className="text-sm text-red-500">{error}</p>}
					<div className="flex justify-end">
						<button
							type="submit"
							disabled={isCreating}
							className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-xl font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
						>
							{isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
							Generate Link
						</button>
					</div>
				</form>
			</div>

			{/* Referrals List */}
			<div className="bg-white p-6 rounded-2xl shadow-sm border border-zinc-100">
				<h2 className="text-xl font-bold mb-6 flex items-center gap-2">
					<BarChart3 className="text-primary-600" />
					Referral Analytics
				</h2>

				{referrals.length === 0 ? (
					<p className="text-zinc-500 text-center py-8">No referral links created yet.</p>
				) : (
					<div className="overflow-x-auto">
						<table className="w-full text-left border-collapse">
							<thead>
								<tr className="border-b border-zinc-100 text-sm text-zinc-500">
									<th className="pb-3 font-medium">Campaign Name</th>
									<th className="pb-3 font-medium">Code</th>
									<th className="pb-3 font-medium text-center">Clicks</th>
									<th className="pb-3 font-medium text-center">Conversions</th>
									<th className="pb-3 font-medium text-right">Revenue</th>
									<th className="pb-3 font-medium text-right">Actions</th>
								</tr>
							</thead>
							<tbody className="text-sm">
								{referrals.map((ref) => (
									<tr key={ref._id} className="border-b border-zinc-50 last:border-0 hover:bg-zinc-50/50">
										<td className="py-4 font-medium text-zinc-900">{ref.name}</td>
										<td className="py-4 text-zinc-600 font-mono text-xs bg-zinc-100 px-2 rounded inline-flex mt-3">{ref.code}</td>
										<td className="py-4 text-center">{ref.clicks}</td>
										<td className="py-4 text-center">{ref.conversions}</td>
										<td className="py-4 text-right font-medium">${(ref.revenue / 100).toFixed(2)}</td>
										<td className="py-4">
											<div className="flex justify-end gap-2">
												<button
													onClick={() => copyLink(ref.code)}
													className="p-2 text-zinc-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
													title="Copy Link"
												>
													<Copy className="w-4 h-4" />
												</button>
												<button
													onClick={() => handleDelete(ref._id)}
													className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
													title="Delete"
												>
													<Trash2 className="w-4 h-4" />
												</button>
											</div>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				)}
			</div>
		</div>
	);
}
