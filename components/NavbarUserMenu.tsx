"use client";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, ChevronDown, LayoutDashboard, Ticket } from "lucide-react";

interface NavbarUserMenuProps {
	user: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
		organizerStatus?: string | null;
	};
}

export function NavbarUserMenu({ user }: NavbarUserMenuProps) {
	const [open, setOpen] = useState(false);
	const menuRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
				setOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const isOrganizer = user.organizerStatus === "approved";

	const itemClasses =
		"flex items-center gap-2.5 px-4 py-2.5 font-mono text-[12px] uppercase tracking-wider text-text-secondary hover:bg-bg-surface hover:text-text-primary transition-colors";

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={() => setOpen(!open)}
				aria-haspopup="menu"
				aria-expanded={open}
				className="flex items-center gap-2 border border-border-subtle bg-bg-elevated px-3 py-1.5 text-text-primary hover:border-accent transition-colors cursor-pointer"
			>
				{user.image ? (
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={user.image}
						alt=""
						className="h-6 w-6 object-cover border border-border-subtle"
					/>
				) : (
					<span className="h-6 w-6 flex items-center justify-center bg-bg-void border border-border-subtle">
						<User className="h-3.5 w-3.5" aria-hidden="true" />
					</span>
				)}
				<span className="max-w-[100px] truncate font-mono text-[12px] uppercase tracking-wider max-sm:hidden">
					{user.name || user.email?.split("@")[0] || "User"}
				</span>
				<ChevronDown
					className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
					aria-hidden="true"
				/>
			</button>

			{open && (
				<div
					role="menu"
					className="absolute right-0 top-full mt-2 w-52 border border-border-subtle bg-bg-elevated shadow-[0_12px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden"
				>
					<div className="border-b border-border-subtle px-4 py-3">
						<p className="text-sm font-medium text-text-primary truncate">
							{user.name || "User"}
						</p>
						<p className="font-mono text-[11px] text-text-secondary truncate mt-0.5">
							{user.email}
						</p>
					</div>
					{isOrganizer && (
						<Link
							href="/organizer/dashboard"
							onClick={() => setOpen(false)}
							className={itemClasses}
							role="menuitem"
						>
							<LayoutDashboard className="h-4 w-4" aria-hidden="true" />
							Dashboard
						</Link>
					)}
					<Link
						href="/my/registrations"
						onClick={() => setOpen(false)}
						className={itemClasses}
						role="menuitem"
					>
						<Ticket className="h-4 w-4" aria-hidden="true" />
						My Tickets
					</Link>
					<Link
						href="/profile"
						onClick={() => setOpen(false)}
						className={itemClasses}
						role="menuitem"
					>
						<User className="h-4 w-4" aria-hidden="true" />
						Profile
					</Link>
					<button
						onClick={() => signOut({ callbackUrl: "/" })}
						className={`${itemClasses} w-full border-t border-border-subtle cursor-pointer`}
						role="menuitem"
					>
						<LogOut className="h-4 w-4" aria-hidden="true" />
						Sign Out
					</button>
				</div>
			)}
		</div>
	);
}
