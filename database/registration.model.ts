import { Schema, model, models, Document, Types } from "mongoose";

export interface IRegistration extends Document {
	eventId: Types.ObjectId;
	attendeeUserId: Types.ObjectId;
	attendeeEmail: string;
	attendeeName: string;
	attendeePhone?: string;
	status: "confirmed" | "cancelled_by_user" | "cancelled_by_organizer" | "waitlisted" | "no_show";
	bookingType: "free" | "paid";
	quantity: number;
	ticketCode: string; // e.g., TKT-AB12CD34
	qrPayload: string; // Signed server token
	orderId?: Types.ObjectId;
	ticketTypeId?: Types.ObjectId;
	checkedInAt?: Date | null;
	checkedInBy?: Types.ObjectId | null;
	source: "web" | "api" | "admin";
	metadata?: Record<string, any>;
	createdAt: Date;
	updatedAt: Date;
	cancelledAt?: Date | null;
}

const RegistrationSchema = new Schema<IRegistration>(
	{
		eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
		attendeeUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		attendeeEmail: { type: String, required: true },
		attendeeName: { type: String, required: true },
		attendeePhone: { type: String },
		status: {
			type: String,
			enum: ["confirmed", "cancelled_by_user", "cancelled_by_organizer", "waitlisted", "no_show"],
			default: "confirmed",
			required: true,
		},
		bookingType: { type: String, enum: ["free", "paid"], default: "free", required: true },
		quantity: { type: Number, default: 1, required: true },
		ticketCode: { type: String, required: true, unique: true },
		qrPayload: { type: String, required: true },
		orderId: { type: Schema.Types.ObjectId, ref: "Order", index: true },
		ticketTypeId: { type: Schema.Types.ObjectId, ref: "TicketType", index: true },
		checkedInAt: { type: Date, default: null },
		checkedInBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
		source: { type: String, enum: ["web", "api", "admin"], default: "web", required: true },
		metadata: { type: Schema.Types.Mixed },
		cancelledAt: { type: Date, default: null },
	},
	{
		timestamps: true,
	}
);

// Modify partial unique index to only apply to FREE bookings
// In Paid bookings, a user can have multiple active tickets or orders.
RegistrationSchema.index(
	{ eventId: 1, attendeeUserId: 1 },
	{
		unique: true,
		partialFilterExpression: { status: "confirmed", bookingType: "free" },
	}
);

RegistrationSchema.index({ eventId: 1, createdAt: 1 });
RegistrationSchema.index({ attendeeUserId: 1, createdAt: 1 });

const Registration = models.Registration || model<IRegistration>("Registration", RegistrationSchema);

export default Registration;
