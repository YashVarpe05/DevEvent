"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { organizerProfileSchema } from "@/lib/validations/organizer.schemas";

export default function OrganizerProfileSettings() {
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [success, setSuccess] = useState<string | null>(null);

	const {
		register,
		handleSubmit,
		reset,
		formState: { errors },
	} = useForm<z.input<typeof organizerProfileSchema>>({
		resolver: zodResolver(organizerProfileSchema),
		defaultValues: {
			displayName: "",
			slug: "",
			bio: "",
			website: "",
			contactEmail: "",
			location: { city: "", country: "" },
			socialLinks: { x: "", linkedin: "" },
			organizationType: "individual",
		}
	});

	useEffect(() => {
		const fetchProfile = async () => {
			try {
				const res = await fetch("/api/organizer/profile");
				if (!res.ok) throw new Error("Failed to load profile");
				const data = await res.json();
				// Reset form with fetched data
				if (data.profile) {
					reset(data.profile);
				}
			} catch (err) {
				setError("Failed to load organizer profile. Please try refreshing.");
			} finally {
				setLoading(false);
			}
		};

		fetchProfile();
	}, [reset]);

	const onSubmit = async (data: z.input<typeof organizerProfileSchema>) => {
		try {
			setSaving(true);
			setError(null);
			setSuccess(null);

			const res = await fetch("/api/organizer/profile", {
				method: "PATCH",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(data),
			});

			const json = await res.json();

			if (!res.ok) {
				setError(json.details ? JSON.stringify(json.details) : (json.error || "Failed to save profile"));
				return;
			}

			setSuccess("Profile updated successfully!");
			
			// Auto hide success message
			setTimeout(() => {
				setSuccess(null);
			}, 3000);
		} catch (err) {
			setError("An unexpected error occurred.");
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return (
			<div className="animate-pulse space-y-6 max-w-2xl">
				<div className="h-8 bg-zinc-800 rounded w-1/4"></div>
				<div className="space-y-4">
					<div className="h-10 bg-zinc-800 rounded"></div>
					<div className="h-32 bg-zinc-800 rounded"></div>
					<div className="h-10 bg-zinc-800 rounded"></div>
				</div>
			</div>
		);
	}

	const inputStyle = {
		width: "100%",
		padding: "10px 14px",
		background: "var(--bg-base)",
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
		<div style={{ maxWidth: "800px" }}>
			<div style={{ marginBottom: "32px" }}>
				<h1 style={{ fontSize: "28px", fontWeight: 700, color: "var(--text-primary)", fontFamily: "var(--font-display)", marginBottom: "8px" }}>Organizer Profile</h1>
				<p style={{ color: "var(--text-secondary)", fontSize: "15px" }}>
					This information is displayed publicly on your organizer page and on the events you host.
				</p>
			</div>

			{error && (
				<div style={{ padding: "16px", background: "rgba(239, 68, 68, 0.1)", color: "var(--red)", borderRadius: "var(--radius-md)", marginBottom: "24px", border: "1px solid rgba(239, 68, 68, 0.2)" }}>
					{error}
				</div>
			)}

			{success && (
				<div style={{ padding: "16px", background: "rgba(16, 185, 129, 0.1)", color: "var(--green)", borderRadius: "var(--radius-md)", marginBottom: "24px", display: "flex", alignItems: "center", gap: "8px", border: "1px solid rgba(16, 185, 129, 0.2)" }}>
					<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
					{success}
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmit)} style={{ background: "var(--bg-surface)", padding: "32px", borderRadius: "var(--radius-lg)", border: "1px solid var(--border-dim)", display: "flex", flexDirection: "column", gap: "24px" }}>
				<div>
					<label style={labelStyle}>
						Display Name <span style={{ color: "var(--red)" }}>*</span>
					</label>
					<input
						type="text"
						{...register("displayName")}
						style={inputStyle}
						placeholder="e.g., Tech Innovators NYC"
					/>
					{errors.displayName && (
						<p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.displayName.message}</p>
					)}
					<p style={{ marginTop: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
						This should be your community or personal brand name.
					</p>
				</div>

				<div>
					<label style={labelStyle}>
						Profile Slug <span style={{ color: "var(--red)" }}>*</span>
					</label>
					<input
						type="text"
						{...register("slug")}
						style={inputStyle}
						placeholder="e.g., tech-innovators-nyc"
					/>
					{errors.slug && (
						<p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.slug.message}</p>
					)}
					<p style={{ marginTop: "6px", fontSize: "12px", color: "var(--text-muted)" }}>
						The URL for your public profile.
					</p>
				</div>

				<div>
					<label style={labelStyle}>
						Contact Email <span style={{ color: "var(--red)" }}>*</span>
					</label>
					<input
						type="email"
						{...register("contactEmail")}
						style={inputStyle}
						placeholder="e.g., hello@techinnovators.com"
					/>
					{errors.contactEmail && (
						<p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.contactEmail.message}</p>
					)}
				</div>

				<div>
					<label style={labelStyle}>
						Organization Type <span style={{ color: "var(--red)" }}>*</span>
					</label>
					<select
						{...register("organizationType")}
						style={inputStyle}
					>
						<option value="individual">Individual</option>
						<option value="company">Company</option>
						<option value="community">Community</option>
						<option value="university">University</option>
						<option value="nonprofit">Nonprofit</option>
						<option value="other">Other</option>
					</select>
					{errors.organizationType && (
						<p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.organizationType.message}</p>
					)}
				</div>

				<div>
					<label style={labelStyle}>
						About
					</label>
					<textarea
						{...register("bio")}
						rows={5}
						style={{...inputStyle, resize: "vertical"}}
						placeholder="Tell attendees what your events are all about..."
					/>
					{errors.bio && (
						<p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.bio.message}</p>
					)}
				</div>

				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
					<div>
						<label style={labelStyle}>
							Website URL
						</label>
						<input
							type="url"
							{...register("website")}
							style={inputStyle}
							placeholder="https://"
						/>
						{errors.website && (
							<p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.website.message}</p>
						)}
					</div>
					
					<div>
						<label style={labelStyle}>
							X (Twitter) URL
						</label>
						<input
							type="url"
							{...register("socialLinks.x")}
							style={inputStyle}
							placeholder="https://x.com/..."
						/>
						{errors.socialLinks?.x && (
							<p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.socialLinks.x.message}</p>
						)}
					</div>

					<div>
						<label style={labelStyle}>
							LinkedIn URL
						</label>
						<input
							type="url"
							{...register("socialLinks.linkedin")}
							style={inputStyle}
							placeholder="https://linkedin.com/..."
						/>
						{errors.socialLinks?.linkedin && (
							<p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.socialLinks.linkedin.message}</p>
						)}
					</div>
				</div>
				
				<div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
					<div>
						<label style={labelStyle}>
							City <span style={{ color: "var(--red)" }}>*</span>
						</label>
						<input
							type="text"
							{...register("location.city")}
							style={inputStyle}
							placeholder="e.g., San Francisco"
						/>
						{errors.location?.city && (
							<p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.location.city.message}</p>
						)}
					</div>
					
					<div>
						<label style={labelStyle}>
							Country <span style={{ color: "var(--red)" }}>*</span>
						</label>
						<input
							type="text"
							{...register("location.country")}
							style={inputStyle}
							placeholder="e.g., US"
						/>
						{errors.location?.country && (
							<p style={{ marginTop: "4px", fontSize: "14px", color: "var(--red)" }}>{errors.location.country.message}</p>
						)}
					</div>
				</div>

				<div style={{ paddingTop: "24px", borderTop: "1px solid var(--border-dim)", display: "flex", justifyContent: "flex-end", marginTop: "8px" }}>
					<button
						type="submit"
						disabled={saving}
						style={{
							background: "var(--gold)",
							color: "#000",
							padding: "10px 24px",
							borderRadius: "var(--radius-md)",
							fontWeight: 600,
							border: "none",
							cursor: saving ? "not-allowed" : "pointer",
							opacity: saving ? 0.7 : 1,
							boxShadow: saving ? "none" : "0 0 16px rgba(212, 175, 55, 0.2)",
							transition: "all 0.2s"
						}}
						onMouseEnter={(e) => { if(!saving) { e.currentTarget.style.boxShadow = "0 0 24px rgba(212, 175, 55, 0.4)"; e.currentTarget.style.transform = "scale(0.98)"; } }}
						onMouseLeave={(e) => { if(!saving) { e.currentTarget.style.boxShadow = "0 0 16px rgba(212, 175, 55, 0.2)"; e.currentTarget.style.transform = "scale(1)"; } }}
					>
						{saving ? "Saving Changes..." : "Save Profile"}
					</button>
				</div>
			</form>
		</div>
	);
}
