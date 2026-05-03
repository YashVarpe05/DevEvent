import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface ITicketType extends Document {
	eventId: Types.ObjectId;
	name: string;
	description?: string;
	price: number; // in minor units (cents)
	currency: string;
	quantityTotal: number;
	quantitySold: number;
	minPerOrder: number;
	maxPerOrder: number;
	salesStartAt?: Date;
	salesEndAt?: Date;
	isHidden: boolean;
	status: "active" | "paused" | "sold_out" | "archived";
	createdAt: Date;
	updatedAt: Date;
}

const TicketTypeSchema = new Schema<ITicketType>(
	{
		eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
		name: { type: String, required: true, trim: true },
		description: { type: String, trim: true },
		price: { type: Number, required: true, min: 0 },
		currency: { type: String, default: "USD", lowercase: true },
		quantityTotal: { type: Number, required: true, min: 0 },
		quantitySold: { type: Number, default: 0, min: 0 },
		minPerOrder: { type: Number, default: 1, min: 1 },
		maxPerOrder: { type: Number, default: 10, min: 1 },
		salesStartAt: { type: Date },
		salesEndAt: { type: Date },
		isHidden: { type: Boolean, default: false },
		status: {
			type: String,
			enum: ["active", "paused", "sold_out", "archived"],
			default: "active",
			index: true,
		},
	},
	{ timestamps: true }
);

// Ensure name is unique per event
TicketTypeSchema.index({ eventId: 1, name: 1 }, { unique: true });

const TicketType: Model<ITicketType> =
	mongoose.models.TicketType || mongoose.model<ITicketType>("TicketType", TicketTypeSchema);

export default TicketType;
