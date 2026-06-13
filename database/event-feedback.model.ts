import { Schema, model, models, Document, Types } from "mongoose";

export interface IEventFeedback extends Document {
	eventId: Types.ObjectId;
	attendeeUserId: Types.ObjectId;
	rating: number; // 1-5 stars
	comment?: string;
	createdAt: Date;
	updatedAt: Date;
}

const EventFeedbackSchema = new Schema<IEventFeedback>(
	{
		eventId: { type: Schema.Types.ObjectId, ref: "Event", required: true, index: true },
		attendeeUserId: { type: Schema.Types.ObjectId, ref: "User", required: true },
		rating: { type: Number, required: true, min: 1, max: 5 },
		comment: { type: String, trim: true, maxlength: 2000 },
	},
	{ timestamps: true },
);

// One feedback entry per attendee per event (resubmitting updates it)
EventFeedbackSchema.index({ eventId: 1, attendeeUserId: 1 }, { unique: true });

const EventFeedback =
	models.EventFeedback || model<IEventFeedback>("EventFeedback", EventFeedbackSchema);

export default EventFeedback;
