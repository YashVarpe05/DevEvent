"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { pricingSchema } from "@/lib/validations/pricing";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, Trash2, Edit3, Save, X, Ticket } from "lucide-react";

interface TicketType {
	_id: string;
	name: string;
	price: number;
	currency: string;
	quantityTotal: number;
	quantitySold: number;
	status: string;
}

export default function TicketManagementPage() {
	const params = useParams();
	const eventId = params.id as string;
	const [tickets, setTickets] = useState<TicketType[]>([]);
	const [loading, setLoading] = useState(true);
	const [isAdding, setIsAdding] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);

	const fetchTickets = async () => {
		try {
			const res = await fetch(`/api/organizer/events/${eventId}/tickets`);
			const data = await res.json();
			if (data.tickets) {
				setTickets(data.tickets);
			}
		} catch (error) {
			console.error("Fetch tickets error:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchTickets();
	}, [eventId]);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm({
		resolver: zodResolver(pricingSchema),
		defaultValues: {
			name: "",
			price: 0,
			quantityTotal: 100,
			currency: "USD",
		},
	});

	const onSubmit = async (data: any) => {
		try {
			// Convert price to cents
			const payload = { ...data, price: Math.round(data.price * 100) };

			const res = await fetch(`/api/organizer/events/${eventId}/tickets`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (res.ok) {
				setIsAdding(false);
				reset();
				fetchTickets();
			}
		} catch (error) {
			console.error("Submit error:", error);
		}
	};

	const deleteTicket = async (ticketId: string) => {
		if (!confirm("Are you sure you want to delete this ticket tier?")) return;

		try {
			const res = await fetch(`/api/organizer/events/${eventId}/tickets/${ticketId}`, {
				method: "DELETE",
			});
			if (res.ok) fetchTickets();
		} catch (error) {
			console.error("Delete error:", error);
		}
	};

	if (loading) return <div style={{ padding: "32px", textAlign: "center", color: "var(--text-muted)" }}>Loading tickets...</div>;

	const inputStyle = {
		width: "100%",
		padding: "10px 16px",
		background: "var(--bg-surface)",
		border: "1px solid var(--border-dim)",
		borderRadius: "var(--radius-md)",
		color: "var(--text-primary)",
		outline: "none",
		transition: "border-color 0.2s"
	};

	const labelStyle = {
		display: "block",
		fontSize: "14px",
		fontWeight: 500,
		color: "var(--text-secondary)",
		marginBottom: "8px"
	};

	return (
		<div style={{ maxWidth: "800px", margin: "0 auto", padding: "24px", display: "flex", flexDirection: "column", gap: "32px" }}>
			<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
				<div>
					<h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", display: "flex", alignItems: "center", gap: "12px", margin: "0 0 8px 0" }}>
						<Ticket style={{ color: "var(--gold)" }} /> Ticket Management
					</h1>
					<p style={{ color: "var(--text-secondary)", margin: 0 }}>Configure multiple ticket tiers for your event.</p>
				</div>
				<button
					onClick={() => setIsAdding(true)}
					style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--gold)", color: "#000", border: "none", padding: "10px 20px", borderRadius: "var(--radius-md)", fontWeight: 600, cursor: "pointer", transition: "all 0.2s", boxShadow: "0 0 16px var(--gold-dim)" }}
					onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(212, 175, 55, 0.4)"; e.currentTarget.style.transform = "scale(0.98)"; }}
					onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 16px var(--gold-dim)"; e.currentTarget.style.transform = "scale(1)"; }}
				>
					<Plus size={20} /> Add Tier
				</button>
			</div>

			{/* Existing Tiers */}
			<div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
				{tickets.length === 0 && !isAdding && (
					<div style={{ padding: "48px", textAlign: "center", borderRadius: "var(--radius-xl)", border: "1px dashed var(--border-dim)", color: "var(--text-muted)" }}>
						No tickets created yet. Start by adding a tier.
					</div>
				)}

				{tickets.map((ticket) => (
					<div
						key={ticket._id}
						style={{ padding: "20px", borderRadius: "var(--radius-xl)", border: "1px solid var(--border-dim)", background: "var(--bg-surface)", display: "flex", alignItems: "center", justifyContent: "space-between", transition: "background-color 0.2s" }}
						onMouseEnter={(e) => e.currentTarget.style.background = "var(--bg-elevated)"}
						onMouseLeave={(e) => e.currentTarget.style.background = "var(--bg-surface)"}
					>
						<div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
							<h3 style={{ fontSize: "20px", fontWeight: 600, color: "var(--text-primary)", margin: 0 }}>{ticket.name}</h3>
							<div style={{ display: "flex", flexWrap: "wrap", gap: "16px", fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
								<span>Price: ${(ticket.price / 100).toFixed(2)} {ticket.currency.toUpperCase()}</span>
								<span>Capacity: {ticket.quantityTotal}</span>
								<span>Sold: {ticket.quantitySold}</span>
							</div>
							<div style={{ width: "100%", maxWidth: "320px", height: "6px", background: "var(--bg-base)", borderRadius: "9999px", marginTop: "12px", overflow: "hidden", border: "1px solid var(--border-dim)" }}>
								<div 
									style={{ height: "100%", background: "var(--gold)", transition: "width 0.5s ease", width: `${Math.min(100, (ticket.quantitySold / ticket.quantityTotal) * 100)}%` }}
								/>
							</div>
						</div>
						<div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
							<button 
								onClick={() => deleteTicket(ticket._id)}
								style={{ padding: "8px", color: "var(--text-muted)", background: "transparent", border: "none", borderRadius: "var(--radius-md)", cursor: "pointer", transition: "all 0.2s" }}
								onMouseEnter={(e) => { e.currentTarget.style.color = "var(--red)"; e.currentTarget.style.background = "rgba(239, 68, 68, 0.1)"; }}
								onMouseLeave={(e) => { e.currentTarget.style.color = "var(--text-muted)"; e.currentTarget.style.background = "transparent"; }}
							>
								<Trash2 size={18} />
							</button>
						</div>
					</div>
				))}

				{/* Add Tier Form */}
				{isAdding && (
					<div style={{ padding: "24px", borderRadius: "var(--radius-xl)", border: "1px solid var(--gold-dim)", background: "var(--bg-surface)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", marginTop: "16px" }}>
						<form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
							<div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "16px", '@media (min-width: 768px)': { gridTemplateColumns: "repeat(2, 1fr)" } } as any}>
								<div>
									<label style={labelStyle}>Tier Name</label>
									<input 
										{...register("name")}
										placeholder="e.g., Early Bird, VIP"
										style={inputStyle}
										onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
										onBlur={(e) => e.target.style.borderColor = "var(--border-dim)"}
									/>
									{errors.name && <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "4px" }}>{(errors.name as any).message}</p>}
								</div>
								<div>
									<label style={labelStyle}>Price (USD)</label>
									<input 
										{...register("price", { valueAsNumber: true })}
										type="number"
										step="0.01"
										placeholder="0.00"
										style={inputStyle}
										onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
										onBlur={(e) => e.target.style.borderColor = "var(--border-dim)"}
									/>
									{errors.price && <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "4px" }}>{(errors.price as any).message}</p>}
								</div>
								<div>
									<label style={labelStyle}>Total Quantity</label>
									<input 
										{...register("quantityTotal", { valueAsNumber: true })}
										type="number"
										placeholder="100"
										style={inputStyle}
										onFocus={(e) => e.target.style.borderColor = "var(--gold)"}
										onBlur={(e) => e.target.style.borderColor = "var(--border-dim)"}
									/>
									{errors.quantityTotal && <p style={{ fontSize: "12px", color: "var(--red)", marginTop: "4px" }}>{(errors.quantityTotal as any).message}</p>}
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
									onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 24px rgba(212, 175, 55, 0.4)"; e.currentTarget.style.transform = "scale(0.98)"; }}
									onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 16px var(--gold-dim)"; e.currentTarget.style.transform = "scale(1)"; }}
								>
									Create Tier
								</button>
							</div>
						</form>
					</div>
				)}
			</div>
		</div>
	);
}
