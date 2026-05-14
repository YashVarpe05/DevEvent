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
		<main style={{ minHeight: "100vh", background: "var(--bg-base)", padding: "32px 0" }}>
			<div style={{ maxWidth: "896px", margin: "0 auto", padding: "0 16px" }}>
				<div style={{ marginBottom: "24px" }}>
					<Link 
						href="/organizer/events" 
						style={{ display: "inline-flex", alignItems: "center", fontSize: "14px", fontWeight: 500, color: "var(--text-secondary)", transition: "color 0.2s" }}
					>
						<ArrowLeft style={{ width: "16px", height: "16px", marginRight: "4px" }} />
						Back to Events
					</Link>
				</div>
                
				<div style={{ marginBottom: "32px" }}>
					<h1 style={{ fontSize: "30px", fontWeight: 700, color: "var(--text-primary)", margin: 0, fontFamily: "var(--font-display)" }}>Edit Event</h1>
					<p style={{ color: "var(--text-secondary)", marginTop: "8px", fontSize: "15px" }}>
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
