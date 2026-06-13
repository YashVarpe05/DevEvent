"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AlertCircle } from "lucide-react";
import {
	organizerApplicationSchema,
	OrganizerApplicationInput,
} from "@/lib/validations/organizer.schemas";

const labelClasses =
	"block font-mono text-[11px] uppercase tracking-widest font-medium text-text-secondary mb-2";

const inputClasses =
	"w-full bg-bg-base border border-border-subtle px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-secondary focus:border-accent";

const fieldErrorClasses = "text-[12px] mt-1.5 text-error";

const RequiredMark = () => (
	<span className="text-accent" aria-hidden="true">
		{" "}*
	</span>
);

export default function BecomeOrganizerForm() {
	const router = useRouter();
	const [error, setError] = useState<string | null>(null);

	// Check if user already applied
	useEffect(() => {
		fetch("/api/organizer/application/me")
			.then((res) => {
				if (res.ok) return res.json();
				return null;
			})
			.then((data) => {
				if (data?.application) {
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
		} catch {
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
		<div className="bg-bg-elevated border border-border-subtle p-6 sm:p-8">
			<h2 className="font-display text-[22px] font-bold text-text-primary mb-6">
				Organizer Application
			</h2>

			{error && (
				<div
					role="alert"
					className="mb-5 flex items-start gap-2.5 border border-error/30 bg-error/5 px-4 py-3 text-[13px] text-error"
				>
					<AlertCircle size={15} className="shrink-0 mt-0.5" aria-hidden="true" />
					{error}
				</div>
			)}

			<form
				onSubmit={handleSubmit(onSubmit)}
				className="flex flex-col gap-5"
				noValidate
			>
				{/* Why Organizing */}
				<div>
					<label htmlFor="whyOrganizing" className={labelClasses}>
						Why do you want to organize events on DevEvent?
						<RequiredMark />
					</label>
					<textarea
						id="whyOrganizing"
						{...register("whyOrganizing")}
						rows={4}
						placeholder="Tell us about your community goals..."
						className={`${inputClasses} min-h-[100px] resize-y leading-relaxed`}
						aria-invalid={Boolean(errors.whyOrganizing)}
					/>
					{errors.whyOrganizing && (
						<p className={fieldErrorClasses}>{errors.whyOrganizing.message}</p>
					)}
				</div>

				<div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
					{/* Past Events */}
					<div>
						<label htmlFor="pastEventsCount" className={labelClasses}>
							Events organized so far
							<RequiredMark />
						</label>
						<input
							id="pastEventsCount"
							type="number"
							{...register("pastEventsCount", { valueAsNumber: true })}
							min="0"
							className={`${inputClasses} font-mono`}
							aria-invalid={Boolean(errors.pastEventsCount)}
						/>
						{errors.pastEventsCount && (
							<p className={fieldErrorClasses}>{errors.pastEventsCount.message}</p>
						)}
					</div>

					{/* Expected Events */}
					<div>
						<label htmlFor="expectedEventsPerMonth" className={labelClasses}>
							Expected events per month
							<RequiredMark />
						</label>
						<input
							id="expectedEventsPerMonth"
							type="number"
							{...register("expectedEventsPerMonth", { valueAsNumber: true })}
							min="1"
							className={`${inputClasses} font-mono`}
							aria-invalid={Boolean(errors.expectedEventsPerMonth)}
						/>
						{errors.expectedEventsPerMonth && (
							<p className={fieldErrorClasses}>
								{errors.expectedEventsPerMonth.message}
							</p>
						)}
					</div>
				</div>

				{/* Event Types */}
				<div>
					<span className={labelClasses}>
						What types of events will you host?
						<RequiredMark />
					</span>
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
						{EVENT_TYPES.map((type) => (
							<label
								key={type}
								className="flex items-center gap-2.5 px-3 py-2.5 bg-bg-base border border-border-subtle text-[13px] text-text-secondary cursor-pointer transition-colors hover:border-border-hover hover:text-text-primary has-[input:checked]:border-accent has-[input:checked]:text-accent has-[input:checked]:bg-accent-dim"
							>
								<input
									type="checkbox"
									value={type}
									{...register("primaryEventTypes")}
									className="w-3.5 h-3.5 shrink-0 cursor-pointer accent-[#FF6B35]"
								/>
								<span>{type}</span>
							</label>
						))}
					</div>
					{errors.primaryEventTypes && (
						<p className={fieldErrorClasses}>{errors.primaryEventTypes.message}</p>
					)}
				</div>

				{/* Ticketing Intent */}
				<div>
					<span className={labelClasses}>
						Ticketing plans
						<RequiredMark />
					</span>
					<div className="flex flex-col gap-1.5">
						{[
							{ value: "free_only", label: "Free events only" },
							{ value: "paid_only", label: "Paid events only" },
							{ value: "both", label: "Both free and paid events" },
						].map((option) => (
							<label
								key={option.value}
								className="flex items-center gap-2.5 px-3.5 py-3 bg-bg-base border border-border-subtle text-[13px] text-text-secondary cursor-pointer transition-colors hover:border-border-hover hover:text-text-primary has-[input:checked]:border-accent has-[input:checked]:text-text-primary"
							>
								<input
									type="radio"
									value={option.value}
									{...register("ticketingIntent")}
									className="w-3.5 h-3.5 shrink-0 cursor-pointer accent-[#FF6B35]"
								/>
								<span>{option.label}</span>
							</label>
						))}
					</div>
					{errors.ticketingIntent && (
						<p className={fieldErrorClasses}>{errors.ticketingIntent.message}</p>
					)}
				</div>

				{/* Terms / Policy */}
				<div className="border-t border-border-subtle pt-5 mt-2 flex flex-col gap-3">
					<label className="flex items-start gap-2.5 text-[13px] text-text-secondary leading-normal cursor-pointer">
						<input
							type="checkbox"
							{...register("termsAccepted")}
							className="mt-0.5 w-3.5 h-3.5 shrink-0 cursor-pointer accent-[#FF6B35]"
						/>
						<span>
							I agree to the{" "}
							<a
								href="#"
								className="text-accent hover:text-accent-hover transition-colors"
							>
								Terms of Service
							</a>{" "}
							for Organizers.
							<RequiredMark />
						</span>
					</label>
					{errors.termsAccepted && (
						<p className={fieldErrorClasses}>{errors.termsAccepted.message}</p>
					)}

					<label className="flex items-start gap-2.5 text-[13px] text-text-secondary leading-normal cursor-pointer">
						<input
							type="checkbox"
							{...register("policyAccepted")}
							className="mt-0.5 w-3.5 h-3.5 shrink-0 cursor-pointer accent-[#FF6B35]"
						/>
						<span>
							I have read and agree to follow the{" "}
							<a
								href="#"
								className="text-accent hover:text-accent-hover transition-colors"
							>
								Community Guidelines &amp; Organizer Policy
							</a>
							.
							<RequiredMark />
						</span>
					</label>
					{errors.policyAccepted && (
						<p className={fieldErrorClasses}>{errors.policyAccepted.message}</p>
					)}
				</div>

				{/* Submit */}
				<button
					type="submit"
					disabled={isSubmitting}
					className="w-full h-12 bg-accent text-bg-base font-mono text-[12px] uppercase tracking-widest font-bold transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
				>
					{isSubmitting ? "Submitting Application..." : "Submit Application"}
				</button>
			</form>
		</div>
	);
}
