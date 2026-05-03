import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type InteractionType =
	| "view"
	| "bookmark"
	| "share"
	| "register_click"
	| "register_complete";

export interface IUserEventInteraction extends Document {
	userId?: Types.ObjectId | null;
	eventId: Types.ObjectId;
	type: InteractionType;
	weight: number;
	query?: string;
	filtersHash?: string;
	position?: number;
	createdAt: Date;
	updatedAt: Date;
}

const UserEventInteractionSchema = new Schema<IUserEventInteraction>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			default: null,
			index: true,
		},
		eventId: {
			type: Schema.Types.ObjectId,
			ref: "Event",
			required: true,
			index: true,
		},
		type: {
			type: String,
			enum: [
				"view",
				"bookmark",
				"share",
				"register_click",
				"register_complete",
			],
			required: true,
		},
		weight: { type: Number, required: true, min: 0 },
		query: { type: String, trim: true },
		filtersHash: { type: String, trim: true },
		position: { type: Number, min: 0 },
	},
	{ timestamps: true },
);

UserEventInteractionSchema.index({ eventId: 1, createdAt: -1 });
UserEventInteractionSchema.index({ userId: 1, createdAt: -1 });
UserEventInteractionSchema.index({ type: 1, createdAt: -1 });

const UserEventInteraction: Model<IUserEventInteraction> =
	mongoose.models.UserEventInteraction ||
	mongoose.model<IUserEventInteraction>(
		"UserEventInteraction",
		UserEventInteractionSchema,
	);

export default UserEventInteraction;
