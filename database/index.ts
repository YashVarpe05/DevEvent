// Central export for all database models
export { default as Event } from "./event.model";
export { default as Booking } from "./booking.model";
export { default as User } from "./user.model";
export { EmailVerificationToken, PasswordResetToken } from "./token.model";
// [FIXED]: Export all Phase 5 payment and ticketing models from the central database barrel.
export { default as Order } from "./order.model";
export { default as Registration } from "./registration.model";
export { default as TicketType } from "./ticket-type.model";
export { default as PaymentTransaction } from "./payment-transaction.model";
export { default as OrganizerProfile } from "./organizer-profile.model";
export { default as OrganizerApplication } from "./organizer-application.model";
export { default as StripeWebhookEvent } from "./stripe-webhook-event.model";
export { default as PromoCode } from "./promo-code.model";
export { default as Referral } from "./referral.model";
export { default as UserReferral } from "./user-referral.model";
export { default as EventAnalyticsDaily } from "./event-analytics-daily.model";
export { default as UserInterestProfile } from "./user-interest-profile.model";
export { default as UserEventInteraction } from "./user-event-interaction.model";
export { default as FollowOrganizer } from "./follow-organizer.model";
export { default as SavedSearch } from "./saved-search.model";

// Export TypeScript interfaces for type safety
export type { IEvent } from "./event.model";
export type { IBooking } from "./booking.model";
export type {
	IUser,
	UserProvider,
	UserRole,
	OrganizerStatus,
} from "./user.model";
export type {
	IEmailVerificationToken,
	IPasswordResetToken,
} from "./token.model";
export type { IOrder, OrderStatus } from "./order.model";
export type { IRegistration } from "./registration.model";
export type { ITicketType } from "./ticket-type.model";
export type {
	IPaymentTransaction,
	TransactionType,
} from "./payment-transaction.model";
export type {
	IOrganizerProfile,
	OrganizationType,
} from "./organizer-profile.model";
export type { IStripeWebhookEvent } from "./stripe-webhook-event.model";
export type { IPromoCode } from "./promo-code.model";
export type { IReferral } from "./referral.model";
export type { IUserReferral } from "./user-referral.model";
export type { IEventAnalyticsDaily } from "./event-analytics-daily.model";
export type {
	IUserInterestProfile,
	PreferredFormat,
	PriceAffinity,
} from "./user-interest-profile.model";
export type {
	IUserEventInteraction,
	InteractionType,
} from "./user-event-interaction.model";
export type { IFollowOrganizer } from "./follow-organizer.model";
export type { ISavedSearch } from "./saved-search.model";
export type {
	IOrganizerApplication,
	IApplicationData,
	ApplicationStatus,
	TicketingIntent,
} from "./organizer-application.model";
