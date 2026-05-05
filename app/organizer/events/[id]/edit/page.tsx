export const dynamic = 'force-dynamic';
import React from "react";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Event, { IEvent } from "@/database/event.model";
import EventForm from "@/components/forms/EventForm";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
	title: "Edit Event | DevEvent",
};

export default async function EditEventPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
	const session = await auth();
	
	if (!session?.user?.id) {
		redirect("/login");
	}

	const { id } = await params;

	await connectDB();
	const event = await Event.findById(id).lean() as IEvent;

	if (!event || event.deletedAt) {
		notFound();
	}

	const isAdmin = session.user.roles?.includes("admin");
	const isOwner = event.organizerId.toString() === session.user.id;

	if (!isAdmin && !isOwner) {
		redirect("/organizer/events");
	}

	// We need to pass the event data down to the client form.
    // Convert ObjectIds to strings.
    const eventData = {
        ...event,
        _id: event._id?.toString(),
        organizerId: event.organizerId?.toString(),
        organizerProfileId: event.organizerProfileId?.toString(),
    };

	return (
		<main className="min-h-screen bg-gray-50 py-8">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				<div className="mb-6">
					<Link 
						href="/organizer/events" 
						className="inline-flex items-center text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
					>
						<ArrowLeft className="w-4 h-4 mr-1" />
						Back to Events
					</Link>
				</div>
                
				<div className="mb-8">
					<h1 className="text-3xl font-bold text-gray-900">Edit Event</h1>
					<p className="text-gray-500 mt-2">
						{event.status === "published" 
                            ? "This event is live. Changes will be reflected immediately." 
                            : "This is a draft. Fill in the details to publish it."}
					</p>
				</div>

				<EventForm initialData={eventData as any} />
			</div>
		</main>
	);
}
