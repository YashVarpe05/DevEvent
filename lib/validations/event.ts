import * as z from "zod";

// Base schema for creating an event draft
export const eventFormSchema = z.object({
	title: z.string().min(3, "Title must be at least 3 characters").max(120, "Title must be less than 120 characters"),
	shortDescription: z.string().min(10, "Short description must be at least 10 characters").max(250, "Short description must be less than 250 characters"),
	eventType: z.enum(["online", "offline", "hybrid"]),
	timezone: z.string().min(1, "Timezone is required"),
	// [FIXED]: Use Zod 4-compatible date coercion for datetime-local form values.
	startAt: z.coerce.date(),
	endAt: z.coerce.date(),
    // The rest of the fields are optional for drafts
    description: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).default([]),
    coverImageUrl: z.string().optional(),
    visibility: z.enum(["public", "unlisted", "private"]).default("public"),
    isAllDay: z.boolean().default(false),
    
    // Location
    location: z.object({
        venueName: z.string().optional(),
        addressLine1: z.string().optional(),
        addressLine2: z.string().optional(),
        city: z.string().optional(),
        state: z.string().optional(),
        country: z.string().optional(),
        postalCode: z.string().optional(),
    }).optional(),
    
    // Online
    online: z.object({
        platform: z.string().optional(),
        meetingUrl: z.string().optional(),
        accessNotes: z.string().optional(),
    }).optional(),
    
    // Capacity
    capacityType: z.enum(["limited", "unlimited"]).default("unlimited"),
    capacity: z.coerce.number().optional(),
    
    // Pricing
    isPaid: z.boolean().default(false),
    currency: z.string().default("USD"),
    basePrice: z.coerce.number().optional(),
}).refine((data) => data.startAt < data.endAt, {
    message: "End time must be after start time",
    path: ["endAt"],
});

export type EventFormValues = z.infer<typeof eventFormSchema>;

// Publish validation schema (stricter)
export const publishEventSchema = eventFormSchema.refine((data) => {
    // If offline or hybrid, location is required
    if (data.eventType === "offline" || data.eventType === "hybrid") {
        if (!data.location?.addressLine1 || !data.location?.city || !data.location?.country) {
            return false;
        }
    }
    return true;
}, {
    message: "Location (Address, City, Country) is required for offline/hybrid events",
    path: ["location.addressLine1"],
}).refine((data) => {
    // If online or hybrid, meeting URL is required
    if (data.eventType === "online" || data.eventType === "hybrid") {
        if (!data.online?.meetingUrl) {
            return false;
        }
    }
    return true;
}, {
    message: "Meeting URL is required for online/hybrid events",
    path: ["online.meetingUrl"],
}).refine((data) => {
    // If paid, basePrice is required and > 0
    if (data.isPaid) {
        if (!data.basePrice || data.basePrice <= 0) {
            return false;
        }
    }
    return true;
}, {
    message: "Paid events must have a base price greater than 0",
    path: ["basePrice"],
});
