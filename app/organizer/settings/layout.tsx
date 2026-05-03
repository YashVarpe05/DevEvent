import React from "react";
import Link from "next/link";

export const metadata = {
	title: "Organizer Profile Settings | DevEvent",
};

export default function OrganizerSettingsLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col md:flex-row gap-8">
			{/* Settings Sidebar */}
			<aside className="w-full md:w-64 shrink-0">
				<nav className="space-y-1">
					<Link
						href="/organizer/settings/profile"
						className="block px-4 py-2.5 rounded-md bg-blue-50 text-primary font-medium border-l-4 border-primary"
					>
						Public Profile
					</Link>
					<div className="block px-4 py-2.5 rounded-md text-gray-500 cursor-not-allowed">
						Team Members <span className="text-[10px] ml-2 uppercase tracking-wider bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Soon</span>
					</div>
					<div className="block px-4 py-2.5 rounded-md text-gray-500 cursor-not-allowed">
						Payout Methods <span className="text-[10px] ml-2 uppercase tracking-wider bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">Soon</span>
					</div>
				</nav>
			</aside>

			{/* Main Content Area */}
			<div className="flex-1">
				{children}
			</div>
		</div>
	);
}
