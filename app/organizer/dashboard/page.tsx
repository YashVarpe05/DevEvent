export const dynamic = 'force-dynamic';
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";

export const metadata = {
	title: "Organizer Dashboard | DevEvent",
};

export default async function OrganizerDashboard() {
	const session = await auth();

	return (
		<main className="min-h-screen bg-gray-50">
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex justify-between items-center">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">Organizer Dashboard</h1>
							<p className="text-gray-500 text-sm mt-1">
								Welcome back, {session?.user?.name || "Organizer"}!
							</p>
						</div>
						<div className="flex gap-4">
							<Link
								href="/organizer/settings/profile"
								className="text-gray-600 hover:text-gray-900 font-medium py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
							>
								Settings
							</Link>
							<Link
								href="/events/create"
								className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors"
							>
								Create Event
							</Link>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						<h3 className="text-gray-500 text-sm font-medium mb-1">Total Events</h3>
						<p className="text-3xl font-bold text-gray-900">0</p>
					</div>
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						<h3 className="text-gray-500 text-sm font-medium mb-1">Total Attendees</h3>
						<p className="text-3xl font-bold text-gray-900">0</p>
					</div>
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
						<h3 className="text-gray-500 text-sm font-medium mb-1">Upcoming Events</h3>
						<p className="text-3xl font-bold text-gray-900">0</p>
					</div>
				</div>

				<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center">
					<div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
						<svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
						</svg>
					</div>
					<h3 className="text-lg font-bold text-gray-900 mb-2">You don't have any events yet</h3>
					<p className="text-gray-500 max-w-sm mx-auto mb-6">
						Create your first tech event to start building your community.
					</p>
					<Link
						href="/events/create"
						className="inline-block bg-primary text-white font-medium py-2.5 px-6 rounded-md hover:bg-primary/90 transition-colors"
					>
						Create Your First Event
					</Link>
				</div>
			</div>
		</main>
	);
}
