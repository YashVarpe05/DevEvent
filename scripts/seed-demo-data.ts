/**
 * Seed script — creates demo users, organizer profiles, events, and ticket types.
 * Run: npx tsx scripts/seed-demo-data.ts
 */
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { readFileSync } from "fs";

// Load env manually (no dotenv dependency)
function loadEnv(file: string) {
	try {
		const lines = readFileSync(file, "utf8").split("\n");
		for (const line of lines) {
			const trimmed = line.trim();
			if (!trimmed || trimmed.startsWith("#")) continue;
			const eqIdx = trimmed.indexOf("=");
			if (eqIdx === -1) continue;
			const key = trimmed.slice(0, eqIdx).trim();
			const val = trimmed.slice(eqIdx + 1).trim();
			if (!process.env[key]) process.env[key] = val;
		}
	} catch {}
}
loadEnv(".env.local");
loadEnv(".env");

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) {
	console.error("❌ MONGODB_URI is not set");
	process.exit(1);
}

async function seed() {
	console.log("🌱 Connecting to MongoDB...");
	await mongoose.connect(MONGODB_URI as string);
	console.log("✅ Connected");

	const db = mongoose.connection.db!;

	// ─── 1. Create Users ──────────────────────────────────────────────────────
	const usersCollection = db.collection("users");

	const hashedPassword = await bcrypt.hash("Demo@1234", 12);

	// Demo account emails use +tags on a real inbox so confirmation/test emails
	// actually deliver instead of bouncing. Override with SEED_EMAIL_BASE.
	const SEED_BASE = process.env.SEED_EMAIL_BASE || "yashvarpe2005@gmail.com";
	const [seedLocal, seedDomain] = SEED_BASE.split("@");
	const demoEmail = (tag: string) => `${seedLocal}+${tag}@${seedDomain}`;
	const ADMIN_EMAIL = demoEmail("admin");
	const ORGANIZER_EMAIL = demoEmail("organizer");
	const ATTENDEE_EMAIL = demoEmail("attendee");

	const demoUsers = [
		{
			name: "Admin User",
			email: ADMIN_EMAIL,
			passwordHash: hashedPassword,
			provider: "credentials",
			roles: ["admin", "attendee"],
			emailVerified: true,
			isActive: true,
			lastLoginAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			name: "Organizer Demo",
			email: ORGANIZER_EMAIL,
			passwordHash: hashedPassword,
			provider: "credentials",
			roles: ["organizer", "attendee"],
			organizerStatus: "approved",
			emailVerified: true,
			isActive: true,
			lastLoginAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			name: "Attendee Demo",
			email: ATTENDEE_EMAIL,
			passwordHash: hashedPassword,
			provider: "credentials",
			roles: ["attendee"],
			emailVerified: true,
			isActive: true,
			lastLoginAt: new Date(),
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	for (const user of demoUsers) {
		const existing = await usersCollection.findOne({ email: user.email });
		if (!existing) {
			await usersCollection.insertOne(user);
			console.log(`  ✅ Created user: ${user.email}`);
		} else {
			console.log(`  ⏭️  User exists: ${user.email}`);
		}
	}

	const organizer = await usersCollection.findOne({ email: ORGANIZER_EMAIL });
	const organizerId = organizer!._id;

	// ─── 2. Create Organizer Profile ──────────────────────────────────────────
	const profilesCollection = db.collection("organizerprofiles");
	const existingProfile = await profilesCollection.findOne({ userId: organizerId });

	if (!existingProfile) {
		await profilesCollection.insertOne({
			userId: organizerId,
			organizationName: "DevEvent Labs",
			slug: "devevent-labs",
			bio: "A community-driven organization hosting world-class developer events, hackathons, and workshops.",
			website: "https://devevent.com",
			socialLinks: {
				twitter: "https://twitter.com/devevent",
				linkedin: "https://linkedin.com/company/devevent",
				github: "https://github.com/devevent",
			},
			isPublic: true,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
		console.log("  ✅ Created organizer profile: DevEvent Labs");
	}

	const profile = await profilesCollection.findOne({ userId: organizerId });
	const profileId = profile!._id;

	// ─── 3. Create Events ─────────────────────────────────────────────────────
	const eventsCollection = db.collection("events");

	const now = new Date();
	const futureDate = (daysFromNow: number) => {
		const d = new Date(now);
		d.setDate(d.getDate() + daysFromNow);
		return d;
	};

	const demoEvents = [
		{
			organizerId,
			organizerProfileId: profileId,
			title: "React Summit 2026",
			slug: "react-summit-2026",
			shortDescription: "The biggest React conference — 2 days of cutting-edge talks, workshops, and networking.",
			description: "Join 500+ developers for an immersive React experience featuring keynotes from Meta engineers, hands-on workshops on React Server Components, and networking with the world's best frontend developers.",
			category: "Conference",
			tags: ["react", "javascript", "frontend", "nextjs", "web-development"],
			coverImageUrl: "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200",
			eventType: "offline",
			visibility: "public",
			status: "published",
			timezone: "Asia/Kolkata",
			startAt: futureDate(14),
			endAt: futureDate(15),
			isAllDay: false,
			location: {
				venueName: "Hyderabad International Convention Centre",
				addressLine1: "Novotel & HICC Complex",
				city: "Hyderabad",
				state: "Telangana",
				country: "India",
				postalCode: "500081",
			},
			capacityType: "limited",
			capacity: 500,
			isPaid: true,
			currency: "INR",
			basePrice: 1999,
			stats: { viewsCount: 245, bookmarksCount: 89, registrationsCount: 123 },
			searchableText: "react summit 2026 conference frontend javascript nextjs hyderabad",
			qualityScore: 92,
			popularityScore: 85,
			trendingScore: 78,
			isFeatured: true,
			publishedAt: new Date(),
			lastPublishedAt: new Date(),
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			organizerId,
			organizerProfileId: profileId,
			title: "AI/ML Weekend Hackathon",
			slug: "ai-ml-weekend-hackathon",
			shortDescription: "48-hour AI/ML hackathon with $5,000 in prizes. Build, ship, and demo your AI project.",
			description: "An intensive 48-hour hackathon focused on practical AI/ML applications. Teams of 2-4 will build and demo projects using any AI framework. Mentors from Google, Microsoft, and top AI startups will be available.",
			category: "Hackathon",
			tags: ["ai", "machine-learning", "python", "hackathon", "data-science"],
			coverImageUrl: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&q=80&w=1200",
			eventType: "hybrid",
			visibility: "public",
			status: "published",
			timezone: "Asia/Kolkata",
			startAt: futureDate(7),
			endAt: futureDate(9),
			isAllDay: false,
			location: {
				venueName: "T-Hub 2.0",
				city: "Hyderabad",
				state: "Telangana",
				country: "India",
			},
			online: {
				platform: "Discord",
				meetingUrl: "https://discord.gg/devevent",
				accessNotes: "Join the #hackathon channel after registration",
			},
			capacityType: "limited",
			capacity: 200,
			isPaid: false,
			currency: "INR",
			basePrice: 0,
			stats: { viewsCount: 567, bookmarksCount: 201, registrationsCount: 156 },
			searchableText: "ai ml weekend hackathon machine learning python data science",
			qualityScore: 88,
			popularityScore: 92,
			trendingScore: 95,
			isFeatured: true,
			publishedAt: new Date(),
			lastPublishedAt: new Date(),
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			organizerId,
			organizerProfileId: profileId,
			title: "TypeScript Masterclass",
			slug: "typescript-masterclass",
			shortDescription: "Level up your TypeScript skills — advanced patterns, generics, type gymnastics, and real-world architectures.",
			description: "A deep-dive workshop covering advanced TypeScript patterns including conditional types, template literals, mapped types, and building type-safe APIs. Taught by a core TypeScript contributor.",
			category: "Workshop",
			tags: ["typescript", "javascript", "web-development", "programming"],
			coverImageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200",
			eventType: "online",
			visibility: "public",
			status: "published",
			timezone: "Asia/Kolkata",
			startAt: futureDate(5),
			endAt: futureDate(5),
			isAllDay: false,
			online: {
				platform: "Zoom",
				meetingUrl: "https://zoom.us/j/demo123",
				accessNotes: "Link sent 30 min before event",
			},
			capacityType: "unlimited",
			isPaid: true,
			currency: "INR",
			basePrice: 499,
			stats: { viewsCount: 320, bookmarksCount: 145, registrationsCount: 89 },
			searchableText: "typescript masterclass workshop javascript programming advanced",
			qualityScore: 90,
			popularityScore: 78,
			trendingScore: 72,
			isFeatured: false,
			publishedAt: new Date(),
			lastPublishedAt: new Date(),
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			organizerId,
			organizerProfileId: profileId,
			title: "DevOps & Cloud Native Meetup",
			slug: "devops-cloud-native-meetup",
			shortDescription: "Monthly meetup — Kubernetes, Docker, CI/CD pipelines, and cloud architecture patterns.",
			description: "Join our monthly DevOps community meetup! This month: building production-ready Kubernetes clusters, GitOps with ArgoCD, and monitoring with Prometheus + Grafana. Pizza and networking included.",
			category: "Meetup",
			tags: ["devops", "kubernetes", "docker", "cloud", "aws"],
			coverImageUrl: "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=1200",
			eventType: "offline",
			visibility: "public",
			status: "published",
			timezone: "Asia/Kolkata",
			startAt: futureDate(3),
			endAt: futureDate(3),
			isAllDay: false,
			location: {
				venueName: "91springboard",
				addressLine1: "4th Floor, Premia Building",
				city: "Pune",
				state: "Maharashtra",
				country: "India",
				postalCode: "411006",
			},
			capacityType: "limited",
			capacity: 60,
			isPaid: false,
			currency: "INR",
			basePrice: 0,
			stats: { viewsCount: 180, bookmarksCount: 45, registrationsCount: 42 },
			searchableText: "devops cloud native meetup kubernetes docker aws ci cd pune",
			qualityScore: 82,
			popularityScore: 70,
			trendingScore: 65,
			isFeatured: false,
			publishedAt: new Date(),
			lastPublishedAt: new Date(),
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			organizerId,
			organizerProfileId: profileId,
			title: "Open Source Contribution Sprint",
			slug: "open-source-contribution-sprint",
			shortDescription: "Guided open-source contribution day — get your first PR merged into a real project!",
			description: "Perfect for beginners! Experienced maintainers will guide you through finding issues, understanding codebases, writing quality PRs, and the open-source workflow. Bring your laptop and enthusiasm.",
			category: "Workshop",
			tags: ["open-source", "github", "git", "beginner-friendly", "community"],
			coverImageUrl: "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&q=80&w=1200",
			eventType: "online",
			visibility: "public",
			status: "published",
			timezone: "Asia/Kolkata",
			startAt: futureDate(10),
			endAt: futureDate(10),
			isAllDay: true,
			online: {
				platform: "Google Meet",
				meetingUrl: "https://meet.google.com/demo-sprint",
				accessNotes: "All day event — join any time",
			},
			capacityType: "unlimited",
			isPaid: false,
			currency: "INR",
			basePrice: 0,
			stats: { viewsCount: 410, bookmarksCount: 178, registrationsCount: 95 },
			searchableText: "open source contribution sprint github git beginner friendly workshop",
			qualityScore: 86,
			popularityScore: 82,
			trendingScore: 80,
			isFeatured: true,
			publishedAt: new Date(),
			lastPublishedAt: new Date(),
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
		{
			organizerId,
			organizerProfileId: profileId,
			title: "System Design Interview Prep",
			slug: "system-design-interview-prep",
			shortDescription: "Crack system design interviews — learn to design Twitter, Netflix, and Uber from scratch.",
			description: "A hands-on workshop that walks through designing real-world distributed systems. Cover load balancing, caching, database sharding, message queues, and microservices. Each session includes whiteboard practice and peer review.",
			category: "Workshop",
			tags: ["system-design", "interview-prep", "career", "backend", "architecture"],
			coverImageUrl: "https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&q=80&w=1200",
			eventType: "online",
			visibility: "public",
			status: "published",
			timezone: "Asia/Kolkata",
			startAt: futureDate(21),
			endAt: futureDate(21),
			isAllDay: false,
			online: {
				platform: "Zoom",
				meetingUrl: "https://zoom.us/j/system-design",
			},
			capacityType: "limited",
			capacity: 100,
			isPaid: true,
			currency: "INR",
			basePrice: 299,
			stats: { viewsCount: 890, bookmarksCount: 312, registrationsCount: 78 },
			searchableText: "system design interview prep career backend architecture distributed systems",
			qualityScore: 94,
			popularityScore: 88,
			trendingScore: 90,
			isFeatured: true,
			publishedAt: new Date(),
			lastPublishedAt: new Date(),
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		},
	];

	for (const event of demoEvents) {
		const existing = await eventsCollection.findOne({ slug: event.slug });
		if (!existing) {
			const result = await eventsCollection.insertOne(event);
			console.log(`  ✅ Created event: ${event.title}`);

			// Create ticket types for paid events
			if (event.isPaid) {
				const ticketsCollection = db.collection("tickettypes");
				await ticketsCollection.insertMany([
					{
						eventId: result.insertedId,
						name: "General Admission",
						description: "Standard entry to all sessions",
						price: event.basePrice,
						currency: event.currency,
						quantityTotal: event.capacity || 100,
						quantitySold: 0,
						maxPerOrder: 5,
						salesStartAt: new Date(),
						salesEndAt: event.startAt,
						isActive: true,
						sortOrder: 0,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
					{
						eventId: result.insertedId,
						name: "VIP Pass",
						description: "Includes priority seating, exclusive networking session, and swag bag",
						price: (event.basePrice || 0) * 2,
						currency: event.currency,
						quantityTotal: Math.floor((event.capacity || 100) * 0.2),
						quantitySold: 0,
						maxPerOrder: 2,
						salesStartAt: new Date(),
						salesEndAt: event.startAt,
						isActive: true,
						sortOrder: 1,
						createdAt: new Date(),
						updatedAt: new Date(),
					},
				]);
				console.log(`    ✅ Created tickets for: ${event.title}`);
			}
		} else {
			console.log(`  ⏭️  Event exists: ${event.title}`);
		}
	}

	console.log("\n🎉 Seed complete! Demo accounts (password: Demo@1234):");
	console.log(`  Admin:     ${ADMIN_EMAIL}`);
	console.log(`  Organizer: ${ORGANIZER_EMAIL}`);
	console.log(`  Attendee:  ${ATTENDEE_EMAIL}`);
	console.log("\n📊 6 demo events created with ticket types");

	await mongoose.disconnect();
	console.log("🔌 Disconnected from MongoDB");
}

seed().catch((err) => {
	console.error("❌ Seed failed:", err);
	process.exit(1);
});
