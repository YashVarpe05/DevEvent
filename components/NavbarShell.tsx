"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import {
	IconMenu2,
	IconX,
	IconBell,
	IconUser,
	IconTicket,
	IconShoppingBag,
	IconLayoutDashboard,
	IconShield,
	IconBriefcase,
	IconLogout,
} from "@tabler/icons-react";
import { Button } from "./ui/Button";

interface NavbarUser {
	name: string | null;
	email: string | null;
	image: string | null;
	roles: string[];
	organizerStatus: string;
}

interface NavbarShellProps {
	user: NavbarUser | null;
}

const NAV_LINKS = [
	{ href: "/events", label: "Discover" },
	{ href: "/become-organizer", label: "Organizers" },
	{ href: "https://github.com/YashVarpe05/DevEvent", label: "Open Source", external: true },
];

export function NavbarShell({ user }: NavbarShellProps) {
	const pathname = usePathname();
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { scrollY } = useScroll();

	useMotionValueEvent(scrollY, "change", (latest) => {
		setScrolled(latest > 50);
	});

	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	useEffect(() => {
		setMenuOpen(false);
		setDropdownOpen(false);
	}, [pathname]);

	// Lock body scroll when mobile menu is open
	useEffect(() => {
		if (menuOpen) {
			document.body.style.overflow = "hidden";
		} else {
			document.body.style.overflow = "";
		}
		return () => { document.body.style.overflow = ""; };
	}, [menuOpen]);

	const initials = user?.name
		? user.name
				.split(" ")
				.map((w) => w[0])
				.join("")
				.slice(0, 2)
				.toUpperCase()
		: "U";

	const isOrganizer = user?.roles?.includes("organizer");
	const isAdmin = user?.roles?.includes("admin");

	const isActive = (href: string) => pathname === href;

	return (
		<>
			{/* ── Fixed Navbar ── */}
			<header
				className="fixed top-0 left-0 right-0 z-50"
				style={{
					height: 58,
					backgroundColor: scrolled ? "rgba(8,8,9,0.88)" : "transparent",
					backdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
					WebkitBackdropFilter: scrolled ? "blur(24px) saturate(180%)" : "none",
					borderBottom: scrolled ? "1px solid var(--border-dim)" : "1px solid transparent",
					transition: "all 280ms cubic-bezier(0.16, 1, 0.3, 1)",
				}}
			>
				<nav className="mx-auto flex h-[58px] max-w-7xl items-center justify-between px-5 sm:px-6">
					{/* LEFT — Logo */}
					<Link href="/" className="flex items-center gap-0 no-underline">
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

					{/* CENTER — Nav links (desktop) */}
					<div className="hidden items-center md:flex" style={{ gap: 0 }}>
						{NAV_LINKS.map((link, i) => {
							const active = !link.external && isActive(link.href);
							return (
								<div key={link.href} className="flex items-center">
									{i > 0 && (
										<span
											style={{
												color: "var(--border-bright)",
												fontSize: "10px",
												margin: "0 2px",
											}}
										>
											·
										</span>
									)}
									<Link
										href={link.href}
										target={link.external ? "_blank" : undefined}
										rel={link.external ? "noopener noreferrer" : undefined}
										style={{
											position: "relative",
											padding: "8px 14px",
											fontSize: "14px",
											fontFamily: "var(--font-body)",
											color: active ? "var(--text-primary)" : "var(--text-secondary)",
											textDecoration: "none",
											transition: "color 120ms ease",
										}}
										onMouseEnter={(e) =>
											(e.currentTarget.style.color = "var(--text-primary)")
										}
										onMouseLeave={(e) =>
											(e.currentTarget.style.color = active
												? "var(--text-primary)"
												: "var(--text-secondary)")
										}
									>
										{link.label}
										{active && (
											<motion.div
												layoutId="nav-active-line"
												style={{
													position: "absolute",
													bottom: "-2px",
													left: "14px",
													right: "14px",
													height: "1.5px",
													background: "var(--gold)",
													borderRadius: "1px",
												}}
												transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
											/>
										)}
									</Link>
								</div>
							);
						})}
					</div>

					{/* RIGHT — Auth */}
					<div className="flex items-center gap-3">
						{user ? (
							<>
								{/* Bell */}
								<button
									className="hidden cursor-pointer p-1.5 transition-colors duration-[120ms] md:flex"
									style={{ color: "var(--text-muted)" }}
									onMouseEnter={(e) =>
										(e.currentTarget.style.color = "var(--text-primary)")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.color = "var(--text-muted)")
									}
								>
									<IconBell size={18} stroke={1.5} />
								</button>

								{/* Avatar + Dropdown */}
								<div className="relative hidden md:block" ref={dropdownRef}>
									<button
										onClick={() => setDropdownOpen(!dropdownOpen)}
										className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-full"
										style={{
											backgroundColor: user.image
												? "transparent"
												: "var(--gold-subtle)",
											border: `1px solid ${user.image ? "var(--border)" : "var(--border-gold)"}`,
										}}
									>
										{user.image ? (
											<img
												src={user.image}
												alt=""
												className="h-full w-full object-cover"
											/>
										) : (
											<span
												className="font-mono text-[11px] font-medium"
												style={{ color: "var(--gold)" }}
											>
												{initials}
											</span>
										)}
									</button>

									<AnimatePresence>
										{dropdownOpen && (
											<motion.div
												initial={{ opacity: 0, scale: 0.97, y: -8 }}
												animate={{ opacity: 1, scale: 1, y: 0 }}
												exit={{ opacity: 0, scale: 0.97, y: -8 }}
												transition={{
													duration: 0.15,
													ease: [0.16, 1, 0.3, 1],
												}}
												className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-[var(--radius-lg)] p-1.5"
												style={{
													backgroundColor: "var(--bg-overlay)",
													border: "1px solid var(--border)",
												}}
											>
												{/* User info */}
												<div
													className="px-3 py-2.5 mb-1"
													style={{
														borderBottom: "1px solid var(--border-dim)",
													}}
												>
													<p
														className="truncate text-[13px] font-medium"
														style={{ color: "var(--text-primary)" }}
													>
														{user.name || "User"}
													</p>
													<p
														className="truncate text-[11px] mt-0.5"
														style={{ color: "var(--text-muted)" }}
													>
														{user.email}
													</p>
												</div>

												{/* Links group 1 */}
												<div className="py-0.5">
													<DropdownLink
														href="/profile"
														icon={<IconUser size={14} stroke={1.5} />}
													>
														Profile
													</DropdownLink>
													<DropdownLink
														href="/my/registrations"
														icon={<IconTicket size={14} stroke={1.5} />}
													>
														My Tickets
													</DropdownLink>
													<DropdownLink
														href="/my/orders"
														icon={<IconShoppingBag size={14} stroke={1.5} />}
													>
														My Orders
													</DropdownLink>
												</div>

												<hr
													className="my-1 border-0 h-px"
													style={{ background: "var(--border-dim)" }}
												/>

												{/* Links group 2 */}
												<div className="py-0.5">
													{isOrganizer ? (
														<DropdownLink
															href="/organizer/dashboard"
															icon={<IconLayoutDashboard size={14} stroke={1.5} />}
														>
															Organizer Dashboard
														</DropdownLink>
													) : (
														<DropdownLink
															href="/become-organizer"
															icon={<IconBriefcase size={14} stroke={1.5} />}
														>
															Become Organizer
														</DropdownLink>
													)}
													{isAdmin && (
														<DropdownLink
															href="/admin"
															icon={<IconShield size={14} stroke={1.5} />}
														>
															Admin Panel
														</DropdownLink>
													)}
												</div>

												<hr
													className="my-1 border-0 h-px"
													style={{ background: "var(--border-dim)" }}
												/>

												{/* Sign out */}
												<div className="py-0.5">
													<button
														onClick={() =>
															signOut({ callbackUrl: "/" })
														}
														className="flex w-full cursor-pointer items-center gap-2.5 rounded-[var(--radius-md)] px-3 h-[34px] text-[13px] transition-colors duration-[120ms]"
														style={{ color: "var(--text-secondary)" }}
														onMouseEnter={(e) => {
															e.currentTarget.style.color = "var(--red)";
															e.currentTarget.style.backgroundColor = "var(--bg-elevated)";
														}}
														onMouseLeave={(e) => {
															e.currentTarget.style.color = "var(--text-secondary)";
															e.currentTarget.style.backgroundColor = "transparent";
														}}
													>
														<IconLogout size={14} stroke={1.5} />
														Sign out
													</button>
												</div>
											</motion.div>
										)}
									</AnimatePresence>
								</div>
							</>
						) : (
							<div className="hidden items-center gap-2 md:flex">
								<Link href="/login">
									<Button variant="ghost" size="sm">
										Sign in
									</Button>
								</Link>
								<Link href="/become-organizer">
									<Button
										variant="primary"
										size="sm"
										className="glow-gold-sm"
									>
										List an Event
									</Button>
								</Link>
							</div>
						)}

						{/* Mobile hamburger */}
						<button
							onClick={() => setMenuOpen(!menuOpen)}
							className="cursor-pointer p-1.5 md:hidden"
							style={{ color: "var(--text-primary)" }}
						>
							{menuOpen ? (
								<IconX size={20} stroke={1.5} />
							) : (
								<IconMenu2 size={20} stroke={1.5} />
							)}
						</button>
					</div>
				</nav>
			</header>

			{/* ── Mobile Drawer ── */}
			<AnimatePresence>
				{menuOpen && (
					<>
						{/* Backdrop */}
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-40 bg-black/60 md:hidden"
							onClick={() => setMenuOpen(false)}
						/>

						{/* Drawer */}
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{
								type: "tween",
								duration: 0.3,
								ease: [0.16, 1, 0.3, 1],
							}}
							className="fixed inset-0 z-50 flex flex-col md:hidden"
							style={{
								backgroundColor: "var(--bg-void)",
								borderLeft: "1px solid var(--border-dim)",
							}}
						>
							{/* Header */}
							<div className="flex h-[58px] items-center justify-between px-5">
								<Link
									href="/"
									className="flex items-center no-underline"
									onClick={() => setMenuOpen(false)}
								>
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
								<button
									onClick={() => setMenuOpen(false)}
									className="cursor-pointer p-1.5"
									style={{ color: "var(--text-primary)" }}
								>
									<IconX size={20} stroke={1.5} />
								</button>
							</div>

							{/* Nav links */}
							<div className="flex flex-col px-5 mt-4">
								{NAV_LINKS.map((link) => (
									<Link
										key={link.href}
										href={link.href}
										target={link.external ? "_blank" : undefined}
										rel={link.external ? "noopener noreferrer" : undefined}
										className="no-underline py-4"
										style={{
											fontFamily: "var(--font-display)",
											fontSize: 22,
											fontWeight: 500,
											color: isActive(link.href)
												? "var(--text-primary)"
												: "var(--text-secondary)",
											borderBottom: "1px solid var(--border-dim)",
										}}
									>
										{link.label}
									</Link>
								))}
							</div>

							{/* Auth section */}
							<div className="mt-auto flex flex-col gap-3 p-5">
								{user ? (
									<>
										<div className="mb-2">
											<p
												className="text-[14px] font-medium"
												style={{ color: "var(--text-primary)" }}
											>
												{user.name || "User"}
											</p>
											<p
												className="text-[12px] mt-0.5"
												style={{ color: "var(--text-muted)" }}
											>
												{user.email}
											</p>
										</div>
										<MobileLink href="/profile">Profile</MobileLink>
										<MobileLink href="/my/registrations">My Tickets</MobileLink>
										<MobileLink href="/my/orders">My Orders</MobileLink>
										{isOrganizer && (
											<MobileLink href="/organizer/dashboard">
												Organizer Dashboard
											</MobileLink>
										)}
										{isAdmin && (
											<MobileLink href="/admin">Admin Panel</MobileLink>
										)}
										<button
											onClick={() => signOut({ callbackUrl: "/" })}
											className="mt-2 w-full cursor-pointer text-left text-[15px] py-2 transition-colors duration-[120ms]"
											style={{ color: "var(--red)" }}
										>
											Sign out
										</button>
									</>
								) : (
									<>
										<Link href="/login" className="w-full">
											<Button
												variant="secondary"
												size="lg"
												className="w-full"
											>
												Sign in
											</Button>
										</Link>
										<Link href="/become-organizer" className="w-full">
											<Button
												variant="primary"
												size="lg"
												className="w-full"
											>
												List an Event
											</Button>
										</Link>
									</>
								)}
							</div>
						</motion.div>
					</>
				)}
			</AnimatePresence>

			{/* Spacer for fixed header */}
			<div className="h-[58px]" />
		</>
	);
}

/* ── Dropdown link helper ── */
function DropdownLink({
	href,
	icon,
	children,
}: {
	href: string;
	icon: React.ReactNode;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			className="flex items-center gap-2.5 rounded-[var(--radius-md)] px-3 h-[34px] text-[13px] no-underline transition-colors duration-[120ms]"
			style={{ color: "var(--text-secondary)" }}
			onMouseEnter={(e) => {
				e.currentTarget.style.color = "var(--text-primary)";
				e.currentTarget.style.backgroundColor = "var(--bg-elevated)";
			}}
			onMouseLeave={(e) => {
				e.currentTarget.style.color = "var(--text-secondary)";
				e.currentTarget.style.backgroundColor = "transparent";
			}}
		>
			{icon}
			{children}
		</Link>
	);
}

/* ── Mobile link helper ── */
function MobileLink({
	href,
	children,
}: {
	href: string;
	children: React.ReactNode;
}) {
	return (
		<Link
			href={href}
			className="text-[15px] py-2 no-underline transition-colors duration-[120ms]"
			style={{ color: "var(--text-secondary)" }}
		>
			{children}
		</Link>
	);
}
