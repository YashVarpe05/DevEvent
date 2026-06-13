import type { Metadata } from "next";
import LegalPage, { LegalSection, LegalList } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
	title: "Refund & Cancellation Policy | DevEvent",
	description: "How refunds and cancellations work for events booked on DevEvent.",
};

export default function RefundPolicyPage() {
	return (
		<LegalPage
			title="Refund & Cancellation Policy"
			intro={`This policy explains how refunds and cancellations work for tickets booked through ${LEGAL.website}. Because each event is run by an independent organizer, the organizer's stated refund terms apply alongside this policy.`}
		>
			<LegalSection heading="1. Free events">
				<p>
					Free registrations carry no charge, so there is nothing to refund. You may cancel a free registration at any time from your registrations page; doing so releases your spot (and may promote someone from the waitlist).
				</p>
			</LegalSection>

			<LegalSection heading="2. Paid events — organizer-set terms">
				<p>
					For paid events, the organizer sets the refund terms shown on the event page at the time of purchase. By buying a ticket you agree to that event's stated refund terms. Where an organizer has not specified terms, the default below applies.
				</p>
			</LegalSection>

			<LegalSection heading="3. Default refund window">
				<LegalList
					items={[
						"Refund requests made at least 7 days before the event start are eligible for a full refund of the ticket price.",
						"Requests made between 7 days and 48 hours before the event may be eligible for a partial refund at the organizer's discretion.",
						"Requests made within 48 hours of the event start are generally not eligible, except where the event is cancelled or materially changed.",
						"Platform and payment-processing fees may be non-refundable.",
					]}
				/>
			</LegalSection>

			<LegalSection heading="4. If an organizer cancels or reschedules">
				<p>
					If an organizer cancels an event, registered attendees are entitled to a refund of the ticket price. If an event is rescheduled, your ticket typically remains valid for the new date; if you cannot attend the new date, you may request a refund.
				</p>
			</LegalSection>

			<LegalSection heading="5. How to request a refund">
				<LegalList
					items={[
						"Open the event or your registration on the platform and use the refund/cancellation option where available, or contact the organizer directly.",
						<>If you cannot resolve a refund with the organizer, contact us at <a href={`mailto:${LEGAL.supportEmail}`} className="text-accent hover:text-accent-hover">{LEGAL.supportEmail}</a> and we will assist where we can.</>,
					]}
				/>
			</LegalSection>

			<LegalSection heading="6. How refunds are issued">
				<p>
					Approved refunds are issued to the original payment method through our payment partner (Razorpay or Stripe). Once processed, refunds typically take 5–10 business days to appear, depending on your bank or card issuer. We are not responsible for delays caused by financial institutions.
				</p>
			</LegalSection>

			<LegalSection heading="7. No-shows">
				<p>
					Failing to attend an event ("no-show") without cancelling in advance is not eligible for a refund unless the event's terms state otherwise.
				</p>
			</LegalSection>

			<LegalSection heading="8. Chargebacks">
				<p>
					If you have a problem with a charge, please contact us first so we can help. Initiating a chargeback without contacting us may delay resolution and can result in account suspension while the dispute is reviewed.
				</p>
			</LegalSection>

			<LegalSection heading="9. Contact">
				<p>
					{LEGAL.legalEntity}, {LEGAL.address}. For refund help, email{" "}
					<a href={`mailto:${LEGAL.supportEmail}`} className="text-accent hover:text-accent-hover">{LEGAL.supportEmail}</a>.
				</p>
			</LegalSection>
		</LegalPage>
	);
}
