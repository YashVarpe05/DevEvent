"use client";
import { useState, useRef, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { User, LogOut, ChevronDown } from "lucide-react";

interface NavbarUserMenuProps {
	user: {
		name?: string | null;
		email?: string | null;
		image?: string | null;
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

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={() => setOpen(!open)}
				className="flex items-center gap-2 rounded-lg border border-dark-200 bg-dark-200/50 px-3 py-1.5 text-sm text-white hover:bg-dark-200 transition-colors cursor-pointer"
			>
				{user.image ? (
					<img
						src={user.image}
						alt=""
						className="h-6 w-6 rounded-full object-cover"
					/>
				) : (
					<User className="h-4 w-4" />
				)}
				<span className="max-w-[100px] truncate max-sm:hidden">
					{user.name || user.email?.split("@")[0] || "User"}
				</span>
				<ChevronDown
					className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`}
				/>
			</button>

			{open && (
				<div className="absolute right-0 top-full mt-2 w-48 rounded-lg border border-dark-200 bg-dark-100 shadow-lg z-50 overflow-hidden">
					<div className="border-b border-dark-200 px-4 py-3">
						<p className="text-sm font-medium text-white truncate">
							{user.name || "User"}
						</p>
						<p className="text-xs text-light-200 truncate">{user.email}</p>
					</div>
					<Link
						href="/profile"
						onClick={() => setOpen(false)}
						className="flex items-center gap-2 px-4 py-2.5 text-sm text-light-100 hover:bg-dark-200 hover:text-white transition-colors"
					>
						<User className="h-4 w-4" />
						Profile
					</Link>
					<button
						onClick={() => signOut({ callbackUrl: "/" })}
						className="flex w-full items-center gap-2 px-4 py-2.5 text-sm text-light-100 hover:bg-dark-200 hover:text-white transition-colors cursor-pointer"
					>
						<LogOut className="h-4 w-4" />
						Sign Out
					</button>
				</div>
			)}
		</div>
	);
}
