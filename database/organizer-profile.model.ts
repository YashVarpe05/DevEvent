import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type OrganizationType =
	| "individual"
	| "company"
	| "community"
	| "university"
	| "nonprofit"
	| "other";

export interface IOrganizerProfile extends Document {
	userId: Types.ObjectId;
	displayName: string;
	slug: string;
	bio: string;
	avatarUrl?: string;
	website?: string;
	contactEmail: string;
	phone?: string;
	location: {
		city: string;
		country: string;
	};
	socialLinks?: {
		x?: string;
		linkedin?: string;
		github?: string;
		instagram?: string;
	};
	organizationType: OrganizationType;
	teamSize?: number;
	eventCategories: string[];
	isPublic: boolean;
	stripeConnectedAccountId?: string;
	stripeOnboardingComplete: boolean;
	chargesEnabled: boolean;
	payoutsEnabled: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const OrganizerProfileSchema = new Schema<IOrganizerProfile>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
		},
		displayName: {
			type: String,
			required: [true, "Display name is required"],
			trim: true,
			maxlength: [100, "Display name must be less than 100 characters"],
		},
		slug: {
			type: String,
			required: [true, "Slug is required"],
			unique: true,
			lowercase: true,
			trim: true,
			match: [
				/^[a-z0-9][a-z0-9-]*[a-z0-9]$/,
				"Slug must contain only lowercase letters, numbers, and hyphens",
			],
			minlength: [3, "Slug must be at least 3 characters"],
			maxlength: [40, "Slug must be less than 40 characters"],
		},
		bio: {
			type: String,
			default: "",
			maxlength: [500, "Bio must be less than 500 characters"],
		},
		avatarUrl: {
			type: String,
			trim: true,
		},
		website: {
			type: String,
			trim: true,
		},
		contactEmail: {
			type: String,
			required: [true, "Contact email is required"],
			lowercase: true,
			trim: true,
		},
		phone: {
			type: String,
			trim: true,
		},
		location: {
			city: { type: String, required: true, trim: true },
			country: { type: String, required: true, trim: true },
		},
		socialLinks: {
			x: { type: String, trim: true },
			linkedin: { type: String, trim: true },
			github: { type: String, trim: true },
			instagram: { type: String, trim: true },
		},
		organizationType: {
			type: String,
			required: true,
			enum: {
				values: [
					"individual",
					"company",
					"community",
					"university",
					"nonprofit",
					"other",
				],
				message: "Invalid organization type",
			},
			default: "individual",
		},
		teamSize: {
			type: Number,
			min: [1, "Team size must be at least 1"],
		},
		eventCategories: {
			type: [String],
			default: [],
		},
		isPublic: {
			type: Boolean,
			default: true,
		},
		stripeConnectedAccountId: {
			type: String,
			sparse: true,
			index: true,
		},
		stripeOnboardingComplete: {
			type: Boolean,
			default: false,
		},
		chargesEnabled: {
			type: Boolean,
			default: false,
		},
		payoutsEnabled: {
			type: Boolean,
			default: false,
		},
	},
	{
		timestamps: true,
	},
);

const OrganizerProfile: Model<IOrganizerProfile> =
	mongoose.models.OrganizerProfile ||
	mongoose.model<IOrganizerProfile>("OrganizerProfile", OrganizerProfileSchema);

export default OrganizerProfile;
