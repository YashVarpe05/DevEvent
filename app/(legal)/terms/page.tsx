import type { Metadata } from "next";
import LegalPage, { LegalSection, LegalList } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
	title: "Terms of Service | DevEvent",
	description: "The terms governing your use of the DevEvent platform.",
};

export default function TermsPage() {
	return (
		<LegalPage
			title="Terms of Service"
			intro={`These Terms of Service ("Terms") govern your use of ${LEGAL.website}, operated by ${LEGAL.legalEntity} ("${LEGAL.platformName}", "we", "us"). By creating an account or using the platform, you agree to these Terms.`}
		>
			<LegalSection heading="1. Who we are">
				<p>
					{LEGAL.platformName} is a platform that lets organizers create and manage events, and lets attendees discover and register for them. For paid events, we facilitate payments between attendees and organizers through our payment partners. We are not the organizer of events listed on the platform unless explicitly stated.
				</p>
			</LegalSection>

			<LegalSection heading="2. Accounts">
				<LegalList
					items={[
						"You must provide accurate information and keep your account secure. You are responsible for activity under your account.",
						"You must be old enough to form a binding contract in your jurisdiction.",
						"We may suspend or terminate accounts that violate these Terms or that we reasonably believe are involved in fraud or abuse.",
					]}
				/>
			</LegalSection>

			<LegalSection heading="3. Organizers">
				<p>If you create or host events, you additionally agree that:</p>
				<LegalList
					items={[
						"You are solely responsible for your event — its content, accuracy, conduct, legality, and delivery.",
						"You will honor the tickets you sell and the terms you advertise to attendees.",
						"You are responsible for any taxes applicable to your event revenue.",
						"You will handle attendee data you receive responsibly and in line with our Privacy Policy and applicable law.",
						"You will set and honor a refund approach consistent with our Refund & Cancellation Policy.",
					]}
				/>
			</LegalSection>

			<LegalSection heading="4. Attendees">
				<LegalList
					items={[
						"Registering for an event creates an agreement between you and the organizer, not with us (except for payment processing we facilitate).",
						"Your ticket is personal to you. Tickets and QR codes must not be duplicated, resold, or transferred except where the organizer permits it.",
						"Entry to an event is at the organizer's and venue's discretion, subject to their rules.",
					]}
				/>
			</LegalSection>

			<LegalSection heading="5. Payments and platform fees">
				<p>
					Payments for paid events are processed by Razorpay and/or Stripe. We may charge a platform fee and pass through payment-processing fees; the applicable fee is shown to organizers at the time of setup. Payouts to organizers are made according to the schedule and conditions described in their dashboard and subject to our payment partners' requirements.
				</p>
			</LegalSection>

			<LegalSection heading="6. Refunds">
				<p>
					Refunds and cancellations are governed by our{" "}
					<a href="/refund-policy" className="text-accent hover:text-accent-hover">Refund &amp; Cancellation Policy</a>, which forms part of these Terms.
				</p>
			</LegalSection>

			<LegalSection heading="7. Acceptable use">
				<p>You agree not to:</p>
				<LegalList
					items={[
						"Use the platform for unlawful, fraudulent, or harmful purposes.",
						"List events that are illegal, deceptive, or that infringe others' rights.",
						"Attempt to bypass security, scrape data at scale, forge tickets, or interfere with the platform's operation.",
						"Upload content you do not have the right to use, or that is abusive, hateful, or infringing.",
					]}
				/>
			</LegalSection>

			<LegalSection heading="8. Intellectual property">
				<p>
					The platform, its software, and its branding belong to us or our licensors. You retain ownership of content you submit (such as event descriptions and images) and grant us a license to host and display it for the purpose of operating the platform.
				</p>
			</LegalSection>

			<LegalSection heading="9. Disclaimers">
				<p>
					The platform is provided "as is" without warranties of any kind. We do not guarantee that events will take place as described, that the platform will be uninterrupted or error-free, or that listings are accurate. Events are the responsibility of their organizers.
				</p>
			</LegalSection>

			<LegalSection heading="10. Limitation of liability">
				<p>
					To the maximum extent permitted by law, {LEGAL.platformName} is not liable for indirect, incidental, or consequential damages, or for the acts or omissions of organizers, attendees, or third parties. Where liability cannot be excluded, it is limited to the amount of platform fees you paid to us in the three months preceding the claim.
				</p>
			</LegalSection>

			<LegalSection heading="11. Indemnity">
				<p>
					You agree to indemnify {LEGAL.platformName} against claims arising from your events, your content, your use of the platform, or your breach of these Terms.
				</p>
			</LegalSection>

			<LegalSection heading="12. Governing law">
				<p>
					These Terms are governed by {LEGAL.governingLaw}. Disputes are subject to the exclusive jurisdiction of {LEGAL.jurisdiction}.
				</p>
			</LegalSection>

			<LegalSection heading="13. Changes">
				<p>
					We may update these Terms from time to time. Continued use after changes take effect constitutes acceptance. The "Last updated" date above reflects the current version.
				</p>
			</LegalSection>

			<LegalSection heading="14. Contact">
				<p>
					{LEGAL.legalEntity}, {LEGAL.address}. Questions? Email{" "}
					<a href={`mailto:${LEGAL.supportEmail}`} className="text-accent hover:text-accent-hover">{LEGAL.supportEmail}</a>.
				</p>
			</LegalSection>
		</LegalPage>
	);
}
