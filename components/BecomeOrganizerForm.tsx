"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
	organizerApplicationSchema,
	OrganizerApplicationInput,
} from "@/lib/validations/organizer.schemas";

export default function BecomeOrganizerForm() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);
	const [status, setStatus] = useState<string | null>(null);

	// Check if user already applied
	useEffect(() => {
		fetch("/api/organizer/application/me")
			.then((res) => {
				if (res.ok) {
					router.push("/organizer/application-status");
				}
			})
			.catch(() => {});
	}, [router]);

	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting },
	} = useForm<OrganizerApplicationInput>({
		resolver: zodResolver(organizerApplicationSchema),
		defaultValues: {
			pastEventsCount: 0,
			expectedEventsPerMonth: 1,
			primaryEventTypes: [],
		},
	});

	const onSubmit = async (data: OrganizerApplicationInput) => {
		try {
			setError(null);
			const res = await fetch("/api/organizer/apply", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const json = await res.json();
			if (!res.ok) {
				setError(json.error || "Failed to submit application");
				return;
			}

			router.push("/organizer/application-status");
		} catch (err) {
			setError("An unexpected error occurred. Please try again.");
		}
	};

	const EVENT_TYPES = [
		"Technology & Programming",
		"Design",
		"Business & Startups",
		"Marketing",
		"Career Development",
		"Networking",
		"Social",
		"Other",
	];

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
			<h2 className="text-2xl font-bold mb-6">Organizer Application</h2>

			{error && (
				<div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm">
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
				{/* Why Organizing */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Why do you want to organize events on DevEvent? <span className="text-red-500">*</span>
					</label>
					<textarea
						{...register("whyOrganizing")}
						rows={4}
						className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
						placeholder="Tell us about your community goals..."
					/>
					{errors.whyOrganizing && (
						<p className="mt-1 text-sm text-red-500">{errors.whyOrganizing.message}</p>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Past Events */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							How many events have you organized in the past? <span className="text-red-500">*</span>
						</label>
						<input
							type="number"
							{...register("pastEventsCount", { valueAsNumber: true })}
							className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
							min="0"
						/>
						{errors.pastEventsCount && (
							<p className="mt-1 text-sm text-red-500">{errors.pastEventsCount.message}</p>
						)}
					</div>

					{/* Expected Events */}
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Expected events per month? <span className="text-red-500">*</span>
						</label>
						<input
							type="number"
							{...register("expectedEventsPerMonth", { valueAsNumber: true })}
							className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
							min="1"
						/>
						{errors.expectedEventsPerMonth && (
							<p className="mt-1 text-sm text-red-500">{errors.expectedEventsPerMonth.message}</p>
						)}
					</div>
				</div>

				{/* Event Types */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						What types of events will you host? <span className="text-red-500">*</span>
					</label>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
						{EVENT_TYPES.map((type) => (
							<label key={type} className="flex items-center space-x-3 text-sm">
								<input
									type="checkbox"
									value={type}
									{...register("primaryEventTypes")}
									className="rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4"
								/>
								<span>{type}</span>
							</label>
						))}
					</div>
					{errors.primaryEventTypes && (
						<p className="mt-2 text-sm text-red-500">{errors.primaryEventTypes.message}</p>
					)}
				</div>

				{/* Ticketing Intent */}
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Ticketing plans <span className="text-red-500">*</span>
					</label>
					<div className="space-y-3">
						<label className="flex items-center space-x-3 text-sm">
							<input
								type="radio"
								value="free_only"
								{...register("ticketingIntent")}
								className="text-primary focus:ring-primary w-4 h-4"
							/>
							<span>Free events only</span>
						</label>
						<label className="flex items-center space-x-3 text-sm">
							<input
								type="radio"
								value="paid_only"
								{...register("ticketingIntent")}
								className="text-primary focus:ring-primary w-4 h-4"
							/>
							<span>Paid events only</span>
						</label>
						<label className="flex items-center space-x-3 text-sm">
							<input
								type="radio"
								value="both"
								{...register("ticketingIntent")}
								className="text-primary focus:ring-primary w-4 h-4"
							/>
							<span>Both free and paid events</span>
						</label>
					</div>
					{errors.ticketingIntent && (
						<p className="mt-2 text-sm text-red-500">{errors.ticketingIntent.message}</p>
					)}
				</div>

				<div className="pt-4 border-t space-y-4">
					<label className="flex items-start space-x-3 text-sm">
						<input
							type="checkbox"
							{...register("termsAccepted")}
							className="mt-1 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4 shrink-0"
						/>
						<span>
							I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> for Organizers. <span className="text-red-500">*</span>
						</span>
					</label>
					{errors.termsAccepted && (
						<p className="mt-1 text-sm text-red-500">{errors.termsAccepted.message}</p>
					)}

					<label className="flex items-start space-x-3 text-sm">
						<input
							type="checkbox"
							{...register("policyAccepted")}
							className="mt-1 rounded border-gray-300 text-primary focus:ring-primary cursor-pointer w-4 h-4 shrink-0"
						/>
						<span>
							I have read and agree to follow the <a href="#" className="text-primary hover:underline">Community Guidelines & Organizer Policy</a>. <span className="text-red-500">*</span>
						</span>
					</label>
					{errors.policyAccepted && (
						<p className="mt-1 text-sm text-red-500">{errors.policyAccepted.message}</p>
					)}
				</div>

				<div className="pt-6">
					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full bg-primary text-white py-3 px-4 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium"
					>
						{isSubmitting ? "Submitting Application..." : "Submit Application"}
					</button>
				</div>
			</form>
		</div>
	);
}
