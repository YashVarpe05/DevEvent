import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type PreferredFormat = "online" | "offline" | "hybrid";
export type PriceAffinity = "free" | "mixed" | "paid";

export interface IUserInterestProfile extends Document {
	userId: Types.ObjectId;
	preferredCategories: string[];
	preferredCities: string[];
	preferredFormats: PreferredFormat[];
	priceAffinity: PriceAffinity;
	activeHours?: number[];
	recentInteractions: Array<{
		eventId?: Types.ObjectId;
		category?: string;
		weight: number;
		at: Date;
	}>;
	updatedAt: Date;
	createdAt: Date;
}

const UserInterestProfileSchema = new Schema<IUserInterestProfile>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			unique: true,
			index: true,
		},
		preferredCategories: { type: [String], default: [] },
		preferredCities: { type: [String], default: [] },
		preferredFormats: {
			type: [String],
			enum: ["online", "offline", "hybrid"],
			default: [],
		},
		priceAffinity: {
			type: String,
			enum: ["free", "mixed", "paid"],
			default: "mixed",
			required: true,
		},
		activeHours: {
			type: [Number],
			default: undefined,
			validate: {
				validator: (hours: number[] | undefined) => {
					if (!hours) return true;
					return hours.every((h) => Number.isInteger(h) && h >= 0 && h <= 23);
				},
				message: "activeHours must be integers between 0 and 23",
			},
		},
		recentInteractions: {
			type: [
				{
					eventId: { type: Schema.Types.ObjectId, ref: "Event" },
					category: { type: String },
					weight: { type: Number, required: true, min: 0 },
					at: { type: Date, default: Date.now, required: true },
				},
			],
			default: [],
		},
	},
	{ timestamps: true },
);

UserInterestProfileSchema.index({ updatedAt: -1 });

const UserInterestProfile: Model<IUserInterestProfile> =
	mongoose.models.UserInterestProfile ||
	mongoose.model<IUserInterestProfile>(
		"UserInterestProfile",
		UserInterestProfileSchema,
	);

export default UserInterestProfile;
