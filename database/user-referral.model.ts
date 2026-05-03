import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IUserReferral extends Document {
	referrerId: Types.ObjectId;
	referredUserId?: Types.ObjectId;
	eventId?: Types.ObjectId;
	orderId?: Types.ObjectId;
	status: "clicked" | "signed_up" | "converted";
	createdAt: Date;
	updatedAt: Date;
}

const UserReferralSchema = new Schema<IUserReferral>(
	{
		referrerId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		referredUserId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			default: null,
		},
		eventId: {
			type: Schema.Types.ObjectId,
			ref: "Event",
			default: null,
		},
		orderId: {
			type: Schema.Types.ObjectId,
			ref: "Order",
			default: null,
		},
		status: {
			type: String,
			enum: ["clicked", "signed_up", "converted"],
			default: "clicked",
		},
	},
	{ timestamps: true }
);

UserReferralSchema.index({ referrerId: 1, eventId: 1 });
UserReferralSchema.index({ referredUserId: 1, eventId: 1 });

const UserReferral: Model<IUserReferral> =
	mongoose.models.UserReferral || mongoose.model<IUserReferral>("UserReferral", UserReferralSchema);

export default UserReferral;
