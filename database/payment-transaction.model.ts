import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type TransactionType =
	| "payment_captured"
	| "refund_issued"
	| "chargeback"
	| "payout_released"
	| "fee_adjustment";

export interface IPaymentTransaction extends Document {
	orderId: Types.ObjectId;
	eventId: Types.ObjectId;
	organizerId: Types.ObjectId;
	buyerUserId: Types.ObjectId;
	type: TransactionType;
	status: "pending" | "succeeded" | "failed";
	amount: number; // in cents
	currency: string;
	externalRef?: string; // stripe object id
	rawProviderPayload?: Record<string, any>;
	occurredAt: Date;
	createdAt: Date;
	updatedAt: Date;
}

const PaymentTransactionSchema = new Schema<IPaymentTransaction>(
	{
		orderId: {
			type: Schema.Types.ObjectId,
			ref: "Order",
			required: true,
			index: true,
		},
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
		buyerUserId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		type: {
			type: String,
			enum: [
				"payment_captured",
				"refund_issued",
				"chargeback",
				"payout_released",
				"fee_adjustment",
			],
			required: true,
			index: true,
		},
		status: {
			type: String,
			enum: ["pending", "succeeded", "failed"],
			default: "succeeded",
			required: true,
		},
		amount: { type: Number, required: true },
		currency: { type: String, required: true, lowercase: true },
		externalRef: { type: String, index: true },
		rawProviderPayload: { type: Schema.Types.Mixed },
		occurredAt: { type: Date, default: Date.now },
	},
	{ timestamps: true },
);

PaymentTransactionSchema.index({ occurredAt: -1 });
PaymentTransactionSchema.index({ organizerId: 1, occurredAt: -1 });
PaymentTransactionSchema.index({ buyerUserId: 1, occurredAt: -1 });
PaymentTransactionSchema.index(
	{ type: 1, externalRef: 1 },
	{ unique: true, sparse: true },
);

const PaymentTransaction: Model<IPaymentTransaction> =
	mongoose.models.PaymentTransaction ||
	mongoose.model<IPaymentTransaction>(
		"PaymentTransaction",
		PaymentTransactionSchema,
	);

export default PaymentTransaction;
