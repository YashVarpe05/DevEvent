"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence, useScroll, useMotionValueEvent } from "framer-motion";
import {
	Menu,
	X,
	Bell,
	User,
	Ticket,
	ShoppingBag,
	LayoutDashboard,
	Shield,
	Briefcase,
	LogOut,
} from "lucide-react";
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
	{ href: "/events", label: "Events" },
	{ href: "/become-organizer", label: "Organizers" },
];

export function NavbarShell({ user }: NavbarShellProps) {
	const pathname = usePathname();
	const [scrolled, setScrolled] = useState(false);
	const [menuOpen, setMenuOpen] = useState(false);
	const [dropdownOpen, setDropdownOpen] = useState(false);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const { scrollY } = useScroll();

	useMotionValueEvent(scrollY, "change", (latest) => {
		setScrolled(latest > 40);
	});

	// Close dropdown on outside click
	useEffect(() => {
		const handler = (e: MouseEvent) => {
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				setDropdownOpen(false);
			}
		};
		document.addEventListener("mousedown", handler);
		return () => document.removeEventListener("mousedown", handler);
	}, []);

	// Close mobile menu on route change
	useEffect(() => {
		setMenuOpen(false);
		setDropdownOpen(false);
	}, [pathname]);

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

	return (
		<>
			<header
				className="fixed top-0 left-0 right-0 z-50 transition-[background-color,border-color] duration-200"
				style={{
					backgroundColor: scrolled ? "var(--bg-elevated)" : "transparent",
					borderBottom: scrolled ? "1px solid var(--border)" : "1px solid transparent",
				}}
			>
				<nav className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5 sm:px-8">
					{/* LEFT — Logo */}
					<Link href="/" className="flex items-center gap-0 no-underline">
						<span
							className="font-display text-xl tracking-wide"
							style={{ color: "var(--text-primary)" }}
						>
							DEV
						</span>
						<span
							className="font-display text-xl"
							style={{ color: "var(--accent)" }}
						>
							·
						</span>
						<span
							className="font-display text-xl tracking-wide"
							style={{ color: "var(--text-primary)" }}
						>
							EVENT
						</span>
					</Link>

					{/* CENTER — Nav links (desktop) */}
					<div className="hidden items-center gap-8 md:flex">
						{NAV_LINKS.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="text-[13px] font-medium no-underline transition-colors duration-150"
								style={{
									color:
										pathname === link.href
											? "var(--text-primary)"
											: "var(--text-secondary)",
								}}
								onMouseEnter={(e) =>
									(e.currentTarget.style.color = "var(--text-primary)")
								}
								onMouseLeave={(e) =>
									(e.currentTarget.style.color =
										pathname === link.href
											? "var(--text-primary)"
											: "var(--text-secondary)")
								}
							>
								{link.label}
							</Link>
						))}
					</div>

					{/* RIGHT — Auth */}
					<div className="flex items-center gap-3">
						{user ? (
							<>
								{/* Bell */}
								<button
									className="hidden cursor-pointer p-1.5 transition-colors duration-150 md:flex"
									style={{ color: "var(--text-muted)" }}
									onMouseEnter={(e) =>
										(e.currentTarget.style.color = "var(--text-primary)")
									}
									onMouseLeave={(e) =>
										(e.currentTarget.style.color = "var(--text-muted)")
									}
								>
									<Bell size={18} />
								</button>

								{/* Avatar + Dropdown */}
								<div className="relative hidden md:block" ref={dropdownRef}>
									<button
										onClick={() => setDropdownOpen(!dropdownOpen)}
										className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded-[var(--radius-md)]"
										style={{
											backgroundColor: "var(--bg-overlay)",
											border: "1px solid var(--border)",
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
												className="text-[11px] font-semibold"
												style={{ color: "var(--text-secondary)" }}
											>
												{initials}
											</span>
										)}
									</button>

									<AnimatePresence>
										{dropdownOpen && (
											<motion.div
												initial={{ opacity: 0, scale: 0.97, y: -4 }}
												animate={{ opacity: 1, scale: 1, y: 0 }}
												exit={{ opacity: 0, scale: 0.97, y: -4 }}
												transition={{ duration: 0.15 }}
												className="absolute right-0 top-full mt-2 w-52 overflow-hidden rounded-[var(--radius-lg)]"
												style={{
													backgroundColor: "var(--bg-overlay)",
													border: "1px solid var(--border)",
												}}
											>
												{/* User info */}
												<div
													className="px-4 py-3"
													style={{
														borderBottom:
															"1px solid var(--border)",
													}}
												>
													<p
														className="truncate text-[13px] font-medium"
														style={{
															color: "var(--text-primary)",
														}}
													>
														{user.name || "User"}
													</p>
													<p
														className="truncate text-[11px]"
														style={{
															color: "var(--text-muted)",
														}}
													>
														{user.email}
													</p>
												</div>

												{/* Links */}
												<div className="py-1">
													<DropdownLink
														href="/profile"
														icon={<User size={14} />}
													>
														Profile
													</DropdownLink>
													<DropdownLink
														href="/my/registrations"
														icon={<Ticket size={14} />}
													>
														My Tickets
													</DropdownLink>
													<DropdownLink
														href="/my/orders"
														icon={<ShoppingBag size={14} />}
													>
														My Orders
													</DropdownLink>
												</div>

												<div
													style={{
														borderTop:
															"1px solid var(--border)",
													}}
												/>

												<div className="py-1">
													{isOrganizer ? (
														<DropdownLink
															href="/organizer/dashboard"
															icon={
																<LayoutDashboard
																	size={14}
																/>
															}
														>
															Organizer Dashboard
														</DropdownLink>
													) : (
														<DropdownLink
															href="/become-organizer"
															icon={
																<Briefcase size={14} />
															}
														>
															Become Organizer
														</DropdownLink>
													)}
													{isAdmin && (
														<DropdownLink
															href="/admin"
															icon={<Shield size={14} />}
														>
															Admin Panel
														</DropdownLink>
													)}
												</div>

												<div
													style={{
														borderTop:
															"1px solid var(--border)",
													}}
												/>

												<div className="py-1">
													<button
														onClick={() =>
															signOut({
																callbackUrl: "/",
															})
														}
														className="flex w-full cursor-pointer items-center gap-2.5 px-4 py-2 text-[13px] transition-colors duration-150"
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
														<LogOut size={14} />
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
								<Link href="/signup">
									<Button variant="primary" size="sm">
										Get Started
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
							{menuOpen ? <X size={20} /> : <Menu size={20} />}
						</button>
					</div>
				</nav>
			</header>

			{/* Mobile drawer */}
			<AnimatePresence>
				{menuOpen && (
					<>
						<motion.div
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
							className="fixed inset-0 z-40 bg-black/60 md:hidden"
							onClick={() => setMenuOpen(false)}
						/>
						<motion.div
							initial={{ x: "100%" }}
							animate={{ x: 0 }}
							exit={{ x: "100%" }}
							transition={{ type: "tween", duration: 0.25 }}
							className="fixed top-0 right-0 bottom-0 z-50 flex w-72 flex-col md:hidden"
							style={{
								backgroundColor: "var(--bg-elevated)",
								borderLeft: "1px solid var(--border)",
							}}
						>
							{/* Close */}
							<div className="flex h-14 items-center justify-end px-5">
								<button
									onClick={() => setMenuOpen(false)}
									className="cursor-pointer p-1.5"
									style={{ color: "var(--text-primary)" }}
								>
									<X size={20} />
								</button>
							</div>

							{/* Nav links */}
							<div className="flex flex-col gap-1 px-4">
								{NAV_LINKS.map((link) => (
									<Link
										key={link.href}
										href={link.href}
										className="rounded-[var(--radius-md)] px-3 py-2.5 text-[15px] font-medium no-underline transition-colors duration-150"
										style={{
											color:
												pathname === link.href
													? "var(--text-primary)"
													: "var(--text-secondary)",
										}}
									>
										{link.label}
									</Link>
								))}
							</div>

							<div
								className="mx-4 my-3"
								style={{
									borderTop: "1px solid var(--border)",
								}}
							/>

							{/* Auth */}
							<div className="flex flex-col gap-2 px-4">
								{user ? (
									<>
										<div className="mb-2 px-3">
											<p
												className="text-[13px] font-medium"
												style={{
													color: "var(--text-primary)",
												}}
											>
												{user.name || "User"}
											</p>
											<p
												className="text-[11px]"
												style={{
													color: "var(--text-muted)",
												}}
											>
												{user.email}
											</p>
										</div>
										<MobileLink href="/profile">
											Profile
										</MobileLink>
										<MobileLink href="/my/registrations">
											My Tickets
										</MobileLink>
										<MobileLink href="/my/orders">
											My Orders
										</MobileLink>
										{isOrganizer && (
											<MobileLink href="/organizer/dashboard">
												Organizer Dashboard
											</MobileLink>
										)}
										{isAdmin && (
											<MobileLink href="/admin">
												Admin Panel
											</MobileLink>
										)}
										<button
											onClick={() =>
												signOut({ callbackUrl: "/" })
											}
											className="mt-2 w-full cursor-pointer rounded-[var(--radius-md)] px-3 py-2.5 text-left text-[15px] transition-colors duration-150"
											style={{
												color: "var(--error)",
											}}
										>
											Sign out
										</button>
									</>
								) : (
									<>
										<Link href="/login" className="w-full">
											<Button
												variant="secondary"
												size="md"
												className="w-full"
											>
												Sign in
											</Button>
										</Link>
										<Link href="/signup" className="w-full">
											<Button
												variant="primary"
												size="md"
												className="w-full"
											>
												Get Started
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
			<div className="h-14" />
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
			className="flex items-center gap-2.5 px-4 py-2 text-[13px] no-underline transition-colors duration-150"
			style={{ color: "var(--text-secondary)" }}
			onMouseEnter={(e) =>
				(e.currentTarget.style.color = "var(--text-primary)")
			}
			onMouseLeave={(e) =>
				(e.currentTarget.style.color = "var(--text-secondary)")
			}
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
			className="rounded-[var(--radius-md)] px-3 py-2.5 text-[15px] no-underline transition-colors duration-150"
			style={{ color: "var(--text-secondary)" }}
		>
			{children}
		</Link>
	);
}
