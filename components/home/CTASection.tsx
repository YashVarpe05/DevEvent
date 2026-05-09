"use client";

import Link from "next/link";
import { LightLines } from "../ui/light-lines";
import { Button } from "../ui/Button";

export function CTASection() {
	return (
		<section className="relative overflow-hidden py-32" style={{ backgroundColor: "var(--bg-void)" }}>
			<div className="absolute inset-0 z-0">
				<LightLines className="light-lines-override" />
			</div>
			
			<div className="relative z-10 mx-auto max-w-4xl px-5 text-center">
				<h2 className="text-display-lg text-[var(--text-primary)]">
					Ready to host your
					<br />
					<em style={{ fontStyle: "italic", color: "var(--gold)" }}>
						next big event?
					</em>
				</h2>
				<p className="mx-auto mt-6 max-w-xl text-[17px] text-[var(--text-secondary)]">
					Join thousands of organizers who use DevEvent to manage ticketing, attendees, and marketing all in one place.
				</p>
				<div className="mt-10 flex flex-wrap items-center justify-center gap-4">
					<Link href="/become-organizer">
						<Button variant="primary" size="lg" className="glow-gold">
							Create Event Now
						</Button>
					</Link>
					<Link href="/events">
						<Button variant="secondary" size="lg">
							Browse Events
						</Button>
					</Link>
				</div>
			</div>
		</section>
	);
}
