import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function CTASection() {
	return (
		<section
			className="relative w-full py-24"
			style={{ backgroundColor: "var(--bg-base)" }}
		>
			{/* Amber glow */}
			<div
				className="pointer-events-none absolute inset-0"
				style={{
					background:
						"radial-gradient(ellipse 600px 300px at 50% 50%, rgba(255,181,71,0.05) 0%, transparent 70%)",
				}}
			/>

			<div className="relative z-10 mx-auto flex max-w-xl flex-col items-center px-5 text-center">
				<span
					className="text-[11px] font-medium uppercase tracking-[0.1em]"
					style={{ color: "var(--text-muted)" }}
				>
					GET STARTED TODAY
				</span>

				<h2
					className="mt-4 font-display text-3xl tracking-tight sm:text-4xl"
					style={{ color: "var(--text-primary)" }}
				>
					Ready to find your
					<br />
					next developer event?
				</h2>

				<div className="mt-8 flex items-center gap-3">
					<Link href="/events">
						<Button variant="primary" size="lg">
							Browse Events
						</Button>
					</Link>
					<Link href="/become-organizer">
						<Button variant="secondary" size="lg">
							Host an Event
						</Button>
					</Link>
				</div>

				<p
					className="mt-6 text-[13px]"
					style={{ color: "var(--text-muted)" }}
				>
					Free to use. No credit card required.
				</p>
			</div>
		</section>
	);
}
