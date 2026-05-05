export const dynamic = 'force-dynamic';
import { connection } from "next/server";
import { auth, signOut } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
	User,
	Mail,
	Shield,
	Calendar,
	LogOut,
	CheckCircle,
	AlertCircle,
} from "lucide-react";
import { ResendVerificationButton } from "./ResendVerificationButton";

export default async function ProfilePage() {
	await connection();
	const session = await auth();

	if (!session?.user) {
		redirect("/login?callbackUrl=/profile");
	}

	const { user } = session;

	return (
		<section className="max-w-2xl mx-auto">
			<h1 className="text-4xl mb-8">Your Profile</h1>

			<div className="glass card-shadow rounded-xl border border-dark-200 p-8 space-y-6">
				{/* Avatar + Name */}
				<div className="flex items-center gap-4">
					<div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 border border-primary/20">
						{user.image ? (
							<img
								src={user.image}
								alt={user.name || "User"}
								className="h-16 w-16 rounded-full object-cover"
							/>
						) : (
							<User className="h-8 w-8 text-primary" />
						)}
					</div>
					<div>
						<h2 className="text-xl font-bold text-white">
							{user.name || "DevEvent User"}
						</h2>
						<p className="text-light-200 text-sm">{user.email}</p>
					</div>
				</div>

				<hr className="border-dark-200" />

				{/* Details */}
				<div className="space-y-4">
					<div className="flex items-center gap-3">
						<Mail className="h-5 w-5 text-light-200" />
						<div className="flex-1">
							<p className="text-sm text-light-200">Email</p>
							<p className="text-white">{user.email}</p>
						</div>
						{user.isEmailVerified ? (
							<span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
								<CheckCircle className="h-3 w-3" />
								Verified
							</span>
						) : (
							<span className="inline-flex items-center gap-1 rounded-full bg-yellow-500/10 px-3 py-1 text-xs font-medium text-yellow-400">
								<AlertCircle className="h-3 w-3" />
								Not verified
							</span>
						)}
					</div>

					<div className="flex items-center gap-3">
						<Shield className="h-5 w-5 text-light-200" />
						<div>
							<p className="text-sm text-light-200">Roles</p>
							<div className="flex gap-2 mt-1">
								{user.roles.map((role) => (
									<span
										key={role}
										className="pill capitalize"
									>
										{role}
									</span>
								))}
							</div>
						</div>
					</div>

					<div className="flex items-center gap-3">
						<Calendar className="h-5 w-5 text-light-200" />
						<div>
							<p className="text-sm text-light-200">Member since</p>
							<p className="text-white text-sm">Active member</p>
						</div>
					</div>
				</div>

				<hr className="border-dark-200" />

				{/* Actions */}
				<div className="flex flex-wrap gap-3">
					{!user.isEmailVerified && <ResendVerificationButton />}

					<form
						action={async () => {
							"use server";
							await signOut({ redirectTo: "/" });
						}}
					>
						<button
							type="submit"
							className="inline-flex items-center gap-2 rounded-lg border border-dark-200 bg-dark-200/50 px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-dark-200 cursor-pointer"
						>
							<LogOut className="h-4 w-4" />
							Sign Out
						</button>
					</form>
				</div>
			</div>

			<p className="text-center mt-6">
				<Link
					href="/"
					className="text-sm text-light-200 hover:text-white transition-colors"
				>
					← Back to home
				</Link>
			</p>
		</section>
	);
}
