import mongoose, { Document, Model, Schema, Types } from "mongoose";

export type ApplicationStatus = "pending" | "approved" | "rejected" | "withdrawn";
export type TicketingIntent = "free_only" | "paid_only" | "both";

export interface IApplicationData {
	whyOrganizing: string;
	pastEventsCount: number;
	expectedEventsPerMonth: number;
	primaryEventTypes: string[];
	ticketingIntent: TicketingIntent;
	termsAccepted: boolean;
	policyAccepted: boolean;
}

export interface IOrganizerApplication extends Document {
	userId: Types.ObjectId;
	status: ApplicationStatus;
	submittedAt: Date;
	reviewedAt?: Date;
	reviewedBy?: Types.ObjectId;
	reviewNotes?: string;
	rejectionReason?: string;
	applicationData: IApplicationData;
	riskFlags?: string[];
	createdAt: Date;
	updatedAt: Date;
}

const OrganizerApplicationSchema = new Schema<IOrganizerApplication>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		status: {
			type: String,
			required: true,
			enum: {
				values: ["pending", "approved", "rejected", "withdrawn"],
				message: "Status must be pending, approved, rejected, or withdrawn",
			},
			default: "pending",
		},
		submittedAt: {
			type: Date,
			required: true,
			default: Date.now,
		},
		reviewedAt: {
			type: Date,
		},
		reviewedBy: {
			type: Schema.Types.ObjectId,
			ref: "User",
		},
		reviewNotes: {
			type: String,
			trim: true,
		},
		rejectionReason: {
			type: String,
			trim: true,
		},
		applicationData: {
			whyOrganizing: {
				type: String,
				required: [true, "Please tell us why you want to organize events"],
				trim: true,
				maxlength: [1000, "Must be less than 1000 characters"],
			},
			pastEventsCount: {
				type: Number,
				required: true,
				min: [0, "Must be 0 or more"],
			},
			expectedEventsPerMonth: {
				type: Number,
				required: true,
				min: [1, "Must be at least 1"],
			},
			primaryEventTypes: {
				type: [String],
				required: true,
				validate: {
					validator: (v: string[]) => v.length > 0,
					message: "Select at least one event type",
				},
			},
			ticketingIntent: {
				type: String,
				required: true,
				enum: {
					values: ["free_only", "paid_only", "both"],
					message: "Must be free_only, paid_only, or both",
				},
			},
			termsAccepted: {
				type: Boolean,
				required: true,
				validate: {
					validator: (v: boolean) => v === true,
					message: "You must accept the terms",
				},
			},
			policyAccepted: {
				type: Boolean,
				required: true,
				validate: {
					validator: (v: boolean) => v === true,
					message: "You must accept the policy",
				},
			},
		},
		riskFlags: {
			type: [String],
			default: [],
		},
	},
	{
		timestamps: true,
	},
);

// Compound index for admin queue queries
OrganizerApplicationSchema.index({ status: 1, createdAt: -1 });

const OrganizerApplication: Model<IOrganizerApplication> =
	mongoose.models.OrganizerApplication ||
	mongoose.model<IOrganizerApplication>(
		"OrganizerApplication",
		OrganizerApplicationSchema,
	);

export default OrganizerApplication;
