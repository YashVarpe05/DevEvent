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
		<div style={{ maxWidth: "1000px", margin: "0 auto", padding: "32px 24px", display: "flex", flexDirection: "column", gap: "32px" }}>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<div>
					<h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: "12px", margin: "0 0 8px 0" }}>
						<Tag style={{ color: "var(--gold)" }} /> Promo Codes
					</h1>
					<p style={{ color: "var(--text-secondary)", margin: 0 }}>Create discount codes for your event tickets.</p>
				</div>
				<button
					onClick={() => setIsAdding(true)}
					style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--gold)", color: "#000", border: "none", padding: "10px 20px", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 0 16px var(--gold-dim)" }}
					onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(255,107,53, 0.4)"; e.currentTarget.style.transform = "scale(0.98)"; }}
					onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 16px var(--gold-dim)"; e.currentTarget.style.transform = "scale(1)"; }}
				>
					<Plus size={20} /> Create Code
				</button>
			</div>

			<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
				{promoCodes.length === 0 && !isAdding && (
					<div style={{ padding: "48px", textAlign: "center", borderRadius: "var(--radius-xl)", border: "1px dashed var(--border-dim)", color: "var(--text-muted)" }}>
						No promo codes created yet. Start by generating one to boost sales.
					</div>
				)}

				{promoCodes.map((promo) => (
					<div
						key={promo._id}
						style={{ padding: "20px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-dim)", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background-color 0.2s" }}
						onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-elevated)"}
						onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-surface)"}
					>
						<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
							<div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
								<h3 style={{ fontSize: "18px", fontWeight: 700, fontFamily: "monospace", letterSpacing: "1px", color: "var(--gold)", background: "var(--gold-dim)", padding: "4px 12px", borderRadius: "var(--radius-sm)", margin: 0 }}>
									{promo.code}
								</h3>
								<span style={{ padding: "2px 8px", fontSize: "12px", fontWeight: 500, borderRadius: "9999px", background: promo.isActive ? "rgba(34, 197, 94, 0.1)" : "rgba(239, 68, 68, 0.1)", color: promo.isActive ? "var(--green)" : "var(--red)" }}>
									{promo.isActive ? "Active" : "Inactive"}
								</span>
							</div>
							<div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
								<span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
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
						<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
							<button 
								onClick={() => deletePromo(promo._id)}
								style={{ padding: "8px", color: "var(--text-muted)", background: "transparent", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", transition: "all 0.2s" }}
								onMouseEnter={(e) => { e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }}
								onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
							>
								<Trash2 size={18} />
							</button>
						</div>
					</div>
				))}

				{isAdding && (
					<div style={{ padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--gold-dim)", background: "var(--bg-surface)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", marginTop: "16px" }}>
						<form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
							<div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", '@media (min-width: 768px)': { gridTemplateColumns: "repeat(2, 1fr)" } } as any}>
								<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
									<label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Promo Code</label>
									<input 
										{...register("code")}
										placeholder="e.g., SUMMER2024"
										style={{ width: "100%", padding: "10px 16px", background: "var(--bg-base)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none", textTransform: "uppercase", fontFamily: "monospace" }}
										onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
										onBlur={(e) => e.target.style.borderColor = "var(--border-dim)"}
									/>
									{errors.code && <p style={{ fontSize: "12px", color: "var(--red)", margin: 0 }}>{(errors.code as any).message}</p>}
								</div>
								
								<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
									<label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Discount Type</label>
									<select
										{...register("type")}
										style={{ width: "100%", padding: "10px 16px", background: "var(--bg-base)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none", cursor: "pointer" }}
										onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
										onBlur={(e) => e.target.style.borderColor = "var(--border-dim)"}
									>
										<option value="percentage">Percentage (%)</option>
										<option value="fixed">Fixed Amount ($)</option>
									</select>
								</div>

								<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
									<label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>
										{discountType === "percentage" ? "Discount Percentage" : "Discount Amount (in cents)"}
									</label>
									<input 
										{...register("value", { valueAsNumber: true })}
										type="number"
										min="1"
										placeholder={discountType === "percentage" ? "e.g., 20" : "e.g., 500 ($5.00)"}
										style={{ width: "100%", padding: "10px 16px", background: "var(--bg-base)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }}
										onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
										onBlur={(e) => e.target.style.borderColor = "var(--border-dim)"}
									/>
									{errors.value && <p style={{ fontSize: "12px", color: "var(--red)", margin: 0 }}>{(errors.value as any).message}</p>}
								</div>

								<div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
									<label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Max Uses (Optional)</label>
									<input 
										{...register("maxUses", { valueAsNumber: true, setValueAs: v => v === "" || isNaN(v) ? null : v })}
										type="number"
										min="1"
										placeholder="Leave empty for unlimited"
										style={{ width: "100%", padding: "10px 16px", background: "var(--bg-base)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }}
										onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
										onBlur={(e) => e.target.style.borderColor = "var(--border-dim)"}
									/>
									{errors.maxUses && <p style={{ fontSize: "12px", color: "var(--red)", margin: 0 }}>{(errors.maxUses as any).message}</p>}
								</div>

								<div style={{ display: "flex", flexDirection: "column", gap: "8px", gridColumn: "1 / -1" }}>
									<label style={{ fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)" }}>Expiry Date (Optional)</label>
									<input 
										{...register("expiresAt")}
										type="datetime-local"
										style={{ width: "100%", padding: "10px 16px", background: "var(--bg-base)", border: "1px solid var(--border-dim)", borderRadius: "var(--radius-md)", color: "var(--text-primary)", outline: "none" }}
										onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
										onBlur={(e) => e.target.style.borderColor = "var(--border-dim)"}
									/>
								</div>
							</div>

							<div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", paddingTop: "16px", borderTop: "1px solid var(--border-dim)" }}>
								<button 
									type="button"
									onClick={() => setIsAdding(false)}
									style={{ padding: "10px 16px", color: "var(--text-secondary)", background: "transparent", border: "none", fontWeight: 500, cursor: "pointer", transition: "color 0.2s" }}
									onMouseEnter={(e) => e.currentTarget.style.color = "var(--text-primary)"}
									onMouseLeave={(e) => e.currentTarget.style.color = "var(--text-secondary)"}
								>
									Cancel
								</button>
								<button 
									type="submit"
									style={{ padding: "10px 24px", background: "var(--gold)", color: "#000", border: "none", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 0 16px var(--gold-dim)" }}
									onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(255,107,53, 0.4)"; e.currentTarget.style.transform = "scale(0.98)"; }}
									onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 16px var(--gold-dim)"; e.currentTarget.style.transform = "scale(1)"; }}
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
