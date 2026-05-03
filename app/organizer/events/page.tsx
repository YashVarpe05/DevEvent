import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";
import { redirect } from "next/navigation";
import { Calendar, MapPin, MoreVertical, Plus, Edit2, CheckCircle, Clock } from "lucide-react";

export const metadata = {
	title: "My Events | DevEvent",
};

export default async function OrganizerEventsPage({ 
  searchParams 
}: { 
  searchParams: Promise<{ status?: string }> 
}) {
	const session = await auth();
	
	if (!session?.user?.id) {
		redirect("/login");
	}

	const params = await searchParams;
	const currentStatus = params.status || "all";

	await connectDB();

	const query: any = { organizerId: session.user.id, deletedAt: null };
	if (currentStatus !== "all") {
		query.status = currentStatus;
	}

	const events = await Event.find(query).sort({ createdAt: -1 }).lean() as IEvent[];

	return (
		<main className="min-h-screen bg-gray-50">
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
					<div className="flex justify-between items-center flex-wrap gap-4">
						<div>
							<h1 className="text-2xl font-bold text-gray-900">My Events</h1>
							<p className="text-gray-500 text-sm mt-1">
								Manage your drafts and published events
							</p>
						</div>
						<div className="flex gap-4">
							<Link
								href="/organizer/dashboard"
								className="text-gray-600 hover:text-gray-900 font-medium py-2 px-4 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
							>
								Dashboard
							</Link>
							<Link
								href="/organizer/events/new"
								className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-md transition-colors flex items-center gap-2"
							>
								<Plus className="w-4 h-4" />
								Create Event
							</Link>
						</div>
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
				<div className="mb-6 border-b border-gray-200">
					<nav className="-mb-px flex space-x-8">
						<Link
							href="/organizer/events"
							className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
								currentStatus === "all"
									? "border-primary text-primary"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							All Events
						</Link>
						<Link
							href="/organizer/events?status=draft"
							className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
								currentStatus === "draft"
									? "border-primary text-primary"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							Drafts
						</Link>
						<Link
							href="/organizer/events?status=published"
							className={`whitespace-nowrap pb-4 px-1 border-b-2 font-medium text-sm transition-colors ${
								currentStatus === "published"
									? "border-primary text-primary"
									: "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
							}`}
						>
							Published
						</Link>
					</nav>
				</div>

				{events.length === 0 ? (
					<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
						<div className="w-16 h-16 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
							<Calendar className="w-8 h-8" />
						</div>
						<h3 className="text-lg font-bold text-gray-900 mb-2">No events found</h3>
						<p className="text-gray-500 max-w-sm mx-auto mb-6">
							{currentStatus === "all" 
								? "You haven't created any events yet." 
								: `You don't have any events with status '${currentStatus}'.`}
						</p>
						<Link
							href="/organizer/events/new"
							className="inline-block bg-primary text-white font-medium py-2 px-6 rounded-md hover:bg-primary/90 transition-colors"
						>
							Create Event
						</Link>
					</div>
				) : (
					<div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
						<ul className="divide-y divide-gray-200">
							{events.map((event) => (
								<li key={event._id?.toString()} className="hover:bg-gray-50 transition-colors">
									<div className="px-6 py-5 flex items-center justify-between">
										<div className="flex-1 min-w-0 pr-4">
											<div className="flex items-center gap-3 mb-1">
												<h3 className="text-lg font-semibold text-gray-900 truncate">
													{event.title}
												</h3>
												<span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${
													event.status === 'published' 
														? 'bg-green-50 text-green-700 border-green-200' 
														: event.status === 'draft'
														? 'bg-yellow-50 text-yellow-700 border-yellow-200'
														: 'bg-gray-50 text-gray-700 border-gray-200'
												}`}>
													{event.status.charAt(0).toUpperCase() + event.status.slice(1)}
												</span>
												<span className="px-2.5 py-0.5 rounded-full text-xs font-medium border bg-blue-50 text-blue-700 border-blue-200 capitalize">
													{event.eventType}
												</span>
											</div>
											
											<div className="flex items-center gap-4 text-sm text-gray-500 mt-2">
												{event.startAt && (
													<div className="flex items-center gap-1.5">
														<Clock className="w-4 h-4 text-gray-400" />
														{new Date(event.startAt).toLocaleDateString()}
													</div>
												)}
												
												{event.eventType === 'offline' || event.eventType === 'hybrid' ? (
													<div className="flex items-center gap-1.5">
														<MapPin className="w-4 h-4 text-gray-400" />
														<span className="truncate max-w-[200px]">
															{event.location?.city ? `${event.location.city}, ${event.location.country}` : 'Location TBD'}
														</span>
													</div>
												) : null}

												<div className="flex items-center gap-1.5">
													<div className="w-4 h-4 rounded border border-gray-300 flex items-center justify-center text-[10px] text-gray-500 font-bold">
														{event.currency === 'USD' ? '$' : event.currency}
													</div>
													{event.isPaid ? (event.basePrice || 0) : 'Free'}
												</div>
											</div>
										</div>
										
										<div className="flex items-center gap-3">
											{event.status === 'published' && (
												<Link 
													href={`/events/${event.slug}`} 
													target="_blank"
													className="text-gray-500 hover:text-primary transition-colors p-2"
													title="View Public Page"
												>
													<CheckCircle className="w-5 h-5" />
												</Link>
											)}
											<Link 
												href={`/organizer/events/${event._id}/edit`}
												className="inline-flex items-center gap-2 bg-white border border-gray-300 text-gray-700 font-medium py-1.5 px-4 rounded-md hover:bg-gray-50 transition-colors text-sm"
											>
												<Edit2 className="w-4 h-4" />
												Edit
											</Link>
											<button className="text-gray-400 hover:text-gray-700 p-2">
												<MoreVertical className="w-5 h-5" />
											</button>
										</div>
									</div>
								</li>
							))}
						</ul>
					</div>
				)}
			</div>
		</main>
	);
}
