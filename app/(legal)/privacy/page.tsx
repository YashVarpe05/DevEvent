import type { Metadata } from "next";
import LegalPage, { LegalSection, LegalList } from "@/components/LegalPage";
import { LEGAL } from "@/lib/legal";

export const metadata: Metadata = {
	title: "Privacy Policy | DevEvent",
	description: "How DevEvent collects, uses, and protects your personal data.",
};

export default function PrivacyPolicyPage() {
	return (
		<LegalPage
			title="Privacy Policy"
			intro={`This Privacy Policy explains how ${LEGAL.legalEntity} ("${LEGAL.platformName}", "we", "us") collects, uses, and protects your information when you use ${LEGAL.website}. By using the platform you agree to the practices described here.`}
		>
			<LegalSection heading="1. Information we collect">
				<p>We collect the following categories of information:</p>
				<LegalList
					items={[
						<><strong>Account data</strong> — name, email address, password hash, and profile details you provide when you sign up or sign in with Google.</>,
						<><strong>Event and registration data</strong> — events you create or register for, ticket details, check-in status, and answers to any custom registration questions an organizer asks.</>,
						<><strong>Payment data</strong> — for paid events, transactions are processed by our payment partners (Razorpay and Stripe). We store order records and the last status of a payment, but we do not store full card numbers or banking credentials.</>,
						<><strong>Usage and device data</strong> — pages viewed, actions taken, IP address, and browser information, collected via analytics to improve the product.</>,
						<><strong>Communications</strong> — emails we send you (confirmations, reminders, organizer announcements) and your notification preferences.</>,
					]}
				/>
			</LegalSection>

			<LegalSection heading="2. How we use your information">
				<LegalList
					items={[
						"To create and manage your account and authenticate you.",
						"To process event registrations, issue tickets, and enable check-in.",
						"To process payments for paid events through our payment partners.",
						"To send transactional emails (registration confirmations, reminders, waitlist updates) and, where you have opted in, organizer announcements about events you follow.",
						"To provide organizers with attendee lists for the events they host.",
						"To detect, prevent, and respond to fraud, abuse, and security incidents.",
						"To analyze usage and improve the platform.",
					]}
				/>
			</LegalSection>

			<LegalSection heading="3. Sharing with organizers">
				<p>
					When you register for an event, the organizer (and any co-hosts) of that event can see your name, email, ticket status, and your answers to their registration questions. This is necessary for them to manage and run the event. Organizers are responsible for their own use of this data.
				</p>
			</LegalSection>

			<LegalSection heading="4. Third-party services">
				<p>We rely on trusted service providers to operate the platform, including:</p>
				<LegalList
					items={[
						"Payment processing — Razorpay and Stripe.",
						"Email delivery — Resend.",
						"Hosting and database — our cloud infrastructure and managed database providers.",
						"Analytics and error monitoring — used in aggregate to maintain and improve the service.",
					]}
				/>
				<p>These providers process data on our behalf under their own privacy and security commitments.</p>
			</LegalSection>

			<LegalSection heading="5. Cookies">
				<p>
					We use essential cookies to keep you signed in and to secure the platform. We may also use analytics cookies to understand how the product is used. You can control cookies through your browser settings, though disabling essential cookies may prevent you from signing in.
				</p>
			</LegalSection>

			<LegalSection heading="6. Data retention">
				<p>
					We retain your data for as long as your account is active or as needed to provide the service, comply with legal obligations (including financial record-keeping for transactions), resolve disputes, and enforce our agreements.
				</p>
			</LegalSection>

			<LegalSection heading="7. Your rights">
				<p>You may:</p>
				<LegalList
					items={[
						"Access and update your account information at any time from your profile.",
						"Request a copy of your personal data or its deletion, subject to legal retention requirements.",
						"Unsubscribe from organizer notification emails using the link in any such email.",
						<>Contact us at <a href={`mailto:${LEGAL.privacyEmail}`} className="text-accent hover:text-accent-hover">{LEGAL.privacyEmail}</a> to exercise these rights.</>,
					]}
				/>
			</LegalSection>

			<LegalSection heading="8. Security">
				<p>
					We protect your data with industry-standard measures including encrypted transport (HTTPS), hashed passwords, signed ticket tokens, and rate limiting. No method of transmission or storage is completely secure, but we work to protect your information and respond promptly to incidents.
				</p>
			</LegalSection>

			<LegalSection heading="9. Children">
				<p>
					The platform is not directed to children under 13 (or the minimum age required in your jurisdiction). We do not knowingly collect data from children.
				</p>
			</LegalSection>

			<LegalSection heading="10. Changes to this policy">
				<p>
					We may update this Privacy Policy from time to time. Material changes will be reflected by the "Last updated" date above, and where appropriate we will notify you by email.
				</p>
			</LegalSection>

			<LegalSection heading="11. Contact">
				<p>
					{LEGAL.legalEntity}, {LEGAL.address}. For privacy questions, email{" "}
					<a href={`mailto:${LEGAL.privacyEmail}`} className="text-accent hover:text-accent-hover">{LEGAL.privacyEmail}</a>.
				</p>
			</LegalSection>
		</LegalPage>
	);
}
