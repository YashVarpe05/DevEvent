"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "motion/react";

const navLinks = [
	{ href: "/events", label: "Discover", external: false },
	{ href: "/become-organizer", label: "Organizers", external: false },
	{
		href: "https://github.com/YashVarpe05/DevEvent",
		label: "Open Source",
		external: true,
	},
] as const;

export default function Navbar() {
	const [scrolled, setScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => setScrolled(window.scrollY > 50);
		handleScroll();
		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, []);

	return (
		<motion.nav
			initial={{ y: -100 }}
			animate={{ y: 0 }}
			transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
			className={`home-navbar ${scrolled ? "is-scrolled" : ""}`}
			style={{
				backdropFilter: scrolled ? "blur(4px)" : "none",
				WebkitBackdropFilter: scrolled ? "blur(4px)" : "none",
			}}
		>
			<style>{navbarStyles}</style>
			<div className="home-navbar-inner">
				<Link href="/" className="home-navbar-logo">
					<span>
						Dev<em>Event</em>
					</span>
				</Link>

				<div className="home-navbar-center">
					{navLinks.map((item) => (
						<Link
							key={item.href}
							href={item.href}
							target={item.external ? "_blank" : undefined}
							rel={item.external ? "noopener noreferrer" : undefined}
							className="home-navbar-link"
						>
							{item.label}
							<span />
						</Link>
					))}
				</div>

				<div className="home-navbar-actions">
					<Link href="/login" className="home-navbar-signin">
						Sign in
					</Link>
					<Link href="/become-organizer" className="home-navbar-cta">
						List an Event
					</Link>
				</div>
			</div>
		</motion.nav>
	);
}

const navbarStyles = `
	.home-navbar {
		position: fixed;
		top: 0;
		left: 0;
		z-index: 50;
		width: 100%;
		border-bottom: 1px solid transparent;
		background: transparent;
		transition: background-color 300ms ease, border-color 300ms ease;
	}

	.home-navbar.is-scrolled {
		border-color: #1F1F23;
		background: rgba(10, 10, 11, 0.95);
	}

	.home-navbar-inner {
		display: flex;
		height: 64px;
		max-width: 1440px;
		margin: 0 auto;
		align-items: center;
		justify-content: space-between;
		padding: 0 24px;
	}

	.home-navbar-logo {
		display: flex;
		align-items: center;
		color: #E8E6E3;
	}

	.home-navbar-logo span {
		font-family: var(--font-display);
		font-size: 20px;
		font-weight: 700;
		line-height: 1;
		color: #E8E6E3;
	}

	.home-navbar-logo em {
		font-style: italic;
		color: #FF6B35;
	}

	.home-navbar-center {
		display: none;
		align-items: center;
		gap: 32px;
	}

	.home-navbar-link,
	.home-navbar-signin,
	.home-navbar-cta {
		font-family: var(--font-mono);
		font-size: 12px;
		letter-spacing: 0.1em;
		text-transform: uppercase;
	}

	.home-navbar-link {
		position: relative;
		color: #6B6B74;
		transition: color 180ms ease;
	}

	.home-navbar-link:hover {
		color: #E8E6E3;
	}

	.home-navbar-link span {
		position: absolute;
		left: 0;
		bottom: -3px;
		width: 0;
		height: 1px;
		background: #FF6B35;
		transition: width 300ms ease;
	}

	.home-navbar-link:hover span {
		width: 100%;
	}

	.home-navbar-actions {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	.home-navbar-signin {
		color: #6B6B74;
		transition: color 180ms ease;
	}

	.home-navbar-signin:hover {
		color: #E8E6E3;
	}

	.home-navbar-cta {
		padding: 10px 20px;
		border-radius: 0;
		background: #FF6B35;
		font-weight: 700;
		color: #0A0A0B;
		transition: background-color 180ms ease;
	}

	.home-navbar-cta:hover {
		background: #FF8555;
	}

	@media (min-width: 768px) {
		.home-navbar-center {
			display: flex;
		}
	}

	@media (min-width: 1024px) {
		.home-navbar-inner {
			padding: 0 40px;
		}
	}
`;
