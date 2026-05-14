"use client";

import Link from "next/link";
import { Github, Linkedin, Twitter } from "lucide-react";

const linkGroups = [
	{
		links: [
			{ href: "/events", label: "Discover Events" },
			{ href: "/become-organizer", label: "For Organizers" },
		],
		title: "PLATFORM",
	},
	{
		links: [
			{ href: "https://github.com/YashVarpe05/DevEvent", label: "Open Source", external: true },
		],
		title: "RESOURCES",
	},
] as const;

const socialLinks = [
	{
		Icon: Github,
		href: "https://github.com/YashVarpe05/DevEvent",
		label: "GitHub",
	},
	{ Icon: Twitter, href: "#", label: "Twitter" },
	{ Icon: Linkedin, href: "#", label: "LinkedIn" },
] as const;

export default function Footer() {
	return (
		<footer className="footer-section">
			<style>{footerStyles}</style>
			<div className="footer-section__inner">
				<div className="footer-section__grid">
					<div className="footer-section__brand-column">
						<Link href="/" className="footer-section__logo" aria-label="DevEvent home">
							Dev<span>Event</span>
						</Link>
						<p className="footer-section__tagline">
							India&apos;s developer event platform. Built by builders, for builders.
						</p>
						<div className="footer-section__socials">
							{socialLinks.map(({ Icon, href, label }) => (
								<a
									key={label}
									href={href}
									className="footer-section__social-link"
									aria-label={label}
									target={href.startsWith("http") ? "_blank" : undefined}
									rel={href.startsWith("http") ? "noreferrer" : undefined}
								>
									<Icon aria-hidden="true" size={20} />
								</a>
							))}
						</div>
					</div>

					{linkGroups.map((group) => (
						<nav
							key={group.title}
							className="footer-section__link-group"
							aria-label={group.title}
						>
							<h2 className="footer-section__group-title">{group.title}</h2>
							{group.links.map((link) => {
								const isExt = 'external' in link;
								return (
									<Link
										key={link.label}
										href={link.href}
										{...(isExt ? { target: "_blank", rel: "noopener noreferrer" } : {})}
										className="footer-section__group-link"
									>
										{link.label}
									</Link>
								);
							})}
						</nav>
					))}
				</div>

				<div className="footer-section__bottom">
					<p>© 2026 DevEvent. All rights reserved.</p>
					<div>
						Made with <span>♥</span> in India
					</div>
				</div>
			</div>
		</footer>
	);
}

const footerStyles = `
	.footer-section {
		width: 100%;
		background: var(--bg-base, #0A0A0B);
		border-top: 1px solid var(--border-dim, #1F1F23);
	}

	.footer-section__inner {
		width: 100%;
		max-width: 1440px;
		margin: 0 auto;
		padding: 64px 24px 32px;
		box-sizing: border-box;
	}

	.footer-section__grid {
		display: grid;
		grid-template-columns: 1fr;
		gap: 40px;
		margin-bottom: 48px;
	}

	.footer-section__logo {
		display: inline-block;
		margin-bottom: 24px;
		color: var(--text-primary, #E8E6E3);
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1;
		text-decoration: none;
	}

	.footer-section__logo span {
		color: var(--gold, #FF6B35);
		font-style: italic;
	}

	.footer-section__tagline {
		max-width: 280px;
		margin: 0 0 24px;
		color: var(--text-muted, #6B6B74);
		font-family: var(--font-body);
		font-size: 14px;
		line-height: 1.65;
	}

	.footer-section__socials {
		display: flex;
		gap: 16px;
	}

	.footer-section__social-link {
		display: inline-flex;
		width: 40px;
		height: 40px;
		align-items: center;
		justify-content: center;
		border: 1px solid var(--border-dim, #1F1F23);
		color: var(--text-muted, #6B6B74);
		text-decoration: none;
		transition: border-color 180ms ease, color 180ms ease;
	}

	.footer-section__social-link:hover {
		border-color: var(--gold, #FF6B35);
		color: var(--gold, #FF6B35);
	}

	.footer-section__link-group {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.footer-section__group-title {
		margin: 0 0 8px;
		color: var(--text-primary, #E8E6E3);
		font-family: var(--font-mono);
		font-size: 11px;
		font-weight: 700;
		letter-spacing: 0.15em;
		line-height: 1.2;
		text-transform: uppercase;
	}

	.footer-section__group-link {
		color: var(--text-muted, #6B6B74);
		font-family: var(--font-mono);
		font-size: 12px;
		font-weight: 500;
		letter-spacing: 0.08em;
		line-height: 1.3;
		text-decoration: none;
		text-transform: uppercase;
		transition: color 180ms ease;
	}

	.footer-section__group-link:hover {
		color: var(--gold, #FF6B35);
	}

	.footer-section__bottom {
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding-top: 24px;
		border-top: 1px solid var(--border-dim, #1F1F23);
		color: var(--text-muted, #6B6B74);
		font-family: var(--font-mono);
		font-size: 11px;
		letter-spacing: 0.08em;
		line-height: 1.4;
		text-align: center;
		text-transform: uppercase;
	}

	.footer-section__bottom p {
		margin: 0;
	}

	.footer-section__bottom span {
		color: var(--gold, #FF6B35);
	}

	@media (min-width: 768px) {
		.footer-section__grid {
			grid-template-columns: repeat(3, minmax(0, 1fr));
		}

		.footer-section__bottom {
			flex-direction: row;
			text-align: left;
		}
	}

	@media (min-width: 1024px) {
		.footer-section__inner {
			padding-inline: 40px;
		}
	}
`;
