import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ISavedSearch extends Document {
	userId: Types.ObjectId;
	query: string;
	filters: Record<string, unknown>;
	name?: string;
	notificationFrequency: "daily" | "weekly" | "off";
	lastNotifiedAt?: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

const SavedSearchSchema = new Schema<ISavedSearch>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		query: { type: String, default: "", trim: true },
		filters: { type: Schema.Types.Mixed, default: {} },
		name: { type: String, trim: true },
		notificationFrequency: {
			type: String,
			enum: ["daily", "weekly", "off"],
			default: "weekly",
			required: true,
		},
		lastNotifiedAt: { type: Date, default: null },
	},
	{ timestamps: true },
);

SavedSearchSchema.index({ userId: 1, createdAt: -1 });
SavedSearchSchema.index({ userId: 1, name: 1 }, { sparse: true });

const SavedSearch: Model<ISavedSearch> =
	mongoose.models.SavedSearch ||
	mongoose.model<ISavedSearch>("SavedSearch", SavedSearchSchema);

export default SavedSearch;
