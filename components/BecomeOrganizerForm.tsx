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

	const labelStyle: React.CSSProperties = {
		fontSize: "12px",
		fontWeight: 500,
		color: "var(--text-secondary)",
		letterSpacing: "0.02em",
		marginBottom: "6px",
		display: "block",
	};

	const inputStyle: React.CSSProperties = {
		width: "100%",
		background: "var(--bg-elevated)",
		border: "1px solid var(--border)",
		borderRadius: "var(--radius-md)",
		padding: "10px 14px",
		fontSize: "14px",
		color: "var(--text-primary)",
		outline: "none",
		transition: "border-color 150ms ease, box-shadow 150ms ease",
		fontFamily: "var(--font-body)",
		boxSizing: "border-box" as const,
	};

	const fieldErrorStyle: React.CSSProperties = {
		fontSize: "12px",
		color: "var(--red)",
		marginTop: "4px",
	};

	const handleFocus = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		e.target.style.borderColor = "rgba(201,168,76,0.5)";
		e.target.style.boxShadow = "0 0 0 3px #131008";
	};

	const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
		e.target.style.borderColor = "var(--border)";
		e.target.style.boxShadow = "none";
	};

	return (
		<div
			style={{
				background: "var(--bg-surface)",
				border: "1px solid var(--border-dim)",
				borderRadius: "var(--radius-lg)",
				padding: "28px 32px",
			}}
		>
			<h2
				style={{
					fontFamily: "var(--font-serif)",
					fontSize: "22px",
					fontWeight: 600,
					color: "var(--text-primary)",
					marginBottom: "24px",
				}}
			>
				Organizer Application
			</h2>

			{error && (
				<div
					style={{
						marginBottom: "20px",
						background: "rgba(204,70,70,0.06)",
						border: "1px solid rgba(204,70,70,0.25)",
						borderRadius: "var(--radius-md)",
						padding: "10px 14px",
						color: "var(--red)",
						fontSize: "13px",
					}}
				>
					{error}
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmit)} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
				{/* Why Organizing */}
				<div>
					<label style={labelStyle}>
						Why do you want to organize events on DevEvent? <span style={{ color: "var(--red)" }}>*</span>
					</label>
					<textarea
						{...register("whyOrganizing")}
						rows={4}
						placeholder="Tell us about your community goals..."
						style={{
							...inputStyle,
							minHeight: "100px",
							resize: "vertical" as const,
							lineHeight: 1.6,
						}}
						onFocus={handleFocus as any}
						onBlur={handleBlur as any}
					/>
					{errors.whyOrganizing && (
						<p style={fieldErrorStyle}>{errors.whyOrganizing.message}</p>
					)}
				</div>

				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
					{/* Past Events */}
					<div>
						<label style={labelStyle}>
							How many events have you organized? <span style={{ color: "var(--red)" }}>*</span>
						</label>
						<input
							type="number"
							{...register("pastEventsCount", { valueAsNumber: true })}
							min="0"
							style={{
								...inputStyle,
								fontFamily: "var(--font-mono)",
							}}
							onFocus={handleFocus}
							onBlur={handleBlur}
						/>
						{errors.pastEventsCount && (
							<p style={fieldErrorStyle}>{errors.pastEventsCount.message}</p>
						)}
					</div>

					{/* Expected Events */}
					<div>
						<label style={labelStyle}>
							Expected events per month? <span style={{ color: "var(--red)" }}>*</span>
						</label>
						<input
							type="number"
							{...register("expectedEventsPerMonth", { valueAsNumber: true })}
							min="1"
							style={{
								...inputStyle,
								fontFamily: "var(--font-mono)",
							}}
							onFocus={handleFocus}
							onBlur={handleBlur}
						/>
						{errors.expectedEventsPerMonth && (
							<p style={fieldErrorStyle}>{errors.expectedEventsPerMonth.message}</p>
						)}
					</div>
				</div>

				{/* Event Types */}
				<div>
					<label style={labelStyle}>
						What types of events will you host? <span style={{ color: "var(--red)" }}>*</span>
					</label>
					<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
						{EVENT_TYPES.map((type) => (
							<label
								key={type}
								className="event-type-checkbox"
								style={{
									display: "flex",
									alignItems: "center",
									gap: "10px",
									padding: "10px 12px",
									background: "var(--bg-elevated)",
									border: "1px solid var(--border-dim)",
									borderRadius: "var(--radius-sm)",
									fontSize: "13px",
									color: "var(--text-secondary)",
									cursor: "pointer",
									transition: "all 150ms ease",
								}}
							>
								<input
									type="checkbox"
									value={type}
									{...register("primaryEventTypes")}
									style={{
										width: "14px",
										height: "14px",
										accentColor: "var(--gold)",
										flexShrink: 0,
										cursor: "pointer",
									}}
								/>
								<span>{type}</span>
							</label>
						))}
					</div>
					{errors.primaryEventTypes && (
						<p style={fieldErrorStyle}>{errors.primaryEventTypes.message}</p>
					)}
				</div>

				{/* Ticketing Intent */}
				<div>
					<label style={labelStyle}>
						Ticketing plans <span style={{ color: "var(--red)" }}>*</span>
					</label>
					<div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
						{[
							{ value: "free_only", label: "Free events only" },
							{ value: "paid_only", label: "Paid events only" },
							{ value: "both", label: "Both free and paid events" },
						].map((option) => (
							<label
								key={option.value}
								className="ticketing-radio"
								style={{
									display: "flex",
									alignItems: "center",
									gap: "10px",
									padding: "12px 14px",
									background: "var(--bg-elevated)",
									border: "1px solid var(--border-dim)",
									borderRadius: "var(--radius-md)",
									fontSize: "13px",
									color: "var(--text-secondary)",
									cursor: "pointer",
									transition: "all 150ms ease",
								}}
							>
								<input
									type="radio"
									value={option.value}
									{...register("ticketingIntent")}
									style={{
										accentColor: "var(--gold)",
										width: "14px",
										height: "14px",
										cursor: "pointer",
									}}
								/>
								<span>{option.label}</span>
							</label>
						))}
					</div>
					{errors.ticketingIntent && (
						<p style={fieldErrorStyle}>{errors.ticketingIntent.message}</p>
					)}
				</div>

				{/* Terms / Policy */}
				<div
					style={{
						borderTop: "1px solid var(--border-dim)",
						paddingTop: "20px",
						marginTop: "8px",
						display: "flex",
						flexDirection: "column",
						gap: "12px",
					}}
				>
					<label
						style={{
							display: "flex",
							alignItems: "flex-start",
							gap: "10px",
							fontSize: "13px",
							color: "var(--text-muted)",
							lineHeight: 1.5,
							cursor: "pointer",
						}}
					>
						<input
							type="checkbox"
							{...register("termsAccepted")}
							style={{
								marginTop: "2px",
								width: "14px",
								height: "14px",
								accentColor: "var(--gold)",
								flexShrink: 0,
								cursor: "pointer",
							}}
						/>
						<span>
							I agree to the{" "}
							<a
								href="#"
								style={{
									color: "var(--gold)",
									textDecoration: "none",
								}}
								onMouseEnter={(e) => (e.currentTarget.style.color = "#DFC06E")}
								onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gold)")}
							>
								Terms of Service
							</a>{" "}
							for Organizers. <span style={{ color: "var(--red)" }}>*</span>
						</span>
					</label>
					{errors.termsAccepted && (
						<p style={fieldErrorStyle}>{errors.termsAccepted.message}</p>
					)}

					<label
						style={{
							display: "flex",
							alignItems: "flex-start",
							gap: "10px",
							fontSize: "13px",
							color: "var(--text-muted)",
							lineHeight: 1.5,
							cursor: "pointer",
						}}
					>
						<input
							type="checkbox"
							{...register("policyAccepted")}
							style={{
								marginTop: "2px",
								width: "14px",
								height: "14px",
								accentColor: "var(--gold)",
								flexShrink: 0,
								cursor: "pointer",
							}}
						/>
						<span>
							I have read and agree to follow the{" "}
							<a
								href="#"
								style={{
									color: "var(--gold)",
									textDecoration: "none",
								}}
								onMouseEnter={(e) => (e.currentTarget.style.color = "#DFC06E")}
								onMouseLeave={(e) => (e.currentTarget.style.color = "var(--gold)")}
							>
								Community Guidelines &amp; Organizer Policy
							</a>
							. <span style={{ color: "var(--red)" }}>*</span>
						</span>
					</label>
					{errors.policyAccepted && (
						<p style={fieldErrorStyle}>{errors.policyAccepted.message}</p>
					)}
				</div>

				{/* Submit */}
				<div>
					<button
						type="submit"
						disabled={isSubmitting}
						style={{
							width: "100%",
							height: "48px",
							background: "var(--gold)",
							color: "#08080A",
							fontWeight: 600,
							fontSize: "14px",
							border: "none",
							borderRadius: "var(--radius-md)",
							cursor: isSubmitting ? "not-allowed" : "pointer",
							transition: "background 160ms ease",
							letterSpacing: "0.02em",
							opacity: isSubmitting ? 0.5 : 1,
						}}
						onMouseEnter={(e) => {
							if (!isSubmitting) e.currentTarget.style.background = "#DFC06E";
						}}
						onMouseLeave={(e) => {
							if (!isSubmitting) e.currentTarget.style.background = "var(--gold)";
						}}
					>
						{isSubmitting ? "Submitting Application..." : "Submit Application"}
					</button>
				</div>
			</form>

			<style>{`
				.event-type-checkbox:hover {
					border-color: var(--border) !important;
					color: var(--text-primary) !important;
				}
				.event-type-checkbox:has(input:checked) {
					border-color: rgba(201,168,76,0.4) !important;
					background: rgba(19,16,8,0.8) !important;
					color: var(--gold) !important;
				}
				.ticketing-radio:hover {
					border-color: var(--border) !important;
					color: var(--text-primary) !important;
				}
				.ticketing-radio:has(input:checked) {
					border-color: rgba(201,168,76,0.4) !important;
					color: var(--text-primary) !important;
				}
				textarea::placeholder,
				input::placeholder {
					color: var(--text-muted) !important;
				}
				@media (max-width: 640px) {
					.event-type-checkbox {
						/* keep single column on very small screens handled by grid */
					}
				}
			`}</style>
		</div>
	);
}
