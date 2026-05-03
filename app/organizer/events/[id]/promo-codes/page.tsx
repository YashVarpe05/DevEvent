"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Tag, Percent, DollarSign } from "lucide-react";

const createPromoSchema = z.object({
	code: z.string().min(3, "Code must be at least 3 characters").max(20, "Code too long"),
	type: z.enum(["percentage", "fixed"]),
	value: z.number().min(1, "Value must be at least 1"),
	maxUses: z.number().int().min(1, "Must be at least 1").nullable().optional(),
	expiresAt: z.string().nullable().optional(),
});

interface PromoCode {
	_id: string;
	code: string;
	type: "percentage" | "fixed";
	value: number;
	maxUses: number | null;
	currentUses: number;
	expiresAt: string | null;
	isActive: boolean;
}

export default function PromoCodesPage() {
	const params = useParams();
	const eventId = params.id as string;
	const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAdding, setIsAdding] = useState(false);

	const fetchPromoCodes = async () => {
		try {
			const res = await fetch(`/api/organizer/events/${eventId}/promo-codes`);
			const data = await res.json();
			if (Array.isArray(data)) {
				setPromoCodes(data);
			}
		} catch (error) {
			console.error("Fetch promo codes error:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchPromoCodes();
	}, [eventId]);

	const {
		register,
		handleSubmit,
		reset,
		watch,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(createPromoSchema),
		defaultValues: {
			code: "",
			type: "percentage" as "percentage" | "fixed",
			value: 10,
			maxUses: null,
			expiresAt: "",
		},
	});

	const discountType = watch("type");

	const onSubmit = async (data: any) => {
		try {
			const payload = {
				...data,
				code: data.code.toUpperCase(),
				maxUses: data.maxUses ? Number(data.maxUses) : null,
				expiresAt: data.expiresAt ? new Date(data.expiresAt).toISOString() : null,
			};

			const res = await fetch(`/api/organizer/events/${eventId}/promo-codes`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				setIsAdding(false);
				reset();
				fetchPromoCodes();
			} else {
				const errorData = await res.json();
				alert(errorData.error || "Failed to create promo code");
			}
		} catch (error) {
			console.error("Submit error:", error);
		}
	};

	const deletePromo = async (codeId: string) => {
		if (!confirm("Are you sure you want to delete this promo code?")) return;

		try {
			const res = await fetch(`/api/organizer/events/${eventId}/promo-codes/${codeId}`, {
				method: "DELETE",
			});
			if (res.ok) fetchPromoCodes();
		} catch (error) {
			console.error("Delete error:", error);
		}
	};

	if (loading) return <div className="p-8 text-center text-zinc-400">Loading promo codes...</div>;

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-white flex items-center gap-2">
						<Tag className="text-primary-500" /> Promo Codes
					</h1>
					<p className="text-zinc-400">Create discount codes for your event tickets.</p>
				</div>
				<button
					onClick={() => setIsAdding(true)}
					className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
				>
					<Plus size={20} /> Create Code
				</button>
			</div>

			<div className="grid gap-4">
				{promoCodes.length === 0 && !isAdding && (
					<div className="p-12 text-center rounded-xl border border-dashed border-zinc-800 text-zinc-500">
						No promo codes created yet. Start by generating one to boost sales.
					</div>
				)}

				{promoCodes.map((promo) => (
					<div
						key={promo._id}
						className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-between group"
					>
						<div className="space-y-1">
							<div className="flex items-center gap-3">
								<h3 className="text-xl font-bold font-mono tracking-wider text-primary-400 bg-primary-900/20 px-3 py-1 rounded">
									{promo.code}
								</h3>
								<span className={`px-2 py-0.5 text-xs font-medium rounded-full ${promo.isActive ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
									{promo.isActive ? "Active" : "Inactive"}
								</span>
							</div>
							<div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400 mt-3">
								<span className="flex items-center gap-1">
									{promo.type === "percentage" ? <Percent size={14} /> : <DollarSign size={14} />}
									{promo.type === "percentage" ? `${promo.value}% off` : `$${(promo.value / 100).toFixed(2)} off`}
								</span>
								<span>
									Uses: {promo.currentUses} {promo.maxUses ? `/ ${promo.maxUses}` : '(Unlimited)'}
								</span>
								{promo.expiresAt && (
									<span>Expires: {new Date(promo.expiresAt).toLocaleDateString()}</span>
								)}
							</div>
						</div>
						<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
							<button 
								onClick={() => deletePromo(promo._id)}
								className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
							>
								<Trash2 size={18} />
							</button>
						</div>
					</div>
				))}

				{isAdding && (
					<div className="p-6 rounded-xl border border-primary-500/30 bg-zinc-900 shadow-2xl animate-in slide-in-from-top duration-300">
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300">Promo Code</label>
									<input 
										{...register("code")}
										placeholder="e.g., SUMMER2024"
										className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500 uppercase font-mono"
									/>
									{errors.code && <p className="text-xs text-red-500">{(errors.code as any).message}</p>}
								</div>
								
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300">Discount Type</label>
									<select
										{...register("type")}
										className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-2 text-white"
									>
										<option value="percentage">Percentage (%)</option>
										<option value="fixed">Fixed Amount ($)</option>
									</select>
								</div>

								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300">
										{discountType === "percentage" ? "Discount Percentage" : "Discount Amount (in cents)"}
									</label>
									<input 
										{...register("value", { valueAsNumber: true })}
										type="number"
										min="1"
										placeholder={discountType === "percentage" ? "e.g., 20" : "e.g., 500 ($5.00)"}
										className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500"
									/>
									{errors.value && <p className="text-xs text-red-500">{(errors.value as any).message}</p>}
								</div>

								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300">Max Uses (Optional)</label>
									<input 
										{...register("maxUses", { valueAsNumber: true, setValueAs: v => v === "" || isNaN(v) ? null : v })}
										type="number"
										min="1"
										placeholder="Leave empty for unlimited"
										className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500"
									/>
									{errors.maxUses && <p className="text-xs text-red-500">{(errors.maxUses as any).message}</p>}
								</div>

								<div className="space-y-2 md:col-span-2">
									<label className="text-sm font-medium text-zinc-300">Expiry Date (Optional)</label>
									<input 
										{...register("expiresAt")}
										type="datetime-local"
										className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-2 text-white"
									/>
								</div>
							</div>

							<div className="flex justify-end gap-3 pt-4 border-t border-zinc-800">
								<button 
									type="button"
									onClick={() => setIsAdding(false)}
									className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
								>
									Cancel
								</button>
								<button 
									type="submit"
									className="px-6 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors font-medium shadow-lg shadow-primary-900/20"
								>
									Create Promo Code
								</button>
							</div>
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
