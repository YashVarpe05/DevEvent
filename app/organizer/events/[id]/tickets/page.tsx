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

	if (loading) return <div className="p-8 text-center text-zinc-400">Loading tickets...</div>;

	return (
		<div className="max-w-4xl mx-auto p-6 space-y-8">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-white flex items-center gap-2">
						<Ticket className="text-primary-500" /> Ticket Management
					</h1>
					<p className="text-zinc-400">Configure multiple ticket tiers for your event.</p>
				</div>
				<button
					onClick={() => setIsAdding(true)}
					className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg transition-colors"
				>
					<Plus size={20} /> Add Tier
				</button>
			</div>

			{/* Existing Tiers */}
			<div className="grid gap-4">
				{tickets.length === 0 && !isAdding && (
					<div className="p-12 text-center rounded-xl border border-dashed border-zinc-800 text-zinc-500">
						No tickets created yet. Start by adding a tier.
					</div>
				)}

				{tickets.map((ticket) => (
					<div
						key={ticket._id}
						className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/50 flex items-center justify-between group"
					>
						<div className="space-y-1">
							<h3 className="text-xl font-semibold text-white">{ticket.name}</h3>
							<div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-zinc-400">
								<span>Price: ${(ticket.price / 100).toFixed(2)} {ticket.currency.toUpperCase()}</span>
								<span>Capacity: {ticket.quantityTotal}</span>
								<span>Sold: {ticket.quantitySold}</span>
							</div>
							<div className="w-full max-w-xs h-1.5 bg-zinc-800 rounded-full mt-2 overflow-hidden">
								<div 
									className="h-full bg-primary-500 transition-all duration-500" 
									style={{ width: `${Math.min(100, (ticket.quantitySold / ticket.quantityTotal) * 100)}%` }}
								/>
							</div>
						</div>
						<div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
							<button 
								onClick={() => deleteTicket(ticket._id)}
								className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
							>
								<Trash2 size={18} />
							</button>
						</div>
					</div>
				))}

				{/* Add Tier Form */}
				{isAdding && (
					<div className="p-6 rounded-xl border border-primary-500/30 bg-zinc-900 shadow-2xl animate-in slide-in-from-top duration-300">
						<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300">Tier Name</label>
									<input 
										{...register("name")}
										placeholder="e.g., Early Bird, VIP"
										className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500"
									/>
									{errors.name && <p className="text-xs text-red-500">{(errors.name as any).message}</p>}
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300">Price (USD)</label>
									<input 
										{...register("price", { valueAsNumber: true })}
										type="number"
										step="0.01"
										placeholder="0.00"
										className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500"
									/>
									{errors.price && <p className="text-xs text-red-500">{(errors.price as any).message}</p>}
								</div>
								<div className="space-y-2">
									<label className="text-sm font-medium text-zinc-300">Total Quantity</label>
									<input 
										{...register("quantityTotal", { valueAsNumber: true })}
										type="number"
										placeholder="100"
										className="w-full bg-zinc-800 border-zinc-700 rounded-lg px-4 py-2 text-white placeholder-zinc-500"
									/>
									{errors.quantityTotal && <p className="text-xs text-red-500">{(errors.quantityTotal as any).message}</p>}
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
