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
				<div className="h-8 bg-gray-200 rounded w-1/4"></div>
				<div className="space-y-4">
					<div className="h-10 bg-gray-200 rounded"></div>
					<div className="h-32 bg-gray-200 rounded"></div>
					<div className="h-10 bg-gray-200 rounded"></div>
				</div>
			</div>
		);
	}

	return (
		<div className="max-w-2xl">
			<div className="mb-8">
				<h1 className="text-2xl font-bold text-gray-900 mb-2">Organizer Profile</h1>
				<p className="text-gray-600">
					This information is displayed publicly on your organizer page and on the events you host.
				</p>
			</div>

			{error && (
				<div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md text-sm">
					{error}
				</div>
			)}

			{success && (
				<div className="mb-6 p-4 bg-green-50 text-green-700 rounded-md text-sm flex items-center gap-2">
					<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
						<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
					</svg>
					{success}
				</div>
			)}

			<form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Display Name <span className="text-red-500">*</span>
					</label>
					<input
						type="text"
						{...register("displayName")}
						className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
						placeholder="e.g., Tech Innovators NYC"
					/>
					{errors.displayName && (
						<p className="mt-1 text-sm text-red-500">{errors.displayName.message}</p>
					)}
					<p className="mt-1 text-xs text-gray-500">
						This should be your community or personal brand name.
					</p>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Profile Slug <span className="text-red-500">*</span>
					</label>
					<input
						type="text"
						{...register("slug")}
						className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
						placeholder="e.g., tech-innovators-nyc"
					/>
					{errors.slug && (
						<p className="mt-1 text-sm text-red-500">{errors.slug.message}</p>
					)}
					<p className="mt-1 text-xs text-gray-500">
						The URL for your public profile.
					</p>
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Contact Email <span className="text-red-500">*</span>
					</label>
					<input
						type="email"
						{...register("contactEmail")}
						className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
						placeholder="e.g., hello@techinnovators.com"
					/>
					{errors.contactEmail && (
						<p className="mt-1 text-sm text-red-500">{errors.contactEmail.message}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						Organization Type <span className="text-red-500">*</span>
					</label>
					<select
						{...register("organizationType")}
						className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none bg-white"
					>
						<option value="individual">Individual</option>
						<option value="company">Company</option>
						<option value="community">Community</option>
						<option value="university">University</option>
						<option value="nonprofit">Nonprofit</option>
						<option value="other">Other</option>
					</select>
					{errors.organizationType && (
						<p className="mt-1 text-sm text-red-500">{errors.organizationType.message}</p>
					)}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-700 mb-2">
						About
					</label>
					<textarea
						{...register("bio")}
						rows={5}
						className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
						placeholder="Tell attendees what your events are all about..."
					/>
					{errors.bio && (
						<p className="mt-1 text-sm text-red-500">{errors.bio.message}</p>
					)}
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Website URL
						</label>
						<input
							type="url"
							{...register("website")}
							className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
							placeholder="https://"
						/>
						{errors.website && (
							<p className="mt-1 text-sm text-red-500">{errors.website.message}</p>
						)}
					</div>
					
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							X (Twitter) URL
						</label>
						<input
							type="url"
							{...register("socialLinks.x")}
							className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
							placeholder="https://x.com/..."
						/>
						{errors.socialLinks?.x && (
							<p className="mt-1 text-sm text-red-500">{errors.socialLinks.x.message}</p>
						)}
					</div>

					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							LinkedIn URL
						</label>
						<input
							type="url"
							{...register("socialLinks.linkedin")}
							className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
							placeholder="https://linkedin.com/..."
						/>
						{errors.socialLinks?.linkedin && (
							<p className="mt-1 text-sm text-red-500">{errors.socialLinks.linkedin.message}</p>
						)}
					</div>
				</div>
				
				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							City <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							{...register("location.city")}
							className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
							placeholder="e.g., San Francisco"
						/>
						{errors.location?.city && (
							<p className="mt-1 text-sm text-red-500">{errors.location.city.message}</p>
						)}
					</div>
					
					<div>
						<label className="block text-sm font-medium text-gray-700 mb-2">
							Country <span className="text-red-500">*</span>
						</label>
						<input
							type="text"
							{...register("location.country")}
							className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-primary focus:border-primary outline-none"
							placeholder="e.g., US"
						/>
						{errors.location?.country && (
							<p className="mt-1 text-sm text-red-500">{errors.location.country.message}</p>
						)}
					</div>
				</div>

				<div className="pt-6 border-t mt-6 flex justify-end">
					<button
						type="submit"
						disabled={saving}
						className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 font-medium"
					>
						{saving ? "Saving Changes..." : "Save Profile"}
					</button>
				</div>
			</form>
		</div>
	);
}
