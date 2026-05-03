import mongoose, { Document, Model, Schema } from "mongoose";

export type UserProvider = "credentials" | "google" | "mixed";
export type UserRole = "attendee" | "organizer" | "admin";
export type OrganizerStatus =
	| "not_applied"
	| "pending"
	| "approved"
	| "rejected"
	| "suspended";

export interface IUser extends Document {
	name?: string;
	email: string;
	passwordHash?: string | null;
	emailVerified: boolean;
	image?: string;
	provider: UserProvider;
	roles: UserRole[];
	organizerStatus: OrganizerStatus;
	organizerApprovedAt?: Date | null;
	organizerRejectedAt?: Date | null;
	organizerRejectionReason?: string | null;
	isActive: boolean;
	lastLoginAt?: Date;
	deletedAt?: Date | null;
	createdAt: Date;
	updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
	{
		name: {
			type: String,
			trim: true,
		},
		email: {
			type: String,
			required: [true, "Email is required"],
			unique: true,
			lowercase: true,
			trim: true,
			validate: {
				validator: (value: string) => {
					const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
					return emailRegex.test(value);
				},
				message: "Please provide a valid email address",
			},
		},
		passwordHash: {
			type: String,
			default: null,
		},
		emailVerified: {
			type: Boolean,
			default: false,
		},
		image: {
			type: String,
		},
		provider: {
			type: String,
			required: true,
			enum: {
				values: ["credentials", "google", "mixed"],
				message: "Provider must be credentials, google, or mixed",
			},
			default: "credentials",
		},
		roles: {
			type: [String],
			enum: {
				values: ["attendee", "organizer", "admin"],
				message: "Role must be attendee, organizer, or admin",
			},
			default: ["attendee"],
		},
		organizerStatus: {
			type: String,
			enum: {
				values: ["not_applied", "pending", "approved", "rejected", "suspended"],
				message:
					"Organizer status must be not_applied, pending, approved, rejected, or suspended",
			},
			default: "not_applied",
		},
		organizerApprovedAt: {
			type: Date,
			default: null,
		},
		organizerRejectedAt: {
			type: Date,
			default: null,
		},
		organizerRejectionReason: {
			type: String,
			default: null,
			trim: true,
		},
		isActive: {
			type: Boolean,
			default: true,
		},
		lastLoginAt: {
			type: Date,
		},
		deletedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: true,
	},
);

// Index on email is already created by unique: true

const User: Model<IUser> =
	mongoose.models.User || mongoose.model<IUser>("User", UserSchema);

export default User;
