import { z } from "zod";

// ─── Slug ────────────────────────────────────────────────────────────────────

export const slugSchema = z
	.string()
	.min(3, "Slug must be at least 3 characters")
	.max(40, "Slug must be less than 40 characters")
	.regex(
		/^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
		"Slug must start and end with a letter or number, and contain only lowercase letters, numbers, and hyphens",
	)
	.transform((v) => v.toLowerCase());

// ─── Organizer Application ──────────────────────────────────────────────────

export const organizerApplicationSchema = z.object({
	whyOrganizing: z
		.string()
		.min(20, "Please provide at least 20 characters explaining why you want to organize")
		.max(1000, "Must be less than 1000 characters")
		.trim(),
	pastEventsCount: z
		.number()
		.int()
		.min(0, "Must be 0 or more"),
	expectedEventsPerMonth: z
		.number()
		.int()
		.min(1, "Must be at least 1")
		.max(100, "Must be 100 or fewer"),
	primaryEventTypes: z
		.array(z.string().trim())
		.min(1, "Select at least one event type")
		.max(10, "Select at most 10 event types"),
	ticketingIntent: z.enum(["free_only", "paid_only", "both"], {
		error: "Select a ticketing preference",
	}),
	termsAccepted: z.literal(true, {
		error: "You must accept the terms of service",
	}),
	policyAccepted: z.literal(true, {
		error: "You must accept the organizer policy",
	}),
});

// ─── Organizer Profile ──────────────────────────────────────────────────────

export const organizerProfileSchema = z.object({
	displayName: z
		.string()
		.min(1, "Display name is required")
		.max(100, "Display name must be less than 100 characters")
		.trim(),
	slug: slugSchema,
	bio: z
		.string()
		.max(500, "Bio must be less than 500 characters")
		.trim()
		.optional()
		.default(""),
	avatarUrl: z.string().url("Must be a valid URL").optional().or(z.literal("")),
	website: z.string().url("Must be a valid URL").optional().or(z.literal("")),
	contactEmail: z
		.string()
		.email("Must be a valid email")
		.toLowerCase()
		.trim(),
	phone: z.string().max(20).trim().optional().or(z.literal("")),
	location: z.object({
		city: z.string().min(1, "City is required").trim(),
		country: z.string().min(1, "Country is required").trim(),
	}),
	socialLinks: z
		.object({
			x: z.string().trim().optional().or(z.literal("")),
			linkedin: z.string().trim().optional().or(z.literal("")),
			github: z.string().trim().optional().or(z.literal("")),
			instagram: z.string().trim().optional().or(z.literal("")),
		})
		.optional(),
	organizationType: z.enum(
		["individual", "company", "community", "university", "nonprofit", "other"],
		{ error: "Select an organization type" },
	),
	teamSize: z.number().int().min(1).optional(),
	eventCategories: z.array(z.string().trim()).max(15).optional().default([]),
	isPublic: z.boolean().optional().default(true),
});

// ─── Admin Review ───────────────────────────────────────────────────────────

export const adminApproveSchema = z.object({
	reviewNotes: z.string().max(1000).trim().optional(),
});

export const adminRejectSchema = z.object({
	rejectionReason: z
		.string()
		.min(1, "Rejection reason is required")
		.max(1000, "Must be less than 1000 characters")
		.trim(),
	reviewNotes: z.string().max(1000).trim().optional(),
});

// ─── Types ──────────────────────────────────────────────────────────────────

export type OrganizerApplicationInput = z.infer<typeof organizerApplicationSchema>;
export type OrganizerProfileInput = z.infer<typeof organizerProfileSchema>;
export type AdminApproveInput = z.infer<typeof adminApproveSchema>;
export type AdminRejectInput = z.infer<typeof adminRejectSchema>;
