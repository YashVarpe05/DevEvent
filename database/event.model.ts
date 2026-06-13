import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type EventType = "online" | "offline" | "hybrid";
export type EventVisibility = "public" | "unlisted" | "private";
export type EventStatus = "draft" | "published" | "unpublished" | "cancelled" | "completed";
export type CapacityType = "limited" | "unlimited";

export interface IEvent extends Document {
	organizerId: Types.ObjectId;
	organizerProfileId: Types.ObjectId;
	title: string;
	slug: string;
	shortDescription: string;
	description?: string;
	category?: string;
	tags: string[];
	coverImageUrl?: string;
	galleryImages: string[];
	eventType: EventType;
	visibility: EventVisibility;
	status: EventStatus;
	timezone: string;
	startAt: Date;
	endAt: Date;
	isAllDay: boolean;
	location?: {
		venueName?: string;
		addressLine1?: string;
		addressLine2?: string;
		city?: string;
		state?: string;
		country?: string;
		postalCode?: string;
		lat?: number;
		lng?: number;
	};
	online?: {
		platform?: string;
		meetingUrl?: string;
		accessNotes?: string;
	};
	capacityType: CapacityType;
	capacity?: number;
	requiresApproval: boolean;
	waitlistEnabled: boolean;
	showGuestList: boolean;
	coHostEmails: string[];
	registrationQuestions: {
		id: string;
		label: string;
		type: "text" | "select" | "checkbox";
		required: boolean;
		options: string[];
	}[];
	registrationStartAt?: Date;
	registrationEndAt?: Date;
	isPaid: boolean;
	currency?: string;
	basePrice?: number;
	seo?: {
		metaTitle?: string;
		metaDescription?: string;
		ogImage?: string;
	};
	stats: {
		viewsCount: number;
		bookmarksCount: number;
		registrationsCount: number;
	};
	searchableText: string;
	qualityScore: number;
	popularityScore: number;
	trendingScore: number;
	geo?: {
		type: "Point";
		coordinates: [number, number];
	};
	language?: string;
	// Idempotency markers for the lifecycle email cron
	lifecycleEmails?: {
		dayBeforeSentAt?: Date | null;
		hourBeforeSentAt?: Date | null;
		feedbackSentAt?: Date | null;
	};
	seriesId?: Types.ObjectId | null;
	isFeatured: boolean;
	publishedAt?: Date | null;
	lastPublishedAt?: Date | null;
	deletedAt?: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

const RegistrationQuestionSchema = new Schema(
	{
		id: { type: String, required: true },
		label: { type: String, required: true, trim: true, maxlength: 150 },
		type: { type: String, enum: ["text", "select", "checkbox"], default: "text" },
		required: { type: Boolean, default: false },
		options: { type: [String], default: [] },
	},
	{ _id: false },
);

const EventSchema = new Schema<IEvent>(
	{
		organizerId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		organizerProfileId: {
			type: Schema.Types.ObjectId,
			ref: "OrganizerProfile",
			required: true,
			index: true,
		},
		title: {
			type: String,
			required: [true, "Title is required"],
			trim: true,
			maxlength: 120,
		},
		slug: {
			type: String,
			unique: true,
			index: true,
			lowercase: true,
			trim: true,
		},
		shortDescription: {
			type: String,
			required: [true, "Short description is required"],
			trim: true,
			maxlength: 250,
		},
		description: { type: String },
		category: { type: String, trim: true },
		tags: { type: [String], default: [] },
		coverImageUrl: { type: String },
		galleryImages: { type: [String], default: [] },
		eventType: {
			type: String,
			enum: ["online", "offline", "hybrid"],
			default: "offline",
		},
		visibility: {
			type: String,
			enum: ["public", "unlisted", "private"],
			default: "public",
		},
		status: {
			type: String,
			enum: ["draft", "published", "unpublished", "cancelled", "completed"],
			default: "draft",
			index: true,
		},
		timezone: { type: String, required: [true, "Timezone is required"] },
		startAt: {
			type: Date,
			required: [true, "Start time is required"],
			index: true,
		},
		endAt: { type: Date, required: [true, "End time is required"] },
		isAllDay: { type: Boolean, default: false },
		location: {
			venueName: { type: String, trim: true },
			addressLine1: { type: String, trim: true },
			addressLine2: { type: String, trim: true },
			city: { type: String, trim: true },
			state: { type: String, trim: true },
			country: { type: String, trim: true },
			postalCode: { type: String, trim: true },
			lat: { type: Number },
			lng: { type: Number },
		},
		online: {
			platform: { type: String, trim: true },
			meetingUrl: { type: String, trim: true },
			accessNotes: { type: String, trim: true },
		},
		capacityType: {
			type: String,
			enum: ["limited", "unlimited"],
			default: "unlimited",
		},
		capacity: { type: Number },
		requiresApproval: { type: Boolean, default: false },
		waitlistEnabled: { type: Boolean, default: true },
		showGuestList: { type: Boolean, default: true },
		coHostEmails: { type: [{ type: String, lowercase: true, trim: true }], default: [] },
		registrationQuestions: {
			type: [RegistrationQuestionSchema],
			default: [],
		},
		registrationStartAt: { type: Date },
		registrationEndAt: { type: Date },
		isPaid: { type: Boolean, default: false },
		currency: { type: String, default: "USD" },
		basePrice: { type: Number },
		seo: {
			metaTitle: { type: String, trim: true },
			metaDescription: { type: String, trim: true },
			ogImage: { type: String, trim: true },
		},
		stats: {
			viewsCount: { type: Number, default: 0 },
			bookmarksCount: { type: Number, default: 0 },
			registrationsCount: { type: Number, default: 0 },
		},
		searchableText: { type: String, default: "", index: true },
		qualityScore: { type: Number, default: 0, min: 0, max: 100, index: true },
		popularityScore: {
			type: Number,
			default: 0,
			min: 0,
			max: 100,
			index: true,
		},
		trendingScore: { type: Number, default: 0, min: 0, max: 100, index: true },
		geo: {
			type: {
				type: String,
				enum: ["Point"],
				required: false,
			},
			coordinates: {
				type: [Number],
				validate: {
					validator: (coords: number[] | undefined) => {
						if (!coords) return true;
						return coords.length === 2;
					},
					message: "Geo coordinates must be [lng, lat]",
				},
			},
		},
		language: { type: String, trim: true, lowercase: true },
		lifecycleEmails: {
			dayBeforeSentAt: { type: Date, default: null },
			hourBeforeSentAt: { type: Date, default: null },
			feedbackSentAt: { type: Date, default: null },
		},
		// Links the occurrences of a recurring event together
		seriesId: { type: Schema.Types.ObjectId, default: null, index: true },
		isFeatured: { type: Boolean, default: false, index: true },
		publishedAt: { type: Date, default: null },
		lastPublishedAt: { type: Date, default: null },
		deletedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

// Compound indexes
EventSchema.index({ organizerId: 1, createdAt: -1 });
EventSchema.index({ status: 1, visibility: 1, startAt: 1 });
EventSchema.index({ status: 1, visibility: 1, endAt: 1, startAt: 1 });
EventSchema.index({ status: 1, visibility: 1, category: 1, startAt: 1 });
EventSchema.index({ status: 1, visibility: 1, eventType: 1, startAt: 1 });
EventSchema.index({ status: 1, visibility: 1, isPaid: 1, basePrice: 1 });
EventSchema.index({ status: 1, visibility: 1, publishedAt: -1 });
EventSchema.index({
	status: 1,
	visibility: 1,
	popularityScore: -1,
	startAt: 1,
});
EventSchema.index({ status: 1, visibility: 1, trendingScore: -1, startAt: 1 });
EventSchema.index({ geo: "2dsphere" });
EventSchema.index(
	{
		title: "text",
		shortDescription: "text",
		description: "text",
		tags: "text",
		searchableText: "text",
	},
	{
		weights: {
			title: 10,
			shortDescription: 5,
			tags: 7,
			description: 2,
			searchableText: 1,
		},
	},
);

// Pre-save hook for slug generation
EventSchema.pre("save", async function () {
	const event = this as IEvent;

	if (event.isModified("title") && !event.slug) {
		const baseSlug = event.title
			.toLowerCase()
			.trim()
			.replace(/[^\w\s-]/g, "")
			.replace(/\s+/g, "-")
			.replace(/-+/g, "-");

		let uniqueSlug = baseSlug;
		let counter = 1;

		while (true) {
			const slugExists = await mongoose.model("Event").exists({
				slug: uniqueSlug,
				_id: { $ne: event._id },
			});

			if (!slugExists) break;
			uniqueSlug = `${baseSlug}-${counter}`;
			counter++;
		}
		event.slug = uniqueSlug;
	}

	if (event.isModified("location") || event.isModified("eventType")) {
		const lat = event.location?.lat;
		const lng = event.location?.lng;
		if (typeof lat === "number" && typeof lng === "number") {
			event.geo = { type: "Point", coordinates: [lng, lat] };
		} else {
			event.geo = undefined;
		}
	}

	if (
		event.isModified("title") ||
		event.isModified("shortDescription") ||
		event.isModified("description") ||
		event.isModified("category") ||
		event.isModified("tags") ||
		event.isModified("location")
	) {
		const parts = [
			event.title,
			event.shortDescription,
			event.description || "",
			event.category || "",
			(event.tags || []).join(" "),
			event.location?.city || "",
			event.location?.country || "",
		];

		event.searchableText = parts
			.join(" ")
			.toLowerCase()
			.replace(/\s+/g, " ")
			.trim();
	}
});

const Event: Model<IEvent> =
	mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
