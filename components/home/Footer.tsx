"use client";

import Link from "next/link";
import { Github, Twitter, Linkedin } from "lucide-react";

const footerLinks = {
	Platform: [
		{ label: "Browse Events", href: "/events" },
		{ label: "Host an Event", href: "/become-organizer" },
		{ label: "Pricing", href: "#" },
		{ label: "Open Source", href: "https://github.com/YashVarpe05/DevEvent" },
	],
	Resources: [
		{ label: "Documentation", href: "#" },
		{ label: "API", href: "#" },
		{ label: "Contributing", href: "#" },
		{ label: "Self Hosting", href: "#" },
	],
	Legal: [
		{ label: "Privacy Policy", href: "#" },
		{ label: "Terms of Service", href: "#" },
		{ label: "Cookie Policy", href: "#" },
	],
};

export function Footer() {
	return (
		<footer
			className="w-full"
			style={{
				backgroundColor: "var(--bg-base)",
				borderTop: "1px solid var(--border)",
			}}
		>
			<div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
				<div className="grid grid-cols-2 gap-10 md:grid-cols-4">
					{/* Brand */}
					<div className="col-span-2 md:col-span-1">
						<span
							className="font-display text-xl tracking-wide"
							style={{ color: "var(--text-primary)" }}
						>
							DEV
							<span style={{ color: "var(--accent)" }}>·</span>
							EVENT
						</span>
						<p
							className="mt-3 text-[14px] leading-relaxed"
							style={{ color: "var(--text-muted)" }}
						>
							India&apos;s open-source developer event platform.
						</p>
						<div className="mt-4 flex items-center gap-3">
							<SocialIcon
								href="https://github.com/YashVarpe05/DevEvent"
								icon={<Github size={16} />}
							/>
							<SocialIcon href="#" icon={<Twitter size={16} />} />
							<SocialIcon href="#" icon={<Linkedin size={16} />} />
						</div>
					</div>

					{/* Link columns */}
					{Object.entries(footerLinks).map(([title, links]) => (
						<div key={title}>
							<h4
								className="text-[11px] font-medium uppercase tracking-[0.1em]"
								style={{ color: "var(--text-muted)" }}
							>
								{title}
							</h4>
							<ul className="mt-4 flex list-none flex-col gap-2.5 p-0">
								{links.map((link) => (
									<li key={link.label}>
										<Link
											href={link.href}
											className="text-[14px] no-underline transition-colors duration-150"
											style={{
												color: "var(--text-secondary)",
											}}
											onMouseEnter={(e) =>
												(e.currentTarget.style.color =
													"var(--text-primary)")
											}
											onMouseLeave={(e) =>
												(e.currentTarget.style.color =
													"var(--text-secondary)")
											}
										>
											{link.label}
										</Link>
									</li>
								))}
							</ul>
						</div>
					))}
				</div>
			</div>

			{/* Bottom bar */}
			<div
				className="w-full"
				style={{ borderTop: "1px solid var(--border)" }}
			>
				<div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-5 py-5 sm:flex-row sm:px-8">
					<p
						className="text-[13px]"
						style={{ color: "var(--text-muted)" }}
					>
						© 2025 DevEvent. Open source under MIT License.
					</p>
					<p
						className="text-[13px]"
						style={{ color: "var(--text-muted)" }}
					>
						Built in India 🇮🇳
					</p>
				</div>
			</div>
		</footer>
	);
}

function SocialIcon({
	href,
	icon,
}: {
	href: string;
	icon: React.ReactNode;
}) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noreferrer"
			className="flex h-8 w-8 items-center justify-center transition-colors duration-150"
			style={{
				color: "var(--text-muted)",
				borderRadius: "var(--radius-md)",
				border: "1px solid var(--border)",
			}}
			onMouseEnter={(e) => {
				e.currentTarget.style.color = "var(--text-primary)";
				e.currentTarget.style.borderColor = "var(--border-strong)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.color = "var(--text-muted)";
				e.currentTarget.style.borderColor = "var(--border)";
			}}
		>
			{icon}
		</a>
	);
}
