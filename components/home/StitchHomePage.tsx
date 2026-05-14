"use client";

import type { CSSProperties, ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
	ArrowRight,
	Github,
	Lock,
	QrCode,
	Star,
	Twitter,
	Zap,
} from "lucide-react";

export type StitchHomeEvent = {
	_id: string;
	title: string;
	slug: string;
	thumbnail?: string;
	location?: string;
	eventStartDate: string;
	eventEndDate: string;
	category?: string;
	isPaid?: boolean;
	ticketPrice?: number;
	currency?: string;
	organizerProfileId?: { name?: string };
};

type PreviewEvent = {
	category: string;
	date: string;
	duration: string;
	href: string;
	image: string;
	price: string;
	title: string;
};

type ShowcaseCard = {
	date: string;
	description: string;
	image: string;
	initial: { opacity: number; rotate: number; x: number; y: number };
	rest: { opacity: number; rotate: number; x: number; y: number };
	title: string;
};

const homeTheme = {
	"--home-bg": "#0A0A0B",
	"--home-surface": "#111113",
	"--home-surface-low": "#1A1B22",
	"--home-surface-high": "#292931",
	"--home-border": "#1F1F23",
	"--home-border-bright": "#383941",
	"--home-text": "#E8E6E3",
	"--home-muted": "#6B6B74",
	"--home-copy": "#A7A1A0",
	"--home-primary": "#FF6B35",
	"--home-primary-pressed": "#FFB59D",
	"--home-on-primary": "#0A0A0B",
	"--home-secondary": "#00D4AA",
	"--home-on-secondary": "#00382B",
} as CSSProperties;

const ease = [0.16, 1, 0.3, 1] as const;

const eventImages = [
	"/images/event1.png",
	"/images/event2.png",
	"/images/event3.png",
	"/images/event4.png",
	"/images/event5.png",
	"/images/event6.png",
];

const fallbackEvents: PreviewEvent[] = [
	{
		category: "Frontend",
		date: "DEC 12 - DELHI NCR",
		title: "JSConf India 2024",
		duration: "2 DAYS",
		price: "INR 2499",
		image: "/images/event1.png",
		href: "/events",
	},
	{
		category: "Hardware",
		date: "JAN 05 - HYDERABAD",
		title: "IoT Build Summit",
		duration: "1 DAY",
		price: "FREE",
		image: "/images/event2.png",
		href: "/events",
	},
	{
		category: "Backend",
		date: "FEB 18 - PUNE",
		title: "GoLang Assembly",
		duration: "3 DAYS",
		price: "INR 4999",
		image: "/images/event3.png",
		href: "/events",
	},
	{
		category: "AI/ML",
		date: "MAR 08 - BANGALORE",
		title: "TensorFlow Conf",
		duration: "2 DAYS",
		price: "INR 3499",
		image: "/images/event4.png",
		href: "/events",
	},
];

const showcaseCards: ShowcaseCard[] = [
	{
		date: "OCT 14 - BANGALORE",
		description: "The premier React conference in Asia.",
		image: "/images/event4.png",
		initial: { opacity: 0, rotate: -10, x: 58, y: -38 },
		rest: { opacity: 0.52, rotate: -7, x: 42, y: -34 },
		title: "React India 2024",
	},
	{
		date: "JAN 05 - HYDERABAD",
		description: "Hardware hacking at scale.",
		image: "/images/event2.png",
		initial: { opacity: 0, rotate: 7, x: -18, y: 18 },
		rest: { opacity: 0.82, rotate: 3, x: 0, y: 0 },
		title: "IoT Build Summit",
	},
	{
		date: "NOV 02 - MUMBAI",
		description: "Building the decentralized future.",
		image: "/images/event5.png",
		initial: { opacity: 0, rotate: -5, x: -38, y: 42 },
		rest: { opacity: 1, rotate: -2, x: -32, y: 32 },
		title: "Web3 Buildathon",
	},
];

function formatDate(dateStr: string, location?: string) {
	const date = new Date(dateStr);
	const dateLabel = Number.isNaN(date.getTime())
		? "SOON"
		: date
				.toLocaleDateString("en-IN", {
					month: "short",
					day: "2-digit",
				})
				.toUpperCase();

	return `${dateLabel} - ${(location || "ONLINE").toUpperCase()}`;
}

function formatDuration(startStr: string, endStr: string) {
	const start = new Date(startStr);
	const end = new Date(endStr);

	if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
		return "1 DAY";
	}

	const days = Math.max(
		1,
		Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
	);

	return days === 1 ? "1 DAY" : `${days} DAYS`;
}

function formatPrice(event: StitchHomeEvent) {
	if (!event.isPaid || !event.ticketPrice) {
		return "FREE";
	}

	if (!event.currency || event.currency === "INR") {
		return `INR ${event.ticketPrice}`;
	}

	return `${event.currency} ${event.ticketPrice}`;
}

function buildPreviewEvents(events: StitchHomeEvent[]): PreviewEvent[] {
	if (!events.length) {
		return fallbackEvents;
	}

	return events.slice(0, 6).map((event, index) => ({
		category: event.category || "Developer",
		date: formatDate(event.eventStartDate, event.location),
		title: event.title,
		duration: formatDuration(event.eventStartDate, event.eventEndDate),
		price: formatPrice(event),
		image: event.thumbnail?.startsWith("/")
			? event.thumbnail
			: eventImages[index % eventImages.length],
		href: `/events/${event.slug}`,
	}));
}

export function StitchHomePage({ events }: { events: StitchHomeEvent[] }) {
	const previewEvents = buildPreviewEvents(events);
	const reduceMotion = useReducedMotion();

	const reveal = (delay = 0, y = 24) => ({
		initial: reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y },
		animate: { opacity: 1, y: 0 },
		transition: reduceMotion
			? { duration: 0 }
			: { duration: 0.62, delay, ease },
	});

	return (
		<div
			style={homeTheme}
			className="min-h-screen bg-[var(--home-bg)] text-[var(--home-text)] selection:bg-[#FF6B35]/30 selection:text-[var(--home-text)]"
		>
			<div>
				<section className="relative flex min-h-[calc(100vh-58px)] flex-col items-stretch overflow-hidden border-b border-[var(--home-border)] bg-[var(--home-bg)] lg:flex-row">
					<motion.div
						aria-hidden
						initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
						animate={{ scaleX: 1 }}
						transition={{ duration: reduceMotion ? 0 : 0.9, ease }}
						className="absolute left-0 top-0 h-px w-full origin-left bg-[var(--home-border)]"
					/>
					<motion.div
						aria-hidden
						initial={reduceMotion ? { scaleY: 1 } : { scaleY: 0 }}
						animate={{ scaleY: 1 }}
						transition={{ duration: reduceMotion ? 0 : 1.1, delay: 0.15, ease }}
						className="absolute bottom-0 left-[60%] top-0 hidden w-px origin-top bg-[var(--home-border)] lg:block"
					/>

					<div className="relative z-10 flex w-full flex-col justify-center px-6 py-20 lg:w-[60%] lg:px-10 lg:py-24">
						<motion.div
							{...reveal(0)}
							className="mb-6 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em] text-[var(--home-primary)]"
						>
							{"// INDIA'S DEVELOPER EVENT PLATFORM"}
						</motion.div>

						<motion.h1
							{...reveal(0.1, 32)}
							className="mb-6 max-w-full overflow-hidden font-[family-name:var(--font-editorial-display)] text-[42px] font-bold uppercase leading-[0.9] tracking-normal text-[var(--home-text)] min-[420px]:text-[48px] sm:max-w-[780px] sm:text-6xl lg:text-7xl xl:text-[84px]"
						>
							<span className="block sm:inline">Where</span>
							<span className="hidden sm:inline"> </span>
							<span className="block sm:inline">Builders</span>
							<br />
							<span className="text-[var(--home-primary)]">
								<span className="block sm:inline">Come</span>
								<span className="hidden sm:inline"> </span>
								<span className="block sm:inline">Together</span>
							</span>
						</motion.h1>

						<motion.p
							initial={reduceMotion ? { y: 0 } : { y: 18 }}
							animate={{ y: 0 }}
							transition={
								reduceMotion
									? { duration: 0 }
									: { duration: 0.62, delay: 0.2, ease }
							}
							style={{ color: "var(--home-copy)", opacity: 1 }}
							className="mb-10 max-w-[330px] font-[family-name:var(--font-editorial-body)] text-base font-medium leading-relaxed text-[var(--home-copy)] sm:max-w-[460px] lg:text-lg"
						>
							Discover hackathons, meetups, and workshops. Book your spot in
							seconds. No fluff.
						</motion.p>

						<motion.div
							{...reveal(0.3)}
							className="mb-16 flex flex-wrap gap-4"
						>
							<Link
								href="/events"
								className="inline-flex items-center gap-2 rounded-none bg-[var(--home-primary)] px-7 py-3.5 font-[family-name:var(--font-editorial-display)] text-xs font-bold uppercase tracking-widest text-[var(--home-on-primary)] transition-colors hover:bg-[var(--home-primary-pressed)]"
							>
								Browse Events
								<ArrowRight className="h-4 w-4" />
							</Link>
							<Link
								href="/become-organizer"
								className="rounded-none border border-[var(--home-border)] px-7 py-3.5 font-[family-name:var(--font-mono)] text-xs uppercase tracking-widest text-[var(--home-text)] transition-colors hover:border-[var(--home-secondary)] hover:text-[var(--home-secondary)]"
							>
								List an Event
							</Link>
						</motion.div>

						<motion.div
							{...reveal(0.4, 12)}
							className="grid grid-cols-2 gap-x-4 gap-y-3 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--home-muted)] sm:flex sm:flex-wrap sm:gap-x-6 sm:gap-y-2"
						>
							<Stat label="Developers" value="2400+" />
							<span className="hidden text-[var(--home-border-bright)] sm:inline">.</span>
							<Stat label="Events" value="140+" />
							<span className="hidden text-[var(--home-border-bright)] sm:inline">.</span>
							<Stat label="Cities" value="28" />
							<span className="hidden text-[var(--home-border-bright)] sm:inline">.</span>
							<Stat label="Open Source" value="100%" />
						</motion.div>
					</div>

					<div className="relative z-10 hidden w-10 items-center justify-center border-x border-[var(--home-border)] bg-[var(--home-bg)] lg:flex">
						<div
							className="whitespace-nowrap font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-[0.2em] text-[var(--home-border-bright)] opacity-70"
							style={{
								writingMode: "vertical-rl",
								textOrientation: "mixed",
								transform: "rotate(180deg)",
							}}
						>
							HACKATHON - MEETUP - WORKSHOP - CONFERENCE - BUILDATHON - ASSEMBLY
						</div>
					</div>

					<div className="relative min-h-[500px] w-full overflow-hidden border-t border-[var(--home-border)] bg-[var(--home-surface)] lg:min-h-0 lg:w-[40%] lg:border-t-0">
						<motion.div
							aria-hidden
							initial={reduceMotion ? { scaleX: 1 } : { scaleX: 0 }}
							animate={{ scaleX: 1 }}
							transition={{ duration: reduceMotion ? 0 : 1, delay: 0.35, ease }}
							className="absolute left-0 top-[18%] h-px w-full origin-left bg-[var(--home-border)]"
						/>
						<motion.div
							aria-hidden
							initial={reduceMotion ? { scaleY: 1 } : { scaleY: 0 }}
							animate={{ scaleY: 1 }}
							transition={{ duration: reduceMotion ? 0 : 1, delay: 0.45, ease }}
							className="absolute bottom-0 right-[24%] top-0 w-px origin-top bg-[var(--home-border)]"
						/>

						<div className="absolute inset-0 flex items-center justify-center">
							{showcaseCards.map((card, index) => (
								<ShowcaseEventCard
									card={card}
									index={index}
									key={card.title}
									reduceMotion={reduceMotion}
								/>
							))}
						</div>
					</div>
				</section>

				<section className="border-b border-[var(--home-border)] bg-[var(--home-bg)] px-6 py-24 lg:px-10">
					<div className="mx-auto max-w-[1440px]">
						<motion.div
							initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
							whileInView={{ opacity: 1 }}
							viewport={{ once: true }}
							className="mb-10 font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em] text-[var(--home-primary)]"
						>
							{"// WHY DEVEVENT"}
						</motion.div>

						<div className="grid auto-rows-[220px] grid-cols-1 gap-4 md:grid-cols-12">
							<motion.div
								initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								className="group flex flex-col justify-between rounded-none border border-[var(--home-border)] bg-[var(--home-surface)] p-6 transition-colors hover:border-[var(--home-primary)] md:col-span-8"
							>
								<div className="flex items-start justify-between gap-4">
									<h3 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[var(--home-text)] lg:text-3xl">
										100% Open Source
									</h3>
									<div className="flex items-center gap-2 border border-[var(--home-border)] bg-[var(--home-bg)] px-3 py-1.5">
										<Star className="h-4 w-4 fill-[var(--home-secondary)] text-[var(--home-secondary)]" />
										<span className="font-[family-name:var(--font-mono)] text-xs text-[var(--home-text)]">
											12.4k
										</span>
									</div>
								</div>
								<p className="max-w-md text-base text-[var(--home-muted)] transition-colors group-hover:text-[var(--home-primary-pressed)]">
									Built by the community, for the community. Inspect the code,
									contribute, and shape the platform&apos;s future.
								</p>
							</motion.div>

							<FeatureCard
								delay={0.1}
								icon={<Lock className="mb-4 h-8 w-8 text-[var(--home-border-bright)]" />}
								title="Secure"
							>
								Enterprise-grade architecture.
							</FeatureCard>

							<motion.div
								initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.2 }}
								className="group flex flex-col items-start justify-between gap-6 rounded-none border border-[var(--home-border)] bg-[var(--home-surface)] p-6 transition-colors hover:border-[var(--home-primary)] md:col-span-6 md:flex-row md:items-center"
							>
								<div className="flex-1">
									<h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--home-text)]">
										UPI Native
									</h3>
									<p className="mb-4 font-[family-name:var(--font-mono)] text-xs uppercase text-[var(--home-muted)]">
										Frictionless payments for India.
									</p>
									<Link
										href="/events"
										className="border-b border-[var(--home-primary)] pb-0.5 font-[family-name:var(--font-mono)] text-xs uppercase text-[var(--home-primary)] transition-colors hover:border-[var(--home-secondary)] hover:text-[var(--home-secondary)]"
									>
										Browse Events
									</Link>
								</div>
								<div className="flex h-24 w-24 items-center justify-center border border-[var(--home-border)] bg-[var(--home-bg)]">
									<QrCode className="h-12 w-12 text-[var(--home-border-bright)]" />
								</div>
							</motion.div>

							<motion.div
								initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
								whileInView={{ opacity: 1, y: 0 }}
								viewport={{ once: true }}
								transition={{ delay: 0.3 }}
								className="group relative flex flex-col justify-between overflow-hidden rounded-none border border-[var(--home-border)] bg-[var(--home-surface)] p-6 transition-colors hover:border-[var(--home-primary)] md:col-span-6"
							>
								<div className="relative z-10">
									<Zap className="mb-4 h-8 w-8 text-[var(--home-border-bright)]" />
									<h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--home-text)]">
										Lightning Fast
									</h3>
									<p className="font-[family-name:var(--font-mono)] text-xs uppercase text-[var(--home-muted)]">
										Optimized for edge delivery.
									</p>
								</div>
								<div className="absolute bottom-[-10px] right-2 select-none font-[family-name:var(--font-editorial-display)] text-[100px] font-bold leading-none text-[var(--home-surface-low)] transition-colors group-hover:text-[var(--home-surface-high)]">
									99<span className="text-[50px]">ms</span>
								</div>
							</motion.div>
						</div>
					</div>
				</section>

				<section className="overflow-hidden border-b border-[var(--home-border)] bg-[var(--home-bg)] py-24">
					<div className="mb-10 px-6 lg:px-10">
						<div className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-[0.1em] text-[var(--home-primary)]">
							{"// UPCOMING"}
						</div>
					</div>

					<div className="flex snap-x gap-4 overflow-x-auto px-6 pb-8 [-ms-overflow-style:none] [scrollbar-width:none] lg:px-10 [&::-webkit-scrollbar]:hidden">
						{previewEvents.map((event, index) => (
							<motion.div
								key={`${event.title}-${index}`}
								initial={reduceMotion ? { opacity: 1, x: 0 } : { opacity: 0, x: 20 }}
								whileInView={{ opacity: 1, x: 0 }}
								viewport={{ once: true }}
								transition={{ delay: index * 0.1 }}
								className="w-[300px] shrink-0 snap-start"
							>
								<Link
									href={event.href}
									className="group block h-full cursor-pointer rounded-none border border-[var(--home-border)] bg-[var(--home-surface)] transition-colors hover:border-[var(--home-primary)]"
								>
									<div className="relative h-40 w-full overflow-hidden border-b border-[var(--home-border)] bg-[var(--home-surface-low)]">
										<Image
											src={event.image}
											alt=""
											fill
											className="object-cover opacity-70 grayscale transition duration-300 group-hover:scale-[1.03] group-hover:grayscale-0"
											sizes="300px"
										/>
										<div className="absolute inset-0 bg-[var(--home-bg)] opacity-35" />
										<div className="absolute left-3 top-3 border border-[var(--home-border)] bg-[var(--home-surface)] px-2 py-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--home-text)]">
											{event.category}
										</div>
									</div>
									<div className="flex flex-col gap-3 p-4">
										<div className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--home-muted)]">
											{event.date}
										</div>
										<h4 className="min-h-[48px] font-[family-name:var(--font-display)] text-lg font-bold leading-tight text-[var(--home-text)]">
											{event.title}
										</h4>
										<div className="mt-2 flex items-center justify-between border-t border-[var(--home-border)] pt-3">
											<span className="font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--home-muted)]">
												{event.duration}
											</span>
											<span className="font-[family-name:var(--font-mono)] text-sm font-bold uppercase text-[var(--home-primary)]">
												{event.price}
											</span>
										</div>
									</div>
								</Link>
							</motion.div>
						))}

						<Link
							href="/events"
							className="group flex w-[140px] shrink-0 cursor-pointer items-center justify-center border border-[var(--home-border)] transition-colors hover:bg-[var(--home-surface)]"
						>
							<span className="flex items-center gap-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--home-muted)] transition-colors group-hover:text-[var(--home-secondary)]">
								View All <ArrowRight className="h-4 w-4" />
							</span>
						</Link>
					</div>
				</section>
			</div>

			<footer className="w-full border-t border-[var(--home-border)] bg-[var(--home-bg)] px-6 py-16 lg:px-10">
				<div className="mx-auto max-w-[1440px]">
					<div className="mb-12 grid grid-cols-1 gap-10 md:grid-cols-4">
						<div>
							<Link
								href="/"
								className="font-[family-name:var(--font-display)] text-xl font-bold text-[var(--home-text)]"
							>
								Dev<span className="text-[var(--home-primary)]">Event</span>
							</Link>
							<p className="mt-4 max-w-xs text-sm text-[var(--home-muted)]">
								India&apos;s developer event platform. Built by builders, for
								builders.
							</p>
						</div>

						<FooterColumn
							title="Platform"
							links={[
								{ label: "Discover Events", href: "/events" },
								{ label: "For Organizers", href: "/become-organizer" },
								{ label: "Pricing", href: "/events" },
							]}
						/>
						<FooterColumn
							title="Resources"
							links={[
								{ label: "Documentation", href: "/events" },
								{
									label: "Open Source",
									href: "https://github.com/YashVarpe05/DevEvent",
								},
							]}
						/>
						<FooterColumn
							title="Legal"
							links={[
								{ label: "Privacy", href: "#" },
								{ label: "Terms", href: "#" },
							]}
						/>
					</div>

					<div className="flex flex-col items-center justify-between gap-4 border-t border-[var(--home-border)] pt-8 md:flex-row">
						<div className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--home-primary)]">
							Built with &lt;/&gt; in India
						</div>
						<div className="flex gap-6">
							<Link
								href="#"
								className="text-[var(--home-muted)] transition-colors hover:text-[var(--home-secondary)]"
								aria-label="Twitter"
							>
								<Twitter className="h-5 w-5" />
							</Link>
							<Link
								href="https://github.com/YashVarpe05/DevEvent"
								className="text-[var(--home-muted)] transition-colors hover:text-[var(--home-secondary)]"
								aria-label="GitHub"
							>
								<Github className="h-5 w-5" />
							</Link>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
}

function ShowcaseEventCard({
	card,
	index,
	reduceMotion,
}: {
	card: ShowcaseCard;
	index: number;
	reduceMotion: boolean | null;
}) {
	const isLive = index === 2;
	const animate = reduceMotion
		? card.rest
		: {
				opacity: card.rest.opacity,
				rotate: card.rest.rotate,
				x: card.rest.x,
				y: [card.rest.y, card.rest.y - (index + 1) * 4, card.rest.y],
			};

	return (
		<motion.div
			initial={reduceMotion ? card.rest : card.initial}
			animate={animate}
			transition={
				reduceMotion
					? { duration: 0 }
					: {
							opacity: { duration: 0.8, delay: 0.3 + index * 0.1, ease },
							rotate: { duration: 0.8, delay: 0.3 + index * 0.1, ease },
							x: { duration: 0.8, delay: 0.3 + index * 0.1, ease },
							y: {
								duration: 5 + index,
								repeat: Infinity,
								repeatType: "mirror",
								delay: 0.9 + index * 0.2,
								ease: "easeInOut",
							},
						}
			}
			whileHover={
				reduceMotion
					? undefined
					: { y: card.rest.y - 10, rotate: card.rest.rotate * 0.6 }
			}
			className={`absolute w-[300px] rounded-none border border-[var(--home-border)] bg-[var(--home-surface)] p-4 transition-colors hover:z-30 hover:border-[var(--home-primary)] ${
				index < 2 ? "hover:opacity-100" : ""
			}`}
		>
			{isLive && (
				<div className="absolute right-3 top-3 z-10 bg-[var(--home-secondary)] px-2 py-1 font-[family-name:var(--font-mono)] text-[10px] font-bold uppercase tracking-wider text-[var(--home-on-secondary)]">
					LIVE
				</div>
			)}
			<div className="relative mb-3 h-44 w-full overflow-hidden border border-[var(--home-border)] bg-[var(--home-surface-low)]">
				<Image
					src={card.image}
					alt=""
					fill
					className="object-cover opacity-70 grayscale transition duration-300 hover:grayscale-0"
					sizes="300px"
				/>
				<div className="absolute inset-0 bg-[var(--home-bg)] opacity-30" />
			</div>
			<div className="mb-1 font-[family-name:var(--font-mono)] text-[10px] uppercase tracking-wider text-[var(--home-muted)]">
				{card.date}
			</div>
			<h3 className="mb-2 font-[family-name:var(--font-display)] text-lg font-bold text-[var(--home-text)]">
				{card.title}
			</h3>
			<p className="border-t border-[var(--home-border)] pt-2 font-[family-name:var(--font-mono)] text-xs text-[var(--home-muted)]">
				{card.description}
			</p>
			{isLive && (
				<div className="mt-3 flex items-center gap-2">
					<span className="font-[family-name:var(--font-mono)] text-[10px] uppercase text-[var(--home-secondary)]">
						$50k Grant Pool
					</span>
					<span className="text-[var(--home-border-bright)]">.</span>
					<span className="font-[family-name:var(--font-mono)] text-[10px] uppercase text-[var(--home-muted)]">
						24h Hackathon
					</span>
				</div>
			)}
		</motion.div>
	);
}

function Stat({ label, value }: { label: string; value: string }) {
	return (
		<div className="flex items-baseline gap-1.5">
			<span className="text-sm font-bold text-[var(--home-primary)]">{value}</span>
			<span>{label}</span>
		</div>
	);
}

function FeatureCard({
	children,
	delay,
	icon,
	title,
}: {
	children: ReactNode;
	delay: number;
	icon: ReactNode;
	title: string;
}) {
	const reduceMotion = useReducedMotion();

	return (
		<motion.div
			initial={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={reduceMotion ? { duration: 0 } : { delay }}
			className="group flex flex-col justify-between rounded-none border border-[var(--home-border)] bg-[var(--home-surface)] p-6 transition-colors hover:border-[var(--home-primary)] md:col-span-4"
		>
			{icon}
			<div>
				<h3 className="mb-2 font-[family-name:var(--font-display)] text-xl font-bold text-[var(--home-text)]">
					{title}
				</h3>
				<p className="font-[family-name:var(--font-mono)] text-xs uppercase text-[var(--home-muted)]">
					{children}
				</p>
			</div>
		</motion.div>
	);
}

function FooterColumn({
	links,
	title,
}: {
	links: { href: string; label: string }[];
	title: string;
}) {
	return (
		<div className="flex flex-col gap-3">
			<h4 className="mb-2 font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--home-text)]">
				{title}
			</h4>
			{links.map((item) => (
				<Link
					key={item.label}
					href={item.href}
					className="font-[family-name:var(--font-mono)] text-xs uppercase tracking-wider text-[var(--home-muted)] transition-colors hover:text-[var(--home-secondary)]"
				>
					{item.label}
				</Link>
			))}
		</div>
	);
}
