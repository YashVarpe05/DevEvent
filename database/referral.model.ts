import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IReferral extends Document {
	eventId: Types.ObjectId;
	organizerId: Types.ObjectId;
	name: string;
	code: string;
	clicks: number;
	conversions: number;
	revenue: number;
	createdAt: Date;
	updatedAt: Date;
}

const ReferralSchema = new Schema<IReferral>(
	{
		eventId: {
			type: Schema.Types.ObjectId,
			ref: "Event",
			required: true,
			index: true,
		},
		organizerId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		name: { type: String, required: true },
		code: { type: String, required: true },
		clicks: { type: Number, default: 0 },
		conversions: { type: Number, default: 0 },
		revenue: { type: Number, default: 0 },
	},
	{ timestamps: true }
);

// Ensure a code is unique per event
ReferralSchema.index({ eventId: 1, code: 1 }, { unique: true });

const Referral: Model<IReferral> =
	mongoose.models.Referral || mongoose.model<IReferral>("Referral", ReferralSchema);

export default Referral;
