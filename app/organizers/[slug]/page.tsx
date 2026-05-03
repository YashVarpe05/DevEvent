import { Metadata } from "next";
import Link from "next/link";
import connectDB from "@/lib/mongodb";
import OrganizerProfile from "@/database/organizer-profile.model";
import Event from "@/database/event.model";
import { FollowOrganizerButton } from "@/components/events/FollowOrganizerButton";

type Props = { params: Promise<{ slug: string }> };

async function loadOrganizerPage(slug: string) {
	await connectDB();
	const organizer = await OrganizerProfile.findOne({
		slug,
		isPublic: true,
	}).lean();
	if (!organizer) return null;

	const events = await Event.find({
		organizerId: organizer.userId,
		status: "published",
		visibility: "public",
		deletedAt: null,
		endAt: { $gte: new Date() },
	})
		.sort({ startAt: 1 })
		.limit(24)
		.lean();

	return { organizer, events };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
	const { slug } = await params;
	const data = await loadOrganizerPage(slug);
	if (!data) {
		return { title: "Organizer not found | DevEvent" };
	}

	const organizer = data.organizer;
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
	const canonical = `${appUrl}/organizers/${organizer.slug}`;

	return {
		title: `${organizer.displayName} | DevEvent Organizer`,
		description: organizer.bio || `Explore events by ${organizer.displayName}`,
		alternates: { canonical },
		openGraph: {
			title: `${organizer.displayName} | DevEvent Organizer`,
			description:
				organizer.bio || `Explore events by ${organizer.displayName}`,
			url: canonical,
			images: organizer.avatarUrl ? [organizer.avatarUrl] : undefined,
		},
		robots: organizer.isPublic
			? { index: true, follow: true }
			: { index: false, follow: false },
	};
}

export default async function OrganizerPublicPage({ params }: Props) {
	const { slug } = await params;
	const data = await loadOrganizerPage(slug);
	if (!data) {
		return (
			<main className="mx-auto max-w-3xl p-8 text-center text-zinc-300">
				Organizer not found.
			</main>
		);
	}

	const { organizer, events } = data;
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
	const canonical = `${appUrl}/organizers/${organizer.slug}`;

	const structuredData = {
		"@context": "https://schema.org",
		"@type": "ProfilePage",
		dateModified: new Date(organizer.updatedAt).toISOString(),
		mainEntity: {
			"@type": "Organization",
			name: organizer.displayName,
			description: organizer.bio,
			url: canonical,
			sameAs: [
				organizer.website,
				organizer.socialLinks?.x,
				organizer.socialLinks?.linkedin,
			].filter(Boolean),
		},
	};

	return (
		<main className="mx-auto max-w-6xl px-4 py-8">
			<script
				type="application/ld+json"
				dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
			/>
			<section className="mb-8 rounded-xl border border-zinc-800 bg-zinc-950 p-6">
				<div className="flex flex-wrap items-center justify-between gap-4">
					<div>
						<h1 className="text-3xl font-bold text-white">
							{organizer.displayName}
						</h1>
						<p className="mt-2 max-w-3xl text-sm text-zinc-400">
							{organizer.bio || "Organizer profile"}
						</p>
					</div>
					<FollowOrganizerButton organizerId={organizer.userId.toString()} />
				</div>
			</section>

			<section>
				<h2 className="mb-4 text-xl font-semibold text-white">
					Upcoming events
				</h2>
				<ul className="grid gap-4 md:grid-cols-3">
					{events.map((event) => (
						<li key={event._id.toString()}>
							<Link
								href={`/events/${event.slug}`}
								className="block rounded-xl border border-zinc-800 bg-zinc-950 p-4 hover:border-zinc-600"
							>
								<p className="text-xs uppercase text-zinc-500">
									{event.category || "Event"}
								</p>
								<h3 className="mt-1 text-lg font-semibold text-white">
									{event.title}
								</h3>
								<p className="mt-2 text-sm text-zinc-400">
									{new Date(event.startAt).toLocaleString()}
								</p>
							</Link>
						</li>
					))}
				</ul>
			</section>
		</main>
	);
}
