export const dynamic = 'force-dynamic';
import React from "react";
import Link from "next/link";
import { auth } from "@/lib/auth";
import {
	CalendarDays,
	Users,
	CalendarCheck,
	IndianRupee,
	User,
	Plus,
	ArrowUpRight,
} from "lucide-react";
import connectDB from "@/lib/mongodb";
import Event from "@/database/event.model";
import Registration from "@/database/registration.model";

export const metadata = {
	title: "Organizer Dashboard | DevEvent",
};

export default async function OrganizerDashboard() {
	const session = await auth();
	const firstName = session?.user?.name?.split(" ")[0] || "Organizer";

	let totalEvents = 0;
	let upcomingEvents = 0;
	let totalAttendees = 0;
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let recentEvents: any[] = [];

	const organizerId = session?.user?.id;
	if (organizerId) {
		await connectDB();

		// Total events this organizer has created
		totalEvents = await Event.countDocuments({
			organizerId,
			deletedAt: null,
		});

		// Upcoming events (published, startAt in future)
		upcomingEvents = await Event.countDocuments({
			organizerId,
			deletedAt: null,
			status: "published",
			startAt: { $gte: new Date() },
		});

		// Get all event IDs for this organizer
		const organizerEventIds = await Event.find(
			{ organizerId, deletedAt: null },
			{ _id: 1 }
		).lean();

		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const eventIds = organizerEventIds.map((e: any) => e._id);

		// Total confirmed attendees across all events
		totalAttendees = eventIds.length > 0
			? await Registration.countDocuments({
					eventId: { $in: eventIds },
					status: "confirmed",
			  })
			: 0;

		// Fetch last 3 events
		recentEvents = await Event.find(
			{ organizerId, deletedAt: null },
			{
				title: 1,
				status: 1,
				startAt: 1,
				slug: 1,
				eventType: 1,
				isPaid: 1,
				basePrice: 1,
				currency: 1,
			}
		)
			.sort({ createdAt: -1 })
			.limit(3)
			.lean();
	}

	const statCards = [
		{ label: "Total Events", value: String(totalEvents), Icon: CalendarDays },
		{ label: "Total Attendees", value: String(totalAttendees), Icon: Users },
		{ label: "Upcoming Events", value: String(upcomingEvents), Icon: CalendarCheck },
	];

	const quickActions = [
		{
			href: "/organizer/events",
			Icon: CalendarDays,
			title: "My Events",
			subtitle: "Manage your events",
		},
		{
			href: "/organizer/payouts",
			Icon: IndianRupee,
			title: "Payouts",
			subtitle: "Track earnings",
		},
		{
			href: "/organizer/settings/profile",
			Icon: User,
			title: "Profile",
			subtitle: "Edit your details",
		},
	];

	return (
		<div className="px-5 sm:px-8 pt-8 pb-12 max-w-[1100px]">
			{/* SECTION 1 — Header */}
			<div className="flex justify-between items-end flex-wrap gap-4 mb-8">
				<div>
					<span className="section-label block mb-2">{"// Organizer"}</span>
					<h1 className="font-display text-[28px] sm:text-[32px] font-bold text-text-primary leading-tight tracking-tight">
						Welcome back,{" "}
						<em className="text-accent not-italic">{firstName}</em>
					</h1>
					<p className="text-text-secondary text-sm mt-1.5">
						Here&apos;s what&apos;s happening with your events
					</p>
				</div>

				<div className="flex gap-2.5">
					<Link
						href="/organizer/settings/profile"
						className="inline-flex items-center font-mono text-[12px] uppercase tracking-widest px-4 py-2.5 border border-border-subtle text-text-primary hover:border-accent hover:text-accent transition-colors"
					>
						Settings
					</Link>
					<Link
						href="/organizer/events/new"
						className="inline-flex items-center gap-1.5 font-mono text-[12px] uppercase tracking-widest font-bold px-4 py-2.5 bg-accent text-bg-base hover:bg-accent-hover transition-colors"
					>
						Create Event <Plus size={13} aria-hidden="true" />
					</Link>
				</div>
			</div>

			{/* SECTION 2 — Stats Grid */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
				{statCards.map((stat) => (
					<div
						key={stat.label}
						className="bg-bg-elevated border border-border-subtle p-5 hover:border-border-hover transition-colors"
					>
						<div className="flex justify-between items-start">
							<span className="mono-label text-text-secondary">
								{stat.label}
							</span>
							<div className="w-8 h-8 bg-accent-dim border border-accent/20 flex items-center justify-center">
								<stat.Icon size={15} className="text-accent" aria-hidden="true" />
							</div>
						</div>
						<div className="font-mono text-[36px] font-semibold text-text-primary mt-3 leading-none">
							{stat.value}
						</div>
					</div>
				))}
			</div>

			{/* SECTION 3 — Quick Actions */}
			<div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
				{quickActions.map((action) => (
					<Link
						key={action.href}
						href={action.href}
						className="group bg-bg-elevated border border-border-subtle p-4 flex items-center gap-3 hover:border-accent transition-colors"
					>
						<div className="w-8 h-8 bg-accent-dim border border-accent/20 flex items-center justify-center shrink-0">
							<action.Icon size={15} className="text-accent" aria-hidden="true" />
						</div>
						<div className="min-w-0">
							<div className="text-[13px] font-medium text-text-primary group-hover:text-accent transition-colors">
								{action.title}
							</div>
							<div className="font-mono text-[10px] uppercase tracking-wider text-text-secondary mt-0.5">
								{action.subtitle}
							</div>
						</div>
						<ArrowUpRight
							size={14}
							className="ml-auto shrink-0 text-text-secondary opacity-0 group-hover:opacity-100 group-hover:text-accent transition-all"
							aria-hidden="true"
						/>
					</Link>
				))}
			</div>

			{/* SECTION 4 — Recent Events */}
			{recentEvents.length > 0 && (
				<div className="bg-bg-elevated border border-border-subtle overflow-hidden mb-6">
					<div className="px-5 py-4 border-b border-border-subtle flex justify-between items-center">
						<span className="mono-label text-text-secondary">
							Recent Events
						</span>
						<Link
							href="/organizer/events"
							className="inline-flex items-center gap-1 font-mono text-[11px] uppercase tracking-wider text-accent hover:text-accent-hover transition-colors"
						>
							View all <ArrowUpRight size={11} aria-hidden="true" />
						</Link>
					</div>

					{/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
					{recentEvents.map((event: any, i: number) => (
						<div
							key={event._id.toString()}
							className={`px-5 py-3.5 flex justify-between items-center gap-3 ${
								i < recentEvents.length - 1 ? "border-b border-border-subtle" : ""
							}`}
						>
							<div className="flex-1 min-w-0">
								<p className="text-sm font-medium text-text-primary truncate">
									{event.title}
								</p>
								<p className="font-mono text-[11px] text-text-secondary mt-0.5">
									{event.startAt
										? new Date(event.startAt).toLocaleDateString("en-IN", {
												day: "numeric",
												month: "short",
												year: "numeric",
											})
										: "No date set"}
								</p>
							</div>

							<div className="flex items-center gap-2 shrink-0">
								<span
									className={`inline-flex items-center gap-1.5 font-mono text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 border ${
										event.status === "published"
											? "border-teal/30 text-teal bg-teal-dim"
											: "border-border-subtle text-text-secondary bg-transparent"
									}`}
								>
									<span
										className={`w-1 h-1 ${
											event.status === "published" ? "bg-teal" : "bg-text-secondary"
										}`}
										aria-hidden="true"
									/>
									{event.status}
								</span>

								<Link
									href={`/organizer/events/${event._id.toString()}/edit`}
									className="font-mono text-[11px] uppercase tracking-wider text-text-secondary px-2.5 py-1 border border-border-subtle hover:border-accent hover:text-accent transition-colors"
								>
									Edit
								</Link>
							</div>
						</div>
					))}
				</div>
			)}

			{/* SECTION 5 — Empty State / Footer */}
			{totalEvents === 0 ? (
				<div className="bg-bg-elevated border border-border-subtle py-14 px-6 text-center">
					<div className="w-14 h-14 bg-accent-dim border border-accent/20 flex items-center justify-center mx-auto mb-4">
						<CalendarDays size={24} className="text-accent" aria-hidden="true" />
					</div>

					<h3 className="font-display text-xl font-bold text-text-primary mb-2">
						No events yet
					</h3>
					<p className="text-text-secondary text-sm mb-6 max-w-[340px] mx-auto leading-relaxed">
						Create your first tech event and start building your developer
						community.
					</p>

					<Link
						href="/organizer/events/new"
						className="inline-flex items-center gap-2 font-mono text-[12px] uppercase tracking-widest font-bold px-6 py-3.5 bg-accent text-bg-base hover:bg-accent-hover transition-colors"
					>
						Create Your First Event <ArrowUpRight size={13} aria-hidden="true" />
					</Link>
				</div>
			) : (
				<p className="text-text-secondary text-sm text-center font-mono">
					You have {totalEvents} event{totalEvents !== 1 ? "s" : ""}.{" "}
					<Link
						href="/organizer/events"
						className="text-accent hover:text-accent-hover transition-colors"
					>
						View all events →
					</Link>
				</p>
			)}
		</div>
	);
}
