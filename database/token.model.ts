import mongoose, { Document, Model, Schema, Types } from "mongoose";

// ─── Email Verification Token ────────────────────────────────────────────────

export interface IEmailVerificationToken extends Document {
	userId: Types.ObjectId;
	tokenHash: string;
	expiresAt: Date;
	usedAt?: Date | null;
	createdAt: Date;
}

const EmailVerificationTokenSchema = new Schema<IEmailVerificationToken>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		tokenHash: {
			type: String,
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
			index: { expires: 0 }, // TTL index — auto-delete when expired
		},
		usedAt: {
			type: Date,
			default: null,
		},
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
	},
);

export const EmailVerificationToken: Model<IEmailVerificationToken> =
	mongoose.models.EmailVerificationToken ||
	mongoose.model<IEmailVerificationToken>(
		"EmailVerificationToken",
		EmailVerificationTokenSchema,
	);

// ─── Password Reset Token ────────────────────────────────────────────────────

export interface IPasswordResetToken extends Document {
	userId: Types.ObjectId;
	tokenHash: string;
	expiresAt: Date;
	usedAt?: Date | null;
	requestedIp?: string;
	userAgent?: string;
	createdAt: Date;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: "User",
			required: true,
			index: true,
		},
		tokenHash: {
			type: String,
			required: true,
		},
		expiresAt: {
			type: Date,
			required: true,
			index: { expires: 0 }, // TTL index
		},
		usedAt: {
			type: Date,
			default: null,
		},
		requestedIp: {
			type: String,
		},
		userAgent: {
			type: String,
		},
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
	},
);

export const PasswordResetToken: Model<IPasswordResetToken> =
	mongoose.models.PasswordResetToken ||
	mongoose.model<IPasswordResetToken>(
		"PasswordResetToken",
		PasswordResetTokenSchema,
	);
