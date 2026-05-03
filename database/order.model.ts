import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type OrderStatus =
	| "pending_payment"
	| "payment_processing"
	| "paid"
	| "payment_failed"
	| "cancelled"
	| "refunded_partial"
	| "refunded_full"
	| "chargeback";

export interface IOrder extends Document {
	eventId: Types.ObjectId;
	buyerUserId: Types.ObjectId;
	organizerId: Types.ObjectId;
	status: OrderStatus;
	currency: string;
	lineItems: Array<{
		ticketTypeId: Types.ObjectId;
		ticketNameSnapshot: string;
		quantity: number;
		unitPrice: number;
		subtotal: number;
		amountSubtotal: number;
		amountDiscount: number;
		amountTax?: number;
		amountTotal: number;
	}>;
	pricingSnapshot: {
		platformFeeRate: number;
		platformFeeFixed: number;
		platformFeeAmount: number;
		processorFeeEstimate: number;
		organizerNetEstimate: number;
	};
	stripeCheckoutSessionId?: string;
	stripePaymentIntentId?: string | null;
	stripeChargeId?: string | null;
	idempotencyKey?: string;
	refunds: Array<{
		stripeRefundId?: string;
		amount: number;
		reason: string;
		initiatedByUserId?: Types.ObjectId;
		initiatedByRole: "organizer" | "admin" | "system";
		status: "pending" | "succeeded" | "failed";
		requestedAt: Date;
		completedAt?: Date | null;
	}>;
	expiresAt?: Date | null;
	referralId?: Types.ObjectId;
	referralCode?: string;
	createdAt: Date;
	updatedAt: Date;
}

const OrderSchema = new Schema<IOrder>(
	{
		eventId: {
			type: Schema.Types.ObjectId,
			ref: "Event",
			required: true,
			index: true,
		},
		buyerUserId: {
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
		status: {
			type: String,
			enum: [
				"pending_payment",
				"payment_processing",
				"paid",
				"payment_failed",
				"cancelled",
				"refunded_partial",
				"refunded_full",
				"chargeback",
			],
			default: "pending_payment",
			index: true,
		},
		currency: { type: String, required: true, lowercase: true },
		lineItems: [
			{
				ticketTypeId: {
					type: Schema.Types.ObjectId,
					ref: "TicketType",
					required: true,
				},
				ticketNameSnapshot: { type: String, required: true },
				quantity: { type: Number, required: true, min: 1 },
				unitPrice: { type: Number, required: true, min: 0 },
				subtotal: { type: Number, required: true },
				amountSubtotal: { type: Number, required: true },
				amountDiscount: { type: Number, default: 0 },
				amountTax: { type: Number, default: 0 },
				amountTotal: { type: Number, required: true },
			},
		],
		pricingSnapshot: {
			platformFeeRate: { type: Number, required: true },
			platformFeeFixed: { type: Number, required: true },
			platformFeeAmount: { type: Number, required: true },
			processorFeeEstimate: { type: Number, required: true },
			organizerNetEstimate: { type: Number, required: true },
		},
		stripeCheckoutSessionId: { type: String, unique: true, sparse: true },
		stripePaymentIntentId: { type: String, index: true, sparse: true },
		stripeChargeId: { type: String, sparse: true, index: true },
		idempotencyKey: { type: String, index: true, sparse: true },
		refunds: [
			{
				stripeRefundId: { type: String, sparse: true },
				amount: { type: Number, required: true, min: 0 },
				reason: { type: String, required: true, trim: true },
				initiatedByUserId: { type: Schema.Types.ObjectId, ref: "User" },
				initiatedByRole: {
					type: String,
					enum: ["organizer", "admin", "system"],
					required: true,
				},
				status: {
					type: String,
					enum: ["pending", "succeeded", "failed"],
					default: "pending",
					required: true,
				},
				requestedAt: { type: Date, default: Date.now, required: true },
				completedAt: { type: Date, default: null },
			},
		],
		expiresAt: { type: Date },
		referralId: { type: Schema.Types.ObjectId, ref: "Referral", sparse: true, index: true },
		referralCode: { type: String, sparse: true, index: true },
	},
	{ timestamps: true },
);

OrderSchema.index({ createdAt: -1 });
OrderSchema.index({ organizerId: 1, createdAt: -1 });
OrderSchema.index({ buyerUserId: 1, createdAt: -1 });
OrderSchema.index({ eventId: 1, status: 1, createdAt: -1 });
OrderSchema.index({ idempotencyKey: 1, buyerUserId: 1, eventId: 1 });

const Order: Model<IOrder> =
	mongoose.models.Order || mongoose.model<IOrder>("Order", OrderSchema);

export default Order;
