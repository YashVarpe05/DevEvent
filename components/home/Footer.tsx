import Link from "next/link";
import { IconBrandGithub, IconBrandTwitter, IconBrandLinkedin } from "@tabler/icons-react";

export function Footer() {
	return (
		<footer
			className="border-t border-[var(--border-dim)] py-12"
			style={{ backgroundColor: "var(--bg-base)" }}
		>
			<div className="mx-auto max-w-6xl px-5">
				<div className="grid grid-cols-1 gap-10 md:grid-cols-4">
					{/* Brand */}
					<div className="col-span-1 md:col-span-1">
						<Link href="/" className="inline-block no-underline mb-4">
							<span
								style={{
									fontFamily: "var(--font-display)",
									fontSize: 22,
									fontWeight: 600,
									color: "var(--text-primary)",
								}}
							>
								Dev
							</span>
							<em
								style={{
									fontFamily: "var(--font-display)",
									fontSize: 22,
									fontWeight: 600,
									fontStyle: "italic",
									color: "var(--gold)",
								}}
							>
								Event
							</em>
						</Link>
						<p className="text-[14px] text-[var(--text-secondary)] mb-6 max-w-xs">
							India's premier platform for discovering and organizing developer events.
						</p>
						<div className="flex gap-4">
							<a href="https://github.com/YashVarpe05/DevEvent" target="_blank" rel="noreferrer" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
								<IconBrandGithub size={20} stroke={1.5} />
							</a>
							<a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
								<IconBrandTwitter size={20} stroke={1.5} />
							</a>
							<a href="#" className="text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
								<IconBrandLinkedin size={20} stroke={1.5} />
							</a>
						</div>
					</div>

					{/* Links */}
					<div>
						<h4 className="font-semibold text-[var(--text-primary)] mb-4 text-[15px]">Platform</h4>
						<ul className="space-y-3 text-[14px]">
							<li>
								<Link href="/events" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
									Browse Events
								</Link>
							</li>
							<li>
								<Link href="/become-organizer" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
									Host an Event
								</Link>
							</li>
							<li>
								<Link href="/pricing" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
									Pricing
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h4 className="font-semibold text-[var(--text-primary)] mb-4 text-[15px]">Resources</h4>
						<ul className="space-y-3 text-[14px]">
							<li>
								<Link href="/help" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
									Help Center
								</Link>
							</li>
							<li>
								<Link href="/blog" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
									Blog
								</Link>
							</li>
							<li>
								<Link href="/guidelines" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
									Organizer Guidelines
								</Link>
							</li>
						</ul>
					</div>
					<div>
						<h4 className="font-semibold text-[var(--text-primary)] mb-4 text-[15px]">Company</h4>
						<ul className="space-y-3 text-[14px]">
							<li>
								<Link href="/about" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
									About Us
								</Link>
							</li>
							<li>
								<Link href="/contact" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
									Contact
								</Link>
							</li>
							<li>
								<Link href="/privacy" className="text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors">
									Privacy Policy
								</Link>
							</li>
						</ul>
					</div>
				</div>
				<div className="mt-12 border-t border-[var(--border-dim)] pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-[13px] text-[var(--text-muted)]">
					<p>© {new Date().getFullYear()} DevEvent. All rights reserved.</p>
					<p>Built for developers, by developers.</p>
				</div>
			</div>
		</footer>
	);
}
