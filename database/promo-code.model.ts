import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IPromoCode extends Document {
	eventId: Types.ObjectId;
	code: string; // e.g. "EARLYBIRD"
	type: "percentage" | "fixed";
	value: number; // e.g. 10 for 10%, or 500 for $5.00
	maxUses: number | null;
	currentUses: number;
	expiresAt: Date | null;
	isActive: boolean;
	createdAt: Date;
	updatedAt: Date;
}

const PromoCodeSchema = new Schema<IPromoCode>(
	{
		eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
		code: { type: String, required: true, uppercase: true, trim: true },
		type: { type: String, enum: ["percentage", "fixed"], required: true },
		value: { type: Number, required: true },
		maxUses: { type: Number, default: null },
		currentUses: { type: Number, default: 0 },
		expiresAt: { type: Date, default: null },
		isActive: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

// A promo code must be unique per event
PromoCodeSchema.index({ eventId: 1, code: 1 }, { unique: true });

const PromoCode: Model<IPromoCode> =
	mongoose.models.PromoCode || mongoose.model<IPromoCode>("PromoCode", PromoCodeSchema);

export default PromoCode;
