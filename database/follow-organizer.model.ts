import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IFollowOrganizer extends Document {
	userId: Types.ObjectId;
	organizerId: Types.ObjectId;
	createdAt: Date;
	updatedAt: Date;
}

const FollowOrganizerSchema = new Schema<IFollowOrganizer>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		organizerId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
	},
	{ timestamps: true },
);

FollowOrganizerSchema.index({ userId: 1, organizerId: 1 }, { unique: true });
FollowOrganizerSchema.index({ organizerId: 1, createdAt: -1 });

const FollowOrganizer: Model<IFollowOrganizer> =
	mongoose.models.FollowOrganizer ||
	mongoose.model<IFollowOrganizer>("FollowOrganizer", FollowOrganizerSchema);

export default FollowOrganizer;
