import mongoose, { Document, Model, Schema, Types } from "mongoose";

export interface IEventAnalyticsDaily extends Document {
	eventId: Types.ObjectId;
	date: Date;
	views: number;
	uniqueViews: number;
	registrations: number;
	ticketsSold: number;
	grossRevenue: number;
	bookmarks: number;
	shares: number;
	conversionRate: number;
	createdAt: Date;
	updatedAt: Date;
}

const EventAnalyticsDailySchema = new Schema<IEventAnalyticsDaily>(
	{
		eventId: {
			type: Schema.Types.ObjectId,
			ref: "Event",
			required: true,
			index: true,
		},
		date: { type: Date, required: true, index: true },
		views: { type: Number, default: 0, min: 0 },
		uniqueViews: { type: Number, default: 0, min: 0 },
		registrations: { type: Number, default: 0, min: 0 },
		ticketsSold: { type: Number, default: 0, min: 0 },
		grossRevenue: { type: Number, default: 0, min: 0 },
		bookmarks: { type: Number, default: 0, min: 0 },
		shares: { type: Number, default: 0, min: 0 },
		conversionRate: { type: Number, default: 0, min: 0 },
	},
	{ timestamps: true },
);

EventAnalyticsDailySchema.index({ eventId: 1, date: -1 }, { unique: true });
EventAnalyticsDailySchema.index({ date: -1, views: -1 });
EventAnalyticsDailySchema.index({ date: -1, registrations: -1 });

const EventAnalyticsDaily: Model<IEventAnalyticsDaily> =
	mongoose.models.EventAnalyticsDaily ||
	mongoose.model<IEventAnalyticsDaily>(
		"EventAnalyticsDaily",
		EventAnalyticsDailySchema,
	);

export default EventAnalyticsDaily;
