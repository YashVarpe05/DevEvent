import BecomeOrganizerForm from "@/components/BecomeOrganizerForm";
import Navbar from "@/components/Navbar";
import { Check } from "lucide-react";

export const metadata = {
	title: "Become an Organizer | DevEvent",
	description: "Apply to become an event organizer on DevEvent.",
};

const benefits = [
	"Host unlimited free events",
	"Access community-building tools",
	"Analytics and attendee insights",
	"Paid ticketing (coming soon)",
];

export default function BecomeOrganizerPage() {
	return (
		<main className="min-h-dvh bg-bg-base pt-28 pb-16 px-6">
			<Navbar />
			<div className="max-w-[960px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_1.6fr] gap-12 items-start">
				{/* LEFT COLUMN */}
				<div>
					<span className="section-label block mb-3">
						{"// BECOME AN ORGANIZER"}
					</span>

					<h1 className="editorial-headline text-[32px] md:text-[42px] mb-4">
						Build Your
						<br />
						<em className="not-italic">Community</em>
					</h1>

					<p className="text-sm text-text-secondary leading-relaxed mb-7 max-w-[320px]">
						Join thousands of organizers hosting high-quality tech events around
						the world.
					</p>

					{/* INFO CARD */}
					<div className="bg-bg-elevated border border-border-subtle border-l-2 border-l-accent p-4 mb-7">
						<h3 className="text-[13px] font-semibold text-text-primary mb-1.5">
							Why we verify organizers
						</h3>
						<p className="text-[13px] text-text-secondary leading-relaxed">
							To maintain a high-quality experience for attendees, we review all
							new organizer applications. Applications are typically reviewed
							within{" "}
							<span className="text-accent font-medium">48 hours</span>.
						</p>
					</div>

					{/* BENEFITS LIST */}
					<ul className="border-t border-border-subtle pt-5 flex flex-col gap-2.5 list-none m-0">
						{benefits.map((benefit) => (
							<li
								key={benefit}
								className="flex items-center gap-2.5 text-[13px] text-text-secondary"
							>
								<Check size={14} className="text-teal shrink-0" aria-hidden="true" />
								{benefit}
							</li>
						))}
					</ul>
				</div>

				{/* RIGHT COLUMN */}
				<div>
					<BecomeOrganizerForm />
				</div>
			</div>
		</main>
	);
}
