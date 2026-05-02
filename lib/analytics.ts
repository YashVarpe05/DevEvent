export function trackServerEvent(
	eventName:
		| "checkout_session_created"
		| "checkout_completed"
		| "payment_succeeded"
		| "payment_failed"
		| "refund_requested"
		| "refund_succeeded"
		| "chargeback_created"
		| "organizer_connected_account_updated"
		| "search_performed"
		| "filter_applied"
		| "event_card_clicked"
		| "recommendation_clicked"
		| "related_event_clicked"
		| "organizer_followed"
		| "saved_search_created"
		| "share_clicked",
	payload: Record<string, unknown>,
) {
	void payload;
	// [FIXED]: Do not log analytics payloads because they may contain user or order identifiers.
	console.log(`[Analytics] ${eventName} tracked`);
}
