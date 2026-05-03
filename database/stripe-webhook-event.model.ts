import mongoose, { Document, Model, Schema } from "mongoose";

export interface IStripeWebhookEvent extends Document {
	eventId: string;
	eventType: string;
	processedAt: Date;
}

const StripeWebhookEventSchema = new Schema<IStripeWebhookEvent>(
	{
		eventId: { type: String, required: true, unique: true, index: true },
		eventType: { type: String, required: true, index: true },
		processedAt: { type: Date, default: Date.now, required: true },
	},
	{ timestamps: true },
);

StripeWebhookEventSchema.index({ processedAt: -1 });

const StripeWebhookEvent: Model<IStripeWebhookEvent> =
	mongoose.models.StripeWebhookEvent ||
	mongoose.model<IStripeWebhookEvent>(
		"StripeWebhookEvent",
		StripeWebhookEventSchema,
	);

export default StripeWebhookEvent;
